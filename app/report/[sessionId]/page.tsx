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
        <div className="flex flex-col items-center gap-4 glass-card p-8 rounded-3xl border border-white/10">
          <svg className="animate-spin h-10 w-10 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-300 text-sm font-semibold font-jakarta">Generating Performance Report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="glass-card border border-red-500/30 rounded-3xl p-8 text-center space-y-4">
          <p className="text-red-400 font-medium">{error || "Report not found."}</p>
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
          >
            Back to Studio Home
          </button>
        </div>
      </div>
    );
  }

  const { report, answers } = data;
  const isIelts = data.session.track === "ielts-speaking";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors glass-card px-4 py-2 rounded-xl border border-white/10"
        >
          ← Start New Voice Session
        </button>
        <span className="text-xs font-mono text-zinc-500">
          Session ID: {sessionId.slice(0, 8)}
        </span>
      </div>

      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-bold text-indigo-300 uppercase tracking-widest">
          {isIelts ? "🎓 Official IELTS Format Assessment" : "📊 Interview Performance Analysis"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-jakarta">
          {isIelts ? "IELTS Speaking Feedback Report" : "Detailed Voice Feedback Report"}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
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
            <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              Estimated Band (Practice Only)
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed mt-0.5">
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
            <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 bg-gradient-to-br from-purple-950/70 via-zinc-900/90 to-zinc-950 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                {/* Gauge Score Circle */}
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center w-28 h-28 rounded-3xl bg-purple-500/20 border border-purple-500/40 shadow-2xl shrink-0">
                    <span className={`text-4xl font-black font-jakarta ${
                      report.overallBand && report.overallBand >= 7.5 ? "text-emerald-400"
                      : report.overallBand && report.overallBand >= 6.5 ? "text-blue-400"
                      : report.overallBand && report.overallBand >= 5.5 ? "text-amber-400"
                      : "text-red-400"
                    }`}>
                      {report.overallBand ?? "—"}
                    </span>
                    <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-widest mt-1">Band Score</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-purple-200 uppercase tracking-wider font-jakarta">Estimated Overall Band</p>
                    <p className="text-xs text-zinc-400">Calculated across 5 exam prompts</p>
                    <div className="pt-1 flex items-center gap-1.5 text-xs text-amber-300">
                      <span>⚠️</span>
                      <span className="font-medium italic">Practice Estimate — Not Certified</span>
                    </div>
                  </div>
                </div>

                {/* Criteria Average Breakdown */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 md:border-l md:border-purple-500/20 md:pl-8">
                  {[
                    { label: "Fluency", key: "fluencyCoherence", color: "text-purple-300" },
                    { label: "Vocabulary", key: "lexicalResource", color: "text-blue-300" },
                    { label: "Grammar", key: "grammaticalRange", color: "text-emerald-300" },
                    { label: "Pronunciation", key: "pronunciation", color: "text-amber-300" },
                  ].map(({ label, key, color }) => {
                    const vals = report.perAnswerFeedback.map((f: any) => f[key]).filter((v: any) => typeof v === "number");
                    const avg = vals.length > 0 ? Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 2) / 2 : null;
                    return (
                      <div key={key} className="glass-card p-3 rounded-2xl text-center border border-white/5">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className={`text-xl font-black font-jakarta ${color}`}>{avg ?? "—"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Row */}
          <div className={`grid gap-4 ${isIelts ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                Total Filler Words
              </p>
              <p
                className={`text-3xl font-black font-jakarta ${
                  report.totalFillerWordCount > 10
                    ? "text-red-400"
                    : report.totalFillerWordCount > 5
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {report.totalFillerWordCount}
              </p>
              <p className="text-xs text-zinc-400">Recorded across all prompts</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                Average Speaking Pace
              </p>
              <p className="text-3xl font-black font-jakarta text-cyan-400">
                {report.avgPace > 0 ? `${report.avgPace} WPM` : "N/A"}
              </p>
              <p className="text-xs text-zinc-400">Optimal pace: 120–160 WPM</p>
            </div>

            {!isIelts && (
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
                <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                  Prompts Completed
                </p>
                <p className="text-3xl font-black font-jakarta text-emerald-400">
                  {answers.length} / {data.session.questions.length}
                </p>
                <p className="text-xs text-zinc-400">Plus follow-up responses</p>
              </div>
            )}
          </div>

          {/* Optional Body Language Overview Card */}
          {(typeof report.avgEyeContactPercent === "number" || report.overallMovementScore) && (
            <div className="glass-card rounded-3xl p-6 border border-indigo-500/25 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-950 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">📹</span>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 font-jakarta">
                    Session Body Language Overview
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  Measured locally • Video never stored
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {typeof report.avgEyeContactPercent === "number" && (
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-zinc-400">Average Eye Contact</p>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        {report.avgEyeContactPercent >= 70
                          ? "Consistent direct engagement with interviewer"
                          : report.avgEyeContactPercent >= 50
                          ? "Moderate forward focus throughout answers"
                          : "Frequent looking away during speaking"}
                      </p>
                    </div>
                    <span
                      className={`text-3xl font-black font-jakarta ml-4 ${
                        report.avgEyeContactPercent >= 70
                          ? "text-emerald-400"
                          : report.avgEyeContactPercent >= 50
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {report.avgEyeContactPercent}%
                    </span>
                  </div>
                )}

                {report.overallMovementScore && (
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-zinc-400">Overall Head Stability</p>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        {report.overallMovementScore === "low"
                          ? "Very stable, confident physical posture"
                          : report.overallMovementScore === "moderate"
                          ? "Natural conversational head gestures"
                          : "Higher movement detected; consider stabilizing posture"}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider ml-4 whitespace-nowrap ${
                        report.overallMovementScore === "low"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : report.overallMovementScore === "moderate"
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
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
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-3 border border-white/10 shadow-xl">
          <h2 className="text-xs font-extrabold text-indigo-300 uppercase tracking-widest font-jakarta">
            {isIelts ? "Examiner Executive Summary" : "AI Feedback Summary"}
          </h2>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            {report.overallSummary}
          </p>
        </div>
      )}

      {/* Prompt-by-Prompt Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white font-jakarta">
          {isIelts ? "Prompt-by-Prompt Band Analysis" : "Per-Question Detailed Feedback"}
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
                className="glass-card rounded-2xl p-6 space-y-3 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    Question {idx + 1}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    {answer.audioDuration}s
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-200">
                  {answer.questionText}
                </p>
                <div className="bg-zinc-950/80 rounded-xl p-4 text-xs text-zinc-300">
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
