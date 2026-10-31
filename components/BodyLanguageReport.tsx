import type { BodyLanguageInsight, BodyLanguageReport, InsightLevel, Moment } from "@/lib/bodyLanguage/metrics";
import { formatTime } from "@/lib/bodyLanguage/metrics";

const LEVEL_STYLE: Record<InsightLevel, { dot: string; label: string; text: string }> = {
  issue: { dot: "bg-beak", label: "Fix this", text: "text-beak-deep" },
  watch: { dot: "bg-amber-500", label: "Watch", text: "text-amber-800" },
  good: { dot: "bg-moss-light", label: "Strength", text: "text-moss" },
};

const MOMENT_TEXT: Record<Moment["kind"], string> = {
  "look-down": "Looked down",
  "look-side": "Looked to the side",
  "look-up": "Looked up",
  "eyes-closed": "Eyes closed",
  "face-touch": "Touched face",
  "out-of-frame": "Out of frame",
  reading: "Reading pattern",
};

function scoreLabel(score: number) {
  if (score >= 80) return { text: "Strong", color: "text-moss" };
  if (score >= 60) return { text: "Good, with things to polish", color: "text-moss" };
  if (score >= 40) return { text: "Needs work", color: "text-amber-800" };
  return { text: "Needs a lot of work", color: "text-beak-deep" };
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const color = value === null ? "bg-line" : value >= 75 ? "bg-moss-light" : value >= 50 ? "bg-amber-500" : "bg-beak";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-stone-muted">{label}</span>
        <span className="font-mono text-ink">{value === null ? "not measured" : value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );
}

function InsightRow({ insight }: { insight: BodyLanguageInsight }) {
  const s = LEVEL_STYLE[insight.level];
  return (
    <li className="flex gap-3 py-3 border-b border-line last:border-0">
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
      <div className="space-y-0.5 min-w-0">
        <p className="text-sm text-ink">
          <span className="font-semibold">{insight.title}</span>
          <span className={`ml-2 text-[11px] font-semibold uppercase tracking-wider ${s.text}`}>{s.label}</span>
        </p>
        <p className="text-xs text-stone-muted leading-relaxed">{insight.detail}</p>
        {insight.tip && <p className="text-xs text-ink/80 leading-relaxed">→ {insight.tip}</p>}
      </div>
    </li>
  );
}

function momentLabel(m: Moment) {
  return `${m.q ? `Q${m.q} · ` : ""}${formatTime(m.t)}`;
}

/** Session-level body language and eye movement section for the report page. */
export interface QuestionBodyLanguage {
  q: number;
  label?: string;
  data: Pick<BodyLanguageReport, "scores" | "stats" | "insights">;
}

/** Question-by-question comparison, so it's clear which answers eye contact or posture slipped on. */
function PerQuestionBreakdown({ rows }: { rows: QuestionBodyLanguage[] }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-ink">Question by question</p>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="bg-cream/60 text-stone-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Question</th>
              <th className="px-3 py-2 font-medium w-40">Eye contact</th>
              <th className="px-3 py-2 font-medium">Look-aways</th>
              <th className="px-3 py-2 font-medium">Blinks/min</th>
              <th className="px-3 py-2 font-medium">Posture</th>
              <th className="px-3 py-2 font-medium">Main note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ q, label, data }) => {
              const s = data.stats;
              const note = data.insights.find((i) => i.level !== "good");
              const eyeColor = s.eyeContactPercent >= 70 ? "bg-moss-light" : s.eyeContactPercent >= 50 ? "bg-amber-500" : "bg-beak";
              return (
                <tr key={q} className="border-t border-line align-top">
                  <td className="px-3 py-2.5 text-ink">
                    <span className="font-semibold">Q{q}</span>
                    {label && <span className="block text-stone-muted">{label}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line">
                        <div className={`h-full rounded-full ${eyeColor}`} style={{ width: `${s.eyeContactPercent}%` }} />
                      </div>
                      <span className="font-mono text-ink">{s.eyeContactPercent}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-ink">
                    {s.lookAways}
                    {s.longestLookAwaySec > 0 && <span className="text-stone-muted"> · longest {s.longestLookAwaySec}s</span>}
                  </td>
                  <td className={`px-3 py-2.5 ${s.blinksPerMin > 35 ? "text-beak-deep" : "text-ink"}`}>{s.blinksPerMin}</td>
                  <td className="px-3 py-2.5 text-ink">{s.uprightPercent === null ? "—" : `${s.uprightPercent}% upright`}</td>
                  <td className="px-3 py-2.5 text-stone-muted">
                    {s.readingDetected ? <span className="text-beak-deep">Reading pattern</span> : note ? note.title : <span className="text-moss">Looked good</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BodyLanguageReportCard({ report, perQuestion = [] }: { report: BodyLanguageReport; perQuestion?: QuestionBodyLanguage[] }) {
  const { scores, stats, insights, moments } = report;
  const label = scoreLabel(scores.overall);

  const statTiles = [
    { label: "Eye contact", value: `${stats.eyeContactPercent}%`, note: "aim for 70–80%", bad: stats.eyeContactPercent < 60 },
    {
      label: "Look-aways",
      value: String(stats.lookAways),
      note: stats.longestLookAwaySec > 0 ? `longest ${stats.longestLookAwaySec}s` : "none over 1s",
      bad: stats.lookAwaysPerMin > 3,
    },
    { label: "Blinks a minute", value: String(stats.blinksPerMin), note: "typical 15–20", bad: stats.blinksPerMin > 35 },
    { label: "Reading from notes", value: stats.readingDetected ? "Detected" : "No", note: "from eye sweeps", bad: stats.readingDetected },
    {
      label: "Upright posture",
      value: stats.uprightPercent === null ? "—" : `${stats.uprightPercent}%`,
      note: stats.uprightPercent === null ? "shoulders not in view" : "of the time",
      bad: stats.uprightPercent !== null && stats.uprightPercent < 60,
    },
    { label: "Face touches", value: String(stats.faceTouches), note: "a nervous habit", bad: stats.faceTouches >= 2 },
  ];

  return (
    <div className="rounded-3xl bg-paper border border-line p-5 sm:p-7 space-y-6 shadow-[0_24px_50px_-32px_rgba(23,34,26,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss">Body language & eye contact</p>
          <h3 className="font-serif text-3xl text-ink mt-1">How you came across on camera</h3>
        </div>
        <span className="text-[11px] text-stone-muted bg-cream/60 border border-line px-2.5 py-1 rounded-full">
          Measured on your device · video never stored
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        <div className="md:col-span-2 flex items-center gap-4">
          <div className="w-24 h-24 rounded-full border-4 border-line flex flex-col items-center justify-center shrink-0">
            <span className="font-serif text-4xl text-ink leading-none">{scores.overall}</span>
            <span className="text-[11px] text-stone-soft">out of 100</span>
          </div>
          <div>
            <p className={`text-base font-semibold ${label.color}`}>{label.text}</p>
            <p className="text-xs text-stone-muted leading-relaxed mt-1">
              Based on {Math.round(stats.durationSec)} seconds of speaking, tracked {stats.facePresencePercent}% in frame.
            </p>
          </div>
        </div>
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <ScoreBar label="Eye behaviour (contact, reading, darting)" value={scores.eyeContact} />
          <ScoreBar label="Posture" value={scores.posture} />
          <ScoreBar label="Composure" value={scores.composure} />
          <ScoreBar label="Warmth and gestures" value={scores.engagement} />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-1">What we noticed</p>
        <ul>
          {insights.map((i) => (
            <InsightRow key={i.title} insight={i} />
          ))}
        </ul>
      </div>

      {/* The raw numbers are useful but noisy, so they stay folded away */}
      <details className="group border-t border-line pt-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-moss hover:text-moss-deep [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Show all measurements</span>
          <span className="hidden group-open:inline">Hide measurements</span>
        </summary>
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statTiles.map((s) => (
              <div key={s.label} className="rounded-xl bg-white border border-line p-3">
                <p className="text-[11px] text-stone-muted">{s.label}</p>
                <p className={`font-serif text-2xl ${s.bad ? "text-beak-deep" : "text-ink"}`}>{s.value}</p>
                <p className="text-[11px] text-stone-soft">{s.note}</p>
              </div>
            ))}
          </div>

          {perQuestion.length > 1 && <PerQuestionBreakdown rows={perQuestion} />}

          <div>
            <p className="text-sm font-semibold text-ink mb-2">Key moments</p>
            {moments.length === 0 ? (
              <p className="text-xs text-stone-muted">No long look-aways, closed eyes or face touches. Nice.</p>
            ) : (
              <ol className="space-y-1.5">
                {moments.slice(0, 10).map((m, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-stone-soft w-20 shrink-0">{momentLabel(m)}</span>
                    <span className="text-ink">
                      {MOMENT_TEXT[m.kind]}
                      {m.durationSec ? <span className="text-stone-muted"> · {m.durationSec}s</span> : null}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

/** Compact per-answer body language panel for each feedback card. */
export function BodyLanguageAnswerPanel({
  data,
}: {
  data: Pick<BodyLanguageReport, "scores" | "stats" | "insights" | "moments">;
}) {
  const { stats, insights, moments } = data;
  const chips = [
    `Eye contact ${stats.eyeContactPercent}%`,
    `${stats.lookAways} look-away${stats.lookAways === 1 ? "" : "s"}`,
    `${stats.blinksPerMin} blinks/min`,
    stats.uprightPercent !== null ? `Upright ${stats.uprightPercent}%` : null,
    stats.readingDetected ? "Reading detected" : null,
    stats.faceTouches > 0 ? `${stats.faceTouches} face touch${stats.faceTouches === 1 ? "" : "es"}` : null,
  ].filter(Boolean) as string[];
  const flagged = insights.filter((i) => i.level !== "good").slice(0, 3);
  const strengths = insights.filter((i) => i.level === "good").slice(0, 2);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span key={c} className="text-[11px] px-2.5 py-1 rounded-full bg-cream/60 border border-line text-ink">
            {c}
          </span>
        ))}
      </div>
      <ul className="space-y-2">
        {[...flagged, ...strengths].map((i) => (
          <li key={i.title} className="flex gap-2 text-xs">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${LEVEL_STYLE[i.level].dot}`} />
            <span>
              <span className="font-semibold text-ink">{i.title}.</span> <span className="text-stone-muted">{i.detail}</span>
              {i.tip && i.level !== "good" ? <span className="text-ink/80"> {i.tip}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {moments.length > 0 && (
        <p className="text-[11px] text-stone-muted">
          Moments:{" "}
          {moments
            .slice(0, 5)
            .map((m) => `${MOMENT_TEXT[m.kind].toLowerCase()} at ${formatTime(m.t)}${m.durationSec ? ` (${m.durationSec}s)` : ""}`)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
