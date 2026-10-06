"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";
import ProgressBar from "@/components/ProgressBar";
import FrameworkIntroScreen from "@/components/FrameworkIntroScreen";
import IeltsIntroScreen from "@/components/IeltsIntroScreen";
import QuestionAudioControl from "@/components/QuestionAudioControl";
import CameraPermissionPrompt from "@/components/CameraPermissionPrompt";
import CameraPreview from "@/components/CameraPreview";
import { useQuestionSpeech } from "@/lib/speech/useQuestionSpeech";
import type { BodyLanguageMetrics } from "@/lib/bodyLanguage/BodyLanguageAnalyzer";

interface FrameworkStepItem {
  letter: string;
  label: string;
  description: string;
}

interface QuestionDetail {
  framework?: string;
  bulletPoints?: string[];
  frameworkSteps?: FrameworkStepItem[];
  [key: string]: unknown;
}

interface InterviewState {
  sessionId: string;
  questions: string[];
  questionDetails?: QuestionDetail[];
  track?: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  currentQuestion: string;
  isFollowUp: boolean;
  lastTranscript: string | null;
  isComplete: boolean;
  isProcessing: boolean;
}

function IeltsQuestionPanel({
  currentQuestionIndex,
  currentQuestion,
  questionDetails,
  audioControl,
}: {
  currentQuestionIndex: number;
  currentQuestion: string;
  questionDetails?: QuestionDetail[];
  audioControl: React.ReactNode;
}) {
  const detail = questionDetails?.[currentQuestionIndex];

  // Part 1 – Personal Question
  if (currentQuestionIndex < 2) {
    return (
      <div className="space-y-4 animate-in fade-in duration-400">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-bold text-blue-300 uppercase tracking-wider backdrop-blur-md">
              <span className="w-5 h-5 rounded-lg bg-blue-500/30 flex items-center justify-center text-xs font-black">1</span>
              Part 1 — Personal & General
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Question {currentQuestionIndex + 1} of 2</span>
          </div>
          {audioControl}
        </div>

        <div className="glass-card rounded-3xl border border-blue-500/30 overflow-hidden shadow-2xl relative">
          <div className="flex items-center gap-3 px-6 py-3.5 border-b border-blue-500/20 bg-blue-900/20">
            <div className="w-7 h-7 rounded-xl bg-blue-500/30 border border-blue-500/40 flex items-center justify-center text-sm">🎙️</div>
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest font-jakarta">Examiner Prompt</span>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed font-jakarta">{currentQuestion}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-white/10 text-xs text-zinc-300">
          <span className="text-base shrink-0">💡</span>
          <p className="leading-relaxed">
            <strong className="text-white font-semibold">Examiner Tip:</strong> Speak naturally for 2–3 sentences. Warm up your fluency and pronunciation.
          </p>
        </div>
      </div>
    );
  }

  // Part 2 – Cue Card
  if (currentQuestionIndex === 2) {
    const bulletPoints = detail?.bulletPoints || [];
    const lines = currentQuestion.split("\n");
    const mainPrompt = lines[0] || currentQuestion;
    const parsedBullets: string[] = bulletPoints.length > 0
      ? bulletPoints
      : lines.filter((l: string) => l.startsWith("•")).map((l: string) => l.replace(/^•\s*/, ""));

    return (
      <div className="space-y-4 animate-in fade-in duration-400">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider backdrop-blur-md">
              <span className="w-5 h-5 rounded-lg bg-purple-500/30 flex items-center justify-center text-xs font-black">2</span>
              Part 2 — Cue Card Long Turn
            </div>
            <span className="text-[11px] text-purple-300/80 font-mono">Speak for 1–2 minutes</span>
          </div>
        </div>

        <div className="glass-card rounded-3xl border-2 border-purple-500/40 overflow-hidden shadow-2xl relative">
          <div className="px-6 py-3.5 bg-purple-500/15 border-b border-purple-500/25 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-purple-200 uppercase tracking-widest font-jakarta">Candidate Task Card</span>
              <span className="text-[10px] text-purple-300/70 font-mono">IELTS Part 2</span>
            </div>
            {audioControl}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-lg sm:text-xl font-bold text-white leading-snug font-jakarta">{mainPrompt}</p>

            {parsedBullets.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-purple-500/20">
                <p className="text-[11px] font-extrabold text-purple-300 uppercase tracking-widest">You should say:</p>
                <div className="space-y-3">
                  {parsedBullets.map((bp: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-white/5">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-200 leading-relaxed font-medium">{bp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-3.5 bg-purple-500/10 border-t border-purple-500/20">
            <p className="text-xs text-purple-200/80 italic">
              Take 1 minute to plan notes. Then record a continuous long response covering all points.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Part 3 – Discussion
  const part3Number = currentQuestionIndex - 2;
  return (
    <div className="space-y-4 animate-in fade-in duration-400">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 uppercase tracking-wider backdrop-blur-md">
            <span className="w-5 h-5 rounded-lg bg-emerald-500/30 flex items-center justify-center text-xs font-black">3</span>
            Part 3 — Two-Way Discussion
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Question {part3Number} of 2</span>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-emerald-500/20 bg-emerald-900/20 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center text-sm">🎙️</div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest font-jakarta">Examiner Discussion Prompt</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-emerald-400/80">Analytical</span>
            {audioControl}
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed font-jakarta">{currentQuestion}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-white/10 text-xs text-zinc-300">
        <span className="text-base shrink-0">💡</span>
        <p className="leading-relaxed">
          <strong className="text-white font-semibold">Discussion Strategy:</strong> Express your perspective, present arguments, and justify your points with examples.
        </p>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [state, setState] = useState<InterviewState>({
    sessionId: "",
    questions: [],
    totalQuestions: 0,
    currentQuestionIndex: 0,
    currentQuestion: "",
    isFollowUp: false,
    lastTranscript: null,
    isComplete: false,
    isProcessing: false,
  });

  const [sessionStage, setSessionStage] = useState<"intro" | "practice" | "report">("intro");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  // --- Camera / Body Language state ---
  // "prompt" = show the opt-in modal, "requesting" = camera init in progress,
  // "active" = camera running, "skipped" = user opted out
  const [cameraState, setCameraState] = useState<"prompt" | "requesting" | "active" | "skipped">("prompt");
  const [cameraError, setCameraError] = useState("");
  const [isCurrentlyRecording, setIsCurrentlyRecording] = useState(false);
  const analyzerRef = useRef<import("@/lib/bodyLanguage/BodyLanguageAnalyzer").BodyLanguageAnalyzer | null>(null);
  const latestMetricsRef = useRef<BodyLanguageMetrics | null>(null);

  // Audio speech synthesis hook
  const {
    audioEnabled,
    setAudioEnabled,
    isSpeaking,
    speak,
    stop,
  } = useQuestionSpeech();

  const lastSpokenKeyRef = useRef<string>("");

  const isCommBuilder = state.track === "communication-builder";
  const isIeltsSpeaking = state.track === "ielts-speaking";
  const currentQuestionDetail = state.questionDetails?.[state.currentQuestionIndex];

  // Helper to formulate spoken text for the active prompt
  const getSpokenTextForCurrentQuestion = useCallback(() => {
    if (!state.currentQuestion) return "";

    if (isIeltsSpeaking) {
      if (state.currentQuestionIndex === 2) {
        // Part 2 Cue card
        const detail = state.questionDetails?.[2];
        const bulletPoints: string[] = detail?.bulletPoints || [];
        const lines = state.currentQuestion.split("\n");
        const mainPrompt = lines[0] || state.currentQuestion;
        const parsedBullets: string[] =
          bulletPoints.length > 0
            ? bulletPoints
            : lines
              .filter((l: string) => l.startsWith("•"))
              .map((l: string) => l.replace(/^•\s*/, ""));

        if (parsedBullets.length > 0) {
          return `${mainPrompt}. You should say: ${parsedBullets.join(
            ". "
          )}. Take one minute to prepare.`;
        }
        return mainPrompt;
      }
      return state.currentQuestion;
    }

    return state.currentQuestion;
  }, [
    state.currentQuestion,
    state.currentQuestionIndex,
    state.questionDetails,
    isIeltsSpeaking,
  ]);

  // Replay speech on demand (force = true)
  const handleSpeakCurrent = useCallback(() => {
    const textToSpeak = getSpokenTextForCurrentQuestion();
    if (textToSpeak) {
      speak(textToSpeak, true);
    }
  }, [getSpokenTextForCurrentQuestion, speak]);

  // Load session from server
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch(`/api/interview/${sessionId}`);
        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Server error (${res.status}): ${text.slice(0, 150)}`);
        }

        if (!res.ok) throw new Error(data.error || "Failed to load session.");

        if (data.session.status === "completed") {
          router.push(`/report/${sessionId}`);
          return;
        }

        const isComm = data.session.track === "communication-builder";
        const isIelts = data.session.track === "ielts-speaking";

        if (isComm || isIelts) {
          if (
            data.session.currentQuestionIndex > 0 ||
            (data.answers && data.answers.length > 0) ||
            data.session.awaitingFollowUp
          ) {
            setSessionStage("practice");
          } else {
            setSessionStage("intro");
          }
        } else {
          setSessionStage("practice");
        }

        setState({
          sessionId: data.session.sessionId,
          questions: data.session.questions,
          questionDetails: data.session.questionDetails,
          track: data.session.track,
          totalQuestions: isIelts ? 5 : data.session.questions.length,
          currentQuestionIndex: data.session.currentQuestionIndex,
          currentQuestion:
            data.session.questions[data.session.currentQuestionIndex],
          isFollowUp: data.session.awaitingFollowUp || false,
          lastTranscript: null,
          isComplete: false,
          isProcessing: false,
        });

        if (data.session.awaitingFollowUp && data.answers.length > 0) {
          const lastAnswer = data.answers[data.answers.length - 1];
          if (lastAnswer.followUpText) {
            setState((prev) => ({
              ...prev,
              currentQuestion: lastAnswer.followUpText,
              isFollowUp: true,
              lastTranscript: lastAnswer.answerTranscript,
            }));
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, router]);

  // Automatically read questions out loud when presented in practice stage
  useEffect(() => {
    if (
      sessionStage !== "practice" ||
      state.isProcessing ||
      state.isComplete ||
      !state.currentQuestion
    ) {
      return;
    }

    const currentKey = `${state.currentQuestionIndex}-${state.isFollowUp ? "followup" : "main"
      }-${state.currentQuestion}`;

    if (lastSpokenKeyRef.current !== currentKey) {
      lastSpokenKeyRef.current = currentKey;
      const textToSpeak = getSpokenTextForCurrentQuestion();
      if (textToSpeak) {
        speak(textToSpeak);
      }
    }
  }, [
    sessionStage,
    state.currentQuestionIndex,
    state.isFollowUp,
    state.currentQuestion,
    state.isProcessing,
    state.isComplete,
    getSpokenTextForCurrentQuestion,
    speak,
  ]);

  // --- Camera: handle enable ---
  const handleEnableCamera = useCallback(async () => {
    setCameraState("requesting");
    setCameraError("");
    try {
      const { BodyLanguageAnalyzer } = await import("@/lib/bodyLanguage/BodyLanguageAnalyzer");
      const analyzer = new BodyLanguageAnalyzer();
      // init() creates its own off-screen video element — no external element needed
      await analyzer.init();
      analyzerRef.current = analyzer;
      setCameraState("active");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied.";
      setCameraError(msg);
      setCameraState("prompt"); // go back so user can retry or skip
    }
  }, []);

  // --- Camera: handle skip ---
  const handleSkipCamera = useCallback(() => {
    setCameraState("skipped");
  }, []);

  // --- Camera: turn off (user clicks X on preview) ---
  const handleDisableCamera = useCallback(() => {
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
    }
    setCameraState("skipped");
    latestMetricsRef.current = null;
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.stop();
        analyzerRef.current = null;
      }
    };
  }, []);

  const handleRecordingComplete = useCallback(
    async (audioBase64: string, duration: number, liveText?: string) => {
      stop(); // Stop audio if speaking

      // Stop body language sampling and capture metrics
      let blMetrics: BodyLanguageMetrics | null = null;
      if (analyzerRef.current && cameraState === "active") {
        blMetrics = analyzerRef.current.stopSampling();
        latestMetricsRef.current = blMetrics;
      }

      setState((prev) => ({ ...prev, isProcessing: true }));

      try {
        const res = await fetch("/api/interview/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            audioBase64,
            audioDuration: duration,
            questionText: state.currentQuestion,
            isFollowUp: state.isFollowUp,
            liveText,
            // Body language data (null if camera was skipped)
            eyeContactPercent: blMetrics?.eyeContactPercent ?? null,
            movementScore: blMetrics?.movementScore ?? null,
          }),
        });

        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Server error (${res.status}): ${text.slice(0, 150)}`);
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to submit answer.");
        }

        if (data.isComplete) {
          setState((prev) => ({
            ...prev,
            isComplete: true,
            lastTranscript: data.transcript,
            isProcessing: false,
          }));
          setSessionStage("report");
        } else if (data.followUpQuestion) {
          setState((prev) => ({
            ...prev,
            currentQuestion: data.followUpQuestion,
            isFollowUp: true,
            lastTranscript: data.transcript,
            isProcessing: false,
          }));
          setSessionStage("practice");
        } else if (data.nextQuestion) {
          setState((prev) => ({
            ...prev,
            currentQuestionIndex: data.questionIndex,
            totalQuestions: data.totalQuestions || prev.totalQuestions,
            currentQuestion: data.nextQuestion,
            isFollowUp: false,
            lastTranscript: data.transcript,
            isProcessing: false,
          }));
          setSessionStage("practice");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process answer."
        );
        setState((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [sessionId, state.currentQuestion, state.isFollowUp, stop, cameraState]
  );

  const handleGenerateReport = async () => {
    stop();
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text.slice(0, 150)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate report.");
      }

      const history = JSON.parse(
        localStorage.getItem("sessionHistory") || "[]"
      );
      const idx = history.findIndex(
        (s: { sessionId: string }) => s.sessionId === sessionId
      );
      if (idx >= 0) {
        history[idx].status = "completed";
        localStorage.setItem("sessionHistory", JSON.stringify(history));
      }

      router.push(`/report/${sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate report."
      );
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 glass-card p-8 rounded-3xl border border-white/10">
          <svg className="animate-spin h-10 w-10 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-300 text-sm font-semibold font-jakarta">Preparing Interview Studio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="glass-card border border-red-500/30 rounded-3xl p-8 text-center space-y-4">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
          >
            Back to Studio Home
          </button>
        </div>
      </div>
    );
  }

  if (isCommBuilder && sessionStage === "intro") {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <FrameworkIntroScreen
          questionDetails={(state.questionDetails as any) || []}
          onStartPractice={() => {
            setSessionStage("practice");
            setState((prev) => ({ ...prev, currentQuestionIndex: 0 }));
          }}
        />
      </div>
    );
  }

  if (isIeltsSpeaking && sessionStage === "intro") {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <IeltsIntroScreen
          onStartPractice={() => {
            setSessionStage("practice");
            setState((prev) => ({ ...prev, currentQuestionIndex: 0 }));
          }}
        />
      </div>
    );
  }

  const audioControlElement = (
    <QuestionAudioControl
      audioEnabled={audioEnabled}
      onToggleAudio={setAudioEnabled}
      isSpeaking={isSpeaking}
      onSpeak={handleSpeakCurrent}
      onStop={stop}
    />
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Camera Permission Prompt Modal — shown once when practice stage starts */}
      {sessionStage === "practice" && !state.isComplete && !state.isProcessing &&
        (cameraState === "prompt" || cameraState === "requesting") && (
        <CameraPermissionPrompt
          onEnable={handleEnableCamera}
          onSkip={handleSkipCamera}
          isRequesting={cameraState === "requesting"}
          errorMessage={cameraError || undefined}
        />
      )}
      {/* Top Header Bar with Exit and Global Voice Audio Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <button
          onClick={() => {
            stop();
            router.push("/");
          }}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-950/70 border border-white/10 px-3.5 py-1.5 rounded-xl hover:bg-zinc-900"
        >
          ← Exit Studio
        </button>

        <div className="flex items-center gap-3">
          {isSpeaking && (
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Speaking question out loud...</span>
            </div>
          )}
          <QuestionAudioControl
            audioEnabled={audioEnabled}
            onToggleAudio={(val) => {
              setAudioEnabled(val);
              if (val) {
                handleSpeakCurrent();
              }
            }}
            isSpeaking={isSpeaking}
            onSpeak={handleSpeakCurrent}
            onStop={stop}
            variant="header-toggle"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        current={state.currentQuestionIndex}
        total={state.totalQuestions}
        awaitingFollowUp={state.isFollowUp}
      />

      {/* Complete State */}
      {sessionStage === "report" || state.isComplete ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-white/10 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white font-jakarta">
              {isIeltsSpeaking ? "IELTS Exam Practice Complete!" : "Session Complete!"}
            </h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              {isIeltsSpeaking
                ? "All 3 parts recorded. Generate your comprehensive report to view your estimated Band Scores across 4 criteria."
                : "All prompts have been answered. Generate your report for transcript analysis, filler words, and STAR feedback."}
            </p>
          </div>

          {state.lastTranscript && (
            <div className="text-left bg-zinc-950/80 border border-white/5 rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Last Recorded Response
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">&ldquo;{state.lastTranscript}&rdquo;</p>
            </div>
          )}

          <button
            id="generate-report-btn"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 disabled:from-zinc-800 disabled:to-zinc-900 text-white font-extrabold text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/30 hover:scale-105"
          >
            {generatingReport ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Detailed Analysis...
              </span>
            ) : (
              isIeltsSpeaking ? "Generate IELTS Band Score Report →" : "Generate Feedback Report →"
            )}
          </button>
        </div>
      ) : (
        /* Active Recording State */
        <div className="space-y-6">
          {/* Last Transcript Display */}
          {state.lastTranscript && (
            <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4 space-y-1 animate-in fade-in duration-300">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Previous Answer Transcript
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed italic">
                &ldquo;{state.lastTranscript}&rdquo;
              </p>
            </div>
          )}

          {/* Question Display with Audio controls */}
          {isIeltsSpeaking ? (
            <IeltsQuestionPanel
              currentQuestionIndex={state.currentQuestionIndex}
              currentQuestion={state.currentQuestion}
              questionDetails={state.questionDetails}
              audioControl={audioControlElement}
            />
          ) : (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${state.isFollowUp ? "bg-amber-500" : "bg-indigo-500"}`} />
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${state.isFollowUp
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                      }`}
                  >
                    {state.isFollowUp
                      ? "⚡ Follow-up Question"
                      : `Question ${state.currentQuestionIndex + 1} of ${state.totalQuestions}`}
                  </span>

                  {audioControlElement}
                </div>
                <p className="text-lg sm:text-xl font-bold text-white leading-relaxed font-jakarta">
                  {state.currentQuestion}
                </p>
              </div>

              {isCommBuilder && currentQuestionDetail && !state.isFollowUp && (() => {
                const fw = currentQuestionDetail.framework;
                const colorMap: Record<string, { bg: string; text: string; border: string; stepBg: string }> = {
                  STAR: { bg: "bg-indigo-500/10", text: "text-indigo-300", border: "border-indigo-500/30", stepBg: "bg-indigo-600/30" },
                  CAR: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30", stepBg: "bg-emerald-600/30" },
                  SEE: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30", stepBg: "bg-amber-600/30" },
                  PAR: { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/30", stepBg: "bg-purple-600/30" },
                };
                const c = (fw && colorMap[fw]) || colorMap.STAR;
                return (
                  <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 space-y-2`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${c.text}`}>
                        💡 Structure using the {fw} Framework
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestionDetail.frameworkSteps?.map((step: FrameworkStepItem) => (
                        <div key={step.letter} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950/60 border border-white/5">
                          <span className={`w-4 h-4 rounded ${c.stepBg} ${c.text} text-[10px] font-bold flex items-center justify-center`}>
                            {step.letter}
                          </span>
                          <span className="text-[11px] text-zinc-300 font-medium">
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Audio Recording Hub */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {state.isProcessing ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <svg className="animate-spin h-10 w-10 text-indigo-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm font-semibold text-zinc-200 font-jakarta">Processing your voice recording...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onStartRecording={stop}
                  onRecordingStateChange={(recording) => {
                    setIsCurrentlyRecording(recording);
                    if (recording && analyzerRef.current && cameraState === "active") {
                      analyzerRef.current.startSampling();
                    }
                  }}
                />

                {/* Camera preview — shown when camera is active */}
                {cameraState === "active" && (
                  <div className="flex justify-center mt-2">
                    <CameraPreview
                      analyzerRef={analyzerRef}
                      isRecording={isCurrentlyRecording}
                      onDisableCamera={handleDisableCamera}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
