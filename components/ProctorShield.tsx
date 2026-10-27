"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export interface ProctorViolation {
  type: "tab_switch" | "fullscreen_exit" | "copy" | "paste" | "devtools" | "right_click";
  timestamp: number;
  message: string;
}

export interface ProctorState {
  violations: ProctorViolation[];
  tabSwitchCount: number;
  fullscreenExitCount: number;
  isFullscreen: boolean;
  isFocused: boolean;
  showWarning: boolean;
  warningMessage: string;
}

interface UseProctorShieldOptions {
  enabled: boolean;
  onViolation?: (violation: ProctorViolation) => void;
}

/**
 * ProctorShield hook — comprehensive anti-cheating system.
 * Tracks tab switches, fullscreen exits, copy/paste, right-click, and devtools.
 */
export function useProctorShield({ enabled, onViolation }: UseProctorShieldOptions) {
  const [state, setState] = useState<ProctorState>({
    violations: [],
    tabSwitchCount: 0,
    fullscreenExitCount: 0,
    isFullscreen: false,
    isFocused: true,
    showWarning: false,
    warningMessage: "",
  });

  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const windowSizeRef = useRef({ width: 0, height: 0 });

  const addViolation = useCallback(
    (type: ProctorViolation["type"], message: string) => {
      const violation: ProctorViolation = {
        type,
        timestamp: Date.now(),
        message,
      };

      setState((prev) => {
        const newViolations = [...prev.violations, violation];
        return {
          ...prev,
          violations: newViolations,
          tabSwitchCount:
            type === "tab_switch" ? prev.tabSwitchCount + 1 : prev.tabSwitchCount,
          fullscreenExitCount:
            type === "fullscreen_exit"
              ? prev.fullscreenExitCount + 1
              : prev.fullscreenExitCount,
          showWarning: true,
          warningMessage: message,
        };
      });

      onViolation?.(violation);

      // Auto-dismiss warning after 4 seconds
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, showWarning: false, warningMessage: "" }));
      }, 4000);
    },
    [onViolation]
  );

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setState((prev) => ({ ...prev, isFullscreen: true }));
      }
    } catch {
      // Fullscreen may be blocked by browser
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // --- Tab / Window focus detection ---
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setState((prev) => ({ ...prev, isFocused: false }));
        addViolation("tab_switch", "Tab switch detected — this has been recorded.");
      } else {
        setState((prev) => ({ ...prev, isFocused: true }));
      }
    };

    const handleWindowBlur = () => {
      setState((prev) => ({ ...prev, isFocused: false }));
    };

    const handleWindowFocus = () => {
      setState((prev) => ({ ...prev, isFocused: true }));
    };

    // --- Fullscreen exit detection ---
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setState((prev) => ({ ...prev, isFullscreen: isFs }));
      if (!isFs) {
        addViolation(
          "fullscreen_exit",
          "Fullscreen exited — return to fullscreen to continue."
        );
      }
    };

    // --- Copy / Paste blocking ---
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy", "Copy action blocked and recorded.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("paste", "Paste action blocked and recorded.");
    };

    // --- Right-click blocking ---
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation("right_click", "Right-click is disabled during the interview.");
    };

    // --- DevTools detection (resize heuristic) ---
    windowSizeRef.current = { width: window.outerWidth, height: window.outerHeight };
    const handleResize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 200;
      const heightThreshold = window.outerHeight - window.innerHeight > 200;
      if (widthThreshold || heightThreshold) {
        addViolation("devtools", "Developer tools may have been opened — recorded.");
      }
    };

    // --- Block keyboard shortcuts ---
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Block Ctrl+Shift+I/J/C (DevTools)
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
        e.preventDefault();
      }
      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key.toUpperCase() === "U") {
        e.preventDefault();
      }
    };

    // --- Navigation blocking ---
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Interview session in progress. Are you sure you want to leave?";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Set initial fullscreen state
    setState((prev) => ({
      ...prev,
      isFullscreen: !!document.fullscreenElement,
    }));

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [enabled, addViolation]);

  const dismissWarning = useCallback(() => {
    setState((prev) => ({ ...prev, showWarning: false, warningMessage: "" }));
  }, []);

  const totalViolations = state.violations.length;

  return {
    ...state,
    totalViolations,
    requestFullscreen,
    exitFullscreen,
    dismissWarning,
  };
}
