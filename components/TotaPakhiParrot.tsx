"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function PerchedHeroParrot() {
  const [speechText, setSpeechText] = useState("READY FOR YOUR MOCK INTERVIEW?");
  const [isAnimating, setIsAnimating] = useState(false);

  const speechOptions = [
    "READY FOR YOUR MOCK INTERVIEW?",
    "EYE CONTACT ON THE CAMERA!",
    "STAR METHOD: SITUATION, TASK, ACTION, RESULT!",
    "CONFIDENT POSTURE WINS OFFERS!",
    "KEEP YOUR ANSWERS CONCISE & METRIC-DRIVEN!",
  ];

  const handleParrotClick = () => {
    setIsAnimating(true);
    const nextIdx = Math.floor(Math.random() * speechOptions.length);
    setSpeechText(speechOptions[nextIdx]);
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center cursor-pointer group select-none"
      onClick={handleParrotClick}
    >
      {/* Speech Bubble */}
      <div
        className={`relative mb-3 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/10 text-slate-900 font-extrabold text-xs tracking-wider uppercase font-jakarta flex items-center gap-2 transform group-hover:scale-105 transition-all duration-300 ${
          isAnimating ? "animate-speech-pop" : ""
        }`}
      >
        <span>{speechText}</span>
        <span>🦜</span>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r border-b border-slate-200/90 rotate-45" />
      </div>

      {/* Parrot Container */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/80 bg-white/70 backdrop-blur-xl animate-mascot-float group-hover:shadow-blue-500/15 transition-all">
        <Image
          src="/totapakhi-perched-parrot.png"
          alt="Parrot AI Interview Coach"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
      </div>

      {/* Click Hint */}
      <span className="mt-2 text-[10px] font-mono text-slate-500 group-hover:text-blue-600 transition-colors uppercase tracking-widest font-semibold">
        Tap Parrot for interview tips
      </span>
    </div>
  );
}
