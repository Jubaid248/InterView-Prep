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
          <span>Interview studio setup</span>
        </div>
        <h1 className="font-serif font-normal text-4xl sm:text-5xl text-ink">
          Choose Your Interview Format
        </h1>
        <p className="text-sm text-stone-muted max-w-xl mx-auto">
          Practice at your own relaxed pace, or take a serious proctored interview with screen takeover and automatic hands-free conversation.
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
            <span className="text-2xl">🎯</span>
            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                selectedMode === "practice"
                  ? "bg-moss-light/20 text-moss border border-moss-light/40"
                  : "bg-line text-stone-muted"
              }`}
            >
              Casual & Flexible
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink">Practice Mode</h3>
          <p className="text-xs text-ink/80 mt-2 leading-relaxed">
            Stress-free preparation. No screen takeover. Tap to record when you&apos;re ready, and turn your camera ON or OFF whenever you like.
          </p>
          <div className="mt-4 pt-3 border-t border-line flex flex-wrap gap-2 text-[11px] font-mono text-stone-muted">
            <span className="text-moss font-semibold">✓ No Fullscreen Lock</span>
            <span className="text-moss font-semibold">✓ Camera Toggle On/Off</span>
            <span className="text-moss font-semibold">✓ Tap-To-Record</span>
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
            <span className="text-2xl">⚔️</span>
            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                selectedMode === "serious"
                  ? "bg-beak/20 text-beak-deep border border-beak/40"
                  : "bg-line text-stone-muted"
              }`}
            >
              AI Proctored Simulation
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink">Serious Interview</h3>
          <p className="text-xs text-ink/80 mt-2 leading-relaxed">
            Full-scale proctored interview. Takes over entire screen. Camera mandatory with gaze tracking. Automatically records the entire conversation hands-free.
          </p>
          <div className="mt-4 pt-3 border-t border-line flex flex-wrap gap-2 text-[11px] font-mono text-stone-muted">
            <span className="text-beak font-semibold">🔒 Fullscreen Takeover</span>
            <span className="text-beak font-semibold">📹 Mandatory Video</span>
            <span className="text-beak font-semibold">⚡ Auto-Record Conversation</span>
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
                <span>🎯</span> Practice Mode Selected
              </h2>
              <p className="text-xs text-stone-muted mt-1">
                You can immediately enter the studio. Camera is optional and can be toggled on/off during practice.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEnableMedia}
                disabled={requestingCamera}
                className="px-4 py-2 rounded-xl bg-cream hover:bg-line border border-line text-xs font-semibold text-ink transition-colors"
              >
                {cameraActive ? "✓ Camera Connected" : "Test Camera (Optional)"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-1">
              <span className="text-lg">🔓</span>
              <h4 className="text-xs font-bold text-ink">No Screen Lock</h4>
              <p className="text-[11px] text-stone-muted">
                You stay in your normal browser window. Check notes or reference materials freely.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-1">
              <span className="text-lg">📹</span>
              <h4 className="text-xs font-bold text-ink">Camera On/Off Anytime</h4>
              <p className="text-[11px] text-stone-muted">
                Toggle camera preview on or off during each question at your preference.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream/60 border border-line space-y-1">
              <span className="text-lg">🎙️</span>
              <h4 className="text-xs font-bold text-ink">Tap To Record</h4>
              <p className="text-[11px] text-stone-muted">
                Think first, then tap the microphone button when you are ready to answer.
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartInterview("practice")}
            className="w-full py-4 px-6 rounded-2xl bg-moss hover:bg-moss-deep text-white font-semibold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl shadow-moss-light/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Start Casual Practice Studio</span>
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
                  <span>📹</span> Mandatory Hardware Check
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    cameraActive && micActive
                      ? "bg-moss-light/20 text-moss border border-moss-light/40"
                      : "bg-beak/20 text-beak-deep border border-beak/40"
                  }`}
                >
                  {cameraActive && micActive ? "PASSED" : "REQUIRED"}
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
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-moss-light border border-moss-light/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-moss-light animate-pulse" />
                      Webcam Online
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cream border border-line flex items-center justify-center mx-auto text-xl text-stone-muted">
                      📷
                    </div>
                    <p className="text-xs text-stone-muted max-w-xs">
                      Webcam is mandatory for the serious interview simulation.
                    </p>
                    <button
                      onClick={handleEnableMedia}
                      disabled={requestingCamera}
                      className="px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-light text-xs font-bold text-white transition-all shadow-lg shadow-moss/30"
                    >
                      {requestingCamera ? "Connecting..." : "Enable Camera & Mic"}
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="mt-2 text-xs text-beak bg-beak-soft border border-beak/30 p-2.5 rounded-xl">
                  ⚠️ {cameraError}
                </p>
              )}

              {/* Microphone Volume Meter */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ink/80 flex items-center gap-1.5">
                    <span>🎙️</span> Microphone Sensitivity
                  </span>
                  <span className={micActive ? "text-moss font-bold" : "text-stone-soft"}>
                    {micActive ? `${micVolume}%` : "Not Connected"}
                  </span>
                </div>
                <div className="h-3 w-full bg-cream rounded-full overflow-hidden p-0.5 border border-line">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-moss-light via-tealbird-light to-moss-light transition-all duration-75"
                    style={{ width: `${micActive ? Math.max(8, micVolume) : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-soft">
                  Speak into your mic to ensure audio levels register.
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
                  <span>🔑</span> Grant Access to Begin
                </button>
              )}
            </div>
          </div>

          {/* Right: Anti-Cheating Protocol & Acceptance */}
          <div className="glass-card rounded-3xl p-6 border border-line shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h2 className="font-serif font-normal text-lg text-ink flex items-center gap-2">
                  <span>🛡️</span> AI Proctored Security Rules
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-beak/15 text-beak-deep border border-beak/30">
                  ENFORCED
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/60 border border-line">
                  <span className="text-base shrink-0">🖥️</span>
                  <div>
                    <h3 className="text-xs font-bold text-ink">Full Screen Takeover</h3>
                    <p className="text-[11px] text-stone-muted">
                      Locks into fullscreen. Exiting triggers an instant security violation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/60 border border-line">
                  <span className="text-base shrink-0">⚡</span>
                  <div>
                    <h3 className="text-xs font-bold text-ink">Hands-Free Conversation Recording</h3>
                    <p className="text-[11px] text-stone-muted">
                      Parrot speaks the prompt out loud, then automatically starts recording your answer. No manual buttons needed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/60 border border-line">
                  <span className="text-base shrink-0">🚫</span>
                  <div>
                    <h3 className="text-xs font-bold text-ink">Tab Switching & Clipboard Blocked</h3>
                    <p className="text-[11px] text-stone-muted">
                      Tab switches and copy/paste are blocked and recorded in your report.
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
                  I agree to the fullscreen lock, mandatory video, and hands-free automatic conversation recording.
                </span>
              </label>

              <button
                onClick={() => onStartInterview("serious")}
                disabled={!canProceedSerious}
                className={`w-full py-4 px-6 rounded-2xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl ${
                  canProceedSerious
                    ? "bg-beak hover:bg-beak-deep text-white shadow-beak/30 hover:scale-[1.02]"
                    : "bg-line text-stone-soft cursor-not-allowed border border-line"
                }`}
              >
                <span>Enter Serious Proctored Studio</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
