/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";

export interface AudioRecorderHandle {
  start: () => void;
  stop: () => void;
  isRecording: () => boolean;
}

interface AudioRecorderProps {
  onRecordingComplete: (
    audioBase64: string,
    duration: number,
    liveText?: string
  ) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  disabled?: boolean;
  autoStart?: boolean;
  mode?: "practice" | "serious";
}

const AudioRecorder = forwardRef<AudioRecorderHandle, AudioRecorderProps>(function AudioRecorder(
  {
    onRecordingComplete,
    onStartRecording,
    onStopRecording,
    onRecordingStateChange,
    disabled = false,
    autoStart = false,
    mode = "practice",
  },
  ref
) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [userHasSpoken, setUserHasSpoken] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isAbortingRef = useRef(false);
  const isStoppingOrStoppedRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  // Audio energy analysis & robust silence detection refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastVoiceTimeRef = useRef<number>(0);
  const cumulativeVoiceMsRef = useRef<number>(0);
  const noiseFloorRef = useRef<number>(3.0);
  const noiseFloorDevRef = useRef<number>(5.0);
  const hasSpokenRef = useRef(false);
  const liveTranscriptRef = useRef<string>("");

  // Silence threshold: 1.5s of silence after speaking → immediate auto-submit (no visual countdown)
  // This feels like a natural human conversational pause without unnecessary waiting.
  const SILENCE_SUBMIT_MS = 1500;

  const cleanupAudio = () => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore
      }
      sourceNodeRef.current = null;
    }
    // Note: AudioContext is preserved across questions to avoid hitting the browser's 6-context hardware limit
  };

  useEffect(() => {
    return () => {
      isAbortingRef.current = true;
      isStoppingOrStoppedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupAudio();
      if (recognitionRef.current) {
        try {
          const rec = recognitionRef.current;
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.onspeechstart = null;
          rec.onsoundstart = null;
          rec.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.ondataavailable = null;
        if (mediaRecorderRef.current.state !== "inactive") {
          try {
            mediaRecorderRef.current.stop();
          } catch {
            // Ignore
          }
        }
      }
      // Release hardware audio resources on final unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };
  }, []);

  // Abort recording cleanly without firing onRecordingComplete (used when disabled or reset)
  const abortRecording = useCallback(() => {
    isAbortingRef.current = true;
    isStoppingOrStoppedRef.current = true;
    cleanupAudio();

    if (recognitionRef.current) {
      try {
        const rec = recognitionRef.current;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.onspeechstart = null;
        rec.onsoundstart = null;
        rec.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    const mr = mediaRecorderRef.current;
    if (mr) {
      mr.onstop = null;
      if (mr.state !== "inactive") {
        try {
          mr.stop();
        } catch {
          // Ignore
        }
      }
    }

    // Keep stream warm for next question
    setIsRecording(false);
    onRecordingStateChange?.(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [onRecordingStateChange]);

  // Dedicated stop function that submits the recording
  const stopRecording = useCallback(() => {
    isStoppingOrStoppedRef.current = true;
    cleanupAudio();

    if (recognitionRef.current) {
      try {
        const rec = recognitionRef.current;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.onspeechstart = null;
        rec.onsoundstart = null;
        rec.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      try {
        mr.stop();
      } catch (err) {
        console.warn("mediaRecorder stop notice:", err);
      }
    }

    setIsRecording(false);
    onRecordingStateChange?.(false);
    onStopRecording?.();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [onRecordingStateChange, onStopRecording]);

  // Keep a mutable ref to stopRecording to prevent any closure staleness
  const stopRecordingRef = useRef(stopRecording);
  stopRecordingRef.current = stopRecording;

  // Abort recording silently if disabled prop becomes true (e.g. Parrot speaks or question processing starts)
  useEffect(() => {
    if (disabled && isRecording) {
      abortRecording();
    }
  }, [disabled, isRecording, abortRecording]);

  const startRecording = useCallback(async () => {
    if (disabled) return;
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") return;

    // Silence any speech synthesis so microphone doesn't pick up computer audio
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onStartRecording?.();

    try {
      // Pre-warmed audio stream: reuse already-open stream to eliminate 500ms device startup latency!
      let stream = streamRef.current;
      const isStreamActive =
        stream &&
        stream.active &&
        stream.getAudioTracks().some((t) => t.readyState === "live");

      if (!isStreamActive || !stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
      }

      if (!stream) return;

      let options: MediaRecorderOptions = {};
      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" };
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      isAbortingRef.current = false;
      isStoppingOrStoppedRef.current = false;
      hasSubmittedRef.current = false;
      setLiveTranscript("");
      liveTranscriptRef.current = "";
      setUserHasSpoken(false);
      hasSpokenRef.current = false;
      const now = Date.now();
      lastVoiceTimeRef.current = now;
      cumulativeVoiceMsRef.current = 0;
      startTimeRef.current = now;
      noiseFloorRef.current = 3.0;
      noiseFloorDevRef.current = 5.0;

      // Web Audio API: Reuse persistent AudioContext across questions
      try {
        let audioCtx = audioContextRef.current;
        if (!audioCtx || audioCtx.state === "closed") {
          const AudioCtxClass =
            window.AudioContext || (window as any).webkitAudioContext;
          audioCtx = new AudioCtxClass();
          audioContextRef.current = audioCtx;
        }

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        let analyser = analyserRef.current;
        if (!analyser) {
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
        }

        // Cleanly disconnect previous source node to avoid stacking multiple audio inputs across questions
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch {
            // Ignore
          }
          sourceNodeRef.current = null;
        }

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceNodeRef.current = source;
      } catch (err) {
        console.warn("AudioContext setup notice:", err);
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          if (recognitionRef.current) {
            try {
              const rec = recognitionRef.current;
              rec.onresult = null;
              rec.onerror = null;
              rec.onend = null;
              rec.onspeechstart = null;
              rec.onsoundstart = null;
              rec.abort();
            } catch {
              // Ignore
            }
            recognitionRef.current = null;
          }

          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onspeechstart = () => {
            if (!isStoppingOrStoppedRef.current && !isAbortingRef.current) {
              lastVoiceTimeRef.current = Date.now();
              hasSpokenRef.current = true;
              setUserHasSpoken(true);
            }
          };

          // Note: onsoundstart is intentionally NOT hooked to avoid background ambient noise/clicks resetting silence

          recognition.onresult = (event: any) => {
            let current = "";
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript + " ";
            }
            const trimmed = current.trim();
            setLiveTranscript(trimmed);
            liveTranscriptRef.current = trimmed;

            if (trimmed.length > 0) {
              lastVoiceTimeRef.current = Date.now();
              hasSpokenRef.current = true;
              setUserHasSpoken(true);
            }
          };

          recognition.onend = () => {
            if (isStoppingOrStoppedRef.current || isAbortingRef.current) return;
            // Auto-restart recognition only if actively recording
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === "recording"
            ) {
              try {
                recognition.start();
              } catch {
                // Ignore
              }
            }
          };

          recognition.onerror = (e: any) => {
            if (e.error !== "no-speech") {
              console.warn("Speech recognition notice:", e.error);
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("Speech recognition notice:", e);
        }
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Discard if aborted, cancelled, or already submitted
        if (isAbortingRef.current || hasSubmittedRef.current) {
          return;
        }

        const duration = (Date.now() - startTimeRef.current) / 1000;
        const transcriptText = (liveTranscriptRef.current || "").trim();

        // Discard empty/accidental micro-recordings under 0.8s with no spoken text
        if (duration < 0.8 && transcriptText.length === 0) {
          console.warn("[AudioRecorder] Discarding empty micro-recording");
          return;
        }

        hasSubmittedRef.current = true;

        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = (reader.result as string) || "";
          const base64 = resultStr.includes(",")
            ? resultStr.split(",")[1]
            : resultStr;

          onRecordingComplete(base64, Math.max(1, Math.round(duration)), transcriptText || undefined);
        };
        reader.readAsDataURL(blob);

        // Keep stream warm for next question (do not stop tracks here)
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      onRecordingStateChange?.(true);
      setElapsed(0);
      setPermissionDenied(false);

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      // Robust Hands-Free Silence Detection (Only active in Serious Mode)
      if (mode === "serious") {
        const timeData = new Uint8Array(256);

        silenceIntervalRef.current = setInterval(() => {
          const mrInstance = mediaRecorderRef.current;
          if (!mrInstance || mrInstance.state === "inactive") return;

          const currentTime = Date.now();
          const elapsedSec = (currentTime - startTimeRef.current) / 1000;

          // Compute Peak Deviation and RMS from audio stream
          if (analyserRef.current) {
            analyserRef.current.getByteTimeDomainData(timeData);
            let maxDev = 0;
            let sumSquares = 0;
            for (let i = 0; i < 256; i++) {
              const dev = Math.abs(timeData[i] - 128);
              if (dev > maxDev) maxDev = dev;
              sumSquares += dev * dev;
            }
            const rms = Math.sqrt(sumSquares / 256);

            // Adaptive noise floor tracking: dynamically calibrates to ambient room noise
            if (elapsedSec < 0.6 || rms < noiseFloorRef.current * 1.3) {
              noiseFloorRef.current = noiseFloorRef.current * 0.92 + rms * 0.08;
              noiseFloorDevRef.current = noiseFloorDevRef.current * 0.92 + maxDev * 0.08;
            }

            // Distinguish genuine voice from ambient room noise (fan, breath, room resonance)
            const voiceRmsThreshold = Math.max(7.0, noiseFloorRef.current * 2.0);
            const voiceDevThreshold = Math.max(14, noiseFloorDevRef.current * 1.8);

            const isCurrentlyVocal = rms >= voiceRmsThreshold || maxDev >= voiceDevThreshold;

            if (isCurrentlyVocal) {
              cumulativeVoiceMsRef.current += 100;
              lastVoiceTimeRef.current = currentTime;

              // Quick voice confirmation: 200ms of voice is plenty to confirm speech
              if (cumulativeVoiceMsRef.current >= 200 || liveTranscriptRef.current.length > 0) {
                hasSpokenRef.current = true;
                setUserHasSpoken(true);
              }
            }
          }

          // Smart arming failsafe: after 3.5s of recording, arm silence detector if candidate uttered any sound or text
          if (
            elapsedSec >= 3.5 &&
            !hasSpokenRef.current &&
            (cumulativeVoiceMsRef.current >= 150 || liveTranscriptRef.current.length > 0)
          ) {
            hasSpokenRef.current = true;
            setUserHasSpoken(true);
          }

          // Case A: User has spoken, now watching for silence
          if (hasSpokenRef.current) {
            const silenceMs = currentTime - lastVoiceTimeRef.current;

            // 1. Primary threshold: 1.5s of silence after speaking → immediate auto-submit
            if (silenceMs >= SILENCE_SUBMIT_MS) {
              stopRecordingRef.current();
              return;
            }

            // 2. Failsafe for substantial answers: if user spoke >= 8 characters or >= 1.5s voice,
            // don't let subtle background noise keep it waiting beyond 2.0s
            const hasSubstantialAnswer =
              liveTranscriptRef.current.trim().length >= 8 ||
              cumulativeVoiceMsRef.current >= 1500;
            if (hasSubstantialAnswer && silenceMs >= 2000) {
              stopRecordingRef.current();
              return;
            }

            // 3. Question turn max duration: auto-submit after 60s
            if (elapsedSec >= 60) {
              stopRecordingRef.current();
              return;
            }
          } else {
            // Case B: Candidate is thinking before starting to speak
            // Generous 90-second safety limit to prevent abandoned tabs
            if (elapsedSec >= 90) {
              stopRecordingRef.current();
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
      setPermissionDenied(true);
    }
  }, [disabled, mode, onRecordingComplete, onRecordingStateChange, onStartRecording]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    start: startRecording,
    stop: stopRecordingRef.current,
    isRecording: () => {
      const mr = mediaRecorderRef.current;
      return mr ? mr.state === "recording" : false;
    },
  }));

  // Auto-start recording when requested in serious mode
  useEffect(() => {
    if (autoStart && !disabled) {
      const mr = mediaRecorderRef.current;
      if (!mr || mr.state === "inactive") {
        startRecording();
      }
    }
  }, [autoStart, disabled, startRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isSerious = mode === "serious";

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      {permissionDenied && (
        <div className="bg-beak/15 border border-beak/40 rounded-2xl p-4 text-center text-beak-deep text-xs sm:text-sm shadow-xl backdrop-blur-md">
          Microphone access denied. Please allow microphone permissions in your browser.
        </div>
      )}

      {/* SERIOUS MODE: Fully Automatic Hands-Free Recording with Infallible 3s Silence Auto-Submit */}
      {isSerious ? (
        <div className="w-full flex flex-col items-center gap-4">
          {/* Status Header */}
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isRecording ? "bg-beak" : "bg-line"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isRecording ? "bg-beak" : "bg-stone-soft"
                  }`}
                />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                {isRecording ? "Live Automatic Recording" : "Standby • Floor to You"}
              </span>
            </div>

            {/* Time Elapsed */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cream border border-line font-mono text-xs">
              <span className="text-stone-muted">Duration:</span>
              <span className={`font-bold ${isRecording ? "text-beak" : "text-stone-muted"}`}>
                {formatTime(elapsed)}
              </span>
            </div>
          </div>

          {/* Equalizer Waveform & Live Listening Feedback */}
          {isRecording ? (
            <div className="w-full p-5 rounded-2xl bg-cream/60 border border-beak/30 flex flex-col items-center gap-3 shadow-inner">
              <div className="flex items-center gap-1.5 h-10 px-4">
                {[12, 24, 16, 32, 20, 28, 14, 34, 22, 18, 26, 14, 30, 20, 16, 24].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-beak via-beak to-amber-300 rounded-full"
                    style={{
                      height: `${height}px`,
                      animation: `waveBarDynamic 1.${(i % 6) + 2}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>

              {/* Listening Status */}
              <p className="text-xs text-ink/80 font-medium text-center">
                {userHasSpoken
                  ? "🎙️ Listening... Submits automatically when you finish speaking."
                  : "🎙️ Microphone is live. Take your time, then speak your response."}
              </p>
            </div>
          ) : (
            <div className="w-full p-4 rounded-2xl bg-cream border border-line flex items-center justify-center text-xs text-stone-muted">
              Parrot is speaking. Microphone turns on automatically once Parrot finishes.
            </div>
          )}

          {/* Quick submit shortcut */}
          {isRecording && (
            <div className="flex items-center justify-end w-full px-2 pt-1">
              <button
                onClick={() => stopRecordingRef.current()}
                className="text-[11px] font-mono text-stone-soft hover:text-ink underline hover:no-underline font-semibold transition-colors"
              >
                Submit now →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* PRACTICE MODE: Manual Tap-To-Record Interface */
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center p-2">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-beak/30 animate-pulse-glow" />
                <div className="absolute -inset-6 rounded-full bg-beak/20 blur-xl animate-pulse" />
              </>
            )}

            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-moss hover:bg-moss-deep disabled:bg-line disabled:cursor-not-allowed transition-all duration-300 shadow-[0_5px_0_#1C3B16,0_18px_30px_-12px_rgba(47,94,37,0.6)] hover:scale-105 active:translate-y-[4px] active:shadow-none"
                title="Tap to start recording"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-moss fill-current" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
              </button>
            ) : (
              <button
                onClick={() => stopRecordingRef.current()}
                className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-beak transition-all duration-300 shadow-[0_18px_34px_-10px_rgba(226,67,43,0.7)] scale-105"
                title="Tap to stop and submit answer"
              >
                <div className="w-8 h-8 rounded-lg bg-white shadow-inner group-hover:scale-90 transition-transform" />
              </button>
            )}
          </div>

          {/* Practice Timer & Prompt */}
          <div className="flex items-center gap-3">
            {isRecording ? (
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-beak/15 border border-beak/40 backdrop-blur-xl shadow-2xl shadow-beak/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-beak opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-beak" />
                </span>
                <span className="text-beak-deep font-mono font-semibold text-lg tabular-nums tracking-widest">
                  {formatTime(elapsed)}
                </span>
                <span className="text-[10px] font-semibold uppercase text-beak-deep tracking-widest border-l border-beak/30 pl-3">
                  Recording • Tap Square To Finish
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-ink/80">
                Tap microphone when ready to speak
              </span>
            )}
          </div>

          {/* Equalizer Waveform in Practice */}
          {isRecording && (
            <div className="flex items-center gap-2 h-10 px-8 py-2 rounded-2xl bg-cream/60 border border-stone-soft/40 backdrop-blur-xl shadow-2xl">
              {[14, 28, 18, 36, 22, 32, 16, 38, 24, 20, 30, 16, 34, 22, 18, 26].map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-beak via-beak to-amber-300 rounded-full"
                  style={{
                    height: `${height}px`,
                    animation: `waveBarDynamic 1.${(i % 6) + 2}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Glass Speech Recognition Terminal */}
      {isRecording && liveTranscript && (
        <div className="w-full rounded-2xl bg-cream/60 border border-moss-light/40 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-moss-light animate-ping" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-moss-deep">
                Live Speech Recognition
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-muted">Transcribing</span>
          </div>
          <div className="max-h-28 overflow-y-auto pr-2 text-xs text-ink leading-relaxed italic">
            &ldquo;{liveTranscript}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
});

export default AudioRecorder;
