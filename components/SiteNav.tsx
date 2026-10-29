"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { friendlyError, requestErrorFrom } from "@/lib/friendlyError";
import { useRouter, usePathname } from "next/navigation";
import ParrotLogo from "@/components/ParrotLogo";

export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLaunchTrack = async (
    track: "ielts-speaking" | "communication-builder" | "debate-practice" | "negotiation-practice"
  ) => {
    setLoadingTrack(track);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      });

      if (!res.ok) throw await requestErrorFrom(res);

      const data = await res.json();
      localStorage.setItem("currentSessionId", data.sessionId);

      const history = JSON.parse(localStorage.getItem("sessionHistory") || "[]");
      history.unshift({
        sessionId: data.sessionId,
        createdAt: new Date().toISOString(),
        status: "in_progress",
        track,
      });
      localStorage.setItem("sessionHistory", JSON.stringify(history));

      setDropdownOpen(false);
      setMobileOpen(false);
      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      setLaunchError(friendlyError("start-track", err));
      setTimeout(() => setLaunchError(""), 6000);
    } finally {
      setLoadingTrack(null);
    }
  };

  // The interview studio has its own toolbar; keep the candidate focused
  if (pathname?.startsWith("/interview/")) return null;

  return (
    <header className="sticky top-4 z-50 px-4 w-full max-w-6xl mx-auto">
      <div className="rounded-2xl bg-paper/85 backdrop-blur-xl border border-line pl-4 pr-2 sm:pl-5 py-2 flex items-center justify-between gap-2 transition-all duration-300">
        
        {/* Brand / Logo (Left) */}
        <Link href="/" className="flex items-center gap-2 group">
          <ParrotLogo className="w-9 h-9 group-hover:rotate-[-8deg] transition-transform" />
          <span className="text-lg font-semibold tracking-tight text-ink">
            Parrot
          </span>
        </Link>

        {/* Center Navigation Links & Dropdown beside Creator */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/"
            className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              pathname === "/"
                ? "text-ink bg-cream"
                : "text-stone-muted hover:text-ink"
            }`}
          >
            Home
          </Link>

          <Link
            href="/creators"
            className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              pathname === "/creators"
                ? "text-ink bg-cream"
                : "text-stone-muted hover:text-ink"
            }`}
          >
            Creator
          </Link>

          {/* Dropdown Beside Creator */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full text-stone-muted hover:text-ink transition-colors"
              aria-expanded={dropdownOpen}
            >
              <span>More practice</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-ink" : "text-stone-soft"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu (Only IELTS Speaking and Communication Builder) */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl p-2 bg-paper border border-line shadow-[0_20px_40px_-20px_rgba(23,34,26,0.35)] z-50 animate-speech-pop">
                <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                  Choose a practice
                </div>

                <div className="mt-1 space-y-1">
                  {/* IELTS Speaking */}
                  <button
                    onClick={() => handleLaunchTrack("ielts-speaking")}
                    disabled={loadingTrack !== null}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-cream group transition-all flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-moss-light shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink group-hover:text-moss transition-colors">
                          IELTS Speaking
                        </span>
                        {loadingTrack === "ielts-speaking" && (
                          <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-muted font-normal leading-tight mt-0.5">
                        All three parts, like the real test
                      </p>
                    </div>
                  </button>

                  {/* Communication Builder */}
                  <button
                    onClick={() => handleLaunchTrack("communication-builder")}
                    disabled={loadingTrack !== null}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-cream group transition-all flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-beak shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink group-hover:text-moss transition-colors">
                          Communication Builder
                        </span>
                        {loadingTrack === "communication-builder" && (
                          <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-muted font-normal leading-tight mt-0.5">
                        Small talk and speaking methods
                      </p>
                    </div>
                  </button>

                  {/* Debate Practice */}
                  <button
                    onClick={() => handleLaunchTrack("debate-practice")}
                    disabled={loadingTrack !== null}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-cream group transition-all flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-tealbird shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink group-hover:text-moss transition-colors">
                          Debate Practice
                        </span>
                        {loadingTrack === "debate-practice" && (
                          <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-muted font-normal leading-tight mt-0.5">
                        Argue a motion against Tota
                      </p>
                    </div>
                  </button>

                  {/* Negotiation Practice */}
                  <button
                    onClick={() => handleLaunchTrack("negotiation-practice")}
                    disabled={loadingTrack !== null}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-cream group transition-all flex items-start gap-2.5"
                  >
                    <span className="mt-0.5 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink group-hover:text-moss transition-colors">
                          Negotiation Practice
                        </span>
                        {loadingTrack === "negotiation-practice" && (
                          <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-muted font-normal leading-tight mt-0.5">
                        Role-play a deal with Tota
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA button + mobile menu toggle */}
        <div className="flex items-center gap-1">
          <Link
            href="/mock-interview"
            className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-deep text-cream transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            Start practicing
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden w-11 h-11 flex items-center justify-center rounded-full text-ink hover:bg-cream transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {launchError && (
        <div role="alert" className="mt-2 mx-auto max-w-md rounded-xl border border-beak/30 bg-beak-soft px-4 py-2.5 text-sm text-ink text-center">
          {launchError}
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sm:hidden mt-2 rounded-3xl p-2 bg-paper border border-line shadow-[0_20px_40px_-20px_rgba(23,34,26,0.35)] animate-speech-pop">
          <Link
            href="/"
            className={`block px-4 py-3 rounded-2xl text-sm font-medium hover:bg-cream ${
              pathname === "/" ? "text-ink font-semibold" : "text-stone-muted"
            }`}
          >
            Home
          </Link>
          <Link
            href="/creators"
            className={`block px-4 py-3 rounded-2xl text-sm font-medium hover:bg-cream ${
              pathname === "/creators" ? "text-ink font-semibold" : "text-stone-muted"
            }`}
          >
            Creator
          </Link>
          <div className="px-4 pt-3 pb-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-t border-slate-100 mt-1">
            More practice
          </div>
          <button
            onClick={() => handleLaunchTrack("ielts-speaking")}
            disabled={loadingTrack !== null}
            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-cream flex items-center gap-2.5"
          >
            <span className="mt-0.5 w-2 h-2 rounded-full bg-moss-light shrink-0" />
            <span className="text-sm font-medium text-ink">IELTS Speaking</span>
            {loadingTrack === "ielts-speaking" && (
              <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
            )}
          </button>
          <button
            onClick={() => handleLaunchTrack("communication-builder")}
            disabled={loadingTrack !== null}
            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-cream flex items-center gap-2.5"
          >
            <span className="mt-0.5 w-2 h-2 rounded-full bg-beak shrink-0" />
            <span className="text-sm font-medium text-ink">Communication Builder</span>
            {loadingTrack === "communication-builder" && (
              <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
            )}
          </button>
          <button
            onClick={() => handleLaunchTrack("debate-practice")}
            disabled={loadingTrack !== null}
            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-cream flex items-center gap-2.5"
          >
            <span className="mt-0.5 w-2 h-2 rounded-full bg-tealbird shrink-0" />
            <span className="text-sm font-medium text-ink">Debate Practice</span>
            {loadingTrack === "debate-practice" && (
              <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
            )}
          </button>
          <button
            onClick={() => handleLaunchTrack("negotiation-practice")}
            disabled={loadingTrack !== null}
            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-cream flex items-center gap-2.5"
          >
            <span className="mt-0.5 w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-sm font-medium text-ink">Negotiation Practice</span>
            {loadingTrack === "negotiation-practice" && (
              <span className="text-[11px] text-moss animate-pulse font-mono">Launching...</span>
            )}
          </button>
        </div>
      )}
    </header>
  );
}
