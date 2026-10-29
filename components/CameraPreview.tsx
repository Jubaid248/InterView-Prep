"use client";

import { useState, useEffect, useRef } from "react";
import type { BodyLanguageAnalyzer, LiveFrame, PostureState } from "@/lib/bodyLanguage/BodyLanguageAnalyzer";
import type { GazeState } from "@/lib/bodyLanguage/metrics";

interface CameraPreviewProps {
  analyzerRef: React.RefObject<BodyLanguageAnalyzer | null>;
  isRecording?: boolean;
}

// Majority vote over recent frames keeps labels from flickering
const SMOOTH_WINDOW = 6;

const GAZE: Record<GazeState, { label: string; ok: boolean | null }> = {
  contact: { label: "Good eye contact", ok: true },
  closed: { label: "Good eye contact", ok: true },
  down: { label: "Looking down", ok: false },
  up: { label: "Looking up", ok: false },
  side: { label: "Looking away", ok: false },
  absent: { label: "Can't see your face", ok: null },
};

const POSTURE_ISSUE: Partial<Record<PostureState, string>> = {
  slouch: "Sit up a little",
  tilt: "Level your shoulders",
  "lean-in": "Move back a bit",
  "lean-back": "Lean in slightly",
};

function majority<T>(items: T[]): T | undefined {
  const counts = new Map<T, number>();
  let best: T | undefined;
  let bestCount = 0;
  for (const item of items) {
    const c = (counts.get(item) ?? 0) + 1;
    counts.set(item, c);
    if (c > bestCount) {
      best = item;
      bestCount = c;
    }
  }
  return best;
}

/**
 * Your side of the "video call": the camera feed with calm, exception-only feedback.
 * Pills only appear when something needs attention; eye tracking dots are opt-in.
 */
export default function CameraPreview({ analyzerRef, isRecording = false }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState<LiveFrame | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const historyRef = useRef<LiveFrame[]>([]);

  // Show the analyzer's camera stream in the visible <video>
  useEffect(() => {
    const sync = () => {
      const dest = videoRef.current;
      const stream = analyzerRef.current?.getStream();
      if (!dest || !stream || dest.srcObject === stream) return;
      dest.srcObject = stream;
      dest.onloadedmetadata = () => {
        dest.play().catch(() => {});
        setStreamReady(true);
      };
      if (dest.readyState >= 2) {
        dest.play().catch(() => {});
        setStreamReady(true);
      }
    };
    sync();
    const id = setInterval(sync, 200);
    return () => clearInterval(id);
  }, [analyzerRef]);

  // Read the analyzer's latest frame (it runs its own detection loop)
  useEffect(() => {
    if (!streamReady) return;
    const id = setInterval(() => {
      const f = analyzerRef.current?.getLiveFrame();
      if (!f) return;
      const hist = historyRef.current;
      hist.push(f);
      if (hist.length > SMOOTH_WINDOW) hist.shift();
      setFrame({
        ...f,
        gaze: majority(hist.map((h) => h.gaze)) ?? f.gaze,
        posture: majority(hist.map((h) => h.posture)) ?? f.posture,
        faceTouch: hist.filter((h) => h.faceTouch).length >= 3,
      });
    }, 150);
    return () => clearInterval(id);
  }, [analyzerRef, streamReady]);

  // Optional, subtle eye tracking: two small dots on the irises, nothing over the eyes
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!showTracking || !frame?.faceDetected || frame.irises.length < 2) return;

    // object-cover crops the stream into the box, and the video is mirrored with CSS
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    const scale = Math.max(canvas.width / vw, canvas.height / vh);
    const offX = (canvas.width - vw * scale) / 2;
    const offY = (canvas.height - vh * scale) / 2;
    const good = frame.gaze === "contact" || frame.gaze === "closed";
    ctx.fillStyle = good ? "rgba(180, 229, 133, 0.85)" : "rgba(250, 199, 117, 0.9)";
    for (const p of frame.irises) {
      ctx.beginPath();
      ctx.arc(canvas.width - (offX + p.x * vw * scale), offY + p.y * vh * scale, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [frame, showTracking]);

  const faceDetected = frame?.faceDetected ?? false;
  const calibrated = frame?.calibrated ?? false;
  const gaze = GAZE[frame?.gaze ?? "absent"];
  const postureIssue = frame?.posture ? POSTURE_ISSUE[frame.posture] : undefined;

  // One gentle coaching line at a time, most important first
  const coach = !streamReady
    ? "Starting your camera…"
    : !faceDetected
    ? "Move so your face is in the frame"
    : !calibrated
    ? "Getting to know your camera. Look at the screen for a moment"
    : frame?.faceTouch
    ? "Try resting your hands away from your face"
    : gaze.ok === false
    ? frame?.gaze === "down"
      ? "Lift your eyes to the camera"
      : "Bring your eyes back to the camera"
    : postureIssue ?? null;

  return (
    <div className="relative h-60 w-full overflow-hidden rounded-3xl border border-line bg-ink/90 sm:h-72">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Status pills: eye contact always, posture and hands only when they need attention */}
      {streamReady && (
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${
              gaze.ok === true ? "bg-paper/90 text-moss" : gaze.ok === false ? "bg-amber-50/95 text-amber-800" : "bg-paper/90 text-stone-muted"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${gaze.ok === true ? "bg-moss-light" : gaze.ok === false ? "bg-amber-500" : "bg-stone-soft"}`} />
            {calibrated || !faceDetected ? gaze.label : "Calibrating"}
          </span>
          {postureIssue && (
            <span className="rounded-full bg-amber-50/95 px-2.5 py-1 text-xs font-medium text-amber-800 backdrop-blur-sm">Posture</span>
          )}
          {frame?.faceTouch && (
            <span className="rounded-full bg-amber-50/95 px-2.5 py-1 text-xs font-medium text-amber-800 backdrop-blur-sm">Hands</span>
          )}
        </div>
      )}

      {/* Name badge with a recording dot */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-ink/75 px-2.5 py-1 text-xs font-medium text-cream">
        {isRecording && <span className="h-2 w-2 rounded-full bg-beak animate-pulse" aria-label="Recording" />}
        You
      </div>

      {/* Privacy note and tracking toggle */}
      <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] text-stone-muted">
        Private · stays on your device
      </span>
      <button
        type="button"
        onClick={() => setShowTracking((s) => !s)}
        className="absolute bottom-3 right-3 rounded-lg bg-ink/60 px-2.5 py-1 text-[11px] text-cream hover:bg-ink/80 transition-colors"
        aria-pressed={showTracking}
      >
        {showTracking ? "Hide tracking" : "Show tracking"}
      </button>

      {/* Gentle coaching line */}
      {coach && (
        <div className="absolute inset-x-0 bottom-12 flex justify-center px-4">
          <p className="rounded-xl bg-paper/95 px-3 py-1.5 text-center text-xs font-medium text-ink shadow-sm">{coach}</p>
        </div>
      )}
    </div>
  );
}
