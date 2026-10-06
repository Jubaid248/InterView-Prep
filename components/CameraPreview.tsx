"use client";

import { useState, useEffect, useRef } from "react";
import type { BodyLanguageAnalyzer, LiveFrame } from "@/lib/bodyLanguage/BodyLanguageAnalyzer";

interface CameraPreviewProps {
  analyzerRef: React.RefObject<BodyLanguageAnalyzer | null>;
  isRecording?: boolean;
  onDisableCamera?: () => void;
}

// Smoothing buffer: keep the last N frames to avoid flickering
const SMOOTH_WINDOW = 4;

export default function CameraPreview({
  analyzerRef,
  isRecording = false,
  onDisableCamera,
}: CameraPreviewProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live overlay state
  const [liveFrame, setLiveFrame] = useState<LiveFrame | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const frameHistoryRef = useRef<LiveFrame[]>([]);

  // ── 1. Sync the MediaStream from the analyzer into the visible <video> ──────
  useEffect(() => {
    const syncStream = () => {
      const dest = localVideoRef.current;
      const analyzer = analyzerRef.current;
      if (!dest || !analyzer) return;
      const stream = analyzer.getStream();
      if (stream && dest.srcObject !== stream) {
        dest.srcObject = stream;
        dest.onloadedmetadata = () => {
          dest.play().catch(() => {});
          setStreamReady(true);
        };
        // If already loaded
        if (dest.readyState >= 2) {
          dest.play().catch(() => {});
          setStreamReady(true);
        }
      }
    };
    syncStream();
    const id = setInterval(syncStream, 200);
    return () => clearInterval(id);
  }, [analyzerRef]);

  // ── 2. Poll detectLiveFrame() for real-time analysis ──────────────────────
  useEffect(() => {
    if (!streamReady) return;

    const tick = () => {
      const analyzer = analyzerRef.current;
      if (!analyzer) return;
      const frame = analyzer.detectLiveFrame();
      if (!frame) return;

      // Smooth eye-contact signal using a rolling window
      const hist = frameHistoryRef.current;
      hist.push(frame);
      if (hist.length > SMOOTH_WINDOW) hist.shift();

      // Use smoothed eyeContact: true if majority of recent frames say so
      const eyeContactCount = hist.filter((f) => f.eyeContact).length;
      const smoothedEyeContact = eyeContactCount >= Math.ceil(hist.length / 2);

      setLiveFrame({ ...frame, eyeContact: smoothedEyeContact });
    };

    // ~4 fps is enough for smooth overlay without CPU hit
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [analyzerRef, streamReady]);

  // ── 3. Draw nose-tracking dot on canvas ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = localVideoRef.current;
    if (!canvas || !video || !liveFrame?.faceDetected) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mirror X to match the -scale-x-100 CSS on the video
    const mirroredX = (1 - liveFrame.noseX) * canvas.width;
    const y = liveFrame.noseY * canvas.height;

    // Glowing nose-tip dot
    const color = liveFrame.eyeContact ? "#4ade80" : "#fb923c";
    ctx.beginPath();
    ctx.arc(mirroredX, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fill();

    // Cross-hair lines
    ctx.strokeStyle = color + "99";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mirroredX, 0);
    ctx.lineTo(mirroredX, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }, [liveFrame]);

  // ── Derived display values ─────────────────────────────────────────────────
  const faceDetected = liveFrame?.faceDetected ?? false;
  const eyeContact = liveFrame?.eyeContact ?? false;
  const yawDeg = liveFrame ? Math.round(Math.abs(liveFrame.yaw)) : 0;

  const ringColor = !faceDetected
    ? "border-zinc-600"
    : eyeContact
    ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
    : "border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.35)]";

  const eyeLabel = !faceDetected
    ? "No face detected"
    : eyeContact
    ? "Eye contact ✓"
    : `Look at camera (${yawDeg}°)`;

  const eyeLabelColor = !faceDetected
    ? "text-zinc-400"
    : eyeContact
    ? "text-emerald-400"
    : "text-orange-400";

  return (
    <div
      className={`relative transition-all duration-300 ${
        isMinimized
          ? "w-44 rounded-2xl p-2.5 glass-card border border-white/10 shadow-lg"
          : "w-full sm:w-80 rounded-3xl p-3 glass-card border border-white/15 shadow-2xl overflow-hidden"
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRecording ? "bg-red-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isRecording ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            {isRecording ? "Analyzing Live" : "Body Language"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized((p) => !p)}
            title={isMinimized ? "Expand" : "Minimize"}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-[10px]"
          >
            {isMinimized ? "↗" : "↘"}
          </button>
          {onDisableCamera && (
            <button
              type="button"
              onClick={onDisableCamera}
              title="Turn Off Camera"
              className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-[10px]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Video + Overlays ── */}
      {!isMinimized && (
        <div className="space-y-3">
          {/* Colored ring signals eye-contact quality */}
          <div className={`relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border-2 transition-all duration-500 ${ringColor}`}>
            {/* Live video feed (mirrored) */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Canvas overlay for nose dot + crosshair */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Eye contact label badge — top right */}
            <div
              className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-white/10 text-[10px] font-bold transition-all duration-300 ${eyeLabelColor}`}
            >
              {!faceDetected ? "👤 " : eyeContact ? "👁️ " : "↔️ "}
              {eyeLabel}
            </div>

            {/* Privacy badge — top left */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-zinc-400">
              <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              On-device
            </div>

            {/* "Analyzing" pulse overlay during recording */}
            {isRecording && faceDetected && (
              <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-xl bg-indigo-950/90 border border-indigo-500/40 text-[10px] font-semibold text-indigo-200 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Tracking gaze &amp; stability
              </div>
            )}
          </div>

          {/* ── Live metric chips ── */}
          <div className="grid grid-cols-2 gap-2">
            {/* Eye contact chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/60 border border-white/8">
              <span className="text-base">{eyeContact ? "👁️" : "↔️"}</span>
              <div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Eye Contact</p>
                <p className={`text-[11px] font-bold ${eyeContact ? "text-emerald-400" : "text-orange-400"}`}>
                  {!faceDetected ? "—" : eyeContact ? "Good" : "Look forward"}
                </p>
              </div>
            </div>

            {/* Head angle chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/60 border border-white/8">
              <span className="text-base">📐</span>
              <div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Head Angle</p>
                <p className={`text-[11px] font-bold ${faceDetected && yawDeg <= 10 ? "text-emerald-400" : yawDeg <= 20 ? "text-yellow-400" : "text-orange-400"}`}>
                  {!faceDetected ? "—" : yawDeg <= 5 ? "Centered ✓" : `${liveFrame && liveFrame.yaw < 0 ? "←" : "→"} ${yawDeg}°`}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-center text-zinc-500 font-mono">
            Green border = good eye contact • Orange = look at screen
          </p>
        </div>
      )}
    </div>
  );
}
