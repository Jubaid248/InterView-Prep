"use client";

import React from "react";

interface FullscreenWarningProps {
  showWarning: boolean;
  warningMessage: string;
  isFullscreen: boolean;
  isFocused: boolean;
  totalViolations: number;
  onRequestFullscreen: () => void;
  onDismiss: () => void;
}

export default function FullscreenWarning({
  showWarning,
  warningMessage,
  isFullscreen,
  isFocused,
  totalViolations,
  onRequestFullscreen,
  onDismiss,
}: FullscreenWarningProps) {
  // If user is currently out of fullscreen, force an inescapable modal
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="max-w-lg w-full bg-slate-100 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-red-500/20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-3xl">
            🔒
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-700 text-xs font-mono font-bold tracking-wider uppercase">
              <span>⚠️ Proctored Environment Locked</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-jakarta">
              Fullscreen Takeover Required
            </h3>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Parrot requires full screen takeover to prevent secondary monitors, notes, or unauthorized applications.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-500/30 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-red-700 font-bold">
              <span>Security Event: Fullscreen Exit</span>
              <span>Total Violations: {totalViolations}</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Exiting full screen is logged with timestamp. Repeated departures may invalidate your interview evaluation score.
            </p>
          </div>

          <button
            onClick={onRequestFullscreen}
            className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Return to Fullscreen & Resume Studio →
          </button>
        </div>
      </div>
    );
  }

  // If there's an active violation toast while in fullscreen
  if (showWarning && warningMessage) {
    return (
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top duration-300">
        <div className="bg-red-50 border border-red-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 text-slate-900">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">⚠️</span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-red-800 uppercase font-mono tracking-wider">
                Proctor Alert Recorded (Violation #{totalViolations})
              </h4>
              <p className="text-xs text-slate-800 leading-snug">
                {warningMessage}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-600 hover:text-slate-900 text-xs font-mono p-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // If focus is lost (e.g. clicking outside or switching app)
  if (!isFocused) {
    return (
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in slide-in-from-top duration-300">
        <div className="bg-amber-50 border border-amber-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-slate-900">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">👁️</span>
            <div>
              <h4 className="text-xs font-bold text-amber-800 font-mono">
                Window Focus Lost
              </h4>
              <p className="text-[11px] text-slate-700">
                Please keep the Parrot Interview window focused.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
