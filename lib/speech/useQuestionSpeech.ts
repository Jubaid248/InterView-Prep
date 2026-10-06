"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "totapakhi_voice_audio_enabled";

/**
 * Cleans text of markdown syntax, bullet points, and formatting
 * so that it reads naturally when spoken out loud.
 */
export function formatTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove bold and italics
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove markdown headings
    .replace(/^#{1,6}\s+/gm, "")
    // Replace bullet points with a comma or pause
    .replace(/^[\s•*-]+\s*/gm, ". ")
    // Remove backticks
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    // Remove blockquotes
    .replace(/^>\s+/gm, "")
    // Strip common emojis such as ⚡, 🎙️, etc.
    .replace(/[⚡🎙️💡]/g, "")
    // Strip any follow-up question labels or prefixes (e.g. "Follow-up Question:", "Follow-up:")
    .replace(/follow[\s-]?up\s*(question)?[:\s.-]*/gi, "")
    // Normalize punctuation and whitespace
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .replace(/\.{2,}/g, ".")
    .trim();

  // If text starts with period or punctuation, clean it
  cleaned = cleaned.replace(/^[\s.,:;!?]+/, "").trim();

  return cleaned;
}

export function useQuestionSpeech() {
  const [audioEnabled, setAudioEnabledState] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(false);

  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const keepAliveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load user preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSpeechSupported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
      setSupported(isSpeechSupported);

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setAudioEnabledState(stored === "true");
        }
      } catch (e) {
        console.warn("Could not read audio setting from localStorage", e);
      }
    }
  }, []);

  // Update localStorage when setting changes
  const setAudioEnabled = useCallback((enabled: boolean) => {
    setAudioEnabledState(enabled);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
      } catch (e) {
        console.warn("Could not write audio setting to localStorage", e);
      }

      // If user toggles audio OFF while speaking, stop speaking immediately
      if (!enabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  }, []);

  // Pick the best natural English voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prioritize natural neural English voices (e.g. Google, Microsoft, Apple Natural)
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

      const naturalVoice = englishVoices.find(
        (v) =>
          v.name.includes("Natural") ||
          v.name.includes("Online (Natural)") ||
          v.name.includes("Google US English") ||
          v.name.includes("Samantha") ||
          v.name.includes("Jenny") ||
          v.name.includes("Aria") ||
          v.name.includes("Guy")
      );

      selectedVoiceRef.current = naturalVoice || englishVoices[0] || voices[0] || null;
    };

    findVoice();
    window.speechSynthesis.onvoiceschanged = findVoice;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const clearKeepAlive = () => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    clearKeepAlive();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (rawText: string, force: boolean = false) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (!audioEnabled && !force) return;

      const cleanText = formatTextForSpeech(rawText);
      if (!cleanText) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      clearKeepAlive();

      // Ensure speech synthesis is not in paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtteranceRef.current = utterance;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utterance.rate = 0.98; // Natural, conversational speed
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        // Chrome bug workaround: long utterances pause after ~14 seconds
        clearKeepAlive();
        keepAliveTimerRef.current = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else {
            clearKeepAlive();
          }
        }, 10000);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        clearKeepAlive();
      };

      utterance.onerror = (e) => {
        // If canceled intentionally, ignore
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis notice:", e.error);
        }
        setIsSpeaking(false);
        clearKeepAlive();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Failed to speak text:", err);
        setIsSpeaking(false);
        clearKeepAlive();
      }
    },
    [audioEnabled]
  );

  return {
    audioEnabled,
    setAudioEnabled,
    isSpeaking,
    speak,
    stop,
    supported,
  };
}
