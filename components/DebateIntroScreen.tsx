"use client";

import React from "react";

interface DebateIntroDetail {
  motion?: string;
  side?: string;
  context?: string;
  [key: string]: unknown;
}

interface DebateIntroScreenProps {
  detail?: DebateIntroDetail;
  onStartPractice: () => void;
}

const ROUNDS = [
  {
    n: "01",
    title: "Opening statement",
    body: "State your position and your two strongest arguments. Tota then rebuts your weakest point, and you respond.",
  },
  {
    n: "02",
    title: "Evidence round",
    body: "Give your best real-world example or evidence. Tota cross-examines it with one pointed question.",
  },
  {
    n: "03",
    title: "Closing statement",
    body: "Name the main clash, weigh why your side's arguments matter more, and finish with a clear conclusion.",
  },
];

const TIPS = [
  { title: "Build arguments with AREI", body: "Assertion, Reasoning, Evidence, Impact. One clear claim, why it's true, proof, and why it matters." },
  { title: "Refute in four steps", body: "“They say…, but…, because…, therefore…” Name their point, counter it, prove it, and show what follows." },
  { title: "Stay on your side", body: "Even if you personally disagree, argue your assigned side as convincingly as you can." },
];

export default function DebateIntroScreen({ detail, onStartPractice }: DebateIntroScreenProps) {
  const side = detail?.side === "against" ? "against" : "for";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      <div className="text-center space-y-3 py-2">
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss">Debate practice</p>
        <h1 className="font-serif font-normal text-4xl sm:text-5xl text-ink leading-tight">
          Make your case. <span className="italic text-moss">Hold your ground.</span>
        </h1>
        <p className="text-sm text-stone-muted max-w-lg mx-auto leading-relaxed">
          You&apos;ll argue one side of a motion and Tota will argue the other, live, over three rounds.
        </p>
      </div>

      {/* Motion card */}
      <div className="rounded-3xl bg-paper border border-line p-6 sm:p-8 space-y-4 shadow-[0_24px_50px_-32px_rgba(23,34,26,0.35)]">
        <p className="text-[11px] font-mono uppercase tracking-widest text-stone-soft">Today&apos;s motion</p>
        <p className="font-serif text-3xl sm:text-4xl text-ink leading-tight">{detail?.motion || "Motion loading…"}</p>
        {detail?.context && <p className="text-sm text-stone-muted leading-relaxed">{detail.context}</p>}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border ${
              side === "for" ? "bg-moss-light/15 text-moss border-moss-light/30" : "bg-beak/10 text-beak-deep border-beak/30"
            }`}
          >
            You argue {side} the motion
          </span>
          <span className="text-sm text-stone-muted">Tota argues {side === "for" ? "against" : "for"} it.</span>
        </div>
      </div>

      {/* Format */}
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-line bg-line">
        {ROUNDS.map((r) => (
          <li key={r.n} className="bg-paper p-5 space-y-2">
            <span className="font-serif text-3xl text-moss">{r.n}</span>
            <h3 className="text-base font-semibold text-ink">{r.title}</h3>
            <p className="text-xs text-stone-muted leading-relaxed">{r.body}</p>
          </li>
        ))}
      </ol>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIPS.map((t) => (
          <div key={t.title} className="rounded-2xl bg-white border border-line p-4 space-y-1.5">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            <p className="text-xs text-stone-muted leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 pt-2">
        <p className="text-xs text-stone-muted">Take a moment to plan two arguments, then start when you&apos;re ready.</p>
        <button
          type="button"
          onClick={onStartPractice}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-moss hover:bg-moss-deep text-cream font-semibold text-base transition-all shadow-[0_3px_0_#1C3B16] active:translate-y-[3px] active:shadow-none"
        >
          Start the debate
        </button>
      </div>
    </div>
  );
}
