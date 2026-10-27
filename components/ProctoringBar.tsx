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
      <header className="w-full bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 backdrop-blur-xl flex items-center justify-between gap-4 z-40 select-none">
        {/* Left: Parrot AI & Track Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦜</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 tracking-wider font-jakarta uppercase">
                  Parrot
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-700 font-bold border border-indigo-500/30">
                  PROCTORED
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono hidden sm:inline">
                {trackName ? trackName.replace("-", " ").toUpperCase() : "PROCTORED INTERVIEW"}
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
                      ? "w-4 bg-emerald-400"
                      : idx === currentQuestionIndex
                      ? `w-6 ${isFollowUp ? "bg-amber-400 animate-pulse" : "bg-indigo-400"}`
                      : "w-2 bg-slate-200"
                  }`}
                  title={`Question ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 ml-1">
              Q{currentQuestionIndex + 1}
              <span className="text-slate-500">/{totalQuestions || 5}</span>
            </span>
          </div>

          {/* Session Duration Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: Security & Proctor Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live REC Indicator */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono font-bold text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="hidden sm:inline">REC</span>
          </div>

          {/* Violations Counter Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors ${
              totalViolations === 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                : totalViolations < 3
                ? "bg-amber-500/15 border-amber-500/40 text-amber-700 animate-bounce"
                : "bg-red-500/20 border-red-500/50 text-red-700 animate-pulse"
            }`}
            title="Anti-cheating violation monitor"
          >
            <span>🛡️</span>
            <span>
              {totalViolations === 0 ? "0 Violations" : `${totalViolations} Alert${totalViolations > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={onRequestFullscreen}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              isFullscreen
                ? "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                : "bg-amber-500/20 border-amber-500/50 text-amber-700 animate-pulse hover:bg-amber-500/30"
            }`}
            title={isFullscreen ? "Fullscreen active" : "Enter Fullscreen"}
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
              {isFullscreen ? "Fullscreen" : "Maximize"}
            </span>
          </button>

          {/* Voice Mute/Unmute */}
          <button
            onClick={() => onToggleAudio(!audioEnabled)}
            className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
            title={audioEnabled ? "Mute Parrot voice" : "Unmute Parrot voice"}
          >
            {audioEnabled ? "🔊" : "🔇"}
          </button>

          {/* Exit / Abort Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-[11px] font-mono font-bold text-red-700 hover:text-red-800 transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Confirmation Modal to Exit */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-100 border border-red-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h4 className="text-base font-bold text-slate-900 font-jakarta">
                Leave Proctored Interview?
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Exiting now will terminate your session and Parrot will not be able to evaluate remaining questions. Are you sure you want to exit?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-900 transition-colors"
              >
                Continue Interview
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
