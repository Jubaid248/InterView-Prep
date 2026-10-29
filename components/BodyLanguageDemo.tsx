"use client";

import { useState } from "react";
import Link from "next/link";
import PerchedHeroParrot from "@/components/TotaPakhiParrot";

export default function BodyLanguageDemo() {
  const [activeTab, setActiveTab] = useState<"vision" | "voice" | "summary">("vision");
  const [simulationState, setSimulationState] = useState<"confident" | "nervous">("confident");

  return (
    <div className="w-full space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white/90 border border-line max-w-md mx-auto shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => setActiveTab("vision")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === "vision"
              ? "bg-moss text-white shadow-md shadow-moss/20"
              : "text-stone-muted hover:text-ink"
          }`}
        >
          <span>📹</span>
          <span>Body Language AI</span>
        </button>

        <button
          onClick={() => setActiveTab("voice")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === "voice"
              ? "bg-moss text-white shadow-md shadow-moss/20"
              : "text-stone-muted hover:text-ink"
          }`}
        >
          <span>🎙️</span>
          <span>Voice & STAR AI</span>
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === "summary"
              ? "bg-moss text-white shadow-md shadow-moss/20"
              : "text-stone-muted hover:text-ink"
          }`}
        >
          <span>📊</span>
          <span>Body Language Report</span>
        </button>
      </div>

      {/* Main Studio Frame */}
      <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-white via-white to-cream border border-line shadow-2xl overflow-hidden backdrop-blur-2xl">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-tealbird/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-tealbird/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-line relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-moss" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink/80">
              PARROT AI MULTI-MODAL EVALUATOR // REAL-TIME SESSION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-stone-muted">Interactive Simulation:</span>
            <button
              onClick={() => setSimulationState(simulationState === "confident" ? "nervous" : "confident")}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border ${
                simulationState === "confident"
                  ? "bg-moss-light/15 border-moss-light/40 text-moss"
                  : "bg-amber-500/15 border-amber-500/40 text-amber-800"
              }`}
            >
              Mode: {simulationState === "confident" ? "🎯 Confident Executive" : "⚠️ Nervous / Looking Away"} (Click to Toggle)
            </button>
          </div>
        </div>

        {/* TAB 1: VISION & BODY LANGUAGE AI */}
        {activeTab === "vision" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6 relative z-10">
            
            {/* Left: Simulated Camera Feed & MediaPipe Landmarks */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-cream border border-line shadow-inner flex flex-col justify-between p-4 group">
                
                {/* Background Face Mesh Canvas Simulation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-60 pointer-events-none">
                  {/* Stylized Face Reticle */}
                  <div
                    className={`relative w-44 h-56 rounded-[48%] border-2 transition-all duration-700 flex items-center justify-center ${
                      simulationState === "confident"
                        ? "border-moss/60 shadow-[0_0_30px_rgba(0,242,195,0.2)]"
                        : "border-amber-400/60 translate-x-8 rotate-6 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                    }`}
                  >
                    {/* Eyes tracking dots */}
                    <div className="absolute top-16 left-9 w-3 h-3 rounded-full bg-moss animate-pulse" />
                    <div className="absolute top-16 right-9 w-3 h-3 rounded-full bg-moss animate-pulse" />
                    {/* Nose tip landmark */}
                    <div className="absolute top-28 w-2.5 h-2.5 rounded-full bg-tealbird/30" />
                    {/* Gaze vector reticle line */}
                    <div
                      className={`absolute top-28 h-0.5 bg-gradient-to-r from-transparent via-moss to-transparent transition-all duration-500 ${
                        simulationState === "confident" ? "w-16" : "w-28 rotate-12 bg-amber-400"
                      }`}
                    />
                    {/* Head Yaw Guide */}
                    <span className="absolute -bottom-6 text-[11px] font-mono text-stone-muted uppercase tracking-widest">
                      Head Yaw: {simulationState === "confident" ? "+1.8° [Centered]" : "-18.4° [Looking Off-Screen]"}
                    </span>
                  </div>
                </div>

                {/* Top Overlay Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#00f2c3] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                    <span>MediaPipe Vision Pipeline</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-line">
                    FPS: 30 · 100% Client-Side
                  </div>
                </div>

                {/* Bottom Overlay Status */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-line">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{simulationState === "confident" ? "🟢" : "🟡"}</span>
                    <span className="text-xs font-semibold text-ink">
                      {simulationState === "confident"
                        ? "Optimal Eye Contact & Posture"
                        : "Caution: Gaze drifted away from lens"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-moss">
                    {simulationState === "confident" ? "94% Direct Gaze" : "48% Direct Gaze"}
                  </span>
                </div>
              </div>

              {/* Privacy pill */}
              <div className="flex items-center gap-2 text-[11px] text-stone-muted font-mono">
                <span>🔒</span>
                <span>Privacy Guaranteed: Video is analyzed locally in memory. Zero pixels are recorded or uploaded.</span>
              </div>
            </div>

            {/* Right: Live Body Language Summary Metrics & Mascot */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-moss font-bold">
                  REAL-TIME VISION METRICS
                </span>
                <h3 className="text-xl font-bold text-ink">
                  How Body Language AI Rates You
                </h3>
                <p className="text-xs text-stone-muted">
                  Interviewers form subconscious opinions in the first 30 seconds. Parrot measures the 4 critical non-verbal signals:
                </p>
              </div>

              {/* Metric 1: Eye Contact */}
              <div className="p-3.5 rounded-2xl bg-cream/60 border border-line space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-ink">
                    <span>👀</span> Eye Contact Consistency
                  </span>
                  <span className={simulationState === "confident" ? "text-moss" : "text-amber-800"}>
                    {simulationState === "confident" ? "94% (Target: >75%)" : "48% (Needs focus)"}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-cream overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      simulationState === "confident" ? "bg-moss w-[94%]" : "bg-amber-400 w-[48%]"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-stone-muted">
                  {simulationState === "confident"
                    ? "Maintains forward focus with natural blink patterns. Communicates honesty & conviction."
                    : "Frequent downward glances indicate reading notes or lack of confidence."}
                </p>
              </div>

              {/* Metric 2: Movement & Fidget Score */}
              <div className="p-3.5 rounded-2xl bg-cream/60 border border-line space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-ink">
                    <span>🧘</span> Composure & Stability
                  </span>
                  <span className={simulationState === "confident" ? "text-moss" : "text-amber-800"}>
                    {simulationState === "confident" ? "Low Movement (Calm)" : "High Jitter (Nervous)"}
                  </span>
                </div>
                <p className="text-[11px] text-stone-muted">
                  {simulationState === "confident"
                    ? "Nose-tip anchor remains stable. Balanced shoulder position reflects leadership presence."
                    : "Excessive head tilt and rapid posture shifts signal interview anxiety."}
                </p>
              </div>

              {/* Metric 3: Head Tilt & Alignment */}
              <div className="p-3.5 rounded-2xl bg-cream/60 border border-line flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <span>📐</span> Head Yaw & Orientation
                  </div>
                  <p className="text-[11px] text-stone-muted mt-0.5">
                    {simulationState === "confident" ? "Center-aligned (±2°)" : "Off-axis (-18°)"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-tealbird/10 border border-tealbird/30 text-xs font-mono text-moss font-bold">
                  {simulationState === "confident" ? "OPTIMAL" : "ADJUST"}
                </span>
              </div>

              {/* Live Parrot Coach Tip */}
              <div className="p-3.5 rounded-2xl bg-tealbird/10 border border-tealbird-light/30 flex items-start gap-3">
                <span className="text-xl">🦜</span>
                <div>
                  <span className="text-xs font-bold text-moss block">Parrot Vision Tip:</span>
                  <p className="text-xs text-ink mt-0.5">
                    {simulationState === "confident"
                      ? "“Outstanding composure! Your direct gaze and steady posture command attention. Keep this up during your technical explanation.”"
                      : "“Sqwawk! Lift your chin slightly and look right into the camera lens. Looking down makes you sound uncertain!”"}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: VOICE & STAR REASONING */}
        {activeTab === "voice" && (
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              {/* Question */}
              <div className="p-4 rounded-2xl bg-cream border border-line space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-widest text-moss font-bold">
                  Target Role: Staff Software Engineer @ Stripe
                </div>
                <h4 className="text-sm sm:text-base font-bold text-ink">
                  &ldquo;Describe a major distributed system outage you debugged under pressure. What was your systematic remediation plan?&rdquo;
                </h4>
              </div>

              {/* Waveform & Transcript */}
              <div className="p-5 rounded-2xl bg-white border border-line space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-moss animate-ping" />
                    <span className="text-xs font-mono text-moss font-bold">Live Audio Transcription</span>
                  </div>
                  <span className="text-xs font-mono text-stone-muted">142 WPM · 0 Filler Words</span>
                </div>

                {/* Animated Wave */}
                <div className="flex items-center justify-center gap-1.5 h-12 bg-cream rounded-xl px-4">
                  <div className="w-1.5 bg-moss rounded-full animate-wave-1" />
                  <div className="w-1.5 bg-tealbird/30 rounded-full animate-wave-2" />
                  <div className="w-1.5 bg-moss rounded-full animate-wave-3" />
                  <div className="w-1.5 bg-tealbird-light rounded-full animate-wave-4" />
                  <div className="w-1.5 bg-moss rounded-full animate-wave-5" />
                  <div className="w-1.5 bg-tealbird-light rounded-full animate-wave-2" />
                  <div className="w-1.5 bg-moss rounded-full animate-wave-1" />
                  <div className="w-1.5 bg-tealbird/30 rounded-full animate-wave-3" />
                  <div className="w-1.5 bg-moss rounded-full animate-wave-4" />
                </div>

                {/* STAR Highlighted Transcript */}
                <div className="p-3.5 rounded-xl bg-cream border border-line text-xs text-ink/80 leading-relaxed font-sans space-y-2">
                  <p>
                    <span className="px-1.5 py-0.5 rounded bg-moss-light/20 text-moss-deep font-mono font-bold mr-1.5">
                      [Situation]
                    </span>
                    During Black Friday peak load, our payment idempotency cache started experiencing high-frequency p99 latency spikes of over 850ms.
                  </p>
                  <p>
                    <span className="px-1.5 py-0.5 rounded bg-tealbird/20 text-tealbird-deep font-mono font-bold mr-1.5">
                      [Action]
                    </span>
                    I immediately initiated circuit breakers on non-critical microservices and analyzed shard hot-spotting using distributed traces.
                  </p>
                  <p>
                    <span className="px-1.5 py-0.5 rounded bg-moss-light/20 text-moss font-mono font-bold mr-1.5">
                      [Result]
                    </span>
                    Latency normalized to 45ms within 11 minutes, saving an estimated $1.2M in blocked customer checkout volume.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: STAR Scores */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-2">
                <span className="text-[11px] font-mono text-moss font-bold uppercase">Reasoning Assessment</span>
                <div className="text-2xl font-semibold text-ink">9.6 / 10</div>
                <div className="text-xs text-stone-muted">
                  Exceptional STAR execution. Metrics quantified ($1.2M saved, 45ms latency) without hesitation.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-cream border border-line">
                  <div className="text-[11px] text-stone-muted font-mono">STAR Structure</div>
                  <div className="text-base font-bold text-moss">98%</div>
                </div>
                <div className="p-3 rounded-xl bg-cream border border-line">
                  <div className="text-[11px] text-stone-muted font-mono">Clarity & Pace</div>
                  <div className="text-base font-bold text-tealbird-deep">142 WPM</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-tealbird/10 border border-tealbird/20 text-xs text-ink/80">
                <strong className="text-moss">Pacing Insight:</strong> Natural rhythm without filler words (&ldquo;um&rdquo;, &ldquo;like&rdquo;). Very high hire signal.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FULL POST-INTERVIEW BODY LANGUAGE SUMMARY REPORT */}
        {activeTab === "summary" && (
          <div className="pt-6 space-y-6 relative z-10">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-tealbird/10 via-tealbird/10 to-cream border border-tealbird/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-tealbird-light/20 text-moss text-[11px] font-mono font-bold uppercase tracking-wider">
                  Official Session Debrief
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-ink mt-1.5">
                  Your Body Language & Readiness Summary
                </h3>
                <p className="text-xs text-stone-muted mt-0.5">
                  Evaluated across 5 questions · Real-time vision + speech telemetry
                </p>
              </div>

              <div className="flex items-center gap-4 bg-cream p-3 rounded-2xl border border-line shrink-0">
                <div className="text-center">
                  <div className="text-xs text-stone-muted font-mono">Readiness</div>
                  <div className="text-2xl font-semibold text-moss">94%</div>
                </div>
                <div className="h-8 w-px bg-cream" />
                <div className="text-center">
                  <div className="text-xs text-stone-muted font-mono">Hire Signal</div>
                  <div className="text-2xl font-semibold text-moss">STRONG</div>
                </div>
              </div>
            </div>

            {/* 3-Column Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink/80">📹 Non-Verbal Presence</span>
                  <span className="text-xs font-mono font-bold text-moss">92 / 100</span>
                </div>
                <ul className="text-xs text-stone-muted space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>Eye Contact (88%):</strong> Kept direct gaze without drifting off.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>Posture:</strong> Maintained upright open shoulders.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-800">!</span>
                    <span><strong>Movement:</strong> Occasional head swivel when pausing.</span>
                  </li>
                </ul>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink/80">🎙️ Voice & Fluency</span>
                  <span className="text-xs font-mono font-bold text-tealbird-deep">96 / 100</span>
                </div>
                <ul className="text-xs text-stone-muted space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>Pace:</strong> 138 WPM (Optimal conversational range).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>Fillers:</strong> Zero &ldquo;ums&rdquo; or &ldquo;ahs&rdquo; detected.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>Pauses:</strong> Deliberate 1.5s thinking pauses.</span>
                  </li>
                </ul>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink/80">🧠 Technical Reasoning</span>
                  <span className="text-xs font-mono font-bold text-moss">95 / 100</span>
                </div>
                <ul className="text-xs text-stone-muted space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>STAR Alignment:</strong> Addressed all 4 stages clearly.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>Metric Driven:</strong> Cited concrete business metrics.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-moss">✓</span>
                    <span><strong>Architecture:</strong> Accurate latency trade-offs.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actionable Next Step */}
            <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-cream/60 border border-line">
              <div className="text-xs text-ink/80">
                Want to test this live with your webcam and microphone? Launch a full practice session.
              </div>
              <Link
                href="/mock-interview"
                className="px-5 py-2.5 rounded-full bg-moss hover:bg-moss-deep text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Try With Your Camera →
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Mascot Perched Float */}
      <div className="flex justify-center pt-2">
        <PerchedHeroParrot />
      </div>
    </div>
  );
}
