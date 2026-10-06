"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function PerchedHeroParrot() {
  const [speechText, setSpeechText] = useState("HELLO! READY TO SPEAK?");
  const [isAnimating, setIsAnimating] = useState(false);

  const speechOptions = [
    "HELLO! READY TO SPEAK?",
    "EYE'VE SEEN SOME GREAT ANSWERS!",
    "SQWAK! SPEAK WITH STRUCTURE!",
    "STAR FRAMEWORK ACTIVATED!",
    "IELTS BAND 9 PRACTICE TIME!",
  ];

  const handleParrotClick = () => {
    setIsAnimating(true);
    const nextIdx = Math.floor(Math.random() * speechOptions.length);
    setSpeechText(speechOptions[nextIdx]);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center cursor-pointer group"
      onClick={handleParrotClick}
    >
      {/* Speech Bubble (Image 4 Style: "HELLO!") */}
      <div 
        className={`relative mb-3 px-5 py-2.5 rounded-2xl bg-white border-2 border-zinc-900 shadow-2xl text-zinc-950 font-black text-xs sm:text-sm tracking-wider uppercase font-jakarta flex items-center gap-2 transform group-hover:scale-105 transition-all duration-300 ${
          isAnimating ? "animate-speech-pop" : ""
        }`}
      >
        <span>{speechText}</span>
        <span className="text-amber-500">🦜</span>
        {/* Pointer tail */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-zinc-900 rotate-45" />
      </div>

      {/* 3D Perched Parrot Image Container (Image 3 Style) */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl animate-mascot-float">
        <Image
          src="/totapakhi-perched-parrot.png"
          alt="TotaPakhi Perched Parrot Mascot"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
        {/* Soft Warm Rim Light Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
      </div>

      {/* Click Hint */}
      <span className="mt-2 text-[10px] font-mono text-zinc-300 group-hover:text-amber-400 transition-colors uppercase tracking-widest font-semibold">
        [ Click Parrot To Interact ]
      </span>
    </div>
  );
}
