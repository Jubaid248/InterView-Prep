"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
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

  const handleLaunchTrack = async (track: "ielts-speaking" | "communication-builder") => {
    setLoadingTrack(track);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      });

      if (!res.ok) throw new Error("Failed to start session");

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
      console.error("Error starting practice session:", err);
      router.push("/");
    } finally {
      setLoadingTrack(null);
    }
  };

  // The interview studio has its own toolbar; keep the candidate focused
  if (pathname?.startsWith("/interview/")) return null;

  return (
    <header className="sticky top-5 z-50 px-4 w-full max-w-4xl mx-auto">
      <div className="cloudkit-nav rounded-full pl-5 pr-2 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 transition-all duration-300">
        
        {/* Brand / Logo (Left) */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl group-hover:scale-110 transition-transform">🦜</span>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-jakarta">
            Parrot
          </span>
        </Link>

        {/* Center Navigation Links & Dropdown beside Creator */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/"
            className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              pathname === "/"
                ? "text-slate-900 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </Link>

          <Link
            href="/creators"
            className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              pathname === "/creators"
                ? "text-slate-900 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Creator
          </Link>

          {/* Dropdown Beside Creator */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
              aria-expanded={dropdownOpen}
            >
              <span>Other Tracks</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-slate-900" : "text-slate-500"
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
              <div className="absolute right-0 mt-3 w-64 rounded-2xl p-2 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-900/15 z-50 animate-speech-pop">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                  Select Practice Module
                </div>

                <div className="mt-1 space-y-1">
                  {/* IELTS Speaking */}
                  <button
                    onClick={() => handleLaunchTrack("ielts-speaking")}
                    disabled={loadingTrack !== null}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 group transition-all flex items-start gap-2.5"
                  >
                    <span className="text-base">🎙️</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          IELTS Speaking
                        </span>
                        {loadingTrack === "ielts-speaking" && (
                          <span className="text-[10px] text-blue-500 animate-pulse font-mono">Launching...</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                        Band 9 fluency & cue card prep
                      </p>
                    </div>
                  </button>

                  {/* Communication Builder */}
                  <button
                    onClick={() => handleLaunchTrack("communication-builder")}
                    disabled={loadingTrack !== null}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 group transition-all flex items-start gap-2.5"
                  >
                    <span className="text-base">💬</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          Communication Builder
                        </span>
                        {loadingTrack === "communication-builder" && (
                          <span className="text-[10px] text-blue-500 animate-pulse font-mono">Launching...</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                        STAR framework executive clarity
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA Button (Dark pill button like Cloudkit 'Try free') + mobile menu toggle */}
        <div className="flex items-center gap-1">
          <Link
            href="/mock-interview"
            className="text-sm font-semibold px-5 py-2.5 sm:py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            Try free
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden w-11 h-11 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sm:hidden mt-2 rounded-3xl p-2 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-900/15 animate-speech-pop">
          <Link
            href="/"
            className={`block px-4 py-3 rounded-2xl text-sm font-medium hover:bg-slate-50 ${
              pathname === "/" ? "text-slate-900 font-semibold" : "text-slate-600"
            }`}
          >
            Home
          </Link>
          <Link
            href="/creators"
            className={`block px-4 py-3 rounded-2xl text-sm font-medium hover:bg-slate-50 ${
              pathname === "/creators" ? "text-slate-900 font-semibold" : "text-slate-600"
            }`}
          >
            Creator
          </Link>
          <div className="px-4 pt-3 pb-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-t border-slate-100 mt-1">
            Other Tracks
          </div>
          <button
            onClick={() => handleLaunchTrack("ielts-speaking")}
            disabled={loadingTrack !== null}
            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 flex items-center gap-2.5"
          >
            <span className="text-base">🎙️</span>
            <span className="text-sm font-medium text-slate-800">IELTS Speaking</span>
            {loadingTrack === "ielts-speaking" && (
              <span className="text-[11px] text-blue-500 animate-pulse font-mono">Launching...</span>
            )}
          </button>
          <button
            onClick={() => handleLaunchTrack("communication-builder")}
            disabled={loadingTrack !== null}
            className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 flex items-center gap-2.5"
          >
            <span className="text-base">💬</span>
            <span className="text-sm font-medium text-slate-800">Communication Builder</span>
            {loadingTrack === "communication-builder" && (
              <span className="text-[11px] text-blue-500 animate-pulse font-mono">Launching...</span>
            )}
          </button>
        </div>
      )}
    </header>
  );
}
