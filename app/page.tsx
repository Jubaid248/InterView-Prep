"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroParrot from "@/components/HeroParrot";

const PILLARS = [
  {
    title: "Your words",
    body: "Checks every answer against STAR so your stories land with a clear situation, action and result.",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {["Situation", "Task", "Action", "Result"].map((s, i) => (
          <span
            key={s}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              i < 3 ? "bg-moss/5 border-moss/20 text-moss" : "bg-beak/5 border-beak/25 text-beak"
            }`}
          >
            {i < 3 ? "✓ " : "+ "}
            {s}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Your voice",
    body: "Tracks speaking pace, filler words and long pauses, then shows you exactly where you rushed.",
    visual: (
      <div className="flex items-end gap-[3px] h-8">
        {[10, 18, 26, 14, 30, 22, 12, 28, 20, 16, 24, 10, 18, 26, 14].map((h, i) => (
          <span key={i} className="w-1.5 rounded-full bg-moss-light/70" style={{ height: h }} />
        ))}
      </div>
    ),
  },
  {
    title: "Your presence",
    body: "Reads eye contact and posture from your webcam. It runs on your device, so video never leaves it.",
    visual: (
      <div className="space-y-1.5">
        {[
          ["Eye contact", 92],
          ["Posture", 84],
        ].map(([label, v]) => (
          <div key={label} className="flex items-center gap-2 text-[11px] text-stone-muted">
            <span className="w-16">{label}</span>
            <span className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
              <span className="block h-full rounded-full bg-moss-light" style={{ width: `${v}%` }} />
            </span>
            <span className="w-7 text-right font-mono text-ink">{v}%</span>
          </div>
        ))}
      </div>
    ),
  },
];

const STEPS = [
  { n: "01", title: "Add your resume", body: "Upload a PDF and pick a role. Tota tailors questions to your experience." },
  { n: "02", title: "Talk it through", body: "Answer out loud, camera on, like the real thing. Tota listens and follows up." },
  { n: "03", title: "Get your report", body: "A scorecard with what worked, what to fix, and stronger model answers." },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"presence" | "voice">("presence");

  return (
    <div className="text-ink overflow-x-hidden">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        <div className="space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-paper text-xs text-stone-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-moss-light" />
            AI voice interviews · free to try
          </div>

          <h1 className="font-serif font-normal text-[3.25rem] sm:text-7xl leading-[0.98] tracking-tight">
            Practice out loud.
            <br />
            <span className="italic text-moss">Walk in ready.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-muted max-w-md leading-relaxed">
            Tota asks real interview questions, listens to your answers, and coaches your words, voice and
            body language, so the real interview feels like a rerun.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/mock-interview"
              className="px-6 py-3 rounded-xl bg-moss text-cream text-sm sm:text-base font-semibold shadow-[0_3px_0_#1C3B16] hover:translate-y-[1px] hover:shadow-[0_2px_0_#1C3B16] active:translate-y-[3px] active:shadow-none transition-all"
            >
              Start interview
            </Link>
            <a
              href="#how-it-works"
              className="px-4 py-3 text-sm sm:text-base font-medium text-moss hover:text-moss-deep transition-colors"
            >
              How it works →
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs text-stone-muted">
            {["Runs in your browser", "Video stays on your device", "Instant scorecard"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-moss-light" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <HeroParrot />
      </section>

      {/* What Tota listens for */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss-light mb-3">What Tota listens for</p>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl leading-tight">
            Feedback on everything an interviewer notices.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl bg-paper border border-line p-6 flex flex-col gap-5 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(23,34,26,0.35)] transition-all duration-300"
            >
              <div className="h-12 flex items-center">{p.visual}</div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-sm text-stone-muted leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sample report */}
      <section id="sample-report" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="rounded-3xl bg-paper border border-line p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss-light">Sample report</p>
            <h2 className="font-serif font-normal text-4xl leading-tight">See exactly what to fix before it counts.</h2>
            <p className="text-sm text-stone-muted leading-relaxed">
              Every answer gets scored on content, delivery and presence, with a short note on what to try next time.
            </p>
            <Link href="/mock-interview" className="inline-block text-sm font-semibold text-moss hover:text-moss-deep">
              Try it with your own resume →
            </Link>
          </div>

          <div className="lg:col-span-3 rounded-2xl bg-white border border-line p-4 sm:p-5 space-y-4 shadow-[0_24px_50px_-30px_rgba(23,34,26,0.4)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-stone-soft">Question 2 of 6 · Senior software engineer</span>
              <div className="flex p-1 rounded-full bg-cream text-xs font-medium">
                {(
                  [
                    ["presence", "Presence"],
                    ["voice", "Voice and STAR"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      activeTab === key ? "bg-white text-ink shadow-sm" : "text-stone-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="font-serif text-xl sm:text-2xl leading-snug">
              &ldquo;Describe a major system migration you led under strict latency requirements.&rdquo;
            </p>

            {activeTab === "presence" ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Eye contact", "92%", "Confident"],
                  ["Composure", "Steady", "Low fidgeting"],
                  ["Posture", "Upright", "Engaged"],
                ].map(([label, value, note]) => (
                  <div key={label} className="rounded-xl bg-cream/60 border border-line p-3">
                    <div className="text-[11px] text-stone-muted">{label}</div>
                    <div className="text-lg font-semibold">{value}</div>
                    <div className="text-[11px] text-moss-light font-medium">{note}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Pace", "140 wpm", "Natural"],
                  ["Filler words", "2", "Barely noticeable"],
                  ["STAR", "3 of 4", "Add the result"],
                ].map(([label, value, note], i) => (
                  <div key={label} className="rounded-xl bg-cream/60 border border-line p-3">
                    <div className="text-[11px] text-stone-muted">{label}</div>
                    <div className="text-lg font-semibold">{value}</div>
                    <div className={`text-[11px] font-medium ${i === 2 ? "text-beak" : "text-moss-light"}`}>{note}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-3 rounded-xl bg-moss/5 border border-moss/15 p-3">
              <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-moss text-cream text-[11px] font-semibold flex items-center justify-center">
                T
              </span>
              <p className="text-xs sm:text-sm text-ink/80 leading-relaxed">
                Strong setup and clear trade-offs. Close with the outcome: how much did latency drop, and how did you
                measure it?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 scroll-mt-28">
        <div className="max-w-xl mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss-light mb-3">How it works</p>
          <h2 className="font-serif font-normal text-4xl sm:text-5xl leading-tight">Three steps to your first report.</h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-line bg-line">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-paper p-6 sm:p-8 space-y-3">
              <span className="font-serif text-4xl text-moss-light">{s.n}</span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-stone-muted leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-moss-deep text-cream px-6 sm:px-12 py-12 sm:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-moss/60" aria-hidden="true" />
          <div className="absolute right-24 -bottom-28 w-64 h-64 rounded-full bg-moss/40" aria-hidden="true" />
          <div className="relative space-y-3 max-w-lg">
            <h2 className="font-serif font-normal text-4xl sm:text-5xl leading-tight">
              Your next interview, <span className="italic">rehearsed.</span>
            </h2>
            <p className="text-cream/70 text-sm sm:text-base">Free to start. Bring your resume and a quiet room.</p>
          </div>
          <Link
            href="/mock-interview"
            className="relative self-start md:self-auto whitespace-nowrap px-7 py-3.5 rounded-xl bg-cream text-moss-deep font-semibold shadow-[0_3px_0_rgba(0,0,0,0.25)] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-none transition-all"
          >
            Start interview
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-10 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-muted">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-line">
            <Image src="/creators/jubaid.jpg" alt="Md. Jubaid Hasan" fill className="object-cover" />
          </div>
          <div>
            <div className="text-ink font-medium">Built by Md. Jubaid Hasan</div>
            <Link href="/creators" className="hover:text-moss transition-colors">
              Meet the creator →
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/mock-interview" className="hover:text-ink transition-colors">
            Mock interview
          </Link>
          <Link href="/creators" className="hover:text-ink transition-colors">
            Creator
          </Link>
          <span>© 2026 Parrot AI</span>
        </div>
      </footer>
    </div>
  );
}
