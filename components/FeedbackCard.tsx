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
      color: "text-blue-300",
      bg: "bg-blue-500/15",
      border: "border-blue-500/30",
    };
  }
  if (questionNumber === 3) {
    return {
      label: "Part 2 — Cue Card Long Turn",
      color: "text-purple-300",
      bg: "bg-purple-500/15",
      border: "border-purple-500/30",
    };
  }
  return {
    label: `Part 3 — Discussion Q${questionNumber - 3}`,
    color: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
  };
}

function bandColor(band: number): string {
  if (band >= 7.5) return "text-emerald-400";
  if (band >= 6.5) return "text-blue-400";
  if (band >= 5.5) return "text-amber-400";
  return "text-red-400";
}

export default function FeedbackCard({
  feedback,
  questionNumber,
  track,
}: FeedbackCardProps) {
  const isIelts = track === "ielts-speaking";

  const paceColor =
    feedback.speakingPace > 0 && feedback.speakingPace < 120
      ? "text-amber-400"
      : feedback.speakingPace > 160
        ? "text-red-400"
        : "text-emerald-400";

  const relevanceColor =
    feedback.relevanceScore >= 8
      ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
      : feedback.relevanceScore >= 5
        ? "text-amber-300 bg-amber-500/15 border-amber-500/30"
        : "text-red-300 bg-red-500/15 border-red-500/30";

  const partInfo = isIelts ? getIeltsPartLabel(questionNumber) : null;
  const overallBand = typeof feedback.overallBand === "number" ? feedback.overallBand : null;

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl space-y-0">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-white/10 bg-zinc-950/70 backdrop-blur-md">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            {isIelts && partInfo ? (
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${partInfo.bg} ${partInfo.border} ${partInfo.color}`}>
                  {partInfo.label}
                </span>
              </div>
            ) : (
              <h3 className="text-sm font-extrabold text-white font-jakarta uppercase tracking-wider">
                Prompt {questionNumber} Feedback
              </h3>
            )}
            <p className="text-xs text-zinc-300 leading-snug font-medium">{feedback.questionText}</p>
          </div>

          {isIelts && overallBand !== null ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex flex-col items-end">
                <span className={`text-3xl font-black font-jakarta leading-none ${bandColor(overallBand)}`}>
                  {overallBand}
                </span>
                <span className="text-[10px] font-mono text-purple-300/80 uppercase">Est. Band</span>
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
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
            Recorded Answer Transcript
          </h4>
          <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed bg-zinc-950/80 rounded-2xl p-4 border border-white/5 shadow-inner">
            {highlightFillers(feedback.answerTranscript, feedback.fillerWords)}
          </div>
        </div>

        {/* Follow-up Section */}
        {feedback.followUpText && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
              Follow-up Question & Response
            </h4>
            <p className="text-xs text-indigo-200 italic font-medium">
              &ldquo;{feedback.followUpText}&rdquo;
            </p>
            {feedback.followUpTranscript && (
              <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/80 rounded-2xl p-4 border border-white/5">
                {feedback.followUpTranscript}
              </div>
            )}
          </div>
        )}

        {/* Criteria Breakdown */}
        {isIelts ? (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
              4 Official Criteria Band Ratings
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Fluency & Coherence", value: feedback.fluencyCoherence, color: "text-purple-300" },
                { label: "Lexical Resource", value: feedback.lexicalResource, color: "text-blue-300" },
                { label: "Grammar Accuracy", value: feedback.grammaticalRange, color: "text-emerald-300" },
                { label: "Pronunciation", value: phenomenonToBand(feedback.pronunciation), color: "text-amber-300" },
              ].map(({ label, value }) => {
                const score = typeof value === "number" ? value : null;
                return (
                  <div key={label} className="glass-card rounded-2xl p-3 text-center border border-white/5">
                    <p className="text-[10px] font-medium text-zinc-400 mb-1 leading-tight">{label}</p>
                    <p className={`text-xl font-black font-jakarta ${score !== null ? bandColor(score) : "text-zinc-500"}`}>
                      {score !== null ? score : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center border border-white/5">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Filler Words</p>
              <p className={`text-xl font-extrabold font-jakarta ${feedback.fillerWordCount > 3 ? "text-red-400" : "text-emerald-400"}`}>
                {feedback.fillerWordCount}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-white/5">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Pace (WPM)</p>
              <p className={`text-xl font-extrabold font-jakarta ${paceColor}`}>
                {feedback.speakingPace || "—"}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-white/5">
              <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Relevance</p>
              <p className={`text-xl font-extrabold font-jakarta ${feedback.relevanceScore >= 7 ? "text-emerald-400" : "text-amber-400"}`}>
                {feedback.relevanceScore}/10
              </p>
            </div>
          </div>
        )}

        {/* STAR Analysis for Mock Interview */}
        {!isIelts && feedback.starAnalysis && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
              STAR Method Structure Detection
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["situation", "task", "action", "result"] as const).map((part) => (
                <div key={part} className="p-3.5 rounded-2xl bg-zinc-950/60 border border-indigo-500/20 space-y-1">
                  <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                    {part}
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {feedback.starAnalysis?.[part] || (
                      <span className="text-zinc-500 italic">Not clearly detected</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body Language Feedback (Optional) */}
        {(typeof feedback.eyeContactPercent === "number" || feedback.movementScore) && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                <span>📹</span> Body Language Signals
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">Local Camera Analysis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {typeof feedback.eyeContactPercent === "number" && (
                <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">Eye Contact Focus</p>
                    <p className="text-xs text-zinc-300">
                      {feedback.eyeContactPercent >= 70
                        ? "Great direct camera/screen focus"
                        : feedback.eyeContactPercent >= 50
                        ? "Moderate screen engagement"
                        : "Frequently looked away from screen"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-black font-jakarta ${
                        feedback.eyeContactPercent >= 70
                          ? "text-emerald-400"
                          : feedback.eyeContactPercent >= 50
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {feedback.eyeContactPercent}%
                    </span>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase">Forward Yaw</p>
                  </div>
                </div>
              )}

              {feedback.movementScore && (
                <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">Head Movement & Stability</p>
                    <p className="text-xs text-zinc-300">
                      {feedback.movementScore === "low"
                        ? "Composed and steady posture"
                        : feedback.movementScore === "moderate"
                        ? "Natural conversational motion"
                        : "High head displacement / fidgeting"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold px-3 py-1 rounded-xl uppercase tracking-wider inline-block ${
                        feedback.movementScore === "low"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : feedback.movementScore === "moderate"
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {feedback.movementScore}
                    </span>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1">Stability</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What Worked & What to Improve */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feedback.whatWorked && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 backdrop-blur-md">
              <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>✓</span> Key Strengths
              </p>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {feedback.whatWorked}
              </p>
            </div>
          )}
          {feedback.whatToImprove && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1 backdrop-blur-md">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>💡</span> High-Value Improvement
              </p>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {feedback.whatToImprove}
              </p>
            </div>
          )}
        </div>

        {/* High-Scoring Model Answer */}
        {isIelts && feedback.rewrittenExample ? (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 flex items-center gap-1">
              <span>✨</span> Model Band 8+ Native Response Example
            </h4>
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-zinc-200 leading-relaxed italic">
              &ldquo;{feedback.rewrittenExample}&rdquo;
            </div>
          </div>
        ) : !isIelts && feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
              Specific Actionable Suggestions
            </h4>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-zinc-300">
                  <span className="text-indigo-400 font-bold shrink-0">→</span>
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
        className="bg-red-500/20 text-red-300 px-1 py-0.5 rounded-md border border-red-500/40 font-mono text-[11px]"
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
