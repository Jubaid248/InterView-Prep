"use client";

interface CameraPermissionPromptProps {
  onEnable: () => void;
  onSkip: () => void;
  isRequesting?: boolean;
  errorMessage?: string;
}

export default function CameraPermissionPrompt({
  onEnable,
  onSkip,
  isRequesting = false,
  errorMessage,
}: CameraPermissionPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md glass-card rounded-3xl border border-white/15 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-400">
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

        <div className="p-8 space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <svg
                className="w-8 h-8 text-indigo-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-extrabold text-white font-jakarta leading-snug">
              Want body language feedback too?
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              TotaPakhi can analyze your{" "}
              <span className="text-indigo-300 font-semibold">eye contact</span> and{" "}
              <span className="text-indigo-300 font-semibold">movement</span> during each answer — entirely on your device.
            </p>
          </div>

          {/* Privacy guarantee */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-200 leading-relaxed">
            <svg
              className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <span>
              <strong className="text-emerald-300">Your video never leaves your device.</strong>{" "}
              Only two computed numbers (eye contact % and movement level) are included in your feedback report. No video is stored or transmitted.
            </span>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 leading-relaxed">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="enable-camera-btn"
              onClick={onEnable}
              disabled={isRequesting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-95"
            >
              {isRequesting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Enabling camera...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
                  </svg>
                  <span>Enable camera</span>
                </>
              )}
            </button>

            <button
              id="skip-camera-btn"
              onClick={onSkip}
              disabled={isRequesting}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-semibold text-sm tracking-wide transition-all"
            >
              Skip, audio only
            </button>
          </div>

          {/* Fine print */}
          <p className="text-center text-[11px] text-zinc-500 leading-relaxed">
            You can start without camera and won&apos;t be asked again this session.
            Body language signals appear only if camera was enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
