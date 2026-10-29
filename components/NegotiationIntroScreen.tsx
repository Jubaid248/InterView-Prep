"use client";

import React from "react";

interface NegotiationIntroDetail {
  scenarioTitle?: string;
  yourRole?: string;
  counterpart?: string;
  situation?: string;
  yourGoal?: string;
  yourWalkAway?: string;
  [key: string]: unknown;
}

interface NegotiationIntroScreenProps {
  detail?: NegotiationIntroDetail;
  onStartPractice: () => void;
}

const ROUNDS = [
  { n: "01", title: "Open", body: "Build rapport, then make the first ambitious offer and justify it." },
  { n: "02", title: "Objection", body: "They push back. Ask questions to find out what they really need." },
  { n: "03", title: "Pressure", body: "They make a conditional offer and apply a pressure tactic. Trade, don't cave." },
  { n: "04", title: "Close", body: "Summarise the terms you agreed and the next steps." },
];

const TIPS = [
  { title: "Anchor first", body: "The first number sets the range. Aim high, but give a reason that sounds fair." },
  { title: "Ask, then listen", body: "“What matters most to you here?” Good questions reveal what they can really give." },
  { title: "Trade with if…then", body: "Never give a concession for free: “If you can do X, I can do Y.”" },
  { title: "Know your walk-away", body: "Decide your limit before you start, and be willing to say no." },
];

export default function NegotiationIntroScreen({ detail, onStartPractice }: NegotiationIntroScreenProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      <div className="text-center space-y-3 py-2">
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss">Negotiation practice</p>
        <h1 className="font-serif font-normal text-4xl sm:text-5xl text-ink leading-tight">
          Ask for more. <span className="italic text-moss">Keep the deal.</span>
        </h1>
        <p className="text-sm text-stone-muted max-w-lg mx-auto leading-relaxed">
          Tota plays the other side, with their own goals and limits. Read your brief, then negotiate out loud.
        </p>
      </div>

      {/* Private brief */}
      <div className="rounded-3xl bg-paper border border-line p-6 sm:p-8 space-y-5 shadow-[0_24px_50px_-32px_rgba(23,34,26,0.35)]">
        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-widest text-stone-soft">Your brief · {detail?.scenarioTitle}</p>
          <p className="font-serif text-2xl sm:text-3xl text-ink leading-snug">You&apos;re {detail?.yourRole}.</p>
          <p className="text-sm text-stone-muted leading-relaxed">{detail?.situation}</p>
          <p className="text-sm text-ink">
            <span className="text-stone-muted">You&apos;re negotiating with </span>
            {detail?.counterpart}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-moss/5 border border-moss/15 p-4 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-moss">Your goal</p>
            <p className="text-sm text-ink leading-relaxed">{detail?.yourGoal}</p>
          </div>
          <div className="rounded-2xl bg-beak/5 border border-beak/20 p-4 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-beak-deep">Your walk-away point</p>
            <p className="text-sm text-ink leading-relaxed">{detail?.yourWalkAway}</p>
          </div>
        </div>
        <p className="text-xs text-stone-soft">Only you can see this brief. The other side has goals and limits of their own.</p>
      </div>

      {/* Rounds */}
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-line bg-line">
        {ROUNDS.map((r) => (
          <li key={r.n} className="bg-paper p-4 space-y-1.5">
            <span className="font-serif text-2xl text-moss">{r.n}</span>
            <h3 className="text-sm font-semibold text-ink">{r.title}</h3>
            <p className="text-xs text-stone-muted leading-relaxed">{r.body}</p>
          </li>
        ))}
      </ol>

      {/* Techniques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIPS.map((t) => (
          <div key={t.title} className="rounded-2xl bg-white border border-line p-4 space-y-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            <p className="text-xs text-stone-muted leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onStartPractice}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-moss hover:bg-moss-deep text-cream font-semibold text-base transition-all shadow-[0_3px_0_#1C3B16] active:translate-y-[3px] active:shadow-none"
        >
          Start negotiating
        </button>
      </div>
    </div>
  );
}
