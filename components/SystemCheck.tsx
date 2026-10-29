/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";

interface SystemCheckProps {
  onStartInterview: (mode: "practice" | "serious") => void;
  trackName?: string;
  onRequestCamera: () => Promise<boolean>;
  cameraActive: boolean;
  cameraError?: string;
  initialMode?: "practice" | "serious";
}

export default function SystemCheck({
  onStartInterview,
  trackName,
  onRequestCamera,
  cameraActive,
  cameraError,
  initialMode = "practice",
}: SystemCheckProps) {
  const [selectedMode, setSelectedMode] = useState<"practice" | "serious">(initialMode);
  const [micActive, setMicActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [requestingCamera, setRequestingCamera] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize camera and microphone test
  const handleEnableMedia = async () => {
    setRequestingCamera(true);
    try {
      const ok = await onRequestCamera();
      if (!ok) {
        setRequestingCamera(false);
        return;
      }

      // Also get user media stream for the local video & mic volume meter preview
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Audio analysis for volume meter
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setMicActive(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {
      // Handled via cameraError or permission denial
    } finally {
      setRequestingCamera(false);
    }
  };

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  // Bind video element whenever localStream changes
  useEffect(() => {
    if (localStream && videoRef.current) {
      videoRef.current.srcObject = localStream;
      videoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  const canProceedSerious = cameraActive && micActive && rulesAgreed;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-moss-light/15 border border-moss-light/30 text-moss-deep text-xs font-mono font-bold tracking-wider uppercase">
          <span>Before you start</span>
        </div>
        <h1 className="font-serif font-normal text-4xl sm:text-5xl text-ink">
          Choose how you want to practice
        </h1>
        <p className="text-sm text-stone-muted max-w-xl mx-auto">
          Practice at your own pace, or try a real interview: full screen, camera on, and Tota records each answer automatically.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Practice Mode Tab */}
        <div
          onClick={() => setSelectedMode("practice")}
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 relative overflow-hidden ${
            selectedMode === "practice"
              ? "bg-moss/5 border-moss-light shadow-2xl shadow-moss-light/15"
              : "bg-cream/60 border-line hover:border-stone-soft/40 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-moss-light" aria-hidden="true" />
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                selectedMode === "practice"
                  ? "bg-moss-light/20 text-moss border border-moss-light/40"
                  : "bg-line text-stone-muted"
              }`}
            >
              Relaxed
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink">Practice</h3>
          <p className="text-xs text-ink/80 mt-2 leading-relaxed">
            Go at your own pace. Tap the mic when you&apos;re ready, and turn your camera on or off whenever you like.
          </p>
          <div className="mt-4 pt-3 border-t border-line flex flex-wrap gap-2 text-[11px] font-mono text-stone-muted">
            <span className="text-moss font-semibold">✓ Your normal window</span>
            <span className="text-moss font-semibold">✓ Camera optional</span>
            <span className="text-moss font-semibold">✓ Tap to record</span>
          </div>
        </div>

        {/* Serious Interview Tab */}
        <div
          onClick={() => setSelectedMode("serious")}
          className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 relative overflow-hidden ${
            selectedMode === "serious"
              ? "bg-beak-soft border-beak shadow-2xl shadow-beak/15"
              : "bg-cream/60 border-line hover:border-stone-soft/40 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-beak" aria-hidden="true" />
            <span
              className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                selectedMode === "serious"
                  ? "bg-beak/20 text-beak-deep border border-beak/40"
                  : "bg-line text-stone-muted"
              }`}
            >
              Like the real thing
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink">Real interview</h3>
          <p className="text-xs text-ink/80 mt-2 leading-relaxed">
            Full screen, camera on, no notes. Tota asks each question out loud and starts recording as soon as it finishes, just like a live call.
          </p>
          <div className="mt-4 pt-3 border-t border-line flex flex-wrap gap-2 text-[11px] font-mono text-stone-muted">
            <span className="text-beak-deep font-semibold">• Full screen</span>
            <span className="text-beak-deep font-semibold">• Camera on</span>
            <span className="text-beak-deep font-semibold">• Records automatically</span>
          </div>
        </div>
      </div>

      {/* MODE DETAILS & ACTION PANEL */}
      {selectedMode === "practice" ? (
        /* PRACTICE MODE DETAILS */
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-moss-light/30 shadow-2xl space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-line">
            <div>
              <h2 className="font-serif font-normal text-xl text-ink flex items-center gap-2">
                Practice
              </h2>
              <p className="text-xs text-stone-muted mt-1">
                You can start right away. Turn on your camera any time to get eye-contact and body-language feedback.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEnableMedia}
                disabled={requestingCamera}
                className="px-4 py-2 rounded-xl bg-cream hover:bg-line border border-line text-xs font-semibold text-ink transition-colors"
              >
                {cameraActive ? "✓ Camera ready" : "Check your camera (optional)"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-1">
              <h4 className="text-xs font-bold text-ink">Your normal window</h4>
              <p className="text-[11px] text-stone-muted">
                Nothing goes full screen, and you can glance at your notes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-1">
              <h4 className="text-xs font-bold text-ink">Camera when you want it</h4>
              <p className="text-[11px] text-stone-muted">
                Turn it on for body-language feedback, or leave it off.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-1">
              <h4 className="text-xs font-bold text-ink">Tap to record</h4>
              <p className="text-[11px] text-stone-muted">
                Take a moment to think, then tap the mic when you&apos;re ready.
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartInterview("practice")}
            className="w-full py-4 px-6 rounded-2xl bg-moss hover:bg-moss-deep text-cream font-semibold text-base transition-all duration-300 shadow-xl shadow-moss-light/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Start practice</span>
            <span>→</span>
          </button>
        </div>
      ) : (
        /* SERIOUS MODE DETAILS & HARDWARE VERIFICATION */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left: Camera & Audio Diagnostic Card */}
          <div className="glass-card rounded-3xl p-6 border border-line shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
                <h2 className="font-serif font-normal text-lg text-ink flex items-center gap-2">
                  Camera and microphone
                </h2>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    cameraActive && micActive
                      ? "bg-moss-light/20 text-moss border border-moss-light/40"
                      : "bg-beak/20 text-beak-deep border border-beak/40"
                  }`}
                >
                  {cameraActive && micActive ? "Ready" : "Needed"}
                </span>
              </div>

              {/* Video Preview Box */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-cream border border-line flex items-center justify-center shadow-inner">
                {localStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono text-moss border border-moss-light/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-moss-light animate-pulse" />
                      Camera on
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cream border border-line flex items-center justify-center mx-auto text-xl text-stone-muted">
                      <span className="w-3 h-3 rounded-full bg-stone-soft" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-stone-muted max-w-xs">
                      A real interview needs your camera and microphone, so Tota can give you body-language feedback.
                    </p>
                    <button
                      onClick={handleEnableMedia}
                      disabled={requestingCamera}
                      className="px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-light text-xs font-bold text-white transition-all shadow-lg shadow-moss/30"
                    >
                      {requestingCamera ? "Connecting…" : "Turn on camera and mic"}
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="mt-2 text-xs text-beak-deep bg-beak-soft border border-beak/30 p-2.5 rounded-xl">
                  {cameraError}
                </p>
              )}

              {/* Microphone Volume Meter */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink/80 flex items-center gap-1.5">
                    Microphone level
                  </span>
                  <span className={micActive ? "text-moss font-bold" : "text-stone-soft"}>
                    {micActive ? `${micVolume}%` : "Not connected"}
                  </span>
                </div>
                <div className="h-3 w-full bg-cream rounded-full overflow-hidden p-0.5 border border-line">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-moss-light via-tealbird-light to-moss-light transition-all duration-75"
                    style={{ width: `${micActive ? Math.max(8, micVolume) : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-soft">
                  Say a few words. The bar should move as you speak.
                </p>
              </div>
            </div>

            <div className="pt-2">
              {!localStream && (
                <button
                  onClick={handleEnableMedia}
                  disabled={requestingCamera}
                  className="w-full py-3 rounded-xl bg-cream hover:bg-line border border-line text-xs font-bold text-ink transition-colors flex items-center justify-center gap-2"
                >
                  Allow camera and mic
                </button>
              )}
            </div>
          </div>

          {/* Right: Anti-Cheating Protocol & Acceptance */}
          <div className="glass-card rounded-3xl p-6 border border-line shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h2 className="font-serif font-normal text-lg text-ink flex items-center gap-2">
                  What to expect
                </h2>

              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/60 border border-line">
                  <div>
                    <h3 className="text-xs font-bold text-ink">Full screen, like a real call</h3>
                    <p className="text-[11px] text-stone-muted">
                      The interview fills your screen. If you leave full screen, it&apos;s noted in your report.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/60 border border-line">
                  <div>
                    <h3 className="text-xs font-bold text-ink">Tota records automatically</h3>
                    <p className="text-[11px] text-stone-muted">
                      Tota asks each question out loud, then starts recording your answer. No buttons to press.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/60 border border-line">
                  <div>
                    <h3 className="text-xs font-bold text-ink">No notes or other tabs</h3>
                    <p className="text-[11px] text-stone-muted">
                      Copy and paste are turned off, and switching tabs is noted in your report.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-2xl bg-cream/60 border border-line hover:bg-cream transition-colors">
                <input
                  type="checkbox"
                  checked={rulesAgreed}
                  onChange={(e) => setRulesAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-stone-soft/40 bg-cream text-moss focus:ring-moss-light cursor-pointer"
                />
                <span className="text-xs text-ink/80 leading-relaxed">
                  I&apos;m ready: full screen, camera on, and automatic recording.
                </span>
              </label>

              <button
                onClick={() => onStartInterview("serious")}
                disabled={!canProceedSerious}
                className={`w-full py-4 px-6 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl ${
                  canProceedSerious
                    ? "bg-ink hover:bg-moss-deep text-cream shadow-ink/20 hover:scale-[1.02]"
                    : "bg-line text-stone-soft cursor-not-allowed border border-line"
                }`}
              >
                <span>Start real interview</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
