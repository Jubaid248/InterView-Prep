"use client";

import React, { useMemo } from "react";
import Image from "next/image";

interface ParrotAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  currentSpokenText?: string;
  onReplaySpeech?: () => void;
  audioEnabled?: boolean;
}

export default function ParrotAvatar({
  isSpeaking,
  isListening,
  isProcessing,
  currentSpokenText = "",
  onReplaySpeech,
  audioEnabled = true,
}: ParrotAvatarProps) {
  // Determine Parrot's AI state
  const statusInfo = useMemo(() => {
    if (isProcessing) {
      return {
        label: "Parrot is evaluating...",
        badge: "ANALYZING RESPONSE",
        color: "amber",
        borderColor: "border-amber-500/40",
        ringColor: "ring-amber-500/30",
        glowColor: "from-amber-500/20 via-orange-500/10 to-transparent",
        dotColor: "bg-amber-400",
      };
    }
    if (isSpeaking) {
      return {
        label: "Parrot is speaking...",
        badge: "AI INTERVIEWER SPEAKING",
        color: "emerald",
        borderColor: "border-emerald-500/40",
        ringColor: "ring-emerald-500/30",
        glowColor: "from-emerald-500/20 via-teal-500/10 to-transparent",
        dotColor: "bg-emerald-400",
      };
    }
    if (isListening) {
      return {
        label: "Parrot is listening to you...",
        badge: "LISTENING • MIC ACTIVE",
        color: "cyan",
        borderColor: "border-cyan-500/40",
        ringColor: "ring-cyan-500/30",
        glowColor: "from-cyan-500/20 via-blue-500/10 to-transparent",
        dotColor: "bg-cyan-400",
      };
    }
    return {
      label: "Parrot is ready for your answer",
      badge: "STANDBY • READY",
      color: "indigo",
      borderColor: "border-indigo-500/30",
      ringColor: "ring-indigo-500/20",
      glowColor: "from-indigo-500/15 via-purple-500/5 to-transparent",
      dotColor: "bg-indigo-400",
    };
  }, [isProcessing, isSpeaking, isListening]);

  return (
    <div className="relative flex flex-col items-center justify-between h-full w-full max-w-md mx-auto p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xl backdrop-blur-2xl overflow-hidden">
      {/* Background ambient radial glow */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-b ${statusInfo.glowColor} blur-3xl pointer-events-none transition-all duration-700`}
      />

      {/* Top Header: AI Identity & Badge */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full relative flex items-center justify-center">
            <span
              className={`absolute w-full h-full rounded-full ${statusInfo.dotColor} animate-ping opacity-75`}
            />
            <span
              className={`relative w-2 h-2 rounded-full ${statusInfo.dotColor}`}
            />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wider text-slate-900 uppercase font-jakarta flex items-center gap-1.5">
              <span>Parrot</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                AI v2.4
              </span>
            </h3>
            <p className="text-[10px] text-slate-600 font-mono">AI Interview Proctor</p>
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${statusInfo.borderColor} bg-slate-50 text-slate-800 flex items-center gap-1.5 backdrop-blur-md`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
          {statusInfo.badge}
        </div>
      </div>

      {/* Center: Parrot Avatar with Animated Aura & Sound Waves */}
      <div className="relative my-6 flex flex-col items-center justify-center">
        {/* Animated concentric rings */}
        <div
          className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-slate-200 ${
            isSpeaking ? "animate-spin-slow scale-105" : ""
          } transition-transform duration-700`}
        />
        <div
          className={`absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed border-slate-300 ${
            isSpeaking ? "animate-reverse-spin" : ""
          }`}
        />

        {/* Dynamic Voice Wave Rings (Visible when speaking or listening) */}
        {(isSpeaking || isListening) && (
          <>
            <div
              className={`absolute w-60 h-60 rounded-full border-2 ${
                isSpeaking ? "border-emerald-400/40" : "border-cyan-400/40"
              } animate-ping opacity-25`}
            />
            <div
              className={`absolute w-72 h-72 rounded-full border ${
                isSpeaking ? "border-emerald-500/20" : "border-cyan-500/20"
              } animate-pulse`}
            />
          </>
        )}

        {/* Mascot Avatar Container */}
        <div
          className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-b from-slate-100 to-slate-50 border-2 ${statusInfo.borderColor} shadow-2xl transition-all duration-500 flex items-center justify-center overflow-hidden`}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src="/totapakhi-perched-parrot.png"
              alt="Parrot AI Interviewer"
              fill
              className={`object-cover object-center transition-all duration-500 ${
                isSpeaking
                  ? "scale-105 brightness-110"
                  : isListening
                  ? "scale-100 brightness-105"
                  : "scale-95 brightness-95"
              }`}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-transparent" />
          </div>

          {/* Sound Wave Frequency Overlay on Parrot Avatar */}
          {isSpeaking && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-1 rounded-full bg-slate-50 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-1 h-3 rounded bg-emerald-400 animate-waveform-1" />
              <span className="w-1 h-5 rounded bg-emerald-400 animate-waveform-2" />
              <span className="w-1 h-2 rounded bg-emerald-400 animate-waveform-3" />
              <span className="w-1 h-4 rounded bg-emerald-400 animate-waveform-4" />
              <span className="w-1 h-6 rounded bg-emerald-400 animate-waveform-5" />
              <span className="w-1 h-3 rounded bg-emerald-400 animate-waveform-2" />
              <span className="w-1 h-4 rounded bg-emerald-400 animate-waveform-3" />
            </div>
          )}
        </div>

        {/* State Label */}
        <div className="mt-4 flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-700 font-jakarta">
            {statusInfo.label}
          </p>
        </div>
      </div>

      {/* Bottom: Live Speech Captions / Subtitles Box */}
      <div className="w-full relative z-10 space-y-3">
        <div className="w-full min-h-[72px] max-h-28 overflow-y-auto p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pb-1 border-b border-slate-200 mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <span>💬</span> Live Captions
            </span>
            {isSpeaking && (
              <span className="text-emerald-600 font-mono animate-pulse">
                Speaking...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium line-clamp-3">
            {currentSpokenText ? (
              <span className="text-slate-900 italic">&ldquo;{currentSpokenText}&rdquo;</span>
            ) : (
              <span className="text-slate-500 italic">
                Parrot is waiting to ask the next prompt...
              </span>
            )}
          </p>
        </div>

        {/* Speech Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
            <span>🔊 Audio:</span>
            <span className={audioEnabled ? "text-emerald-600 font-bold" : "text-slate-500"}>
              {audioEnabled ? "Enabled" : "Muted"}
            </span>
          </div>

          {onReplaySpeech && (
            <button
              onClick={onReplaySpeech}
              disabled={isSpeaking || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Ask Parrot to repeat the question"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Repeat Prompt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
