/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPerAnswerFeedback } from "@/lib/models/FeedbackReport";
import { BodyLanguageAnswerPanel } from "@/components/BodyLanguageReport";

interface FeedbackCardProps {
  feedback: IPerAnswerFeedback;
  questionNumber: number;
  track?: string;
  /** The question's stored detail: IELTS part/kind/topic, or a method/debate round name. */
  detail?: { part?: number; kind?: string; topic?: string; framework?: string; stage?: string };
}

// Older IELTS sessions had no stored part, so fall back to their fixed 5-question layout
function getIeltsPartLabel(questionNumber: number, detail?: FeedbackCardProps["detail"]): string {
  const part = detail?.part ?? (questionNumber <= 2 ? 1 : questionNumber === 3 ? 2 : 3);
  const topic = detail?.topic ? ` · ${detail.topic}` : "";
  if (part === 1) return `Part 1 · Introduction${topic}`;
  if (part === 2) return detail?.kind === "rounding-off" ? "Part 2 · Rounding-off question" : "Part 2 · Cue card";
  return `Part 3 · Discussion${topic}`;
}

const FRAMEWORK_LABELS: Record<string, string> = {
  ARE: "Small talk · ARE method",
  PREP: "PREP method",
  PPF: "Past–Present–Future",
};

function bandColor(band: number): string {
  if (band >= 6.5) return "text-moss";
  if (band >= 5.5) return "text-amber-800";
  return "text-beak-deep";
}

/** 0–10 relevance; older reports stored it out of 100. */
export function relevanceOutOf10(score: number): number {
  return score > 10 ? Math.round(score / 10) : Math.round(score);
}

/** One compact, expandable row per question: status and a one-line fix up front, everything else on click. */
export default function FeedbackCard({ feedback, questionNumber, track, detail }: FeedbackCardProps) {
  const isIelts = track === "ielts-speaking";
  const relevance10 = relevanceOutOf10(feedback.relevanceScore);
  const overallBand = typeof feedback.overallBand === "number" ? feedback.overallBand : null;

  const promptLabel = isIelts
    ? getIeltsPartLabel(questionNumber, detail)
    : (track === "debate-practice" || track === "negotiation-practice") && detail?.framework
    ? detail.framework
    : track === "communication-builder" && detail?.framework
    ? FRAMEWORK_LABELS[detail.framework] || `${detail.framework} method`
    : track === "mock-interview" && detail?.stage
    ? detail.stage
    : null;

  // IELTS rows are judged by band; everything else by relevance
  const good = isIelts ? (overallBand ?? 0) >= 6.5 : relevance10 >= 7;
  const oneLiner = good ? feedback.whatWorked || feedback.whatToImprove : feedback.whatToImprove || feedback.whatWorked;

  const paceColor =
    feedback.speakingPace > 0 && feedback.speakingPace < 120
      ? "text-amber-800"
      : feedback.speakingPace > 160
      ? "text-beak-deep"
      : "text-ink";

  const bodyLanguage = (feedback as any).bodyLanguage;
  const legacyBody = !bodyLanguage && (typeof feedback.eyeContactPercent === "number" || feedback.movementScore);

  return (
    <details className="group border-t border-line first:border-t-0">
      <summary className="flex cursor-pointer list-none items-start gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1 space-y-1">
          {promptLabel && (
            <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-stone-muted">{promptLabel}</p>
          )}
          <p className="text-sm font-semibold text-ink leading-snug">
            {questionNumber}. {feedback.questionText}
          </p>
          {oneLiner && (
            <p className="text-sm text-stone-muted leading-snug line-clamp-2 group-open:line-clamp-none">
              {!good && <span className="font-semibold text-amber-800">Fix: </span>}
              {oneLiner}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {isIelts && overallBand !== null ? (
            <span className={`rounded-full border border-line bg-cream/60 px-3 py-1 text-xs font-semibold ${bandColor(overallBand)}`}>
              Band {overallBand}
            </span>
          ) : !isIelts ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                good ? "bg-moss-light/15 text-moss" : "bg-amber-500/15 text-amber-800"
              }`}
            >
              {good ? "Good" : "Needs work"}
            </span>
          ) : null}
          <svg
            className="h-4 w-4 text-stone-muted transition-transform group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </summary>

      <div className="mb-5 space-y-5 rounded-2xl bg-cream/60 p-4 sm:p-5">
        {/* Numbers for this answer */}
        {isIelts ? (
          <p className="text-xs text-stone-muted">
            {[
              ["Fluency", feedback.fluencyCoherence],
              ["Vocabulary", feedback.lexicalResource],
              ["Grammar", feedback.grammaticalRange],
              ["Pronunciation", feedback.pronunciation],
            ]
              .map(([label, v]) => `${label} ${typeof v === "number" ? v : "—"}`)
              .join(" · ")}
          </p>
        ) : (
          <p className="text-xs text-stone-muted">
            <span className={feedback.fillerWordCount > 3 ? "text-beak-deep" : "text-ink"}>
              {feedback.fillerWordCount} filler word{feedback.fillerWordCount === 1 ? "" : "s"}
            </span>
            {" · "}
            <span className={paceColor}>{feedback.speakingPace ? `${feedback.speakingPace} WPM` : "pace —"}</span>
            {" · "}
            <span className="text-ink">Relevance {relevance10}/10</span>
          </p>
        )}

        <Section title="What you said">
          <p className="text-sm text-ink leading-relaxed">
            {highlightFillers(feedback.answerTranscript, feedback.fillerWords)}
          </p>
        </Section>

        {feedback.followUpText && (
          <Section title="Follow-up">
            <p className="text-sm italic text-moss-deep">&ldquo;{feedback.followUpText}&rdquo;</p>
            {feedback.followUpTranscript && (
              <p className="text-sm text-ink/80 leading-relaxed">{feedback.followUpTranscript}</p>
            )}
          </Section>
        )}

        {/* The row only shows one of these, so give both in full here */}
        {(feedback.whatWorked || feedback.whatToImprove) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {feedback.whatWorked && (
              <Section title="What worked">
                <p className="text-sm text-ink leading-relaxed">{feedback.whatWorked}</p>
              </Section>
            )}
            {feedback.whatToImprove && (
              <Section title="What to improve">
                <p className="text-sm text-ink leading-relaxed">{feedback.whatToImprove}</p>
              </Section>
            )}
          </div>
        )}

        {!isIelts && feedback.starAnalysis && (
          <Section title="STAR structure">
            <ul className="space-y-1">
              {(["situation", "task", "action", "result"] as const).map((part) => (
                <li key={part} className="text-sm leading-relaxed">
                  <span className="font-semibold capitalize text-ink">{part}: </span>
                  {feedback.starAnalysis?.[part] ? (
                    <span className="text-ink/80">{feedback.starAnalysis[part]}</span>
                  ) : (
                    <span className="italic text-beak-deep">missing</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {isIelts && feedback.rewrittenExample ? (
          <Section title="A band 8+ version">
            <p className="text-sm italic text-ink leading-relaxed">&ldquo;{feedback.rewrittenExample}&rdquo;</p>
          </Section>
        ) : (
          !isIelts &&
          feedback.suggestions &&
          feedback.suggestions.length > 0 && (
            <Section title="Try this next time">
              <ul className="space-y-1">
                {feedback.suggestions.map((s, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-ink/80">
                    <span className="shrink-0 font-bold text-moss">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )
        )}

        {bodyLanguage && (
          <Section title="Body language">
            <BodyLanguageAnswerPanel data={bodyLanguage} />
          </Section>
        )}
        {legacyBody && (
          <Section title="Body language">
            <p className="text-sm text-ink/80">
              {[
                typeof feedback.eyeContactPercent === "number" ? `Eye contact ${feedback.eyeContactPercent}%` : null,
                feedback.movementScore ? `${feedback.movementScore} head movement` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </Section>
        )}
      </div>
    </details>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[11px] font-mono uppercase tracking-[0.12em] text-stone-muted">{title}</h4>
      {children}
    </div>
  );
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
