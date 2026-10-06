/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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
}

export default function AudioRecorder({
  onRecordingComplete,
  onStartRecording,
  onStopRecording,
  onRecordingStateChange,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    // Silence any speech synthesis so microphone doesn't pick up computer audio
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onStartRecording?.();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
      setLiveTranscript("");

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let current = "";
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript + " ";
            }
            setLiveTranscript(current.trim());
          };

          recognition.onerror = (e: any) => {
            console.warn("Speech recognition notice:", e.error);
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
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = (reader.result as string) || "";
          const base64 = resultStr.includes(",")
            ? resultStr.split(",")[1]
            : resultStr;

          onRecordingComplete(base64, Math.max(1, Math.round(duration)), liveTranscript || undefined);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      onRecordingStateChange?.(true);
      setElapsed(0);
      setPermissionDenied(false);

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setPermissionDenied(true);
    }
  }, [onRecordingComplete, liveTranscript, onRecordingStateChange, onStartRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange?.(false);
      onStopRecording?.();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, onRecordingStateChange, onStopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto">
      {permissionDenied && (
        <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 text-center text-red-300 text-xs sm:text-sm shadow-xl backdrop-blur-md">
          Microphone access denied. Please allow microphone permissions in your browser.
        </div>
      )}

      {/* 3D Mic Controller & Shockwave Pulse Ring */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex items-center justify-center p-2">
          {isRecording && (
            <>
              {/* Outer Shockwave Pulsing Rings */}
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse-glow" />
              <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-red-600/30 via-rose-500/25 to-amber-500/30 blur-xl animate-pulse" />
            </>
          )}

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={disabled}
              className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 hover:via-red-400 hover:to-amber-400 disabled:from-zinc-800 disabled:to-zinc-900 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_15px_35px_rgba(239,68,68,0.5)] hover:shadow-[0_20px_45px_rgba(239,68,68,0.7)] hover:scale-105 active:scale-95 border-2 border-white/20"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-red-600 fill-current" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 transition-all duration-300 shadow-[0_20px_45px_rgba(225,29,72,0.8)] scale-105 border-2 border-white/30"
            >
              <div className="w-8 h-8 rounded-lg bg-white shadow-inner group-hover:scale-90 transition-transform" />
            </button>
          )}
        </div>

        {/* Live Timer Pill */}
        <div className="flex items-center gap-3">
          {isRecording ? (
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-red-500/15 border border-red-500/40 backdrop-blur-xl shadow-2xl shadow-red-500/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-red-300 font-mono font-black text-lg tabular-nums tracking-widest">
                {formatTime(elapsed)}
              </span>
              <span className="text-[10px] font-black uppercase text-red-300 tracking-widest border-l border-red-500/30 pl-3">
                Live Voice Stream
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-zinc-300">
              Click the microphone button to start recording your answer
            </span>
          )}
        </div>
      </div>

      {/* Dynamic 16-Bar Equalizer Waveform */}
      {isRecording && (
        <div className="flex items-center gap-2 h-12 px-8 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 backdrop-blur-xl shadow-2xl">
          {[14, 28, 18, 36, 22, 32, 16, 38, 24, 20, 30, 16, 34, 22, 18, 26].map((height, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-red-600 via-rose-400 to-amber-300 rounded-full"
              style={{
                height: `${height}px`,
                animation: `waveBarDynamic 1.${(i % 6) + 2}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Glass Speech Recognition Terminal */}
      {isRecording && liveTranscript && (
        <div className="w-full rounded-2xl bg-zinc-950/90 border border-indigo-500/40 p-5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300 font-jakarta">
                Live Speech Recognition Engine
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Speech-to-Text Active</span>
          </div>
          <div className="max-h-36 overflow-y-auto pr-2 text-xs text-zinc-100 leading-relaxed font-sans italic">
            &ldquo;{liveTranscript}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}
