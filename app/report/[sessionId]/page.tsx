/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FeedbackCard, { relevanceOutOf10 } from "@/components/FeedbackCard";
import { BodyLanguageReportCard } from "@/components/BodyLanguageReport";
import { friendlyError, requestErrorFrom } from "@/lib/friendlyError";
import { IPerAnswerFeedback } from "@/lib/models/FeedbackReport";

interface ReportData {
  session: {
    sessionId: string;
    jobDescription: string;
    resumeText: string;
    questions: string[];
    questionDetails?: any[];
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
    bodyLanguageReport?: any;
  } | null;
}

type Tab = "overview" | "questions" | "body";

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/interview/${sessionId}`);
        if (!res.ok) throw await requestErrorFrom(res);
        setData(await res.json());
      } catch (err) {
        setError(friendlyError("load-report", err));
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
          <p className="text-ink/80 text-sm font-semibold">Loading your report…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="glass-card border border-beak/30 rounded-3xl p-8 text-center space-y-4">
          <p className="text-ink font-medium">{error || "We can't find this report. The practice session may have expired."}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-deep text-cream text-sm font-semibold transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => router.push("/mock-interview")}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-cream border border-line text-ink text-sm font-semibold transition-colors"
            >
              Start a new one
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state: the session exists but nothing has been answered yet
  if (!data.report && data.answers.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="rounded-3xl bg-paper border border-line p-8 text-center space-y-4">
          <h1 className="font-serif text-4xl text-ink">No answers yet</h1>
          <p className="text-sm text-stone-muted">Answer at least one question to get feedback.</p>
          <button
            onClick={() => router.push(`/interview/${sessionId}`)}
            className="px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-deep text-cream text-sm font-semibold transition-colors"
          >
            Back to practice
          </button>
        </div>
      </div>
    );
  }

  const { report, answers } = data;
  const isIelts = data.session.track === "ielts-speaking";
  const isDebate = data.session.track === "debate-practice";
  const isCommBuilder = data.session.track === "communication-builder";
  const isNegotiation = data.session.track === "negotiation-practice";

  const hasBodyLanguage =
    !!report && (!!report.bodyLanguageReport || typeof report.avgEyeContactPercent === "number" || !!report.overallMovementScore);
  const context = isDebate
    ? data.session.questionDetails?.[0]?.motion
    : isNegotiation
    ? data.session.questionDetails?.[0]?.scenarioTitle
    : null;

  // The weakest answers' "what to improve" notes make the short to-do list on the overview
  const workOnNext = report
    ? [...report.perAnswerFeedback]
        .sort((a, b) =>
          isIelts ? (a.overallBand ?? 0) - (b.overallBand ?? 0) : relevanceOutOf10(a.relevanceScore) - relevanceOutOf10(b.relevanceScore)
        )
        .map((fb) => fb.whatToImprove)
        .filter((s): s is string => !!s)
        .slice(0, 3)
    : [];

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "questions", label: `${isIelts ? "Prompts" : "Questions"} (${report?.perAnswerFeedback.length || answers.length})` },
    ...(hasBodyLanguage ? [{ id: "body" as Tab, label: "Body language" }] : []),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 sm:px-6 pt-10 sm:pt-14 pb-16">
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
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss">
          {isIelts
            ? "IELTS speaking report"
            : isDebate
            ? "Debate report"
            : isNegotiation
            ? "Negotiation report"
            : isCommBuilder
            ? "Communication report"
            : "Interview report"}
        </p>
        <h1 className="font-serif font-normal text-5xl sm:text-6xl leading-[1.02] text-ink">
          {isIelts ? (
            <>Your speaking, <span className="italic text-moss">scored.</span></>
          ) : isDebate ? (
            <>How your case <span className="italic text-moss">held up.</span></>
          ) : isNegotiation ? (
            <>How your deal <span className="italic text-moss">came together.</span></>
          ) : (
            <>Here&rsquo;s how <span className="italic text-moss">you did.</span></>
          )}
        </h1>
        {context && <p className="text-base text-stone-muted leading-relaxed">{context}</p>}
      </div>

      {report ? (
        <div className="space-y-6">
          <div role="tablist" className="flex gap-6 border-b border-line">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px whitespace-nowrap border-b-2 pb-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id ? "border-ink text-ink" : "border-transparent text-stone-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              {report.overallSummary && (
                <p className="font-serif text-xl sm:text-2xl text-ink leading-snug">{report.overallSummary}</p>
              )}

              {isIelts && (
                <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-serif text-6xl leading-none ${
                        report.overallBand && report.overallBand >= 6.5
                          ? "text-moss"
                          : report.overallBand && report.overallBand >= 5.5
                          ? "text-amber-800"
                          : "text-beak-deep"
                      }`}
                    >
                      {report.overallBand ?? "—"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">Estimated band</p>
                      <p className="text-xs text-amber-800">Practice estimate, not an official IELTS score</p>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:border-l sm:border-line sm:pl-5">
                    {[
                      { label: "Fluency", key: "fluencyCoherence" },
                      { label: "Vocabulary", key: "lexicalResource" },
                      { label: "Grammar", key: "grammaticalRange" },
                      { label: "Pronunciation", key: "pronunciation" },
                    ].map(({ label, key }) => {
                      const vals = report.perAnswerFeedback.map((f: any) => f[key]).filter((v: any) => typeof v === "number");
                      const avg = vals.length > 0 ? Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 2) / 2 : null;
                      return (
                        <div key={key}>
                          <p className="text-[11px] text-stone-muted">{label}</p>
                          <p className="font-serif text-2xl text-ink">{avg ?? "—"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={`grid gap-3 ${isIelts ? "grid-cols-2" : "grid-cols-3"}`}>
                <Stat
                  label="Filler words"
                  value={String(report.totalFillerWordCount)}
                  color={report.totalFillerWordCount > 10 ? "text-beak-deep" : report.totalFillerWordCount > 5 ? "text-amber-800" : "text-ink"}
                />
                <Stat label="Pace" value={report.avgPace > 0 ? `${report.avgPace} WPM` : "N/A"} hint="aim for 120–160" />
                {!isIelts && <Stat label="Answered" value={`${answers.length} / ${data.session.questions.length}`} />}
              </div>

              {workOnNext.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-ink">Work on next</h2>
                  <ul className="space-y-2">
                    {workOnNext.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink/80 leading-relaxed">
                        <span className="shrink-0 font-bold text-moss">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setTab("questions")} className="text-sm font-semibold text-moss hover:text-moss-deep">
                    See each {isIelts ? "prompt" : "question"} →
                  </button>
                </div>
              )}

              {!hasBodyLanguage && (
                <p className="rounded-2xl border border-dashed border-line bg-paper/60 p-4 text-sm text-stone-muted">
                  Turn on your camera next time to get feedback on eye contact, posture and body language.
                </p>
              )}
            </div>
          )}

          {tab === "questions" && (
            <div className="glass-card rounded-3xl px-5 sm:px-6">
              {report.perAnswerFeedback.map((fb, idx) => (
                <FeedbackCard
                  key={idx}
                  feedback={fb}
                  questionNumber={idx + 1}
                  track={data.session.track}
                  detail={data.session.questionDetails?.[idx]}
                />
              ))}
            </div>
          )}

          {tab === "body" &&
            (report.bodyLanguageReport ? (
              <BodyLanguageReportCard
                report={report.bodyLanguageReport}
                perQuestion={report.perAnswerFeedback
                  .map((fb: any, i: number) => ({
                    q: i + 1,
                    // Mock interviews label by stage; scripted tracks have a readable round or method name
                    label:
                      (data.session.track === "mock-interview"
                        ? data.session.questionDetails?.[i]?.stage
                        : data.session.questionDetails?.[i]?.framework || data.session.questionDetails?.[i]?.topic) || undefined,
                    data: fb.bodyLanguage,
                  }))
                  .filter((row: any) => row.data)}
              />
            ) : (
              // Older sessions only stored average eye contact and head movement
              <div className="grid grid-cols-2 gap-3">
                {typeof report.avgEyeContactPercent === "number" && (
                  <Stat
                    label="Eye contact"
                    value={`${report.avgEyeContactPercent}%`}
                    color={report.avgEyeContactPercent >= 70 ? "text-moss" : report.avgEyeContactPercent >= 50 ? "text-amber-800" : "text-beak-deep"}
                  />
                )}
                {report.overallMovementScore && (
                  <Stat label="Head movement" value={report.overallMovementScore} color={report.overallMovementScore === "high" ? "text-amber-800" : "text-ink"} />
                )}
              </div>
            ))}
        </div>
      ) : (
        // Feedback isn't ready yet, so just show what was said
        <div className="glass-card rounded-3xl px-5 sm:px-6">
          {answers.map((answer, idx) => (
            <div key={idx} className="space-y-2 border-t border-line py-4 first:border-t-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  {idx + 1}. {answer.questionText}
                </p>
                <span className="text-xs font-mono text-stone-muted">{answer.audioDuration}s</span>
              </div>
              <p className="text-sm text-ink/80 leading-relaxed">{answer.answerTranscript}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint, color = "text-ink" }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="glass-card rounded-2xl p-3 sm:p-4">
      <p className="text-xs text-stone-muted">{label}</p>
      <p className={`font-serif text-2xl sm:text-3xl whitespace-nowrap capitalize ${color}`}>{value}</p>
      {hint && <p className="text-[11px] text-stone-soft">{hint}</p>}
    </div>
  );
}
