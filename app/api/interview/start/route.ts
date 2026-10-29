/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createInterviewSession } from "@/lib/store";
import { generateInitialQuestions } from "@/lib/ai/llm";
import { getCommunicationBuilderSessionQuestions, QuestionBankItem } from "@/lib/config/questionBank";
import { getIeltsSpeakingSessionQuestions } from "@/lib/config/ieltsQuestionBank";
import { getDebateSessionQuestions } from "@/lib/config/debateBank";
import { getNegotiationSessionQuestions } from "@/lib/config/negotiationBank";

// AI calls can be slow; give Vercel functions up to 60s instead of the default
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { resumeText = "", jobDescription = "", track = "mock-interview" } = await req.json();

    const sessionId = uuidv4();
    let questions: string[] = [];
    let questionDetails: any[] = [];

    if (track === "communication-builder") {
      // One small-talk scenario, then 3 prompts that each practice a different speaking method
      questionDetails = getCommunicationBuilderSessionQuestions();
      questions = questionDetails.map((q) => q.promptText);
    } else if (track === "ielts-speaking") {
      // Full examiner script: Part 1 (3 topics), Part 2 cue card + rounding-off, Part 3 (2 themes)
      const ieltsData = getIeltsSpeakingSessionQuestions();
      questions = ieltsData.questions;
      questionDetails = ieltsData.details;
    } else if (track === "debate-practice") {
      // Random motion and side: opening, evidence round, closing
      const debate = getDebateSessionQuestions();
      questions = debate.questions;
      questionDetails = debate.details;
    } else if (track === "negotiation-practice") {
      // Random role-play scenario: opening, objection, conditional offer under pressure, close
      const negotiation = getNegotiationSessionQuestions();
      questions = negotiation.questions;
      questionDetails = negotiation.details;
    } else {
      // Mock interview track requires resume & job description
      if (!resumeText || !jobDescription) {
        return NextResponse.json(
          { error: "Both resumeText and jobDescription are required for mock interview." },
          { status: 400 }
        );
      }

      const result = await generateInitialQuestions(track, resumeText, jobDescription);

      if (result.error || !result.questions) {
        return NextResponse.json(
          { error: `Failed to start interview session: ${result.error || "No questions generated"}` },
          { status: 500 }
        );
      }

      questions = result.questions;
      // Stage, competency, anchor and lookFor per question; used by follow-ups and feedback
      questionDetails = result.details || [];
    }

    // Create session (uses MongoDB if running, or in-memory fallback)
    const defaultJob =
      track === "ielts-speaking"
        ? "IELTS Speaking Practice Exam"
        : track === "debate-practice"
        ? "Debate Practice"
        : track === "negotiation-practice"
        ? "Negotiation Practice"
        : "Communication Builder Practice";

    const session = await createInterviewSession({
      sessionId,
      jobDescription: jobDescription || defaultJob,
      resumeText: resumeText || "N/A",
      questions,
      questionDetails,
      track,
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      questions: session.questions,
      questionDetails: session.questionDetails || questionDetails,
      firstQuestion: session.questions[0],
      totalQuestions: session.questions.length,
      track: session.track || track,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[/api/interview/start] Error:", error);
    return NextResponse.json(
      { error: `Failed to start interview session: ${errMsg}` },
      { status: 500 }
    );
  }
}
