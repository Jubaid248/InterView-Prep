/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { QuestionBankItem, FRAMEWORK_DEFINITIONS, FrameworkType } from "@/lib/config/questionBank";
import TiltCard from "@/components/TiltCard";

interface FrameworkIntroScreenProps {
  questionDetails: QuestionBankItem[];
  onStartPractice: () => void;
}

const FRAMEWORK_META: Record<
  FrameworkType,
  {
    emoji: string;
    tagline: string;
    useCases: string[];
    smallTalkTip: string;
    accentBg: string;
    accentText: string;
    accentBorder: string;
    stepBg: string;
    stepText: string;
    badgeBg: string;
    gradient: string;
    glow: string;
  }
> = {
  STAR: {
    emoji: "⭐",
    tagline: "Turn any experience into a compelling story",
    useCases: [
      "Behavioral interview questions",
      "Sharing professional achievements",
      "Presenting complex work history",
    ],
    smallTalkTip:
      "Use STAR to answer 'Tell me about yourself' or 'What did you work on?' — it keeps your story tight and memorable.",
    accentBg: "bg-moss-light/15",
    accentText: "text-moss-deep",
    accentBorder: "border-moss-light/40",
    stepBg: "bg-moss/30",
    stepText: "text-moss-deep",
    badgeBg: "bg-moss-light/25",
    gradient: "from-moss via-moss-light to-tealbird",
    glow: "rgba(78, 154, 62, 0.4)",
  },
  CAR: {
    emoji: "☕",
    tagline: "Make any conversation engaging and natural",
    useCases: [
      "Small talk and casual conversations",
      "Sharing stories about your weekend / hobbies",
      "Networking and first meetings",
    ],
    smallTalkTip:
      "CAR makes small talk effortless — instead of saying 'It was good,' give context, an action, and a takeaway. People remember you.",
    accentBg: "bg-moss-light/15",
    accentText: "text-moss",
    accentBorder: "border-moss-light/40",
    stepBg: "bg-moss-light/30",
    stepText: "text-moss-deep",
    badgeBg: "bg-moss-light/25",
    gradient: "from-moss-light via-moss-light to-tealbird-light",
    glow: "rgba(52, 211, 153, 0.4)",
  },
  SEE: {
    emoji: "💡",
    tagline: "Explain anything clearly — even to a 5-year-old",
    useCases: [
      "Explaining technical or complex topics",
      "Sharing opinions and ideas confidently",
      "Teaching, training, or presenting",
    ],
    smallTalkTip:
      "When someone asks 'What do you do?', use SEE: make a bold statement, give a real example, and explain why it matters. Instant impact.",
    accentBg: "bg-amber-500/15",
    accentText: "text-amber-700",
    accentBorder: "border-amber-500/40",
    stepBg: "bg-amber-600/30",
    stepText: "text-amber-800",
    badgeBg: "bg-amber-500/25",
    gradient: "from-amber-500 via-amber-400 to-orange-500",
    glow: "rgba(251, 191, 36, 0.4)",
  },
  PAR: {
    emoji: "🎯",
    tagline: "Show your grit and growth through obstacles",
    useCases: [
      "Discussing challenges and how you overcame them",
      "Problem-solving and resilience stories",
      "Personal growth and self-improvement",
    ],
    smallTalkTip:
      "PAR is perfect for 'What's been hard lately?' conversations — it shows depth and self-awareness that builds real connection.",
    accentBg: "bg-tealbird/15",
    accentText: "text-tealbird-deep",
    accentBorder: "border-tealbird/40",
    stepBg: "bg-tealbird/30",
    stepText: "text-tealbird-deep",
    badgeBg: "bg-tealbird/25",
    gradient: "from-tealbird via-tealbird to-pink-500",
    glow: "rgba(192, 132, 252, 0.4)",
  },
};

function FrameworkSlide({
  detail,
  slideIndex,
  total,
}: {
  detail: QuestionBankItem;
  slideIndex: number;
  total: number;
}) {
  const fw = detail.framework as FrameworkType;
  const meta = FRAMEWORK_META[fw];
  const def = FRAMEWORK_DEFINITIONS[fw];
  const [exampleOpen, setExampleOpen] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-stone-muted">
          Framework {slideIndex + 1} of {total}
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full border ${meta.accentBg} ${meta.accentText} ${meta.accentBorder} shadow-md`}>
          {fw} Method
        </span>
      </div>

      {/* Main Glass Tilt Card */}
      <TiltCard
        glowColor={meta.glow}
        className={`glass-card rounded-3xl border ${meta.accentBorder} overflow-hidden shadow-2xl relative`}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${meta.accentBg} border ${meta.accentBorder} flex items-center justify-center text-3xl shadow-xl shrink-0 translate-z-30`}>
              {meta.emoji}
            </div>
            <div className="translate-z-20">
              <h2 className={`text-2xl sm:text-3xl font-semibold ${meta.accentText} leading-tight`}>
                {def.name}
              </h2>
              <p className="text-sm font-medium text-ink mt-1">{meta.tagline}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-stone-muted uppercase tracking-widest mb-3">
              Best Used For
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {meta.useCases.map((uc, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-cream/60 border border-line text-xs font-medium text-ink">
                  <span className={`w-2 h-2 rounded-full ${meta.accentBg} border ${meta.accentBorder} shrink-0`} />
                  {uc}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <p className="text-[11px] font-semibold text-stone-muted uppercase tracking-widest mb-3">
              The {fw} Steps Breakdown
            </p>
            <div className="grid grid-cols-1 gap-3">
              {def.steps.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3.5 rounded-2xl p-4 border ${meta.accentBorder} ${meta.accentBg} backdrop-blur-md`}
                >
                  <span
                    className={`w-10 h-10 shrink-0 rounded-xl ${meta.stepBg} ${meta.stepText} font-semibold text-lg flex items-center justify-center border ${meta.accentBorder} shadow-lg`}
                  >
                    {step.letter}
                  </span>
                  <div>
                    <p className={`text-xs font-semibold ${meta.accentText} uppercase tracking-wider`}>{step.label}</p>
                    <p className="text-xs text-ink leading-relaxed mt-0.5 font-medium">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Small Talk Tip */}
          <div className="flex items-start gap-3 bg-cream/60 border border-line rounded-2xl p-4 shadow-inner">
            <span className="text-2xl shrink-0">🗣️</span>
            <div>
              <p className="text-[11px] font-semibold text-ink/80 uppercase tracking-wider mb-0.5">
                Communication Tip
              </p>
              <p className="text-xs text-ink leading-relaxed">{meta.smallTalkTip}</p>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Example Box */}
      <div className="glass-card rounded-2xl border border-stone-soft/40 overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={() => setExampleOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 bg-cream/60 hover:bg-cream transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📖</span>
            <span className="text-xs font-semibold text-ink">
              Annotated Sentence Breakdown: &ldquo;{detail.promptText.slice(0, 48)}...&rdquo;
            </span>
          </div>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${meta.accentText}`}>
            {exampleOpen ? "▲ Hide Breakdown" : "▼ View Breakdown"}
          </span>
        </button>

        {exampleOpen && (
          <div className="px-6 py-5 space-y-4 border-t border-line bg-cream/60 animate-in fade-in duration-300">
            <div>
              <p className="text-[10px] font-semibold text-stone-muted uppercase tracking-widest mb-1">
                Prompt
              </p>
              <p className="text-xs font-semibold text-ink italic">&ldquo;{detail.promptText}&rdquo;</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-stone-muted uppercase tracking-widest mb-2.5">
                Sentence-by-Sentence Step Mapping
              </p>
              <div className="space-y-3">
                {detail.exampleSentences && detail.exampleSentences.length > 0
                  ? detail.exampleSentences.map((sent, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-cream border border-line">
                        <span
                          className={`shrink-0 w-7 h-7 rounded-lg ${meta.stepBg} ${meta.stepText} border ${meta.accentBorder} text-xs font-bold flex items-center justify-center`}
                        >
                          {sent.stepLetter}
                        </span>
                        <p className="text-xs text-ink leading-relaxed font-medium">{sent.text}</p>
                      </div>
                    ))
                  : (
                      <p className="text-xs text-ink/80 italic leading-relaxed">{detail.exampleAnswer}</p>
                    )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewSlide({ frameworks }: { frameworks: QuestionBankItem[] }) {
  const allFrameworks: FrameworkType[] = ["STAR", "CAR", "SEE", "PAR"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-moss-light/15 border border-moss-light/30 text-xs font-bold text-moss uppercase tracking-widest backdrop-blur-xl">
          🧠 Communication Masterclass
        </div>
        <h1 className="font-serif font-normal text-4xl sm:text-5xl text-ink leading-tight">
          Speak With Structure & Confidence
        </h1>
        <p className="text-sm text-ink/80 max-w-lg mx-auto leading-relaxed">
          Master 4 proven communication frameworks designed for behavioral interviews, technical explanations, and natural small talk.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "📚", label: "4 Frameworks", sub: "Step-by-step breakdowns" },
          { icon: "✍️", label: "Annotated Examples", sub: "Sentence-level mappings" },
          { icon: "🎙️", label: "3 Voice Prompts", sub: "Real-time AI evaluation" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center gap-1.5 glass-card p-5 rounded-2xl border border-line shadow-xl">
            <span className="text-3xl">{item.icon}</span>
            <p className="text-sm font-bold text-ink">{item.label}</p>
            <p className="text-xs text-stone-muted leading-snug">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-stone-muted uppercase tracking-widest">
          Framework Overview
        </p>
        <div className="space-y-3">
          {allFrameworks.map((fw) => {
            const meta = FRAMEWORK_META[fw];
            const def = FRAMEWORK_DEFINITIONS[fw];
            const isInSession = frameworks.some((f) => f.framework === fw);
            return (
              <div
                key={fw}
                className={`p-5 rounded-2xl border ${meta.accentBorder} ${isInSession ? meta.accentBg : "glass-card"} flex items-center justify-between gap-4 shadow-lg`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-semibold ${meta.accentText}`}>{fw}</span>
                      <span className="text-xs text-ink truncate">— {def.name}</span>
                    </div>
                    <p className="text-xs text-stone-muted mt-0.5">{meta.tagline}</p>
                  </div>
                </div>
                {isInSession && (
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${meta.badgeBg} ${meta.accentText} border ${meta.accentBorder} shrink-0`}>
                    In Session
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function FrameworkIntroScreen({
  questionDetails,
  onStartPractice,
}: FrameworkIntroScreenProps) {
  const totalSlides = 1 + questionDetails.length;
  const [slideIndex, setSlideIndex] = useState(0);

  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;

  const goNext = () => setSlideIndex((i) => Math.min(i + 1, totalSlides - 1));
  const goPrev = () => setSlideIndex((i) => Math.max(i - 1, 0));

  const dots = Array.from({ length: totalSlides });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-center gap-2.5">
        {dots.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSlideIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === slideIndex
                ? "w-10 h-3 bg-gradient-to-r from-moss-light to-tealbird-light shadow-md shadow-moss-light/40"
                : "w-3 h-3 bg-line hover:bg-line"
            }`}
          />
        ))}
      </div>

      <div key={slideIndex}>
        {slideIndex === 0 ? (
          <OverviewSlide frameworks={questionDetails} />
        ) : (
          <FrameworkSlide
            detail={questionDetails[slideIndex - 1]}
            slideIndex={slideIndex - 1}
            total={questionDetails.length}
          />
        )}
      </div>

      <div className="flex items-center gap-4 pt-4">
        {!isFirst && (
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl glass-card hover:bg-line text-ink text-xs font-bold transition-all"
          >
            ← Previous
          </button>
        )}

        {isLast ? (
          <button
            type="button"
            onClick={onStartPractice}
            className="flex-1 py-4 px-8 rounded-2xl bg-moss hover:bg-moss-deep text-cream font-semibold text-sm transition-all shadow-[0_3px_0_#1C3B16] active:translate-y-[3px] active:shadow-none flex items-center justify-center gap-2"
          >
            <span>Start Communication Voice Practice</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="flex-1 py-4 px-8 rounded-2xl bg-moss hover:bg-moss-deep text-cream font-semibold text-sm transition-all shadow-[0_3px_0_#1C3B16] active:translate-y-[3px] active:shadow-none flex items-center justify-center gap-2"
          >
            <span>{slideIndex === 0 ? "Learn Frameworks" : "Next Framework"}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
