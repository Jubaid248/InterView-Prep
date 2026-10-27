/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FeedbackCard from "@/components/FeedbackCard";
import { IPerAnswerFeedback } from "@/lib/models/FeedbackReport";

interface ReportData {
  session: {
    sessionId: string;
    jobDescription: string;
    resumeText: string;
    questions: string[];
    track?: string;
    status: string;
    createdAt: string;
  };
  answers: {
    questionIndex: number;
    questionText: string;
    answerTranscript: string;
    audioDuration: number;
    followUpText: string | null;
    followUpTranscript: string | null;
    followUpAudioDuration: number | null;
    timestamp: string;
  }[];
  report: {
    perAnswerFeedback: IPerAnswerFeedback[];
    totalFillerWordCount: number;
    avgPace: number;
    overallSummary: string;
    overallBand?: number;
    avgEyeContactPercent?: number | null;
    overallMovementScore?: "low" | "moderate" | "high" | null;
  } | null;
}

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/interview/${sessionId}`);
        const contentType = res.headers.get("content-type");
        let result;
        if (contentType && contentType.includes("application/json")) {
          result = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Server error (${res.status}): ${text.slice(0, 150)}`);
        }
        if (!res.ok) throw new Error(result.error || "Failed to load report data.");
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load report."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 glass-card p-8 rounded-3xl border border-line">
          <svg className="animate-spin h-10 w-10 text-moss" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-ink/80 text-sm font-semibold">Tota is writing your report…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="glass-card border border-beak/30 rounded-3xl p-8 text-center space-y-4">
          <p className="text-beak font-medium">{error || "Report not found."}</p>
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-moss hover:text-moss-deep underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const { report, answers } = data;
  const isIelts = data.session.track === "ielts-speaking";

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 pt-10 sm:pt-14 pb-16">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/mock-interview")}
          className="inline-flex items-center gap-1.5 text-sm text-stone-muted hover:text-ink transition-colors"
        >
          ← Start a new interview
        </button>
        <span className="text-xs font-mono text-stone-soft">
          Session ID: {sessionId.slice(0, 8)}
        </span>
      </div>

      {/* Title Header */}
      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss-light">
          {isIelts ? "IELTS speaking report" : "Interview report"}
        </p>
        <h1 className="font-serif font-normal text-5xl sm:text-6xl leading-[1.02] text-ink">
          {isIelts ? (
            <>Your speaking, <span className="italic text-moss">scored.</span></>
          ) : (
            <>Here&rsquo;s how <span className="italic text-moss">you did.</span></>
          )}
        </h1>
        <p className="text-base text-stone-muted leading-relaxed max-w-2xl">
          {isIelts
            ? "Comprehensive practice evaluation across Fluency, Lexical Resource, Grammatical Accuracy, and Pronunciation."
            : "Transcript analysis, filler words breakdown, pace metrics, and STAR method alignment."}
        </p>
      </div>

      {/* IELTS Disclaimer Banner */}
      {isIelts && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Estimated Band (Practice Only)
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
              This report provides an estimated band score for self-improvement and practice only. It is <strong>not an official, certified, or endorsed IELTS result</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Hero Overview Cards */}
      {report && (
        <div className="space-y-6">
          {/* IELTS Hero Score Card */}
          {isIelts && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-tealbird/40 bg-gradient-to-br from-tealbird/10 via-cream to-cream shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                {/* Gauge Score Circle */}
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center w-28 h-28 rounded-3xl bg-tealbird/20 border border-tealbird/40 shadow-2xl shrink-0">
                    <span className={`font-serif text-5xl ${
                      report.overallBand && report.overallBand >= 7.5 ? "text-moss"
                      : report.overallBand && report.overallBand >= 6.5 ? "text-moss"
                      : report.overallBand && report.overallBand >= 5.5 ? "text-amber-600"
                      : "text-beak"
                    }`}>
                      {report.overallBand ?? "—"}
                    </span>
                    <span className="text-[10px] text-tealbird-deep font-semibold uppercase tracking-widest mt-1">Band Score</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-tealbird-deep uppercase tracking-wider">Estimated Overall Band</p>
                    <p className="text-xs text-stone-muted">Calculated across 5 exam prompts</p>
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-amber-700">
                      <span>⚠️</span>
                      <span className="font-medium italic">Practice Estimate — Not Certified</span>
                    </div>
                  </div>
                </div>

                {/* Criteria Average Breakdown */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 md:border-l md:border-tealbird/20 md:pl-8">
                  {[
                    { label: "Fluency", key: "fluencyCoherence", color: "text-tealbird-deep" },
                    { label: "Vocabulary", key: "lexicalResource", color: "text-moss-deep" },
                    { label: "Grammar", key: "grammaticalRange", color: "text-moss" },
                    { label: "Pronunciation", key: "pronunciation", color: "text-amber-700" },
                  ].map(({ label, key, color }) => {
                    const vals = report.perAnswerFeedback.map((f: any) => f[key]).filter((v: any) => typeof v === "number");
                    const avg = vals.length > 0 ? Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 2) / 2 : null;
                    return (
                      <div key={key} className="glass-card p-3 rounded-2xl text-center border border-line">
                        <p className="text-[10px] font-bold text-stone-muted uppercase tracking-wider mb-1">{label}</p>
                        <p className={`font-serif text-3xl ${color}`}>{avg ?? "—"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Row */}
          <div className={`grid gap-4 ${isIelts ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
            <div className="glass-card rounded-2xl p-5 border border-line space-y-1">
              <p className="text-xs font-medium text-stone-muted">
                Filler words
              </p>
              <p
                className={`font-serif text-5xl ${
                  report.totalFillerWordCount > 10
                    ? "text-beak"
                    : report.totalFillerWordCount > 5
                    ? "text-amber-600"
                    : "text-moss"
                }`}
              >
                {report.totalFillerWordCount}
              </p>
              <p className="text-xs text-stone-muted">Recorded across all prompts</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-line space-y-1">
              <p className="text-xs font-medium text-stone-muted">
                Average pace
              </p>
              <p className="font-serif text-5xl text-tealbird">
                {report.avgPace > 0 ? `${report.avgPace} WPM` : "N/A"}
              </p>
              <p className="text-xs text-stone-muted">Optimal pace: 120–160 WPM</p>
            </div>

            {!isIelts && (
              <div className="glass-card rounded-2xl p-5 border border-line space-y-1">
                <p className="text-xs font-medium text-stone-muted">
                  Questions answered
                </p>
                <p className="font-serif text-5xl text-moss">
                  {answers.length} / {data.session.questions.length}
                </p>
                <p className="text-xs text-stone-muted">Plus follow-up responses</p>
              </div>
            )}
          </div>

          {/* Optional Body Language Overview Card */}
          {(typeof report.avgEyeContactPercent === "number" || report.overallMovementScore) && (
            <div className="glass-card rounded-3xl p-6 border border-moss-light/25 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">
                    Body language
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-stone-muted bg-cream/60 border border-line px-2.5 py-1 rounded-full">
                  Measured locally • Video never stored
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {typeof report.avgEyeContactPercent === "number" && (
                  <div className="p-4 rounded-2xl bg-cream/60 border border-line flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-stone-muted">Average Eye Contact</p>
                      <p className="text-xs text-ink/80 mt-0.5">
                        {report.avgEyeContactPercent >= 70
                          ? "Consistent direct engagement with interviewer"
                          : report.avgEyeContactPercent >= 50
                          ? "Moderate forward focus throughout answers"
                          : "Frequent looking away during speaking"}
                      </p>
                    </div>
                    <span
                      className={`font-serif text-5xl ml-4 ${
                        report.avgEyeContactPercent >= 70
                          ? "text-moss"
                          : report.avgEyeContactPercent >= 50
                          ? "text-amber-600"
                          : "text-beak"
                      }`}
                    >
                      {report.avgEyeContactPercent}%
                    </span>
                  </div>
                )}

                {report.overallMovementScore && (
                  <div className="p-4 rounded-2xl bg-cream/60 border border-line flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-stone-muted">Overall Head Stability</p>
                      <p className="text-xs text-ink/80 mt-0.5">
                        {report.overallMovementScore === "low"
                          ? "Very stable, confident physical posture"
                          : report.overallMovementScore === "moderate"
                          ? "Natural conversational head gestures"
                          : "Higher movement detected; consider stabilizing posture"}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold px-3 py-1.5 rounded-xl uppercase tracking-wider ml-4 whitespace-nowrap ${
                        report.overallMovementScore === "low"
                          ? "bg-moss-light/15 text-moss border border-moss-light/30"
                          : report.overallMovementScore === "moderate"
                          ? "bg-moss-light/15 text-moss-deep border border-moss-light/30"
                          : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                      }`}
                    >
                      {report.overallMovementScore}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overall Executive Summary */}
      {report?.overallSummary && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-3 border border-line shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-moss text-cream text-xs font-semibold flex items-center justify-center">T</span>
            <div>
              <p className="text-sm font-semibold text-ink leading-tight">Tota&rsquo;s summary</p>
              <p className="text-[11px] text-stone-muted">{isIelts ? "Examiner view" : "AI interviewer"}</p>
            </div>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-ink leading-snug">
            {report.overallSummary}
          </p>
        </div>
      )}

      {/* Prompt-by-Prompt Breakdown */}
      <div className="space-y-6">
        <h2 className="font-serif font-normal text-4xl text-ink">
          {isIelts ? "Prompt by prompt" : "Question by question"}
        </h2>

        {report?.perAnswerFeedback && report.perAnswerFeedback.length > 0 ? (
          report.perAnswerFeedback.map((fb, idx) => (
            <FeedbackCard
              key={idx}
              feedback={fb}
              questionNumber={idx + 1}
              track={data.session.track}
            />
          ))
        ) : (
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 space-y-3 border border-line"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">
                    Question {idx + 1}
                  </h3>
                  <span className="text-xs font-mono text-stone-muted">
                    {answer.audioDuration}s
                  </span>
                </div>
                <p className="text-sm font-medium text-ink">
                  {answer.questionText}
                </p>
                <div className="bg-cream/60 rounded-xl p-4 text-xs text-ink/80">
                  {answer.answerTranscript}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
