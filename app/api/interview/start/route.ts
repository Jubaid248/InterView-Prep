/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createInterviewSession } from "@/lib/store";
import { generateInitialQuestions } from "@/lib/ai/llm";
import { getCommunicationBuilderSessionQuestions, QuestionBankItem } from "@/lib/config/questionBank";
import { getIeltsSpeakingSessionQuestions } from "@/lib/config/ieltsQuestionBank";

export async function POST(req: NextRequest) {
  try {
    const { resumeText = "", jobDescription = "", track = "mock-interview" } = await req.json();

    const sessionId = uuidv4();
    let questions: string[] = [];
    let questionDetails: any[] = [];

    if (track === "communication-builder") {
      // Pick 3 questions, 1 from each of 3 different frameworks (out of STAR, CAR, SEE, PAR)
      questionDetails = getCommunicationBuilderSessionQuestions();
      questions = questionDetails.map((q) => q.promptText);
    } else if (track === "ielts-speaking") {
      // Pick 2 Part 1 questions + 1 Part 2 Cue Card (Part 3 follow-ups will be generated dynamically)
      const ieltsData = getIeltsSpeakingSessionQuestions();
      questions = ieltsData.questions;
      questionDetails = ieltsData.details;
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
    }

    // Create session (uses MongoDB if running, or in-memory fallback)
    const defaultJob =
      track === "ielts-speaking"
        ? "IELTS Speaking Practice Exam"
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
