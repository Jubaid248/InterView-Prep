/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";

import ParrotLogo from "@/components/ParrotLogo";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AudioRecorder from "@/components/AudioRecorder";
import FrameworkIntroScreen from "@/components/FrameworkIntroScreen";
import IeltsIntroScreen from "@/components/IeltsIntroScreen";
import DebateIntroScreen from "@/components/DebateIntroScreen";
import NegotiationIntroScreen from "@/components/NegotiationIntroScreen";
import QuestionAudioControl from "@/components/QuestionAudioControl";
import CameraPreview from "@/components/CameraPreview";
import InterviewerTile from "@/components/InterviewerTile";
import ProctoringBar from "@/components/ProctoringBar";
import FullscreenWarning from "@/components/FullscreenWarning";
import SystemCheck from "@/components/SystemCheck";
import InterviewCountdown from "@/components/InterviewCountdown";
import { useProctorShield, type ProctorViolation } from "@/components/ProctorShield";
import { useQuestionSpeech } from "@/lib/speech/useQuestionSpeech";
import { friendlyError, requestErrorFrom } from "@/lib/friendlyError";
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
  spokenPrefix?: string;
  followUpStyle?: string | null;
  part?: number;
  kind?: string;
  setting?: string;
  motion?: string;
  side?: string;
  yourGoal?: string;
  yourWalkAway?: string;
  counterpart?: string;
  [key: string]: unknown;
}

const TRACK_TITLES: Record<string, string> = {
  "mock-interview": "Mock interview",
  "ielts-speaking": "IELTS Speaking",
  "communication-builder": "Communication practice",
  "debate-practice": "Debate practice",
  "negotiation-practice": "Negotiation practice",
};

const IELTS_PREP_SECONDS = 60;

// Old IELTS sessions have no `kind`; their cue card was always the third question
function isCueCardTurn(detail: QuestionDetail | undefined, index: number): boolean {
  return detail?.kind ? detail.kind === "cue-card" : index === 2;
}

const FOLLOW_UP_LABELS: Record<string, string> = {
  "ielts-part3-probe": "Examiner follow-up",
  "small-talk": "Tota replies",
  "method-probe": "Follow-up",
  "debate-rebuttal": "Tota's rebuttal",
  "debate-cross-exam": "Cross-examination",
  "negotiation-counterpart": "Counterpart responds",
  "negotiation-pressure": "Pressure tactic",
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
  // Recoverable failures stay inline so the interview isn't lost
  const [answerError, setAnswerError] = useState("");
  const [reportError, setReportError] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const pendingAnswerRef = useRef<Record<string, unknown> | null>(null);

  // --- Camera / Body Language state ---
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCurrentlyRecording, setIsCurrentlyRecording] = useState(false);
  const analyzerRef = useRef<BodyLanguageAnalyzer | null>(null);
  const latestMetricsRef = useRef<BodyLanguageMetrics | null>(null);

  // Auto-record trigger for serious mode
  const [autoRecordTrigger, setAutoRecordTrigger] = useState(false);
  // IELTS Part 2: one minute of preparation after the cue card is read
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number | null>(null);
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
  const isDebate = state.track === "debate-practice";
  const isNegotiation = state.track === "negotiation-practice";
  const isScriptedTrack = isCommBuilder || isIeltsSpeaking || isDebate || isNegotiation;
  const currentQuestionDetail = state.questionDetails?.[state.currentQuestionIndex];
  const isCueCard =
    isIeltsSpeaking && !state.isFollowUp && isCueCardTurn(currentQuestionDetail, state.currentQuestionIndex);

  // Helper to formulate spoken text for Parrot: the scripted line (examiner transition,
  // scene, debate motion) followed by the question itself
  const getSpokenTextForCurrentQuestion = useCallback(() => {
    if (!state.currentQuestion) return "";
    if (state.isFollowUp) return state.currentQuestion;

    const detail = state.questionDetails?.[state.currentQuestionIndex];
    const prefix = detail?.spokenPrefix ? `${detail.spokenPrefix} ` : "";

    if (isIeltsSpeaking && isCueCardTurn(detail, state.currentQuestionIndex)) {
      const lines = state.currentQuestion.split("\n");
      const mainPrompt = lines[0] || state.currentQuestion;
      const bullets: string[] =
        detail?.bulletPoints && detail.bulletPoints.length > 0
          ? detail.bulletPoints
          : lines.filter((l: string) => l.startsWith("•")).map((l: string) => l.replace(/^•\s*/, ""));
      const youShouldSay = bullets.length > 0 ? ` You should say: ${bullets.join(", ")}.` : "";
      return `${prefix}${mainPrompt}${youShouldSay} Your one minute of preparation time starts now.`;
    }

    return `${prefix}${state.currentQuestion}`;
  }, [
    state.currentQuestion,
    state.currentQuestionIndex,
    state.questionDetails,
    state.isFollowUp,
    isIeltsSpeaking,
  ]);

  // Runs once Tota finishes speaking: start the cue card prep timer, or auto-record in serious mode
  const handleSpeechFinished = useCallback(
    (cueCard: boolean) => {
      if (cueCard) {
        setPrepSecondsLeft(IELTS_PREP_SECONDS);
        return;
      }
      if (interviewMode === "serious") {
        setTimeout(() => setAutoRecordTrigger(true), 150);
      }
    },
    [interviewMode]
  );

  // Count down the cue card prep minute; in serious mode recording starts when it ends
  useEffect(() => {
    if (prepSecondsLeft === null) return;
    if (prepSecondsLeft <= 0) {
      setPrepSecondsLeft(null);
      if (interviewMode === "serious") setAutoRecordTrigger(true);
      return;
    }
    const id = setTimeout(() => setPrepSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(id);
  }, [prepSecondsLeft, interviewMode]);

  // Replay speech on demand
  const handleSpeakCurrent = useCallback(() => {
    const textToSpeak = getSpokenTextForCurrentQuestion();
    if (textToSpeak) {
      // In serious mode, replaying prompt should pause auto-record and re-trigger on finish
      setAutoRecordTrigger(false);
      setPrepSecondsLeft(null);
      speak(textToSpeak, true, () => handleSpeechFinished(isCueCard));
    }
  }, [getSpokenTextForCurrentQuestion, speak, handleSpeechFinished, isCueCard]);

  // Load session from server
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch(`/api/interview/${sessionId}`);
        if (!res.ok) throw await requestErrorFrom(res);
        const data = await res.json();

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
          totalQuestions: data.session.questions.length,
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
        setError(friendlyError("load-session", err));
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
        setPrepSecondsLeft(null);
        speak(textToSpeak, false, () => handleSpeechFinished(isCueCard));
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
    handleSpeechFinished,
    isCueCard,
  ]);

  // --- Camera toggle methods ---
  const handleRequestCamera = useCallback(async (): Promise<boolean> => {
    setCameraError("");
    let analyzer: BodyLanguageAnalyzer | null = null;
    try {
      const { BodyLanguageAnalyzer } = await import("@/lib/bodyLanguage/BodyLanguageAnalyzer");
      analyzer = new BodyLanguageAnalyzer();
      await analyzer.init();
      analyzerRef.current = analyzer;
      setCameraActive(true);
      return true;
    } catch (err) {
      // Release the camera if it opened but the models failed to load
      analyzer?.stop();
      const name = err instanceof Error ? err.name : "";
      const msg =
        name === "NotAllowedError" || name === "SecurityError"
          ? "Camera access was blocked. Allow camera access in your browser to get eye-contact and body-language feedback."
          : name === "NotFoundError"
          ? "No camera was found on this device."
          : name === "NotReadableError"
          ? "Your camera is being used by another app. Close it and try again."
          : err instanceof Error
          ? err.message
          : "Camera access denied.";
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
          isScriptedTrack &&
          state.currentQuestionIndex === 0 &&
          !state.isFollowUp
        ) {
          setSessionStage("intro");
        } else {
          setSessionStage("practice");
        }
      }
    },
    [proctor, isScriptedTrack, state.currentQuestionIndex, state.isFollowUp]
  );

  // Sends one answer. On failure the payload is kept so "Send again" can retry it
  // without re-recording, and the interview stays on screen.
  const sendAnswer = useCallback(
    async (payload: Record<string, unknown>) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      pendingAnswerRef.current = payload;
      setAnswerError("");
      setState((prev) => ({ ...prev, isProcessing: true }));

      try {
        const res = await fetch("/api/interview/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw await requestErrorFrom(res);
        const data = await res.json();
        pendingAnswerRef.current = null;

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
        setAnswerError(friendlyError("answer", err));
        setState((prev) => ({ ...prev, isProcessing: false }));
      } finally {
        isSubmittingRef.current = false;
      }
    },
    []
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

      stop(); // Stop audio if Tota is speaking
      setAutoRecordTrigger(false);

      // Stop body language sampling and capture metrics
      let blMetrics: BodyLanguageMetrics | null = null;
      if (analyzerRef.current && cameraActive) {
        blMetrics = analyzerRef.current.stopSampling();
        latestMetricsRef.current = blMetrics;
      }

      await sendAnswer({
        sessionId,
        audioBase64,
        audioDuration: duration,
        questionText: state.currentQuestion,
        isFollowUp: state.isFollowUp,
        liveText,
        eyeContactPercent: blMetrics?.eyeContactPercent ?? null,
        movementScore: blMetrics?.movementScore ?? null,
        bodyLanguage: blMetrics?.details ?? null,
      });
    },
    [sessionId, state.currentQuestion, state.isFollowUp, state.isProcessing, state.isComplete, stop, cameraActive, sendAnswer]
  );

  const retryAnswer = useCallback(() => {
    if (pendingAnswerRef.current) sendAnswer(pendingAnswerRef.current);
  }, [sendAnswer]);

  const discardFailedAnswer = useCallback(() => {
    pendingAnswerRef.current = null;
    setAnswerError("");
  }, []);

  const handleGenerateReport = async () => {
    stop();
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setGeneratingReport(true);
    setReportError("");
    try {
      const res = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw await requestErrorFrom(res);

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
      setReportError(friendlyError("report", err));
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
            <p className="text-ink text-base font-bold">Getting your interview ready…</p>
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
          <p className="text-ink font-medium">{error}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-deep text-cream text-sm font-semibold transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => router.push("/mock-interview")}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-cream border border-line text-ink text-sm font-semibold transition-colors"
            >
              Start a new one
            </button>
          </div>
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
            isScriptedTrack &&
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
    if (isNegotiation) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <NegotiationIntroScreen
            detail={state.questionDetails?.[0]}
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
    if (isDebate) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <DebateIntroScreen
            detail={state.questionDetails?.[0]}
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
              {interviewMode === "serious" ? "Real interview complete" : "Practice complete"}
            </span>
            <h2 className="font-serif font-normal text-4xl text-ink">
              {isIeltsSpeaking
                ? "That is the end of the speaking test."
                : isDebate
                ? "Debate complete!"
                : isNegotiation
                ? "Negotiation complete!"
                : "Nice work, that's the whole interview"}
            </h2>
            <p className="text-stone-muted text-sm max-w-md mx-auto">
              {isIeltsSpeaking
                ? "All three parts are recorded. Get your report to see your estimated band score for each of the four criteria."
                : isDebate
                ? "All three rounds are recorded. Get your report to see how persuasive you were, and whether you won."
                : isNegotiation
                ? "All four rounds are recorded. Get your report to see the deal you reached, the techniques you used, and anything you left on the table."
                : isCommBuilder
                ? "You've answered everything. Get your report for feedback on your small talk and each speaking method."
                : "You've answered every question. Get your report to see what worked, what to fix, and stronger ways to answer."}
            </p>
          </div>

          {/* Mode & Proctor Summary */}
          <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
            <div className="px-4 py-2 rounded-2xl bg-cream/60 border border-line text-xs font-mono">
              <span className="text-stone-muted">Mode: </span>
              <span className={`font-bold ${interviewMode === "serious" ? "text-beak-deep" : "text-moss"}`}>
                {interviewMode === "serious" ? "Real interview" : "Practice"}
              </span>
            </div>
            {interviewMode === "serious" && (
              <div className="px-4 py-2 rounded-2xl bg-cream/60 border border-line text-xs font-mono">
                <span className="text-stone-muted">Proctor Violations: </span>
                <span className={`font-bold ${proctor.totalViolations === 0 ? "text-moss" : "text-amber-800"}`}>
                  {proctor.totalViolations}
                </span>
              </div>
            )}
            <div className="px-4 py-2 rounded-2xl bg-cream/60 border border-line text-xs font-mono">
              <span className="text-stone-muted">Interviewer: </span>
              <span className="text-moss font-bold">Tota</span>
            </div>
          </div>

          {state.lastTranscript && (
            <div className="text-left bg-cream/60 border border-line rounded-2xl p-4 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-soft">
                Last Recorded Response
              </p>
              <p className="text-xs text-ink/80 leading-relaxed">&ldquo;{state.lastTranscript}&rdquo;</p>
            </div>
          )}

          <button
            id="generate-report-btn"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            aria-describedby={reportError ? "report-error" : undefined}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-moss hover:bg-moss-deep disabled:from-cream disabled:to-cream text-white font-semibold text-sm tracking-wide transition-all shadow-xl shadow-moss-light/30 hover:scale-105"
          >
            {generatingReport ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-ink" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Tota is writing your report. This takes about 20 seconds.
              </span>
            ) : reportError ? (
              "Try again"
            ) : (
              isIeltsSpeaking ? "See my band score →" : "See my report →"
            )}
          </button>
          {reportError && (
            <p id="report-error" role="alert" className="text-sm text-beak-deep max-w-md mx-auto">
              {reportError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Format cue card bullets if in IELTS Part 2
  const isIeltsPart2 = isCueCard;
  const ieltsPart2Bullets = (() => {
    if (!isIeltsPart2) return [];
    const bulletPoints = currentQuestionDetail?.bulletPoints || [];
    const lines = state.currentQuestion.split("\n");
    return bulletPoints.length > 0
      ? bulletPoints
      : lines.filter((l: string) => l.startsWith("•")).map((l: string) => l.replace(/^•\s*/, ""));
  })();

  const turnLabel = (() => {
    if (state.isFollowUp) {
      const style = currentQuestionDetail?.followUpStyle;
      return `⚡ ${(style && FOLLOW_UP_LABELS[style]) || "Follow-up question"}`;
    }
    if (isIeltsSpeaking) {
      const part =
        currentQuestionDetail?.part ??
        (state.currentQuestionIndex < 2 ? 1 : state.currentQuestionIndex === 2 ? 2 : 3);
      return `IELTS Speaking • Part ${part}`;
    }
    if (isDebate) return `Debate • ${currentQuestionDetail?.framework || "Round"}`;
    if (isNegotiation) return `Negotiation • ${currentQuestionDetail?.framework || "Round"}`;
    if (isCommBuilder && currentQuestionDetail?.framework === "ARE") return "Small talk";
    return `Question ${state.currentQuestionIndex + 1} of ${state.totalQuestions}`;
  })();

  const formatPrep = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  const currentSpokenQuestion = getSpokenTextForCurrentQuestion();
  const isSerious = interviewMode === "serious";

  // Common Question Card component shared across both views
  const QuestionCardContent = (
    <div className="relative space-y-4 overflow-hidden rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-sm">
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          state.isFollowUp ? "bg-amber-400" : isIeltsSpeaking ? "bg-tealbird" : "bg-moss-light"
        }`}
      />

      {/* Card Header with Question Details */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${
              state.isFollowUp
                ? "bg-amber-500/15 text-amber-800 border-amber-500/30"
                : "bg-moss-light/15 text-moss border-moss-light/30"
            }`}
          >
            {turnLabel}
          </span>

          {isIeltsPart2 && (
            <span className="text-[11px] font-mono text-tealbird-deep bg-tealbird/10 px-2 py-0.5 rounded border border-tealbird/20">
              Cue Card (1–2 min)
            </span>
          )}

          {isIeltsPart2 && prepSecondsLeft !== null && (
            <span className="inline-flex items-center gap-2 text-[11px] font-mono text-amber-800 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Prep time {formatPrep(prepSecondsLeft)}
              <button
                type="button"
                onClick={() => setPrepSecondsLeft(0)}
                className="font-sans font-semibold text-amber-900 underline underline-offset-2 hover:no-underline"
              >
                I&apos;m ready
              </button>
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

      {/* Debate motion and assigned side */}
      {isDebate && currentQuestionDetail?.motion && (
        <div className="rounded-2xl border border-line bg-cream/60 p-3.5 flex flex-wrap items-center justify-between gap-2">
          <p className="font-serif text-lg text-ink leading-snug">{currentQuestionDetail.motion}</p>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              currentQuestionDetail.side === "for"
                ? "bg-moss-light/15 text-moss border-moss-light/30"
                : "bg-beak/10 text-beak-deep border-beak/30"
            }`}
          >
            You argue {currentQuestionDetail.side}
          </span>
        </div>
      )}

      {/* Negotiation brief: who you're talking to, your goal and walk-away */}
      {isNegotiation && currentQuestionDetail?.yourGoal && (
        <div className="rounded-2xl border border-line bg-cream/60 p-3.5 space-y-2">
          <p className="text-xs text-stone-muted">
            <span aria-hidden="true">🤝 </span>
            Negotiating with <span className="text-ink font-medium">{currentQuestionDetail.counterpart}</span>
          </p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-moss/5 border border-moss/15 text-ink">
              <span className="font-semibold text-moss">Goal:</span> {currentQuestionDetail.yourGoal}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-beak/5 border border-beak/20 text-ink">
              <span className="font-semibold text-beak-deep">Walk away:</span> {currentQuestionDetail.yourWalkAway}
            </span>
          </div>
        </div>
      )}

      {/* Small talk scene */}
      {isCommBuilder && currentQuestionDetail?.setting && !state.isFollowUp && (
        <p className="text-xs text-stone-muted flex items-center gap-1.5">
          <span aria-hidden="true">📍</span>
          {currentQuestionDetail.setting}
        </p>
      )}

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
                  <span className="w-5 h-5 rounded bg-tealbird/20 text-tealbird-deep text-[11px] font-bold flex items-center justify-center shrink-0">
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
      {(isCommBuilder || isDebate || isNegotiation) && currentQuestionDetail?.frameworkSteps && !state.isFollowUp && (() => {
        const fw = currentQuestionDetail.framework;
        const colorMap: Record<string, { bg: string; text: string; border: string; stepBg: string }> = {
          STAR: { bg: "bg-moss-light/10", text: "text-moss-deep", border: "border-moss-light/30", stepBg: "bg-moss/30" },
          CAR: { bg: "bg-moss-light/10", text: "text-moss", border: "border-moss-light/30", stepBg: "bg-moss-light/30" },
          SEE: { bg: "bg-amber-500/10", text: "text-amber-800", border: "border-amber-500/30", stepBg: "bg-amber-600/30" },
          PAR: { bg: "bg-tealbird/10", text: "text-tealbird-deep", border: "border-tealbird/30", stepBg: "bg-tealbird/30" },
        };
        const c = (fw && colorMap[fw]) || colorMap.STAR;
        return (
          <div className={`rounded-2xl border ${c.border} ${c.bg} p-3.5 space-y-2`}>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${c.text}`}>
                💡 {isDebate ? `Structure your ${String(fw).toLowerCase()}` : isNegotiation ? fw : `Structure with ${fw}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentQuestionDetail.frameworkSteps?.map((step: FrameworkStepItem) => (
                <div
                  key={step.letter}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cream/60 border border-line"
                >
                  <span className={`w-4 h-4 rounded ${c.stepBg} ${c.text} text-[11px] font-bold flex items-center justify-center`}>
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
    <div className="rounded-3xl border border-line bg-white p-4 sm:p-5 shadow-sm">
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
              Tota is thinking about your answer…
            </h3>
            <p className="text-xs text-stone-muted font-mono">
              This takes a few seconds
            </p>
          </div>
        </div>
      )}

      <div className={state.isProcessing ? "hidden" : "space-y-4"}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-muted font-bold">
            {isSerious ? "Tota records automatically" : "Your answer"}
          </span>
          {isSpeaking && (
            <span className="text-[11px] font-mono text-moss animate-pulse">
              Tota is speaking
            </span>
          )}
        </div>

        {answerError && (
          <div role="alert" className="rounded-2xl border border-beak/30 bg-beak-soft p-4 space-y-3">
            <p className="text-sm text-ink">{answerError}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retryAnswer}
                className="px-4 py-2 rounded-xl bg-moss hover:bg-moss-deep text-cream text-sm font-semibold transition-colors"
              >
                Send again
              </button>
              <button
                type="button"
                onClick={discardFailedAnswer}
                className="px-4 py-2 rounded-xl bg-white hover:bg-cream border border-line text-ink text-sm font-semibold transition-colors"
              >
                Record a new answer
              </button>
            </div>
          </div>
        )}

        <AudioRecorder
          mode={interviewMode}
          autoStart={autoRecordTrigger}
          disabled={isSpeaking || state.isProcessing}
          onRecordingComplete={handleRecordingComplete}
          onStartRecording={stop}
          onRecordingStateChange={(recording) => {
            setIsCurrentlyRecording(recording);
            if (recording) setPrepSecondsLeft(null);
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
  const LeaveDialog = confirmLeave ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30" role="dialog" aria-modal="true" aria-labelledby="leave-title">
      <div className="max-w-sm w-full rounded-3xl bg-paper border border-line p-6 space-y-4 shadow-2xl">
        <h2 id="leave-title" className="font-serif text-3xl text-ink">Leave practice?</h2>
        <p className="text-sm text-stone-muted leading-relaxed">
          Your answers so far are saved, and you can still get a report for them.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setConfirmLeave(false);
              handleGenerateReport();
            }}
            className="w-full py-3 rounded-xl bg-moss hover:bg-moss-deep text-cream font-semibold transition-colors"
          >
            Get my report
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-white hover:bg-cream border border-line text-ink font-semibold transition-colors"
          >
            Leave
          </button>
          <button type="button" onClick={() => setConfirmLeave(false)} className="text-sm text-stone-muted hover:text-ink py-1">
            Keep practicing
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Your side of the call when the camera is off
  const SelfViewPlaceholder = (
    <div className="relative flex h-60 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-dashed sm:h-72 border-stone-soft/40 bg-paper p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream border border-line" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-stone-muted" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">Your camera is off</p>
        <p className="mx-auto max-w-xs text-xs leading-relaxed text-stone-muted">
          Turn it on to get feedback on eye contact and body language. Your video never leaves your device.
        </p>
      </div>
      <button
        type="button"
        onClick={handleRequestCamera}
        className="rounded-xl bg-moss px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-moss-deep"
      >
        Turn on camera
      </button>
      {cameraError && (
        <p role="alert" className="max-w-xs text-xs leading-snug text-beak-deep">
          {cameraError}
        </p>
      )}
      <span className="absolute bottom-3 left-3 rounded-lg bg-ink/75 px-2.5 py-1 text-xs font-medium text-cream">You</span>
    </div>
  );

  const progressPercent = Math.round(((state.currentQuestionIndex + (state.isFollowUp ? 0.5 : 0)) / Math.max(1, state.totalQuestions)) * 100);

  // The shared "video call" body: two tiles, the question, then the answer dock
  const StudioBody = (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InterviewerTile
          isSpeaking={isSpeaking}
          isListening={isCurrentlyRecording}
          isProcessing={state.isProcessing}
          caption={currentSpokenQuestion}
        />
        {cameraActive ? <CameraPreview analyzerRef={analyzerRef} isRecording={isCurrentlyRecording} /> : SelfViewPlaceholder}
      </div>

      {QuestionCardContent}
      {RecorderHubContent}

      {state.lastTranscript && (
        <details className="group rounded-2xl border border-line bg-paper/70 px-4 py-3">
          <summary className="cursor-pointer list-none text-sm text-stone-muted hover:text-ink">
            <span className="group-open:hidden">Show your last answer</span>
            <span className="hidden group-open:inline">Hide your last answer</span>
          </summary>
          <p className="mt-2 text-sm italic leading-relaxed text-ink/80">&ldquo;{state.lastTranscript}&rdquo;</p>
        </details>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // MODE 1: PRACTICE (your normal window, camera optional, tap to record)
  // ─────────────────────────────────────────────────────────────
  if (!isSerious) {
    return (
      <div className="min-h-screen text-ink">
        {LeaveDialog}
        <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => {
                stop();
                // Once they've answered something, offer the report instead of losing it
                if (state.currentQuestionIndex > 0 || state.isFollowUp) setConfirmLeave(true);
                else router.push("/");
              }}
              className="shrink-0 rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink transition-colors hover:bg-cream"
            >
              ← Leave
            </button>

            <div className="mx-auto w-full max-w-md space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <ParrotLogo className="h-5 w-5" />
                  {TRACK_TITLES[state.track || ""] || "Mock interview"}
                  <span className="rounded-full border border-moss-light/30 bg-moss-light/15 px-2 py-0.5 text-[11px] font-medium text-moss">Practice</span>
                </span>
                <span className="text-stone-muted">
                  Question {Math.min(state.currentQuestionIndex + 1, state.totalQuestions)} of {state.totalQuestions}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-moss-light transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={cameraActive ? handleDisableCamera : handleRequestCamera}
                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                  cameraActive ? "border-moss-light/40 bg-moss-light/10 text-moss hover:bg-moss-light/20" : "border-line bg-white text-ink hover:bg-cream"
                }`}
                aria-pressed={cameraActive}
                title={cameraActive ? "Turn off camera" : "Turn on your camera for eye-contact and body-language feedback"}
              >
                {cameraActive ? "Camera on" : "Camera off"}
              </button>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                  audioEnabled ? "border-moss-light/40 bg-moss-light/10 text-moss hover:bg-moss-light/20" : "border-line bg-white text-ink hover:bg-cream"
                }`}
                aria-pressed={audioEnabled}
                title={audioEnabled ? "Turn off Tota's voice" : "Turn on Tota's voice"}
              >
                {audioEnabled ? "Voice on" : "Voice off"}
              </button>
            </div>
          </div>
        </header>

        {StudioBody}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MODE 2: REAL INTERVIEW (full screen, camera on, records automatically)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-cream text-ink select-none">
      <FullscreenWarning
        showWarning={proctor.showWarning}
        warningMessage={proctor.warningMessage}
        isFullscreen={proctor.isFullscreen}
        isFocused={proctor.isFocused}
        totalViolations={proctor.totalViolations}
        onRequestFullscreen={proctor.requestFullscreen}
        onDismiss={proctor.dismissWarning}
      />

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

      <main className="flex-1 overflow-y-auto">{StudioBody}</main>
    </div>
  );
}
