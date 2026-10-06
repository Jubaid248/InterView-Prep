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
    } = await req.json();

    const blData = {
      eyeContactPercent: typeof eyeContactPercent === "number" ? eyeContactPercent : null,
      movementScore: movementScore || null,
    };

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

    // Transcribe the audio (use live speech-to-text transcript if provided)
    const transcript =
      liveText && liveText.trim().length > 0
        ? liveText.trim()
        : (await transcribeAudio(audioBase64)).text;

    const effectiveTrack = session.track || track || "mock-interview";

    // --- IELTS Speaking Track Flow ---
    if (effectiveTrack === "ielts-speaking") {
      const idx = session.currentQuestionIndex;

      if (idx === 0 || idx === 1) {
        // Part 1 Questions (no follow-ups)
        await createAnswerRecord({
          sessionId,
          questionIndex: idx,
          questionText,
          answerTranscript: transcript,
          audioBase64,
          audioDuration: audioDuration || 0,
          ...blData,
        });

        const nextIndex = idx + 1;
        await updateInterviewSession(sessionId, {
          currentQuestionIndex: nextIndex,
          awaitingFollowUp: false,
        });

        return NextResponse.json({
          transcript,
          nextQuestion: session.questions[nextIndex],
          questionIndex: nextIndex,
          totalQuestions: 5,
          isFollowUp: false,
        });
      }

      if (idx === 2) {
        // Part 2 Cue Card -> Generate Part 3 Discussion Question #1
        const result = await generateFollowUp("ielts-speaking", questionText, transcript);
        const part3Q1 = result.followUpQuestion || "How do you think this topic affects people in your society today?";

        const updatedQuestions = [...session.questions, part3Q1];
        const updatedDetails = [
          ...(session.questionDetails || []),
          { part: 3, topic: "Part 3 Discussion", question: part3Q1 },
        ];

        await createAnswerRecord({
          sessionId,
          questionIndex: idx,
          questionText,
          answerTranscript: transcript,
          audioBase64,
          audioDuration: audioDuration || 0,
          followUpText: part3Q1,
          ...blData,
        });

        await updateInterviewSession(sessionId, {
          questions: updatedQuestions,
          questionDetails: updatedDetails,
          currentQuestionIndex: 3,
          awaitingFollowUp: false,
        });

        return NextResponse.json({
          transcript,
          nextQuestion: part3Q1,
          questionIndex: 3,
          totalQuestions: 5,
          isFollowUp: false,
        });
      }

      if (idx === 3) {
        // Part 3 Question #1 -> Generate Part 3 Discussion Question #2 using growing history
        const answersList = await getAnswersForSession(sessionId);
        const cueCardRecord = answersList.find((a: any) => a.questionIndex === 2);

        const historyContext = `PART 2 CUE CARD:\n${session.questions[2] || "Cue Card Topic"}\n\nCANDIDATE'S CUE CARD ANSWER:\n${cueCardRecord?.answerTranscript || ""}\n\nPART 3 QUESTION 1:\n${questionText}\n\nCANDIDATE'S RESPONSE TO Q1:\n${transcript}`;

        const result = await generateFollowUp("ielts-speaking", historyContext, transcript);
        const part3Q2 = result.followUpQuestion || "Looking toward the future, how might this trend change in the next decade?";

        const updatedQuestions = [...session.questions, part3Q2];
        const updatedDetails = [
          ...(session.questionDetails || []),
          { part: 3, topic: "Part 3 Discussion", question: part3Q2 },
        ];

        await createAnswerRecord({
          sessionId,
          questionIndex: idx,
          questionText,
          answerTranscript: transcript,
          audioBase64,
          audioDuration: audioDuration || 0,
          followUpText: part3Q2,
          ...blData,
        });

        await updateInterviewSession(sessionId, {
          questions: updatedQuestions,
          questionDetails: updatedDetails,
          currentQuestionIndex: 4,
          awaitingFollowUp: false,
        });

        return NextResponse.json({
          transcript,
          nextQuestion: part3Q2,
          questionIndex: 4,
          totalQuestions: 5,
          isFollowUp: false,
        });
      }

      if (idx >= 4) {
        // Part 3 Question #2 -> Final Answer
        await createAnswerRecord({
          sessionId,
          questionIndex: idx,
          questionText,
          answerTranscript: transcript,
          audioBase64,
          audioDuration: audioDuration || 0,
          ...blData,
        });

        await updateInterviewSession(sessionId, {
          currentQuestionIndex: 5,
          awaitingFollowUp: false,
          status: "in_progress",
        });

        return NextResponse.json({
          transcript,
          isComplete: true,
          message: "All 5 IELTS Speaking prompts completed. Ready to generate feedback.",
        });
      }
    }

    // --- Standard Mock Interview / Communication Builder Flow ---
    if (isFollowUp) {
      // Follow-up answer — update existing answer record
      await updateAnswerRecord(sessionId, session.currentQuestionIndex, {
        followUpTranscript: transcript,
        followUpAudioBase64: audioBase64,
        followUpAudioDuration: audioDuration || 0,
        ...(blData.eyeContactPercent !== null ? { eyeContactPercent: blData.eyeContactPercent } : {}),
        ...(blData.movementScore !== null ? { movementScore: blData.movementScore } : {}),
      });

      // Move to next main question
      const nextIndex = session.currentQuestionIndex + 1;
      await updateInterviewSession(sessionId, {
        currentQuestionIndex: nextIndex,
        awaitingFollowUp: false,
      });

      // Check if interview is complete
      if (nextIndex >= session.questions.length) {
        return NextResponse.json({
          transcript,
          isComplete: true,
          message: "All questions answered. Ready to generate feedback.",
        });
      }

      // Return next main question
      const nextQuestion = session.questions[nextIndex];
      return NextResponse.json({
        transcript,
        nextQuestion,
        questionIndex: nextIndex,
        totalQuestions: session.questions.length,
        isFollowUp: false,
      });
    } else {
      // Main question answer — generate a follow-up question via generateFollowUp
      const result = await generateFollowUp(effectiveTrack, questionText, transcript);

      if (result.error || !result.followUpQuestion) {
        return NextResponse.json(
          { error: `Failed to generate follow-up question: ${result.error || "No follow-up question generated"}` },
          { status: 500 }
        );
      }

      const followUpQuestion: string = result.followUpQuestion;

      // Save answer record
      await createAnswerRecord({
        sessionId,
        questionIndex: session.currentQuestionIndex,
        questionText,
        answerTranscript: transcript,
        audioBase64,
        audioDuration: audioDuration || 0,
        followUpText: followUpQuestion,
        ...blData,
      });

      // Mark session as awaiting follow-up
      await updateInterviewSession(sessionId, {
        awaitingFollowUp: true,
      });

      return NextResponse.json({
        transcript,
        followUpQuestion,
        questionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        isFollowUp: true,
      });
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[/api/interview/answer] Error:", error);
    return NextResponse.json(
      { error: `Failed to process answer: ${errMsg}` },
      { status: 500 }
    );
  }
}
