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
        <div className="max-w-lg w-full bg-cream border-2 border-beak/50 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-beak/20">

          <div className="space-y-2">
            <h3 className="font-serif text-3xl text-ink">You left full screen</h3>
            <p className="text-ink/80 text-sm leading-relaxed max-w-md mx-auto">
              A real interview has your full attention. Go back to full screen to carry on where you left off.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-beak-soft border border-beak/30 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-beak-deep font-semibold">
              <span>Focus notes so far</span>
              <span>{totalViolations}</span>
            </div>
            <p className="text-stone-muted text-xs leading-relaxed">
              Each time you leave full screen, it&apos;s noted in your report so you can see how focused you stayed.
            </p>
          </div>

          <button
            onClick={onRequestFullscreen}
            className="w-full py-4 px-6 rounded-2xl bg-moss hover:bg-moss-deep text-cream font-semibold text-base transition-all shadow-[0_3px_0_#1C3B16] active:translate-y-[3px] active:shadow-none"
          >
            Back to full screen
          </button>
        </div>
      </div>
    );
  }

  // If there's an active violation toast while in fullscreen
  if (showWarning && warningMessage) {
    return (
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top duration-300">
        <div className="bg-beak-soft border border-beak/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 text-ink">
          <div className="flex items-start gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-beak-deep">
                Focus note {totalViolations}
              </h4>
              <p className="text-xs text-ink leading-snug">
                {warningMessage}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="w-8 h-8 flex items-center justify-center text-stone-muted hover:text-ink text-xs rounded-lg hover:bg-cream"
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
        <div className="bg-amber-50 border border-amber-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-ink">
          <div className="flex items-center gap-2.5">
            <div>
              <h4 className="text-xs font-semibold text-amber-800">
                Come back to your interview
              </h4>
              <p className="text-[11px] text-ink/80">
                Tota is waiting. Click back into this window to carry on.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
