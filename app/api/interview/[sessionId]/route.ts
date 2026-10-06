import { NextRequest, NextResponse } from "next/server";
import {
  getInterviewSession,
  getAnswersForSession,
  getFeedbackReport,
} from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    const session = await getInterviewSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    const answers = await getAnswersForSession(sessionId);
    const report = await getFeedbackReport(sessionId);

    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        jobDescription: session.jobDescription,
        resumeText: session.resumeText,
        questions: session.questions,
        questionDetails: session.questionDetails,
        track: session.track,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        awaitingFollowUp: session.awaitingFollowUp,
        createdAt: session.createdAt,
      },
      answers: answers.map((a) => ({
        questionIndex: a.questionIndex,
        questionText: a.questionText,
        answerTranscript: a.answerTranscript,
        audioDuration: a.audioDuration,
        followUpText: a.followUpText,
        followUpTranscript: a.followUpTranscript,
        followUpAudioDuration: a.followUpAudioDuration,
        timestamp: a.createdAt,
      })),
      report: report
        ? {
            perAnswerFeedback: report.perAnswerFeedback,
            totalFillerWordCount: report.totalFillerWordCount,
            avgPace: report.avgPace,
            overallSummary: report.overallSummary,
          }
        : null,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[/api/interview/:sessionId] Error:", error);
    return NextResponse.json(
      { error: `Failed to fetch session data: ${errMsg}` },
      { status: 500 }
    );
  }
}
