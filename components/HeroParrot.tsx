"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FlyingParrot from "@/components/FlyingParrot";

const LINES = [
  "Hi, I'm Tota. Ready for your interview?",
  "Tell me about a time you led under pressure.",
  "Good. Now give me the result, with a number.",
  "Look at the camera, not your notes.",
];

const FLY_IN_MS = 3200;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// How wide the beak opens for a given character: vowels open wide, pauses close.
function mouthFor(ch: string) {
  if (/[aeiou]/i.test(ch)) return 0.85 + Math.random() * 0.15;
  if (/[\s,.?!']/.test(ch)) return 0.05;
  return 0.4 + Math.random() * 0.2;
}

export default function HeroParrot() {
  const birdRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lineRef = useRef(0);

  const [flapSeconds, setFlapSeconds] = useState(0.28);
  const [arrived, setArrived] = useState(false);
  const [text, setText] = useState("");
  const [mouth, setMouth] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    clearTimeout(timerRef.current);
    const line = LINES[lineRef.current % LINES.length];
    lineRef.current += 1;
    let i = 0;
    setText("");
    setSpeaking(true);

    const step = () => {
      if (i < line.length) {
        const ch = line[i++];
        setText(line.slice(0, i));
        setMouth(mouthFor(ch));
        timerRef.current = setTimeout(step, /[,.?!]/.test(ch) ? 220 : 46);
      } else {
        setMouth(0);
        setSpeaking(false);
        timerRef.current = setTimeout(speak, 2600);
      }
    };
    step();
  }, []);

  const flyIn = useCallback(() => {
    cancelAnimationFrame(rafRef.current!);
    clearTimeout(timerRef.current);
    lineRef.current = 0;
    setArrived(false);
    setText("");
    setMouth(0);
    setSpeaking(false);

    const bird = birdRef.current;
    const shadow = shadowRef.current;
    if (!bird || !shadow) return;

    const land = () => {
      bird.style.filter = "none";
      setFlapSeconds(0.9);
      setArrived(true);
      timerRef.current = setTimeout(speak, 400);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bird.style.transform = "none";
      return land();
    }

    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / FLY_IN_MS);
      const e = easeOutCubic(t);
      const u = 1 - e;
      // Quadratic curve from far upper-right, swooping in to the front
      const x = u * u * 200 + 2 * u * e * -110;
      const y = u * u * -170 + 2 * u * e * -40;
      const scale = 0.1 + 0.9 * e + Math.sin(e * Math.PI) * 0.06;
      const bank = u * 16 - Math.sin(e * Math.PI) * 7;
      bird.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${bank}deg)`;
      bird.style.filter = `blur(${(u * 3).toFixed(2)}px) saturate(${(0.55 + 0.45 * e).toFixed(2)})`;
      shadow.style.transform = `scaleX(${(0.15 + 0.85 * e).toFixed(3)})`;
      shadow.style.opacity = (0.08 + 0.42 * e).toFixed(3);
      // Step the wingbeat in 0.1s increments; changing animation-duration every frame makes the flap stutter
      setFlapSeconds(Math.round((0.28 + 0.62 * e) * 10) / 10);
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
      else land();
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [speak]);

  useEffect(() => {
    flyIn();
    return () => {
      cancelAnimationFrame(rafRef.current!);
      clearTimeout(timerRef.current);
    };
  }, [flyIn]);

  return (
    <div className="relative h-[360px] sm:h-[440px] w-full select-none">
      {/* Soft backdrop disc with sound rings that pulse while Tota speaks */}
      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px]">
        <div className="absolute inset-0 rounded-full bg-[#EAE4D4]" />
        <div className="absolute inset-[14%] rounded-full bg-[#E2DBC8]/70" />
        {speaking && (
          <>
            <div className="absolute inset-0 rounded-full border border-moss-light/40 animate-ring" />
            <div className="absolute inset-0 rounded-full border border-moss-light/30 animate-ring [animation-delay:0.8s]" />
          </>
        )}
      </div>

      <div
        className={`absolute left-0 sm:left-2 top-2 z-20 max-w-[250px] rounded-2xl rounded-bl-md bg-white border border-line px-4 py-3 shadow-[0_12px_30px_-12px_rgba(23,34,26,0.25)] transition-all duration-500 ${
          arrived ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        aria-live="polite"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-soft mb-1">
          <span className={`w-1.5 h-1.5 rounded-full ${speaking ? "bg-moss-light animate-pulse" : "bg-stone-soft/60"}`} />
          tota · interviewer
        </div>
        <p className="text-sm leading-snug text-ink min-h-[2.5em]">
          {text}
          <span className="inline-block w-[2px] h-[1em] ml-0.5 align-[-2px] bg-moss-light animate-pulse" />
        </p>
      </div>

      <div
        ref={shadowRef}
        className="absolute left-1/2 bottom-6 -ml-[90px] w-[180px] h-3 rounded-[50%] bg-[#CFC6B1] blur-[2px]"
      />

      <div ref={birdRef} className="absolute inset-x-0 bottom-4 top-6 will-change-transform">
        <FlyingParrot
          mouth={mouth}
          speaking={speaking}
          flapSeconds={flapSeconds}
          className="w-full h-full drop-shadow-[0_18px_22px_rgba(23,34,26,0.18)]"
        />
      </div>

      <button
        onClick={flyIn}
        className="absolute right-2 bottom-0 z-20 text-[11px] font-mono text-stone-soft hover:text-moss transition-colors px-2 py-1"
      >
        replay ↻
      </button>
    </div>
  );
}
