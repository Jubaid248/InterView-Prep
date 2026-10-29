"use client";

import { useEffect, useMemo, useState } from "react";
import FlyingParrot from "@/components/FlyingParrot";

interface InterviewerTileProps {
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  /** What Tota is saying, shown as subtitles while speaking. */
  caption?: string;
}

// Browser speech synthesis has no reliable word timings, so the beak follows a
// syllable-like rhythm while Tota speaks.
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
      if (syllable % (3 + Math.floor(Math.random() * 3)) === 0) setMouth(0.05);
      else setMouth(0.35 + Math.random() * 0.65);
    }, 95);
    return () => clearInterval(id);
  }, [active]);
  return mouth;
}

/** Tota's side of the "video call": the animated parrot, a status pill and live subtitles. */
export default function InterviewerTile({ isSpeaking, isListening, isProcessing, caption }: InterviewerTileProps) {
  const mouth = useTalkingMouth(isSpeaking);

  const status = useMemo(() => {
    if (isProcessing) return { label: "Thinking", dot: "bg-amber-500", flap: 0.6 };
    if (isSpeaking) return { label: "Speaking", dot: "bg-moss-light", flap: 0.8 };
    if (isListening) return { label: "Listening", dot: "bg-tealbird", flap: 1.2 };
    return { label: "Your turn", dot: "bg-stone-soft", flap: 1.1 };
  }, [isProcessing, isSpeaking, isListening]);

  return (
    <div className="relative h-60 w-full overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-[#EFEADC] to-[#E6DFCC] sm:h-72">
      {/* Soft halo + sound rings while speaking or listening */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[78%] aspect-square">
          <div className="absolute inset-[8%] rounded-full bg-paper/50" />
          {(isSpeaking || isListening) && (
            <>
              <div className={`absolute inset-[8%] rounded-full border animate-ring ${isSpeaking ? "border-moss-light/50" : "border-tealbird/50"}`} />
              <div className={`absolute inset-[8%] rounded-full border animate-ring [animation-delay:0.8s] ${isSpeaking ? "border-moss-light/40" : "border-tealbird/40"}`} />
            </>
          )}
          <FlyingParrot
            mouth={mouth}
            speaking={isSpeaking}
            flapSeconds={status.flap}
            className="absolute inset-0 w-full h-full drop-shadow-[0_14px_16px_rgba(23,34,26,0.18)]"
          />
        </div>
      </div>

      {/* Status */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-paper/90 border border-line px-2.5 py-1 text-xs font-medium text-ink">
        <span className="relative flex w-2 h-2">
          {status.label !== "Your turn" && <span className={`absolute inset-0 rounded-full ${status.dot} animate-ping opacity-60`} />}
          <span className={`relative w-2 h-2 rounded-full ${status.dot}`} />
        </span>
        {status.label}
      </div>

      {/* Name badge, like a video call */}
      <div className="absolute bottom-3 left-3 rounded-lg bg-ink/75 px-2.5 py-1 text-xs font-medium text-cream">
        Tota · AI interviewer
      </div>

      {/* Subtitles while Tota speaks */}
      {isSpeaking && caption && (
        <div className="absolute inset-x-4 bottom-12 flex justify-center">
          <p className="max-w-[90%] rounded-xl bg-ink/75 px-3 py-1.5 text-center text-xs leading-snug text-cream line-clamp-2 sm:text-sm">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
