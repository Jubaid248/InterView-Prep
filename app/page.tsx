"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PerchedHeroParrot from "@/components/TotaPakhiParrot";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"summary" | "voice">("summary");

  return (
    <div className="min-h-screen text-slate-900 pt-10 sm:pt-16 pb-24 overflow-x-hidden">
      
      {/* 🚀 HERO SECTION (Cloudkit Simple & Clean) 🚀 */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-white/90 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md">
          <span>⚡</span>
          <span>The future of AI interview prep</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 font-jakarta leading-[1.08]">
          Your unfair edge <br />
          in job interviews
        </h1>

        {/* Minimal Subtitle */}
        <p className="text-base sm:text-lg text-slate-700 max-w-xl mx-auto leading-relaxed font-normal">
          Practice realistic voice mock interviews with instant feedback on your spoken answers, STAR structure, and body language.
        </p>

        {/* Two Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/mock-interview"
            className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base shadow-lg shadow-slate-900/10 hover:shadow-slate-900/15 transition-all duration-200 active:scale-95 border border-white"
          >
            Start Interview
          </Link>
          <a
            href="#body-language"
            className="px-5 py-3 rounded-full text-slate-800 hover:text-slate-950 font-semibold text-sm sm:text-base transition-colors flex items-center gap-1.5"
          >
            <span>Body language summary</span>
            <span className="text-slate-500 font-bold">›</span>
          </a>
        </div>

      </section>

      {/* 🌟 FLOATING CLOUDKIT CARD PREVIEW 🌟 */}
      <section id="body-language" className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        <div className="cloudkit-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                AI Mock Interview Session · Live Analysis
              </span>
            </div>

            {/* Simple Tab Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "summary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                📹 Body Language
              </button>
              <button
                onClick={() => setActiveTab("voice")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "voice" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                🎙️ Voice & STAR
              </button>
            </div>
          </div>

          {/* Main Simulation Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Simulated Interview Data */}
            <div className="md:col-span-8 space-y-4">
              
              {/* Question */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold">
                  Prompt · Senior Software Engineer
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  &ldquo;Describe a major system migration you led under strict latency requirements. How did you validate your trade-offs?&rdquo;
                </p>
              </div>

              {/* TAB 1: BODY LANGUAGE SUMMARY */}
              {activeTab === "summary" && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Summary of Your Body Language</span>
                    <span className="text-emerald-600 font-bold">Score: 94 / 100</span>
                  </div>

                  {/* 3 Simple Metric Bars */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-medium">Eye Contact</div>
                      <div className="text-base font-extrabold text-slate-900">92%</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Confident</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-medium">Composure</div>
                      <div className="text-base font-extrabold text-slate-900">Steady</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Low Fidget</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-medium">Posture</div>
                      <div className="text-base font-extrabold text-slate-900">Upright</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Engaged</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    💡 <strong>Summary:</strong> Excellent direct camera gaze and upright posture. Zero nervous fidgeting detected while explaining the architecture.
                  </p>
                </div>
              )}

              {/* TAB 2: VOICE & STAR */}
              {activeTab === "voice" && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Voice Analysis & Pacing</span>
                    <span className="text-blue-600 font-bold">140 WPM · Optimal</span>
                  </div>

                  {/* Waveform */}
                  <div className="flex items-center justify-center gap-1.5 h-10 bg-slate-50 rounded-xl px-4">
                    <div className="w-1.5 bg-blue-500 rounded-full animate-wave-1" />
                    <div className="w-1.5 bg-blue-400 rounded-full animate-wave-2" />
                    <div className="w-1.5 bg-blue-600 rounded-full animate-wave-3" />
                    <div className="w-1.5 bg-blue-500 rounded-full animate-wave-4" />
                    <div className="w-1.5 bg-blue-400 rounded-full animate-wave-5" />
                    <div className="w-1.5 bg-blue-600 rounded-full animate-wave-2" />
                    <div className="w-1.5 bg-blue-500 rounded-full animate-wave-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-medium">STAR Framework</div>
                      <div className="text-sm font-extrabold text-slate-900">Situation + Action + Result</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-500 font-medium">Filler Words</div>
                      <div className="text-sm font-extrabold text-emerald-600">0 &ldquo;ums&rdquo; detected</div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Parrot Mascot */}
            <div className="md:col-span-4 flex flex-col items-center justify-center">
              <PerchedHeroParrot />
            </div>

          </div>

          {/* Bottom Card Action */}
          <div className="pt-2 text-center">
            <Link
              href="/mock-interview"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              <span>Launch this mock interview</span>
              <span>→</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ⚡ 3 SIMPLE VALUE PILLARS (Minimal Wording) ⚡ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="cloudkit-card rounded-2xl p-5 shadow-sm space-y-2">
          <div className="text-2xl">🎙️</div>
          <h3 className="text-sm font-bold text-slate-900 font-jakarta">Spoken Voice AI</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Real-time feedback on speaking pace, filler words, and STAR structured answers.
          </p>
        </div>

        <div className="cloudkit-card rounded-2xl p-5 shadow-sm space-y-2">
          <div className="text-2xl">📹</div>
          <h3 className="text-sm font-bold text-slate-900 font-jakarta">Body Language Summary</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Webcam eye contact, composure, and posture tracking running 100% locally.
          </p>
        </div>

        <div className="cloudkit-card rounded-2xl p-5 shadow-sm space-y-2">
          <div className="text-2xl">📊</div>
          <h3 className="text-sm font-bold text-slate-900 font-jakarta">Instant Scorecard</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Actionable breakdown and model answers to help you win real offers.
          </p>
        </div>

      </section>

      {/* 👤 CREATOR */}
      <section className="max-w-md mx-auto px-4 pt-16 text-center">
        <div className="inline-flex items-center gap-3 p-3 rounded-2xl cloudkit-card shadow-sm text-left">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
            <Image
              src="/creators/jubaid.jpg"
              alt="Md. Jubaid Hasan"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 font-jakarta">
              Md. Jubaid Hasan
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              CEO & Full Stack Developer · Creator of Parrot
            </div>
          </div>
          <Link
            href="/creators"
            className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1"
          >
            Profile →
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="max-w-4xl mx-auto px-4 pt-12 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-300/40 mt-12">
        <div>© 2026 Parrot AI · Smart Interview Practice</div>
        <div className="flex items-center gap-4 font-medium">
          <Link href="/mock-interview" className="hover:text-slate-900 transition-colors">
            Mock Interview
          </Link>
          <Link href="/creators" className="hover:text-slate-900 transition-colors">
            Creator
          </Link>
        </div>
      </footer>

    </div>
  );
}
