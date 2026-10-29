/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";

interface IeltsIntroScreenProps {
  onStartPractice: () => void;
}

export default function IeltsIntroScreen({ onStartPractice }: IeltsIntroScreenProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tealbird/10 border border-tealbird/30 text-xs font-bold text-tealbird-deep uppercase tracking-widest backdrop-blur-md">
          🎓 Official Exam Format Simulator
        </div>
        <h1 className="font-serif font-normal text-4xl text-ink leading-tight">
          IELTS Speaking Practice Test
        </h1>
        <p className="text-sm text-stone-muted max-w-lg mx-auto leading-relaxed">
          Simulate all 3 parts of the official IELTS Speaking test with real-time AI scoring and estimated Band scores.
        </p>
      </div>

      {/* Uncertified Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md">
        <span className="text-xl shrink-0">⚠️</span>
        <div>
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Practice Estimate Notice
          </p>
          <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
            Scores generated are practice estimates for self-assessment only and are <strong>not official or certified IELTS results</strong>.
          </p>
        </div>
      </div>

      {/* 3 Parts Format Breakdown */}
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-stone-muted uppercase tracking-widest">
          Official 3-Part Exam Structure
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Part 1 */}
          <div className="glass-card rounded-2xl p-5 space-y-2 border border-moss-light/30 bg-moss-light/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-moss-deep uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-moss-light/20 border border-moss-light/40 text-moss-deep flex items-center justify-center text-xs font-semibold">1</span>
                Part 1: Personal & General Questions
              </span>
              <span className="text-[11px] font-mono text-moss">3 Topics • 7 Questions • 4–5 Min</span>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed pl-8">
              The examiner introduces themselves, then asks short questions about you: first your work, studies or home, then two everyday topics. Answer naturally in 2–3 sentences and add a reason or example.
            </p>
          </div>

          {/* Part 2 */}
          <div className="glass-card rounded-2xl p-5 space-y-2 border border-tealbird/40 bg-tealbird/5 shadow-lg shadow-tealbird-deep/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-tealbird-deep uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-tealbird/20 border border-tealbird/40 text-tealbird-deep flex items-center justify-center text-xs font-semibold">2</span>
                Part 2: Cue Card Long Turn
              </span>
              <span className="text-[11px] font-mono text-tealbird-deep">1 Min Prep • 1–2 Min Talk</span>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed pl-8">
              You get a cue card with four points to cover and exactly one minute to prepare (a timer appears). Then speak for one to two minutes. The examiner finishes with one short rounding-off question.
            </p>
          </div>

          {/* Part 3 */}
          <div className="glass-card rounded-2xl p-5 space-y-2 border border-moss-light/30 bg-moss-light/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-moss uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-moss-light/20 border border-moss-light/40 text-moss flex items-center justify-center text-xs font-semibold">3</span>
                Part 3: Two-Way Discussion
              </span>
              <span className="text-[11px] font-mono text-moss">2 Themes • 4–6 Questions • 4–5 Min</span>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed pl-8">
              A deeper discussion about society, linked to your cue card topic. Give opinions, compare past and present, and speculate about the future. The examiner may ask you to explain or extend an answer.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Criteria Scoring Pill */}
      <div className="glass-card rounded-2xl p-5 space-y-3 border border-line">
        <p className="text-[11px] font-semibold text-stone-muted uppercase tracking-widest">
          Scored Across 4 Official IELTS Criteria (Band 1.0–9.0):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-ink">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cream/60 border border-line">
            <span className="text-tealbird-deep">✓</span> Fluency & Coherence
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cream/60 border border-line">
            <span className="text-moss">✓</span> Lexical Resource
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cream/60 border border-line">
            <span className="text-moss">✓</span> Grammatical Range
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cream/60 border border-line">
            <span className="text-amber-800">✓</span> Pronunciation
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onStartPractice}
        className="w-full py-4 px-6 rounded-2xl bg-moss hover:bg-moss-deep text-white font-semibold text-sm tracking-wide transition-all shadow-xl shadow-tealbird/30 hover:shadow-tealbird/50 hover:scale-[1.01] flex items-center justify-center gap-2"
      >
        <span>Launch IELTS Practice Exam Session</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
