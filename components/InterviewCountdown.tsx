/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";

interface InterviewCountdownProps {
  onComplete: () => void;
  trackName?: string;
}

export default function InterviewCountdown({
  onComplete,
  trackName,
}: InterviewCountdownProps) {
  const [count, setCount] = useState(5);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play subtle high-tech countdown tone
  const playBeep = (freq: number) => {
    try {
      const audioCtx = audioContextRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    // Initial beep
    playBeep(440);

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playBeep(880); // Higher pitch for final launch
          setTimeout(() => {
            onComplete();
          }, 300);
          return 0;
        }
        playBeep(prev === 2 ? 660 : 440);
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-2xl text-ink select-none animate-in fade-in duration-300">
      {/* Background ambient radial aura */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-beak/20 via-beak/15 to-amber-500/20 blur-3xl pointer-events-none animate-pulse" />

      {/* Top Proctored Badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-beak/15 border border-beak/40 text-beak-deep text-xs font-mono font-bold tracking-widest uppercase mb-10 shadow-lg shadow-beak/10">
        <span className="w-2 h-2 rounded-full bg-beak animate-ping" />
        <span>PROCTORED INTERVIEW STARTING</span>
      </div>

      {/* Center 5-Second Countdown Ring & Number */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-beak/30 animate-spin-slow" />
        
        {/* Pulsing inner ring */}
        <div className="absolute inset-4 rounded-full border-2 border-beak/50 animate-ping opacity-25" />

        {/* Glow backdrop */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-b from-cream to-cream border border-line shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Animated counter number with key animation trigger */}
          <span
            key={count}
            className="text-7xl sm:text-9xl font-semibold bg-gradient-to-b from-white via-line to-beak bg-clip-text text-transparent animate-in zoom-in-75 duration-300 drop-shadow-[0_10px_25px_rgba(239,68,68,0.5)]"
          >
            {count > 0 ? count : "🚀"}
          </span>
        </div>
      </div>

      {/* Instructions & Status */}
      <div className="mt-10 text-center space-y-2 max-w-md px-4">
        <h3 className="text-lg font-bold text-ink">
          {count > 0 ? "Get Ready — Launching Studio" : "Studio Live! Parrot is ready."}
        </h3>
        <p className="text-xs text-stone-muted font-mono leading-relaxed">
          Full screen locked • Camera & microphone live • Gaze tracking armed
        </p>
        <p className="text-[11px] text-stone-soft font-mono pt-1">
          Parrot will speak the first prompt automatically
        </p>
      </div>
    </div>
  );
}
