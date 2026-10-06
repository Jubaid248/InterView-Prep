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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-widest backdrop-blur-md">
          🎓 Official Exam Format Simulator
        </div>
        <h1 className="text-3xl font-extrabold text-white font-jakarta leading-tight">
          IELTS Speaking Practice Test
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Simulate all 3 parts of the official IELTS Speaking test with real-time AI scoring and estimated Band scores.
        </p>
      </div>

      {/* Uncertified Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md">
        <span className="text-xl shrink-0">⚠️</span>
        <div>
          <p className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
            Practice Estimate Notice
          </p>
          <p className="text-xs text-amber-200/90 leading-relaxed mt-0.5">
            Scores generated are practice estimates for self-assessment only and are <strong>not official or certified IELTS results</strong>.
          </p>
        </div>
      </div>

      {/* 3 Parts Format Breakdown */}
      <div className="space-y-4">
        <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest">
          Official 3-Part Exam Structure
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* Part 1 */}
          <div className="glass-card rounded-2xl p-5 space-y-2 border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center text-xs font-black">1</span>
                Part 1: Personal & General Questions
              </span>
              <span className="text-[11px] font-mono text-blue-400">2 Prompts • Direct Answers</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed pl-8">
              Quick personal questions about familiar topics like work, study, hobbies, or hometown. Speak naturally in 1–3 clear sentences.
            </p>
          </div>

          {/* Part 2 */}
          <div className="glass-card rounded-2xl p-5 space-y-2 border border-purple-500/40 bg-purple-500/5 shadow-lg shadow-purple-900/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center text-xs font-black">2</span>
                Part 2: Cue Card Long Turn
              </span>
              <span className="text-[11px] font-mono text-purple-400">1 Topic Card • 1–2 Min Speech</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed pl-8">
              Main cue card prompt with 3–4 bullet points you must cover. You have 1 minute to prepare notes, then deliver a structured long speech.
            </p>
          </div>

          {/* Part 3 */}
          <div className="glass-card rounded-2xl p-5 space-y-2 border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-black">3</span>
                Part 3: Two-Way Discussion
              </span>
              <span className="text-[11px] font-mono text-emerald-400">2 Analytical Follow-ups</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed pl-8">
              Broader, abstract discussion questions dynamically linked to your Part 2 topic. Express opinions, analyze trends, and present arguments.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Criteria Scoring Pill */}
      <div className="glass-card rounded-2xl p-5 space-y-3 border border-white/10">
        <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest">
          Scored Across 4 Official IELTS Criteria (Band 1.0–9.0):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-200">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
            <span className="text-purple-400">✓</span> Fluency & Coherence
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
            <span className="text-blue-400">✓</span> Lexical Resource
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
            <span className="text-emerald-400">✓</span> Grammatical Range
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
            <span className="text-amber-400">✓</span> Pronunciation
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onStartPractice}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold text-sm tracking-wide transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] flex items-center justify-center gap-2"
      >
        <span>Launch IELTS Practice Exam Session</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
