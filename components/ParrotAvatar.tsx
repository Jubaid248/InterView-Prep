"use client";

import React, { useEffect, useMemo, useState } from "react";
import FlyingParrot from "@/components/FlyingParrot";

interface ParrotAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  currentSpokenText?: string;
  onReplaySpeech?: () => void;
  audioEnabled?: boolean;
}

// Browser speech synthesis doesn't give reliable word timings across browsers,
// so while Tota is speaking the beak follows a syllable-like rhythm instead.
function useTalkingMouth(active: boolean) {
  const [mouth, setMouth] = useState(0);

  useEffect(() => {
    if (!active) {
      setMouth(0);
      return;
    }
    let syllable = 0;
    const id = setInterval(() => {
      syllable += 1;
      // Every few syllables, close briefly as if between words
      if (syllable % (3 + Math.floor(Math.random() * 3)) === 0) setMouth(0.05);
      else setMouth(0.35 + Math.random() * 0.65);
    }, 95);
    return () => clearInterval(id);
  }, [active]);

  return mouth;
}

export default function ParrotAvatar({
  isSpeaking,
  isListening,
  isProcessing,
  currentSpokenText = "",
  onReplaySpeech,
  audioEnabled = true,
}: ParrotAvatarProps) {
  const mouth = useTalkingMouth(isSpeaking);

  const status = useMemo(() => {
    if (isProcessing) {
      return { label: "Tota is reviewing your answer", badge: "Reviewing", dot: "bg-amber-500", flap: 0.6 };
    }
    if (isSpeaking) {
      return { label: "Tota is asking the question", badge: "Speaking", dot: "bg-moss-light", flap: 0.8 };
    }
    if (isListening) {
      return { label: "Tota is listening to you", badge: "Listening", dot: "bg-tealbird", flap: 1.2 };
    }
    return { label: "Tota is ready for your answer", badge: "Ready", dot: "bg-stone-soft", flap: 1.1 };
  }, [isProcessing, isSpeaking, isListening]);

  return (
    <div className="relative flex flex-col items-center justify-between h-full w-full max-w-md mx-auto p-4 sm:p-5 rounded-3xl bg-paper border border-line shadow-[0_24px_50px_-30px_rgba(23,34,26,0.35)] overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-line relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-moss text-cream text-xs font-semibold flex items-center justify-center">T</span>
          <div>
            <h3 className="text-sm font-semibold text-ink leading-tight">Tota</h3>
            <p className="text-[11px] text-stone-muted">AI interviewer</p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-line bg-cream text-ink flex items-center gap-1.5">
          <span className="relative flex w-2 h-2">
            {(isSpeaking || isListening || isProcessing) && (
              <span className={`absolute inset-0 rounded-full ${status.dot} animate-ping opacity-60`} />
            )}
            <span className={`relative w-2 h-2 rounded-full ${status.dot}`} />
          </span>
          {status.badge}
        </div>
      </div>

      {/* Parrot stage */}
      <div className="relative my-3 w-full flex flex-col items-center justify-center">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64">
          <div className="absolute inset-[6%] rounded-full bg-[#EAE4D4]" />
          <div className="absolute inset-[20%] rounded-full bg-[#E2DBC8]/70" />
          {(isSpeaking || isListening) && (
            <>
              <div
                className={`absolute inset-[6%] rounded-full border animate-ring ${
                  isSpeaking ? "border-moss-light/50" : "border-tealbird/50"
                }`}
              />
              <div
                className={`absolute inset-[6%] rounded-full border animate-ring [animation-delay:0.8s] ${
                  isSpeaking ? "border-moss-light/40" : "border-tealbird/40"
                }`}
              />
            </>
          )}
          <FlyingParrot
            mouth={mouth}
            speaking={isSpeaking}
            flapSeconds={status.flap}
            className="absolute inset-0 w-full h-full drop-shadow-[0_14px_16px_rgba(23,34,26,0.18)]"
          />
        </div>

        <p className="mt-1 text-xs font-medium text-stone-muted">{status.label}</p>
      </div>

      {/* Captions */}
      <div className="w-full relative z-10 space-y-3">
        <div className="w-full min-h-[72px] max-h-28 overflow-y-auto p-3.5 rounded-2xl bg-white border border-line">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-soft pb-1.5 mb-1.5 border-b border-line">
            <span>Live captions</span>
            {isSpeaking && <span className="text-moss-light animate-pulse">speaking…</span>}
          </div>
          <p className="text-[13px] leading-relaxed line-clamp-3">
            {currentSpokenText ? (
              <span className="font-serif text-base text-ink">&ldquo;{currentSpokenText}&rdquo;</span>
            ) : (
              <span className="text-stone-soft italic">Tota is about to ask the next question…</span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${audioEnabled ? "bg-moss-light" : "bg-stone-soft"}`} />
            Audio {audioEnabled ? "on" : "muted"}
          </div>

          {onReplaySpeech && (
            <button
              onClick={onReplaySpeech}
              disabled={isSpeaking || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-cream border border-line text-[11px] font-semibold text-ink transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Ask Tota to repeat the question"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Repeat question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
