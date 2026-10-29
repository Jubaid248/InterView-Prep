"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import FlyingParrot from "@/components/FlyingParrot";

interface InterviewStageProps {
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  /** Small label above the question, e.g. "Question 1 of 8". */
  label: ReactNode;
  /** Controls shown next to the label (hear again, read aloud). */
  controls?: ReactNode;
  /** The question itself plus any extras (cue card bullets, framework hints). */
  children: ReactNode;
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

/** Center stage: Tota with the question right underneath. */
export default function InterviewStage({
  isSpeaking,
  isListening,
  isProcessing,
  label,
  controls,
  children,
}: InterviewStageProps) {
  const mouth = useTalkingMouth(isSpeaking);

  const status = useMemo(() => {
    if (isProcessing) return { label: "Thinking", dot: "bg-amber-500", flap: 0.6 };
    if (isSpeaking) return { label: "Speaking", dot: "bg-moss-light", flap: 0.8 };
    if (isListening) return { label: "Listening", dot: "bg-tealbird", flap: 1.2 };
    return { label: "Your turn", dot: "bg-stone-soft", flap: 1.1 };
  }, [isProcessing, isSpeaking, isListening]);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-[#EFEADC] to-[#E6DFCC] px-5 pb-6 pt-6 sm:px-10 sm:pb-10">
      {/* Status */}
      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-line bg-paper/90 px-2.5 py-1 text-xs font-medium text-ink">
        <span className="relative flex h-2 w-2">
          {status.label !== "Your turn" && <span className={`absolute inset-0 rounded-full ${status.dot} animate-ping opacity-60`} />}
          <span className={`relative h-2 w-2 rounded-full ${status.dot}`} />
        </span>
        Tota · {status.label}
      </div>

      {/* Tota */}
      <div className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48">
        <div className="absolute inset-[8%] rounded-full bg-paper/60" />
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
          className="absolute inset-0 h-full w-full drop-shadow-[0_14px_16px_rgba(23,34,26,0.18)]"
        />
      </div>

      {/* Question */}
      <div className="mx-auto mt-2 max-w-3xl space-y-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {label}
          {controls}
        </div>
        {children}
      </div>
    </section>
  );
}
