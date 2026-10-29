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
              ? "bg-moss-light/15 border-moss-light/35 text-moss hover:bg-moss-light/25"
              : "bg-cream border-line text-stone-muted hover:text-ink hover:bg-line"
          }`}
        >
          {audioEnabled ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss-light opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-moss-light" />
              </span>
              <span className="text-sm">🔊</span>
              <span className="tracking-wider">Voice: ON</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-line" />
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
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-800 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
        >
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-0.5 h-3.5">
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms] h-2" />
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms] h-3" />
            <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:75ms] h-2.5" />
          </div>
          <span>Stop</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onSpeak}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream border border-line hover:border-amber-400/40 text-ink/80 hover:text-amber-800 text-xs font-semibold transition-all hover:bg-line"
          title="Read this question aloud"
        >
          <span>Hear it again</span>
        </button>
      )}

      {/* Quick Audio Toggle Switch Pill */}
      <button
        type="button"
        onClick={() => onToggleAudio(!audioEnabled)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono transition-colors border ${
          audioEnabled
            ? "border-moss-light/30 bg-moss-light/10 text-moss hover:bg-moss-light/20"
            : "border-line bg-cream/60 text-stone-muted hover:text-ink"
        }`}
        title={audioEnabled ? "Tota reads each question aloud. Click to turn off." : "Questions are silent. Click to have Tota read them aloud."}
      >
        <span className="text-xs">{audioEnabled ? "✓" : "✕"}</span>
        <span>Read aloud {audioEnabled ? "on" : "off"}</span>
      </button>
    </div>
  );
}
