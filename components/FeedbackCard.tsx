/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPerAnswerFeedback } from "@/lib/models/FeedbackReport";

interface FeedbackCardProps {
  feedback: IPerAnswerFeedback;
  questionNumber: number;
  track?: string;
}

function getIeltsPartLabel(questionNumber: number): { label: string; color: string; bg: string; border: string } {
  if (questionNumber <= 2) {
    return {
      label: `Part 1 — Personal Q${questionNumber}`,
      color: "text-moss-deep",
      bg: "bg-moss-light/15",
      border: "border-moss-light/30",
    };
  }
  if (questionNumber === 3) {
    return {
      label: "Part 2 — Cue Card Long Turn",
      color: "text-tealbird-deep",
      bg: "bg-tealbird/15",
      border: "border-tealbird/30",
    };
  }
  return {
    label: `Part 3 — Discussion Q${questionNumber - 3}`,
    color: "text-moss",
    bg: "bg-moss-light/15",
    border: "border-moss-light/30",
  };
}

function bandColor(band: number): string {
  if (band >= 7.5) return "text-moss";
  if (band >= 6.5) return "text-moss";
  if (band >= 5.5) return "text-amber-600";
  return "text-beak";
}

export default function FeedbackCard({
  feedback,
  questionNumber,
  track,
}: FeedbackCardProps) {
  const isIelts = track === "ielts-speaking";

  const paceColor =
    feedback.speakingPace > 0 && feedback.speakingPace < 120
      ? "text-amber-600"
      : feedback.speakingPace > 160
        ? "text-beak"
        : "text-moss";

  const relevanceColor =
    feedback.relevanceScore >= 8
      ? "text-moss bg-moss-light/15 border-moss-light/30"
      : feedback.relevanceScore >= 5
        ? "text-amber-700 bg-amber-500/15 border-amber-500/30"
        : "text-beak-deep bg-beak/15 border-beak/30";

  const partInfo = isIelts ? getIeltsPartLabel(questionNumber) : null;
  const overallBand = typeof feedback.overallBand === "number" ? feedback.overallBand : null;

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-line shadow-2xl space-y-0">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-line bg-cream/60 backdrop-blur-md">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            {isIelts && partInfo ? (
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${partInfo.bg} ${partInfo.border} ${partInfo.color}`}>
                  {partInfo.label}
                </span>
              </div>
            ) : (
              <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
                Prompt {questionNumber} Feedback
              </h3>
            )}
            <p className="text-xs text-ink/80 leading-snug font-medium">{feedback.questionText}</p>
          </div>

          {isIelts && overallBand !== null ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-tealbird/10 border border-tealbird/30">
              <div className="flex flex-col items-end">
                <span className={`text-3xl font-semibold leading-none ${bandColor(overallBand)}`}>
                  {overallBand}
                </span>
                <span className="text-[10px] font-mono text-tealbird-deep uppercase">Est. Band</span>
              </div>
            </div>
          ) : !isIelts ? (
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${relevanceColor}`}>
              Relevance: {feedback.relevanceScore}/10
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Answer Transcript */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-widest text-stone-muted">
            Recorded Answer Transcript
          </h4>
          <div className="text-xs sm:text-sm text-ink leading-relaxed bg-cream/60 rounded-2xl p-4 border border-line shadow-inner">
            {highlightFillers(feedback.answerTranscript, feedback.fillerWords)}
          </div>
        </div>

        {/* Follow-up Section */}
        {feedback.followUpText && (
          <div className="space-y-2 pt-2 border-t border-line">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-moss">
              Follow-up Question & Response
            </h4>
            <p className="text-xs text-moss-deep italic font-medium">
              &ldquo;{feedback.followUpText}&rdquo;
            </p>
            {feedback.followUpTranscript && (
              <div className="text-xs text-ink/80 leading-relaxed bg-cream/60 rounded-2xl p-4 border border-line">
                {feedback.followUpTranscript}
              </div>
            )}
          </div>
        )}

        {/* Criteria Breakdown */}
        {isIelts ? (
          <div className="space-y-3 pt-2 border-t border-line">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-stone-muted">
              4 Official Criteria Band Ratings
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Fluency & Coherence", value: feedback.fluencyCoherence, color: "text-tealbird-deep" },
                { label: "Lexical Resource", value: feedback.lexicalResource, color: "text-moss-deep" },
                { label: "Grammar Accuracy", value: feedback.grammaticalRange, color: "text-moss" },
                { label: "Pronunciation", value: phenomenonToBand(feedback.pronunciation), color: "text-amber-700" },
              ].map(({ label, value }) => {
                const score = typeof value === "number" ? value : null;
                return (
                  <div key={label} className="glass-card rounded-2xl p-3 text-center border border-line">
                    <p className="text-[10px] font-medium text-stone-muted mb-1 leading-tight">{label}</p>
                    <p className={`text-xl font-semibold ${score !== null ? bandColor(score) : "text-stone-soft"}`}>
                      {score !== null ? score : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center border border-line">
              <p className="text-[10px] font-bold uppercase text-stone-muted mb-1">Filler Words</p>
              <p className={`text-xl font-semibold ${feedback.fillerWordCount > 3 ? "text-beak" : "text-moss"}`}>
                {feedback.fillerWordCount}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-line">
              <p className="text-[10px] font-bold uppercase text-stone-muted mb-1">Pace (WPM)</p>
              <p className={`text-xl font-semibold ${paceColor}`}>
                {feedback.speakingPace || "—"}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-line">
              <p className="text-[10px] font-bold uppercase text-stone-muted mb-1">Relevance</p>
              <p className={`text-xl font-semibold ${feedback.relevanceScore >= 7 ? "text-moss" : "text-amber-600"}`}>
                {feedback.relevanceScore}/10
              </p>
            </div>
          </div>
        )}

        {/* STAR Analysis for Mock Interview */}
        {!isIelts && feedback.starAnalysis && (
          <div className="space-y-3 pt-2 border-t border-line">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-stone-muted">
              STAR Method Structure Detection
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["situation", "task", "action", "result"] as const).map((part) => (
                <div key={part} className="p-3.5 rounded-2xl bg-cream/60 border border-moss-light/20 space-y-1">
                  <p className="text-[10px] font-semibold text-moss uppercase tracking-wider">
                    {part}
                  </p>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    {feedback.starAnalysis?.[part] || (
                      <span className="text-stone-soft italic">Not clearly detected</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body Language Feedback (Optional) */}
        {(typeof feedback.eyeContactPercent === "number" || feedback.movementScore) && (
          <div className="space-y-3 pt-2 border-t border-line">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-moss-deep flex items-center gap-1.5">
                <span>📹</span> Body Language Signals
              </h4>
              <span className="text-[10px] font-mono text-stone-soft">Local Camera Analysis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {typeof feedback.eyeContactPercent === "number" && (
                <div className="glass-card rounded-2xl p-4 border border-line flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase text-stone-muted">Eye Contact Focus</p>
                    <p className="text-xs text-ink/80">
                      {feedback.eyeContactPercent >= 70
                        ? "Great direct camera/screen focus"
                        : feedback.eyeContactPercent >= 50
                        ? "Moderate screen engagement"
                        : "Frequently looked away from screen"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-semibold ${
                        feedback.eyeContactPercent >= 70
                          ? "text-moss"
                          : feedback.eyeContactPercent >= 50
                          ? "text-amber-600"
                          : "text-beak"
                      }`}
                    >
                      {feedback.eyeContactPercent}%
                    </span>
                    <p className="text-[9px] font-mono text-stone-soft uppercase">Forward Yaw</p>
                  </div>
                </div>
              )}

              {feedback.movementScore && (
                <div className="glass-card rounded-2xl p-4 border border-line flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase text-stone-muted">Head Movement & Stability</p>
                    <p className="text-xs text-ink/80">
                      {feedback.movementScore === "low"
                        ? "Composed and steady posture"
                        : feedback.movementScore === "moderate"
                        ? "Natural conversational motion"
                        : "High head displacement / fidgeting"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-xl uppercase tracking-wider inline-block ${
                        feedback.movementScore === "low"
                          ? "bg-moss-light/15 text-moss border border-moss-light/30"
                          : feedback.movementScore === "moderate"
                          ? "bg-moss-light/15 text-moss-deep border border-moss-light/30"
                          : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                      }`}
                    >
                      {feedback.movementScore}
                    </span>
                    <p className="text-[9px] font-mono text-stone-soft uppercase mt-1">Stability</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What Worked & What to Improve */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feedback.whatWorked && (
            <div className="p-4 rounded-2xl bg-moss-light/10 border border-moss-light/30 space-y-1 backdrop-blur-md">
              <p className="text-[11px] font-bold text-moss uppercase tracking-wider flex items-center gap-1.5">
                <span>✓</span> Key Strengths
              </p>
              <p className="text-xs text-ink leading-relaxed">
                {feedback.whatWorked}
              </p>
            </div>
          )}
          {feedback.whatToImprove && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1 backdrop-blur-md">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>💡</span> High-Value Improvement
              </p>
              <p className="text-xs text-ink leading-relaxed">
                {feedback.whatToImprove}
              </p>
            </div>
          )}
        </div>

        {/* High-Scoring Model Answer */}
        {isIelts && feedback.rewrittenExample ? (
          <div className="space-y-2 pt-2 border-t border-line">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-tealbird flex items-center gap-1">
              <span>✨</span> Model Band 8+ Native Response Example
            </h4>
            <div className="p-4 rounded-2xl bg-tealbird/10 border border-tealbird/30 text-xs text-ink leading-relaxed italic">
              &ldquo;{feedback.rewrittenExample}&rdquo;
            </div>
          </div>
        ) : !isIelts && feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-line">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-stone-muted">
              Specific Actionable Suggestions
            </h4>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-ink/80">
                  <span className="text-moss font-bold shrink-0">→</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function phenomenonToBand(val: any): number | null {
  if (typeof val === "number") return val;
  return null;
}

function highlightFillers(
  text: string,
  fillerWords?: { word: string; position: number }[]
): React.ReactNode[] {
  if (!fillerWords || fillerWords.length === 0) {
    return [text];
  }

  const sortedFillers = [...fillerWords].sort((a, b) => a.position - b.position);
  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  for (let i = 0; i < sortedFillers.length; i++) {
    const filler = sortedFillers[i];
    if (filler.position > lastEnd) {
      parts.push(text.slice(lastEnd, filler.position));
    }
    parts.push(
      <span
        key={`filler-${i}`}
        className="bg-beak/20 text-beak-deep px-1 py-0.5 rounded-md border border-beak/40 font-mono text-[11px]"
        title="Filler word"
      >
        {text.slice(filler.position, filler.position + filler.word.length)}
      </span>
    );
    lastEnd = filler.position + filler.word.length;
  }

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return parts;
}
