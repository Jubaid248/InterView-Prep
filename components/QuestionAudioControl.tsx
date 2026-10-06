"use client";

interface QuestionAudioControlProps {
  audioEnabled: boolean;
  onToggleAudio: (enabled: boolean) => void;
  isSpeaking: boolean;
  onSpeak: () => void;
  onStop: () => void;
  className?: string;
  variant?: "badge" | "card-action" | "header-toggle";
}

export default function QuestionAudioControl({
  audioEnabled,
  onToggleAudio,
  isSpeaking,
  onSpeak,
  onStop,
  className = "",
  variant = "badge",
}: QuestionAudioControlProps) {
  // If rendering the top header toggle
  if (variant === "header-toggle") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => onToggleAudio(!audioEnabled)}
          aria-label={audioEnabled ? "Turn questions audio off" : "Turn questions audio on"}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-200 border backdrop-blur-md shadow-sm ${
            audioEnabled
              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25"
              : "bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          }`}
        >
          {audioEnabled ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-sm">🔊</span>
              <span className="tracking-wider">Voice: ON</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-sm">🔇</span>
              <span className="tracking-wider">Voice: OFF</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Card action variant: sits inside the question card for immediate replay / stop / toggle
  return (
    <div className={`flex items-center flex-wrap gap-2.5 ${className}`}>
      {/* Play / Stop Action Button */}
      {isSpeaking ? (
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
        >
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-0.5 h-3.5">
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms] h-2" />
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms] h-3" />
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:75ms] h-2.5" />
          </div>
          <span>Stop Voice</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onSpeak}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 hover:border-amber-400/40 text-zinc-300 hover:text-amber-300 text-xs font-semibold transition-all hover:bg-zinc-800"
          title="Read this question aloud"
        >
          <span className="text-xs">🔊</span>
          <span>Listen</span>
        </button>
      )}

      {/* Quick Audio Toggle Switch Pill */}
      <button
        type="button"
        onClick={() => onToggleAudio(!audioEnabled)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition-colors border ${
          audioEnabled
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            : "border-white/10 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200"
        }`}
        title={audioEnabled ? "Audio questions enabled (click to mute)" : "Audio questions muted (click to enable)"}
      >
        <span className="text-xs">{audioEnabled ? "✓" : "✕"}</span>
        <span>Auto-Read {audioEnabled ? "ON" : "OFF"}</span>
      </button>
    </div>
  );
}
