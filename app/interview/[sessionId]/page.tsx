/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";
import FrameworkIntroScreen from "@/components/FrameworkIntroScreen";
import IeltsIntroScreen from "@/components/IeltsIntroScreen";
import QuestionAudioControl from "@/components/QuestionAudioControl";
import CameraPreview from "@/components/CameraPreview";
import ParrotAvatar from "@/components/ParrotAvatar";
import ProctoringBar from "@/components/ProctoringBar";
import FullscreenWarning from "@/components/FullscreenWarning";
import SystemCheck from "@/components/SystemCheck";
import InterviewCountdown from "@/components/InterviewCountdown";
import { useProctorShield, type ProctorViolation } from "@/components/ProctorShield";
import { useQuestionSpeech } from "@/lib/speech/useQuestionSpeech";
import type { BodyLanguageMetrics, BodyLanguageAnalyzer } from "@/lib/bodyLanguage/BodyLanguageAnalyzer";

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

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;

  // Interview Mode: "practice" (easy, no fullscreen lock, camera toggle on/off, tap-to-record)
  // vs "serious" (real interview, fullscreen takeover, mandatory camera, automatic conversation recording)
  const initialModeParam = searchParams.get("mode") === "serious" ? "serious" : "practice";
  const [interviewMode, setInterviewMode] = useState<"practice" | "serious">(initialModeParam);

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

  // Stages: "system-check" -> "countdown" -> "intro" (if first time comm/ielts) -> "practice" -> "report"
  const [sessionStage, setSessionStage] = useState<"system-check" | "countdown" | "intro" | "practice" | "report">("system-check");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);

  // --- Camera / Body Language state ---
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCurrentlyRecording, setIsCurrentlyRecording] = useState(false);
  const analyzerRef = useRef<BodyLanguageAnalyzer | null>(null);
  const latestMetricsRef = useRef<BodyLanguageMetrics | null>(null);

  // Auto-record trigger for serious mode
  const [autoRecordTrigger, setAutoRecordTrigger] = useState(false);
  const isSubmittingRef = useRef(false);

  // --- Anti-cheating Proctor Shield (Only active in serious mode during active practice stage) ---
  const [violationLog, setViolationLog] = useState<ProctorViolation[]>([]);
  const isProctorEnabled =
    sessionStage === "practice" && interviewMode === "serious" && !state.isComplete;

  const handleProctorViolation = useCallback((violation: ProctorViolation) => {
    setViolationLog((prev) => [...prev, violation]);
  }, []);

  const proctor = useProctorShield({
    enabled: isProctorEnabled,
    onViolation: handleProctorViolation,
  });

  // Automatically exit fullscreen mode when serious interview ends (enters report or completes)
  useEffect(() => {
    if (sessionStage === "report" || state.isComplete) {
      if (typeof document !== "undefined" && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [sessionStage, state.isComplete]);

  // Audio speech synthesis hook for Parrot
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

  // Helper to formulate spoken text for Parrot
  const getSpokenTextForCurrentQuestion = useCallback(() => {
    if (!state.currentQuestion) return "";

    if (isIeltsSpeaking) {
      if (state.currentQuestionIndex === 2) {
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

  // Replay speech on demand
  const handleSpeakCurrent = useCallback(() => {
    const textToSpeak = getSpokenTextForCurrentQuestion();
    if (textToSpeak) {
      // In serious mode, replaying prompt should pause auto-record and re-trigger on finish
      setAutoRecordTrigger(false);
      speak(textToSpeak, true, () => {
        if (interviewMode === "serious") {
          setTimeout(() => setAutoRecordTrigger(true), 400);
        }
      });
    }
  }, [getSpokenTextForCurrentQuestion, speak, interviewMode]);

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

        // If returning to a session already partially completed
        if (
          data.session.currentQuestionIndex > 0 ||
          (data.answers && data.answers.length > 0) ||
          data.session.awaitingFollowUp
        ) {
          setSessionStage("practice");
        } else {
          setSessionStage("system-check");
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

  // Parrot speaks questions out loud & auto-records in Serious Mode
  useEffect(() => {
    if (
      sessionStage !== "practice" ||
      state.isProcessing ||
      state.isComplete ||
      !state.currentQuestion
    ) {
      return;
    }

    const currentKey = `${state.currentQuestionIndex}-${
      state.isFollowUp ? "followup" : "main"
    }-${state.currentQuestion}`;

    if (lastSpokenKeyRef.current !== currentKey) {
      lastSpokenKeyRef.current = currentKey;
      const textToSpeak = getSpokenTextForCurrentQuestion();
      if (textToSpeak) {
        setAutoRecordTrigger(false);
        speak(textToSpeak, false, () => {
          // If in SERIOUS mode, automatically start recording once Parrot finishes speaking (crisp 150ms turn transition)
          if (interviewMode === "serious") {
            setTimeout(() => {
              setAutoRecordTrigger(true);
            }, 150);
          }
        });
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
    interviewMode,
  ]);

  // --- Camera toggle methods ---
  const handleRequestCamera = useCallback(async (): Promise<boolean> => {
    setCameraError("");
    try {
      const { BodyLanguageAnalyzer } = await import("@/lib/bodyLanguage/BodyLanguageAnalyzer");
      const analyzer = new BodyLanguageAnalyzer();
      await analyzer.init();
      analyzerRef.current = analyzer;
      setCameraActive(true);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied.";
      setCameraError(msg);
      setCameraActive(false);
      return false;
    }
  }, []);

  const handleDisableCamera = useCallback(() => {
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
    }
    setCameraActive(false);
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

  // Starting interview after system check & mode choice
  const handleProceedFromSystemCheck = useCallback(
    async (chosenMode: "practice" | "serious") => {
      setInterviewMode(chosenMode);

      if (chosenMode === "serious") {
        // Enforce true fullscreen takeover in serious mode
        await proctor.requestFullscreen();
        // 5-second countdown at the beginning of the serious interview
        setSessionStage("countdown");
      } else {
        if (
          (isCommBuilder || isIeltsSpeaking) &&
          state.currentQuestionIndex === 0 &&
          !state.isFollowUp
        ) {
          setSessionStage("intro");
        } else {
          setSessionStage("practice");
        }
      }
    },
    [proctor, isCommBuilder, isIeltsSpeaking, state.currentQuestionIndex, state.isFollowUp]
  );

  // Submitting recording answer
  const handleRecordingComplete = useCallback(
    async (audioBase64: string, duration: number, liveText?: string) => {
      // Prevent duplicate submissions or submitting during existing processing
      if (isSubmittingRef.current || state.isProcessing || state.isComplete) {
        console.warn("[Interview] Blocked duplicate or premature submission");
        return;
      }

      // Guard against empty audio chunks
      if (!audioBase64 || audioBase64.length < 50) {
        console.warn("[Interview] Blocked empty audio submission");
        return;
      }

      isSubmittingRef.current = true;
      stop(); // Stop audio if Parrot is speaking
      setAutoRecordTrigger(false);

      // Stop body language sampling and capture metrics
      let blMetrics: BodyLanguageMetrics | null = null;
      if (analyzerRef.current && cameraActive) {
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
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [sessionId, state.currentQuestion, state.isFollowUp, state.isProcessing, state.isComplete, stop, cameraActive]
  );

  const handleGenerateReport = async () => {
    stop();
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 glass-card p-8 rounded-3xl border border-line shadow-2xl">
          <svg className="animate-spin h-10 w-10 text-moss" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <div className="text-center">
            <p className="text-ink text-base font-bold">Preparing your studio…</p>
            <p className="text-stone-muted text-xs font-mono mt-1">Configuring AI session</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 px-4">
        <div className="glass-card border border-beak/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-beak/20 text-beak flex items-center justify-center mx-auto text-xl">
            ⚠️
          </div>
          <p className="text-beak font-medium text-sm">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-moss hover:text-moss-deep underline font-mono"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Stage 1: Setup & Mode Selection (Practice vs Serious)
  if (sessionStage === "system-check") {
    return (
      <SystemCheck
        onStartInterview={handleProceedFromSystemCheck}
        trackName={state.track}
        onRequestCamera={handleRequestCamera}
        cameraActive={cameraActive}
        cameraError={cameraError}
        initialMode={interviewMode}
      />
    );
  }

  // Stage 1.2: 5-Second Countdown at the beginning of serious interview
  if (sessionStage === "countdown") {
    return (
      <InterviewCountdown
        trackName={state.track}
        onComplete={() => {
          if (
            (isCommBuilder || isIeltsSpeaking) &&
            state.currentQuestionIndex === 0 &&
            !state.isFollowUp
          ) {
            setSessionStage("intro");
          } else {
            setSessionStage("practice");
          }
        }}
      />
    );
  }

  // Stage 1.5: Track Intro Screens (Framework or IELTS)
  if (sessionStage === "intro") {
    if (isCommBuilder) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <FrameworkIntroScreen
            questionDetails={(state.questionDetails as any) || []}
            onStartPractice={() => {
              setSessionStage("practice");
              setState((prev) => ({ ...prev, currentQuestionIndex: 0 }));
              if (interviewMode === "serious") {
                proctor.requestFullscreen();
              }
            }}
          />
        </div>
      );
    }
    if (isIeltsSpeaking) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <IeltsIntroScreen
            onStartPractice={() => {
              setSessionStage("practice");
              setState((prev) => ({ ...prev, currentQuestionIndex: 0 }));
              if (interviewMode === "serious") {
                proctor.requestFullscreen();
              }
            }}
          />
        </div>
      );
    }
  }

  // Stage 3: Interview Completed / Report Stage
  if (sessionStage === "report" || state.isComplete) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-line shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-moss-light/20 border border-moss-light/40 flex items-center justify-center mx-auto shadow-lg shadow-moss-light/20">
            <svg className="w-10 h-10 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-moss font-bold bg-moss-light/10 px-3 py-1 rounded-full border border-moss-light/20">
              {interviewMode === "serious" ? "Serious Proctored Session Completed" : "Practice Session Completed"}
            </span>
            <h2 className="font-serif font-normal text-4xl text-ink">
              {isIeltsSpeaking ? "IELTS Exam Practice Complete!" : "Session Completed with Parrot!"}
            </h2>
            <p className="text-stone-muted text-sm max-w-md mx-auto">
              {isIeltsSpeaking
                ? "All 3 parts recorded. Generate your comprehensive report to view your estimated Band Scores across 4 criteria."
                : "All interview prompts completed. Generate your report for transcript analysis, filler words, grammar, and STAR feedback."}
            </p>
          </div>

          {/* Mode & Proctor Summary */}
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <div className="px-4 py-2 rounded-2xl bg-cream/60 border border-line text-xs font-mono">
              <span className="text-stone-muted">Mode: </span>
              <span className={`font-bold ${interviewMode === "serious" ? "text-beak" : "text-moss"}`}>
                {interviewMode === "serious" ? "⚔️ Serious Proctored" : "🎯 Practice Mode"}
              </span>
            </div>
            {interviewMode === "serious" && (
              <div className="px-4 py-2 rounded-2xl bg-cream/60 border border-line text-xs font-mono">
                <span className="text-stone-muted">Proctor Violations: </span>
                <span className={`font-bold ${proctor.totalViolations === 0 ? "text-moss" : "text-amber-600"}`}>
                  {proctor.totalViolations}
                </span>
              </div>
            )}
            <div className="px-4 py-2 rounded-2xl bg-cream/60 border border-line text-xs font-mono">
              <span className="text-stone-muted">AI Interviewer: </span>
              <span className="text-moss font-bold">Parrot v2.4</span>
            </div>
          </div>

          {state.lastTranscript && (
            <div className="text-left bg-cream/60 border border-line rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-soft">
                Last Recorded Response
              </p>
              <p className="text-xs text-ink/80 leading-relaxed">&ldquo;{state.lastTranscript}&rdquo;</p>
            </div>
          )}

          <button
            id="generate-report-btn"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-moss hover:bg-moss-deep disabled:from-cream disabled:to-cream text-white font-semibold text-sm tracking-wide transition-all shadow-xl shadow-moss-light/30 hover:scale-105"
          >
            {generatingReport ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-ink" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Parrot is generating detailed report...
              </span>
            ) : (
              isIeltsSpeaking ? "Generate IELTS Band Score Report →" : "Generate Feedback Report →"
            )}
          </button>
        </div>
      </div>
    );
  }

  // Format cue card bullets if in IELTS Part 2
  const isIeltsPart2 = isIeltsSpeaking && state.currentQuestionIndex === 2;
  const ieltsPart2Bullets = (() => {
    if (!isIeltsPart2) return [];
    const detail = state.questionDetails?.[2];
    const bulletPoints = detail?.bulletPoints || [];
    const lines = state.currentQuestion.split("\n");
    return bulletPoints.length > 0
      ? bulletPoints
      : lines.filter((l: string) => l.startsWith("•")).map((l: string) => l.replace(/^•\s*/, ""));
  })();

  const currentSpokenQuestion = getSpokenTextForCurrentQuestion();
  const isSerious = interviewMode === "serious";

  // Common Question Card component shared across both views
  const QuestionCardContent = (
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5 border border-stone-soft/40 shadow-2xl relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          state.isFollowUp ? "bg-amber-400" : isIeltsSpeaking ? "bg-tealbird" : "bg-moss-light"
        }`}
      />

      {/* Card Header with Question Details */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
              state.isFollowUp
                ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
                : "bg-moss-light/15 text-moss border-moss-light/30"
            }`}
          >
            {state.isFollowUp
              ? "⚡ Follow-up Prompt"
              : isIeltsSpeaking
              ? `IELTS Speaking • Part ${state.currentQuestionIndex < 2 ? "1" : state.currentQuestionIndex === 2 ? "2" : "3"}`
              : `Question ${state.currentQuestionIndex + 1} of ${state.totalQuestions}`}
          </span>

          {isIeltsPart2 && (
            <span className="text-[10px] font-mono text-tealbird-deep bg-tealbird/10 px-2 py-0.5 rounded border border-tealbird/20">
              Cue Card (1–2 min)
            </span>
          )}
        </div>

        <QuestionAudioControl
          audioEnabled={audioEnabled}
          onToggleAudio={setAudioEnabled}
          isSpeaking={isSpeaking}
          onSpeak={handleSpeakCurrent}
          onStop={stop}
        />
      </div>

      {/* Main Question Text */}
      <div className="space-y-3">
        <h2 className="font-serif font-normal text-2xl sm:text-2xl text-ink leading-relaxed">
          {isIeltsPart2 ? state.currentQuestion.split("\n")[0] : state.currentQuestion}
        </h2>

        {/* IELTS Part 2 Bullet Points */}
        {isIeltsPart2 && ieltsPart2Bullets.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-tealbird/20">
            <p className="text-[11px] font-semibold text-tealbird-deep uppercase tracking-widest">
              You should say:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {ieltsPart2Bullets.map((bp: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-cream/60 border border-line text-xs text-ink"
                >
                  <span className="w-5 h-5 rounded bg-tealbird/20 text-tealbird-deep text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{bp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Communication Framework Hint (STAR, CAR, SEE) */}
      {isCommBuilder && currentQuestionDetail && !state.isFollowUp && (() => {
        const fw = currentQuestionDetail.framework;
        const colorMap: Record<string, { bg: string; text: string; border: string; stepBg: string }> = {
          STAR: { bg: "bg-moss-light/10", text: "text-moss-deep", border: "border-moss-light/30", stepBg: "bg-moss/30" },
          CAR: { bg: "bg-moss-light/10", text: "text-moss", border: "border-moss-light/30", stepBg: "bg-moss-light/30" },
          SEE: { bg: "bg-amber-500/10", text: "text-amber-700", border: "border-amber-500/30", stepBg: "bg-amber-600/30" },
          PAR: { bg: "bg-tealbird/10", text: "text-tealbird-deep", border: "border-tealbird/30", stepBg: "bg-tealbird/30" },
        };
        const c = (fw && colorMap[fw]) || colorMap.STAR;
        return (
          <div className={`rounded-2xl border ${c.border} ${c.bg} p-3.5 space-y-2`}>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>
                💡 Structure with {fw} Framework
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentQuestionDetail.frameworkSteps?.map((step: FrameworkStepItem) => (
                <div
                  key={step.letter}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cream/60 border border-line"
                >
                  <span className={`w-4 h-4 rounded ${c.stepBg} ${c.text} text-[10px] font-bold flex items-center justify-center`}>
                    {step.letter}
                  </span>
                  <span className="text-[11px] text-ink/80 font-medium">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );

  // Common Recorder Hub component (Preserves AudioRecorder mount to prevent unmount ghost audio)
  const RecorderHubContent = (
    <div className="glass-card rounded-3xl p-5 sm:p-7 border border-line shadow-2xl">
      {state.isProcessing && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-moss-light/20 border-t-moss-light animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-moss">
              T
            </span>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-ink">
              Parrot is evaluating your response...
            </h3>
            <p className="text-xs text-stone-muted font-mono">
              Analyzing grammar, speech metrics & criteria
            </p>
          </div>
        </div>
      )}

      <div className={state.isProcessing ? "hidden" : "space-y-4"}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-muted font-bold">
            {isSerious ? "Hands-Free Conversation Mode" : "Candidate Response Console (Tap-to-Record)"}
          </span>
          {isSpeaking && (
            <span className="text-[10px] font-mono text-moss animate-pulse">
              Parrot is speaking — please listen
            </span>
          )}
        </div>

        <AudioRecorder
          mode={interviewMode}
          autoStart={autoRecordTrigger}
          disabled={isSpeaking || state.isProcessing}
          onRecordingComplete={handleRecordingComplete}
          onStartRecording={stop}
          onRecordingStateChange={(recording) => {
            setIsCurrentlyRecording(recording);
            if (recording && analyzerRef.current && cameraActive) {
              analyzerRef.current.startSampling();
            }
          }}
        />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // MODE 1: CASUAL PRACTICE MODE (No screen takeover, camera toggle on/off, tap-to-record)
  // ─────────────────────────────────────────────────────────────
  if (!isSerious) {
    return (
      <div className="min-h-screen text-ink py-6 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top Practice Navigation Bar */}
          <header className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-line">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  stop();
                  router.push("/");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-stone-muted hover:text-ink transition-colors bg-cream border border-line px-3.5 py-2 rounded-xl hover:bg-cream"
              >
                ← Exit Practice
              </button>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-moss flex items-center justify-center" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <polygon points="15,4 8,7 6,13 11,12" fill="#B4E585" />
                    <polygon points="15,4 11,12 17,15 19,9" fill="#5CB34C" />
                    <polygon points="6,13 11,12 17,15 10,20" fill="#3E9443" />
                    <polygon points="8,7 3,9 4,14 6,13" fill="#FF7A57" />
                    <circle cx="11" cy="8.5" r="1.3" fill="#17221A" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-ink">Parrot studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-moss-light/15 text-moss font-mono font-bold border border-moss-light/30">
                  🎯 Practice Mode
                </span>
              </div>
            </div>

            {/* Camera Toggle Button & Sound */}
            <div className="flex items-center gap-3">
              {/* Camera ON / OFF Toggle */}
              {cameraActive ? (
                <button
                  onClick={handleDisableCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream hover:bg-line border border-line text-xs font-mono text-ink/80 hover:text-beak transition-colors"
                  title="Turn off webcam"
                >
                  <span className="w-2 h-2 rounded-full bg-moss-light animate-pulse" />
                  <span>Turn Camera Off</span>
                </button>
              ) : (
                <button
                  onClick={handleRequestCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-cream border border-line text-xs font-mono text-ink transition-colors"
                  title="Turn on webcam for eye-contact analysis"
                >
                  <span>📷</span>
                  <span>Turn Camera On</span>
                </button>
              )}

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-2 rounded-xl bg-cream border border-line text-xs text-ink/80 hover:text-ink transition-colors"
                title={audioEnabled ? "Mute voice" : "Unmute voice"}
              >
                {audioEnabled ? "🔊 Voice: On" : "🔇 Voice: Muted"}
              </button>
            </div>
          </header>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-mono text-stone-muted px-1">
            <span>
              Question {state.currentQuestionIndex + 1} of {state.totalQuestions}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: state.totalQuestions || 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx < state.currentQuestionIndex
                      ? "w-6 bg-moss-light"
                      : idx === state.currentQuestionIndex
                      ? "w-8 bg-moss-light"
                      : "w-3 bg-line"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Previous Answer Transcript Note */}
          {state.lastTranscript && (
            <div className="bg-cream/60 border border-line rounded-2xl p-4 space-y-1 animate-in fade-in duration-300">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-muted flex items-center gap-1.5 font-mono">
                <span>📝</span> Previous Answer Transcript
              </p>
              <p className="text-xs text-ink/80 leading-relaxed italic">
                &ldquo;{state.lastTranscript}&rdquo;
              </p>
            </div>
          )}

          {/* Practice Main Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Parrot Avatar & Optional Camera Preview */}
            <div className="lg:col-span-5 space-y-4">
              <ParrotAvatar
                isSpeaking={isSpeaking}
                isListening={isCurrentlyRecording}
                isProcessing={state.isProcessing}
                currentSpokenText={currentSpokenQuestion}
                onReplaySpeech={handleSpeakCurrent}
                audioEnabled={audioEnabled}
              />

              {/* Camera Preview (Shown only if turned ON) */}
              {cameraActive && (
                <div className="flex justify-center animate-in fade-in duration-300">
                  <CameraPreview
                    analyzerRef={analyzerRef}
                    isRecording={isCurrentlyRecording}
                    onDisableCamera={handleDisableCamera}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Question Card & Tap-To-Record Console */}
            <div className="lg:col-span-7 space-y-6">
              {QuestionCardContent}
              {RecorderHubContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MODE 2: SERIOUS INTERVIEW (Screen takeover, mandatory video, automatic hands-free conversation)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 bg-[#eaf2fb] text-ink flex flex-col overflow-hidden select-none">
      {/* 1. Fullscreen Violation Guard & Warning Overlay */}
      <FullscreenWarning
        showWarning={proctor.showWarning}
        warningMessage={proctor.warningMessage}
        isFullscreen={proctor.isFullscreen}
        isFocused={proctor.isFocused}
        totalViolations={proctor.totalViolations}
        onRequestFullscreen={proctor.requestFullscreen}
        onDismiss={proctor.dismissWarning}
      />

      {/* 2. Top Proctoring Bar */}
      <ProctoringBar
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={state.totalQuestions}
        isFollowUp={state.isFollowUp}
        totalViolations={proctor.totalViolations}
        isFullscreen={proctor.isFullscreen}
        onRequestFullscreen={proctor.requestFullscreen}
        audioEnabled={audioEnabled}
        onToggleAudio={setAudioEnabled}
        onExit={() => {
          stop();
          if (typeof document !== "undefined" && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          router.push("/");
        }}
        trackName={state.track}
      />

      {/* 3. Main Split-Screen Workspace */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-hidden">
        {/* Left Column: Parrot AI Avatar & Mandatory Docked Candidate Webcam */}
        <section className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-1">
          <div className="flex-1 min-h-[360px] flex flex-col">
            <ParrotAvatar
              isSpeaking={isSpeaking}
              isListening={isCurrentlyRecording}
              isProcessing={state.isProcessing}
              currentSpokenText={currentSpokenQuestion}
              onReplaySpeech={handleSpeakCurrent}
              audioEnabled={audioEnabled}
            />
          </div>

          {/* Mandatory Camera Preview in Serious Mode */}
          <div className="shrink-0 flex justify-center">
            <CameraPreview
              analyzerRef={analyzerRef}
              isRecording={isCurrentlyRecording}
            />
          </div>
        </section>

        {/* Right Column: Question Card & Hands-Free Audio Recorder */}
        <section className="lg:col-span-7 flex flex-col gap-4 h-full overflow-y-auto pl-1 justify-between">
          <div className="space-y-4">
            {state.lastTranscript && (
              <div className="bg-cream/60 border border-line rounded-2xl p-3.5 space-y-1 animate-in fade-in duration-300">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-muted flex items-center gap-1.5 font-mono">
                  <span>📝</span> Previous Answer Transcript
                </p>
                <p className="text-xs text-ink/80 leading-relaxed italic line-clamp-2">
                  &ldquo;{state.lastTranscript}&rdquo;
                </p>
              </div>
            )}

            {QuestionCardContent}
          </div>

          {RecorderHubContent}
        </section>
      </main>
    </div>
  );
}
