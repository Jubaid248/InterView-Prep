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
      <div className="absolute w-[500px] h-[500px] rounded-full bg-moss-light/10 blur-3xl pointer-events-none" />

      {/* Top Proctored Badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-moss/5 border border-moss/20 text-moss text-xs font-semibold mb-10">
        <span className="w-2 h-2 rounded-full bg-moss-light animate-pulse" />
        <span>Real interview</span>
      </div>

      {/* Center 5-Second Countdown Ring & Number */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-line animate-spin-slow" />
        
        {/* Pulsing inner ring */}
        <div className="absolute inset-4 rounded-full border-2 border-moss-light/50 animate-ping opacity-25" />

        {/* Glow backdrop */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-b from-cream to-cream border border-line shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Animated counter number with key animation trigger */}
          <span
            key={count}
            className="font-serif text-8xl sm:text-9xl text-ink animate-in zoom-in-75 duration-300"
          >
            {count > 0 ? count : "Go"}
          </span>
        </div>
      </div>

      {/* Instructions & Status */}
      <div className="mt-10 text-center space-y-2 max-w-md px-4">
        <h3 className="text-lg font-bold text-ink">
          {count > 0 ? `Your interview starts in ${count}` : "Tota is ready when you are"}
        </h3>
        <p className="text-sm text-stone-muted leading-relaxed">
          Full screen, camera and mic on. Take a breath.
        </p>
        <p className="text-xs text-stone-soft pt-1">
          Tota will ask the first question out loud.
        </p>
      </div>
    </div>
  );
}
