"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PerchedHeroParrot from "@/components/TotaPakhiParrot";
import DottedWavePattern from "@/components/DottedWavePattern";

interface Creator {
  name: string;
  role: string;
  image: string;
  description: string;
  tag: string;
  badgeBg: string;
  badgeText: string;
  borderGlow: string;
}

const CREATORS: Creator[] = [
  {
    name: "Farhan Ashraf Muhaimin",
    role: "Product Designing",
    image: "/creators/farhan.jpg",
    description:
      "Crafting user-centric UI/UX design systems, modern visual ergonomics, and 3D interactive user experiences for TotaPakhi.",
    tag: "Design Lead",
    badgeBg: "bg-indigo-500/20",
    badgeText: "text-indigo-300",
    borderGlow: "hover:border-indigo-400",
  },
  {
    name: "Raiyan Razi Rahman",
    role: "Data Analyst",
    image: "/creators/raiyan.jpg",
    description:
      "Engineered prompt-by-prompt speech metrics, filler word analytics, and quantitative IELTS criteria evaluation models.",
    tag: "Data Lead",
    badgeBg: "bg-purple-500/20",
    badgeText: "text-purple-300",
    borderGlow: "hover:border-purple-400",
  },
  {
    name: "Md. Jubaid Hasan",
    role: "Full Stack Developer",
    image: "/creators/jubaid.jpg",
    description:
      "Architected the full-stack Next.js engine, speech recognition pipelines, real-time LLM integrations, and session storage.",
    tag: "Engineering Lead",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-300",
    borderGlow: "hover:border-amber-400",
  },
];

export default function IntakePage() {
  const router = useRouter();
  const [startingTrack, setStartingTrack] = useState<string | null>(null);

  const handleSelectTrack = async (
    selectedTrack: "mock-interview" | "communication-builder" | "ielts-speaking"
  ) => {
    if (selectedTrack === "mock-interview") {
      router.push("/mock-interview");
      return;
    }

    setStartingTrack(selectedTrack);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: selectedTrack }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text.slice(0, 150)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to start session.");
      }

      localStorage.setItem("currentSessionId", data.sessionId);

      const history = JSON.parse(localStorage.getItem("sessionHistory") || "[]");
      history.unshift({
        sessionId: data.sessionId,
        createdAt: new Date().toISOString(),
        status: "in_progress",
        track: selectedTrack,
      });
      localStorage.setItem("sessionHistory", JSON.stringify(history));

      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      console.error("Failed to launch session", err);
      setStartingTrack(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-24 pb-24">
      {/* 💥 HERO SECTION (BOON / SEE WHAT EYE SEE Editorial Layout) 💥 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 sm:pt-8">
        {/* Left Side: Massive Editorial Typography */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>TOTAPAKHI VOICE INTELLIGENCE</span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-[88px] font-black tracking-tighter text-amber-50 leading-[0.88] font-jakarta uppercase">
            MASTER THE <br />
            <span className="glow-text-gold">EFFECT.</span>
          </h1>

          <p className="text-zinc-300 text-base sm:text-xl max-w-xl leading-relaxed font-normal">
            A reasoning & voice studio built around real-time AI feedback — designed for high-stakes interviews, structured communication frameworks, and official IELTS Speaking exams.
          </p>

          {/* Action Pills */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <a
              href="#practice-studios"
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 font-jakarta"
            >
              Select Your Studio ↓
            </a>
            <a
              href="#creators-section"
              className="px-6 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 transition-colors"
            >
              Meet Creators →
            </a>
          </div>
        </div>

        {/* Right Side: Perched Mascot Character with "HELLO!" Speech Bubble */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <PerchedHeroParrot />
        </div>
      </div>

      {/* 💥 TRACK SELECTOR SECTION: "THE TOTAPAKHI DIFFERENCE" 💥 */}
      <div id="practice-studios" className="relative space-y-12 pt-8">
        {/* Dotted Amber Particle Arc SVG Background */}
        <DottedWavePattern />

        <div className="text-center space-y-3 relative z-10">
          <span className="text-xs font-mono font-extrabold uppercase tracking-[0.3em] text-amber-400">
            THE TOTAPAKHI DIFFERENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-jakarta tracking-tight">
            Select Your Practice Studio Track
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Click any studio below to launch directly into your practice session.
          </p>
        </div>

        {/* 3 Luxury Dark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Card 1: Mock Interview */}
          <div
            onClick={() => handleSelectTrack("mock-interview")}
            className="boon-card-interactive p-8 rounded-3xl cursor-pointer flex flex-col justify-between space-y-6 border border-white/10 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-amber-400 stroke-current" fill="none" strokeWidth="2">
                <circle cx="20" cy="20" r="16" strokeDasharray="3 3" />
                <circle cx="20" cy="20" r="10" />
                <circle cx="20" cy="20" r="4" fill="currentColor" />
              </svg>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white font-jakarta group-hover:text-amber-400 transition-colors">
                Mock Interview
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                A reasoning partner built around your target job role & resume content. Tailored questions and instant STAR method analysis.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Job & Resume AI</span>
              <span className="font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                Configure & Launch →
              </span>
            </div>
          </div>

          {/* Card 2: Communication Builder */}
          <div
            onClick={() => handleSelectTrack("communication-builder")}
            className="boon-card-interactive p-8 rounded-3xl cursor-pointer flex flex-col justify-between space-y-6 border border-white/10 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-amber-400 stroke-current" fill="none" strokeWidth="2">
                <circle cx="20" cy="20" r="16" />
                <ellipse cx="20" cy="20" rx="16" ry="6" strokeDasharray="2 2" />
                <ellipse cx="20" cy="20" rx="6" ry="16" strokeDasharray="2 2" />
              </svg>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white font-jakarta group-hover:text-amber-400 transition-colors">
                Communication Builder
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Master STAR, CAR, SEE & PAR frameworks with sentence-by-sentence breakdowns for interviews, teaching, and small talk.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">4 Frameworks</span>
              <span className="font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                {startingTrack === "communication-builder" ? "Launching..." : "Launch Practice →"}
              </span>
            </div>
          </div>

          {/* Card 3: IELTS Speaking */}
          <div
            id="track-ielts-btn"
            onClick={() => handleSelectTrack("ielts-speaking")}
            className="boon-card-interactive p-8 rounded-3xl cursor-pointer flex flex-col justify-between space-y-6 border border-white/10 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-amber-400 stroke-current" fill="none" strokeWidth="2">
                <circle cx="20" cy="20" r="16" strokeDasharray="4 4" />
                <line x1="4" y1="20" x2="36" y2="20" />
                <line x1="20" y1="4" x2="20" y2="36" />
              </svg>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white font-jakarta group-hover:text-amber-400 transition-colors">
                IELTS Speaking
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Authentic 3-part exam flow across Part 1 personal, Part 2 Cue Card, and Part 3 discussion prompts with Band 1–9 analysis.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Parts 1, 2 & 3</span>
              <span className="font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                {startingTrack === "ielts-speaking" ? "Launching..." : "Launch Exam →"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 💥 COLORFUL CREATORS SECTION AT BOTTOM OF HOMEPAGE 💥 */}
      <div id="creators-section" className="space-y-10 pt-16 border-t border-white/10">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-extrabold uppercase tracking-[0.3em] text-amber-400">
            THE ARCHITECTS BEHIND TOTAPAKHI
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-jakarta tracking-tight">
            Meet the Creators
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            The team combining product design, data analytics, and full-stack engineering.
          </p>
        </div>

        {/* 3 Vibrant Full-Color Creator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CREATORS.map((creator, idx) => (
            <div
              key={creator.name}
              className={`boon-card-interactive rounded-3xl overflow-hidden border border-white/15 flex flex-col justify-between group transition-all duration-300 ${creator.borderGlow}`}
            >
              {/* Full-Color Photo Container (NO Grayscale) */}
              <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-zinc-950">
                <Image
                  src={creator.image}
                  alt={creator.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full ${creator.badgeBg} ${creator.badgeText} border border-white/20 backdrop-blur-md shadow-lg`}>
                    0{idx + 1} // {creator.tag}
                  </span>
                </div>
              </div>

              {/* Creator Info Box */}
              <div className="p-6 sm:p-8 space-y-3 bg-[#0a0a0a]">
                <div>
                  <h3 className="text-xl font-bold text-white font-jakarta group-hover:text-amber-400 transition-colors">
                    {creator.name}
                  </h3>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mt-0.5">
                    {creator.role}
                  </p>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {creator.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
