/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import {
  getInterviewSession,
  updateInterviewSession,
  getAnswersForSession,
} from "@/lib/store";
import { generateFeedbackReport } from "@/lib/ai/llm";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, track = "mock-interview" } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required." },
        { status: 400 }
      );
    }

    const session = await getInterviewSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    const answers = await getAnswersForSession(sessionId);
    if (answers.length === 0) {
      return NextResponse.json(
        { error: "No answers found for this session." },
        { status: 400 }
      );
    }

    // Call generateFeedbackReport which calculates metrics, calls Groq LLM, merges, and saves to Mongo
    const effectiveTrack = session.track || track || "mock-interview";
    const report = await generateFeedbackReport(effectiveTrack, {
      sessionId: session.sessionId,
      jobDescription: session.jobDescription,
      resumeText: session.resumeText,
      answers,
    });

    await updateInterviewSession(sessionId, { status: "completed" });

    return NextResponse.json({
      sessionId,
      report,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[/api/interview/end] Error:", error);
    return NextResponse.json(
      { error: `Failed to generate feedback report: ${errMsg}` },
      { status: 500 }
    );
  }
}
