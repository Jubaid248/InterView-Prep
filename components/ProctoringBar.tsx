"use client";

import React, { useState, useEffect } from "react";

interface ProctoringBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isFollowUp?: boolean;
  totalViolations: number;
  isFullscreen: boolean;
  onRequestFullscreen: () => void;
  audioEnabled: boolean;
  onToggleAudio: (enabled: boolean) => void;
  onExit: () => void;
  trackName?: string;
}

const TRACK_NAMES: Record<string, string> = {
  "mock-interview": "Mock interview",
  "ielts-speaking": "IELTS Speaking",
  "communication-builder": "Communication practice",
  "debate-practice": "Debate practice",
  "negotiation-practice": "Negotiation practice",
};

export default function ProctoringBar({
  currentQuestionIndex,
  totalQuestions,
  isFollowUp = false,
  totalViolations,
  isFullscreen,
  onRequestFullscreen,
  audioEnabled,
  onToggleAudio,
  onExit,
  trackName,
}: ProctoringBarProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Live timer for the interview session
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <header className="w-full bg-cream/60 border-b border-line px-4 sm:px-6 py-2.5 backdrop-blur-xl flex items-center justify-between gap-4 z-40 select-none">
        {/* Left: Parrot AI & Track Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-moss-light" aria-hidden="true" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-ink">Parrot</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-moss-light/20 text-moss-deep font-semibold border border-moss-light/30">
                  Real interview
                </span>
              </div>
              <span className="text-[11px] text-stone-muted font-mono hidden sm:inline">
                {TRACK_NAMES[trackName || ""] || "Mock interview"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Progress & Session Clock */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Question step indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalQuestions || 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx < currentQuestionIndex
                      ? "w-4 bg-moss-light"
                      : idx === currentQuestionIndex
                      ? `w-6 ${isFollowUp ? "bg-amber-400 animate-pulse" : "bg-moss-light"}`
                      : "w-2 bg-line"
                  }`}
                  title={`Question ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-ink/80 ml-1">
              Q{currentQuestionIndex + 1}
              <span className="text-stone-soft">/{totalQuestions || 5}</span>
            </span>
          </div>

          {/* Session Duration Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cream border border-line text-xs font-mono text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-moss-light animate-ping" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: Security & Proctor Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live REC Indicator */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-beak/10 border border-beak/30 text-[11px] font-mono font-bold text-beak-deep">
            <span className="w-2 h-2 rounded-full bg-beak animate-pulse" />
            <span className="hidden sm:inline">Recording</span>
          </div>

          {/* Violations Counter Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-colors ${
              totalViolations === 0
                ? "bg-moss-light/10 border-moss-light/30 text-moss"
                : totalViolations < 3
                ? "bg-amber-500/15 border-amber-500/40 text-amber-800 animate-bounce"
                : "bg-beak/20 border-beak/50 text-beak-deep animate-pulse"
            }`}
            title="Focus check: leaving full screen or switching tabs is noted in your report"
          >
            <span>
              {totalViolations === 0 ? "Focused" : `${totalViolations} focus note${totalViolations > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={onRequestFullscreen}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              isFullscreen
                ? "bg-cream border-line text-stone-muted hover:text-ink"
                : "bg-amber-500/20 border-amber-500/50 text-amber-800 animate-pulse hover:bg-amber-500/30"
            }`}
            title={isFullscreen ? "Full screen on" : "Go full screen"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isFullscreen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9H4v5m0-5l6 6m6-6h5v5m0-5l-6 6m-5 5H4v-5m0 5l6-6m6 6h5v-5m0 5l-6-6"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              )}
            </svg>
            <span className="hidden md:inline">
              {isFullscreen ? "Full screen" : "Go full screen"}
            </span>
          </button>

          {/* Voice Mute/Unmute */}
          <button
            onClick={() => onToggleAudio(!audioEnabled)}
            className="p-1.5 rounded-xl bg-cream border border-line text-ink/80 hover:text-ink transition-colors"
            title={audioEnabled ? "Mute Tota's voice" : "Unmute Tota's voice"}
          >
            {audioEnabled ? "🔊" : "🔇"}
          </button>

          {/* Exit / Abort Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-2.5 py-1 rounded-xl bg-beak/10 hover:bg-beak/20 border border-beak/30 text-[11px] font-mono font-bold text-beak-deep hover:text-beak-deep transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Confirmation Modal to Exit */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
          <div className="max-w-md w-full bg-cream border border-beak/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-beak-deep">
              <h4 className="text-base font-bold text-ink">
                Leave this interview?
              </h4>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed">
              If you leave now, Tota won&apos;t be able to give feedback on the questions you haven&apos;t answered yet.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-line hover:bg-line text-xs font-semibold text-ink transition-colors"
              >
                Keep going
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="px-4 py-2 rounded-xl bg-beak hover:bg-beak text-xs font-bold text-white transition-colors"
              >
                Leave interview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
