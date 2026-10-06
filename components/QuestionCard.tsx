"use client";

import { useQuestionSpeech } from "@/lib/speech/useQuestionSpeech";
import QuestionAudioControl from "@/components/QuestionAudioControl";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: any;
  isFollowUp?: boolean;
  audioEnabled?: boolean;
  onToggleAudio?: (enabled: boolean) => void;
  isSpeaking?: boolean;
  onSpeak?: () => void;
  onStop?: () => void;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  isFollowUp = false,
  audioEnabled: propAudioEnabled,
  onToggleAudio: propOnToggleAudio,
  isSpeaking: propIsSpeaking,
  onSpeak: propOnSpeak,
  onStop: propOnStop,
}: QuestionCardProps) {
  const displayText =
    typeof questionText === "string"
      ? questionText
      : questionText && typeof questionText === "object"
        ? questionText.question || questionText.text || questionText.prompt || JSON.stringify(questionText)
        : String(questionText || "");

  // Internal speech hook fallback if props are not provided
  const internalSpeech = useQuestionSpeech();

  const audioEnabled = propAudioEnabled !== undefined ? propAudioEnabled : internalSpeech.audioEnabled;
  const onToggleAudio = propOnToggleAudio || internalSpeech.setAudioEnabled;
  const isSpeaking = propIsSpeaking !== undefined ? propIsSpeaking : internalSpeech.isSpeaking;
  const onStop = propOnStop || internalSpeech.stop;
  const onSpeak =
    propOnSpeak ||
    (() => {
      internalSpeech.speak(displayText, true);
    });

  return (
    <div className="w-full glass-card rounded-2xl p-6 sm:p-8 space-y-4 border border-white/10 relative overflow-hidden shadow-2xl">
      {/* Decorative top glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${isFollowUp
            ? "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500"
            : "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
          }`}
      />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <span
          className={`text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${isFollowUp
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
            }`}
        >
          {isFollowUp
            ? "⚡ Follow-up Question"
            : `Prompt ${questionNumber} of ${totalQuestions}`}
        </span>

        <QuestionAudioControl
          audioEnabled={audioEnabled}
          onToggleAudio={onToggleAudio}
          isSpeaking={isSpeaking}
          onSpeak={onSpeak}
          onStop={onStop}
        />
      </div>

      <p className="text-lg sm:text-xl text-zinc-50 leading-relaxed font-semibold tracking-tight font-jakarta">
        {displayText}
      </p>
    </div>
  );
}
