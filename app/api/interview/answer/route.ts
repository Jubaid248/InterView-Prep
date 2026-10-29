/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import {
  getInterviewSession,
  updateInterviewSession,
  createAnswerRecord,
  updateAnswerRecord,
  getAnswersForSession,
} from "@/lib/store";
import { transcribeAudio } from "@/lib/ai/transcribe";
import { generateFollowUp } from "@/lib/ai/llm";
import type { FollowUpStyle } from "@/lib/config/sessionScript";

/**
 * Which follow-up (if any) Tota asks after a main answer. Scripted tracks set
 * followUpStyle per question; mock interviews always probe once.
 */
function resolveFollowUpStyle(track: string, detail: any): FollowUpStyle | null {
  if (detail && "followUpStyle" in detail) return detail.followUpStyle ?? null;
  if (track === "ielts-speaking") return null;
  return "interview";
}

// Role-plays where the counterpart must remember what was already said
const CONVERSATIONAL_TRACKS = new Set(["negotiation-practice"]);

function formatHistory(answers: any[]): string {
  return [...answers]
    .sort((a, b) => a.questionIndex - b.questionIndex)
    .map((a) =>
      [
        `Tota: ${a.questionText}`,
        `User: ${a.answerTranscript || "(no answer)"}`,
        a.followUpText ? `Tota: ${a.followUpText}` : "",
        a.followUpTranscript ? `User: ${a.followUpTranscript}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n");
}

// AI calls can be slow; give Vercel functions up to 60s instead of the default
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const {
      sessionId,
      audioBase64,
      audioDuration,
      questionText,
      isFollowUp,
      liveText,
      track = "mock-interview",
      eyeContactPercent,
      movementScore,
      bodyLanguage,
    } = await req.json();

    const blData = {
      eyeContactPercent: typeof eyeContactPercent === "number" ? eyeContactPercent : null,
      movementScore: movementScore || null,
    };
    // Full eye-movement and posture tally for this recording (counts only, never video)
    const blTally = bodyLanguage && typeof bodyLanguage === "object" && bodyLanguage.samples > 0 ? bodyLanguage : null;

    if (!sessionId || !audioBase64 || !questionText) {
      return NextResponse.json(
        { error: "sessionId, audioBase64, and questionText are required." },
        { status: 400 }
      );
    }

    // Find the session
    const session = await getInterviewSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    // Transcribe the audio (use live speech-to-text transcript if provided, with safe fallback)
    let transcript = "";
    if (liveText && liveText.trim().length > 0) {
      transcript = liveText.trim();
    } else {
      try {
        const trResult = await transcribeAudio(audioBase64);
        transcript = trResult.text || "";
      } catch (err) {
        console.warn("[Answer API] transcribeAudio failed, using fallback:", err);
        transcript = "No response detected.";
      }
    }

    const effectiveTrack = session.track || track || "mock-interview";

    const idx = session.currentQuestionIndex;
    const totalQuestions = session.questions.length;
    const isConversational = CONVERSATIONAL_TRACKS.has(effectiveTrack);
    const loadHistory = async () =>
      isConversational ? formatHistory(await getAnswersForSession(sessionId)) : undefined;

    // Moves the session to the next scripted question, or marks it complete
    const advance = async (lastLineSaid: string) => {
      const nextIndex = idx + 1;

      if (nextIndex >= totalQuestions) {
        await updateInterviewSession(sessionId, { currentQuestionIndex: nextIndex, awaitingFollowUp: false });
        return NextResponse.json({
          transcript,
          isComplete: true,
          message: "All questions answered. Ready to generate feedback.",
        });
      }

      // Mid-role-play beats are written live so they fit what has already been said;
      // the scripted line stays as a fallback
      let nextQuestion: string = session.questions[nextIndex];
      const nextDetail = session.questionDetails?.[nextIndex];
      const updates: Record<string, any> = { currentQuestionIndex: nextIndex, awaitingFollowUp: false };
      if (nextDetail?.beat) {
        const result = await generateFollowUp(effectiveTrack, lastLineSaid, transcript, {
          detail: { ...nextDetail, followUpStyle: "negotiation-beat" },
          history: await loadHistory(),
        });
        if (result.followUpQuestion) {
          nextQuestion = result.followUpQuestion;
          const questions = [...session.questions];
          questions[nextIndex] = nextQuestion;
          updates.questions = questions;
        } else {
          console.warn("[Answer API] Beat generation failed, using scripted line:", result.error);
        }
      }

      await updateInterviewSession(sessionId, updates);

      return NextResponse.json({
        transcript,
        nextQuestion,
        questionIndex: nextIndex,
        totalQuestions,
        isFollowUp: false,
      });
    };

    if (isFollowUp) {
      // Follow-up answer — update existing answer record
      await updateAnswerRecord(sessionId, idx, {
        followUpTranscript: transcript,
        followUpAudioBase64: audioBase64,
        followUpAudioDuration: audioDuration || 0,
        ...(blData.eyeContactPercent !== null ? { eyeContactPercent: blData.eyeContactPercent } : {}),
        ...(blData.movementScore !== null ? { movementScore: blData.movementScore } : {}),
        ...(blTally ? { followUpBodyLanguage: blTally } : {}),
      } as any);
      return advance(questionText);
    }

    const detail = session.questionDetails?.[idx];
    const style = resolveFollowUpStyle(effectiveTrack, detail);

    let followUpQuestion: string | null = null;
    if (style) {
      // Mock interviews also give the interviewer the CV and JD so it can verify claims
      const result = await generateFollowUp(effectiveTrack, questionText, transcript, {
        detail,
        history: await loadHistory(),
        ...(effectiveTrack === "mock-interview"
          ? { resumeText: session.resumeText, jobDescription: session.jobDescription }
          : {}),
      });
      if (result.followUpQuestion) {
        followUpQuestion = result.followUpQuestion;
      } else {
        // Keep the conversation moving rather than stopping the session on an LLM hiccup
        console.warn("[Answer API] Follow-up generation failed, moving on:", result.error);
      }
    }

    await createAnswerRecord({
      sessionId,
      questionIndex: idx,
      questionText,
      answerTranscript: transcript,
      audioBase64,
      audioDuration: audioDuration || 0,
      ...(followUpQuestion ? { followUpText: followUpQuestion } : {}),
      ...blData,
      bodyLanguage: blTally,
    });

    if (!followUpQuestion) return advance(questionText);

    await updateInterviewSession(sessionId, { awaitingFollowUp: true });

    return NextResponse.json({
      transcript,
      followUpQuestion,
      questionIndex: idx,
      totalQuestions,
      isFollowUp: true,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[/api/interview/answer] Error:", error);
    return NextResponse.json(
      { error: `Failed to process answer: ${errMsg}` },
      { status: 500 }
    );
  }
}
