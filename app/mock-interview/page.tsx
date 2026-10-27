"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";

export default function MockInterviewSetupPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [mode, setMode] = useState<"practice" | "serious">("practice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore saved draft from localStorage on mount
  useEffect(() => {
    try {
      const savedJd = localStorage.getItem("parrot_draft_jd") ?? localStorage.getItem("totapakhi_draft_jd");
      const savedResume = localStorage.getItem("parrot_draft_resume") ?? localStorage.getItem("totapakhi_draft_resume");
      if (savedJd) setJobDescription(savedJd);
      if (savedResume) {
        setResumeText(savedResume);
        setInputMode("paste");
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleJdChange = (val: string) => {
    setJobDescription(val);
    try {
      localStorage.setItem("parrot_draft_jd", val);
    } catch {
      // Ignore
    }
  };

  const handleResumeChange = (val: string) => {
    setResumeText(val);
    try {
      localStorage.setItem("parrot_draft_resume", val);
    } catch {
      // Ignore
    }
  };

  const handleFileTextExtracted = (text: string) => {
    handleResumeChange(text);
  };

  const handleStartSession = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      setError("Please provide both a Job Description and a Resume (upload or paste).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: "mock-interview",
          jobDescription: jobDescription.trim(),
          resumeText: resumeText.trim(),
        }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text.slice(0, 150)}`);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to start session.");
      }

      localStorage.setItem("currentSessionId", data.sessionId);

      const history = JSON.parse(localStorage.getItem("sessionHistory") || "[]");
      history.unshift({
        sessionId: data.sessionId,
        createdAt: new Date().toISOString(),
        status: "in_progress",
        track: "mock-interview",
      });
      localStorage.setItem("sessionHistory", JSON.stringify(history));

      router.push(`/interview/${data.sessionId}?mode=${mode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 pt-10 sm:pt-14 pb-16">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors glass-card px-4 py-2 rounded-xl border border-slate-200 whitespace-nowrap"
        >
          ← Back
        </button>
        <span className="hidden sm:inline text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">
          STUDIO // MOCK INTERVIEW
        </span>
      </div>

      {/* Title */}
      <div className="space-y-2 text-left">
        <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-blue-600">
          TAILORED REASONING ENGINE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-jakarta">
          Mock Interview Setup
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Provide your target Job Description and Resume data. Parrot AI will generate tailored behavioral & technical interview questions aligned with your exact profile.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="boon-card rounded-3xl p-5 sm:p-12 space-y-8 border border-slate-200 shadow-2xl">
        {/* Job Description */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="job-description"
              className="font-bold uppercase tracking-wider text-slate-800 font-jakarta flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Target Job Description
            </label>
            <span className="text-slate-500 font-mono">{jobDescription.length} chars</span>
          </div>
          <textarea
            id="job-description"
            rows={7}
            value={jobDescription}
            onChange={(e) => handleJdChange(e.target.value)}
            placeholder="Paste the target job description, role responsibilities, and required technical skills..."
            className="w-full rounded-2xl boon-input px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Resume Input Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 font-jakarta flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Resume / CV Data
            </label>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${inputMode === "upload"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                  }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${inputMode === "paste"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                  }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {inputMode === "upload" ? (
            <div className="space-y-3">
              <FileUpload onTextExtracted={handleFileTextExtracted} />
              {resumeText && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span>Extracted Resume Content</span>
                    <span className="font-mono">{resumeText.length} characters</span>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={(e) => handleResumeChange(e.target.value)}
                    className="w-full rounded-2xl boon-input px-4 py-3 text-xs text-slate-700 focus:outline-none resize-y"
                  />
                </div>
              )}
            </div>
          ) : (
            <textarea
              id="resume-text"
              rows={7}
              value={resumeText}
              onChange={(e) => handleResumeChange(e.target.value)}
              placeholder="Paste your resume content, experience, accomplishments, and skills here..."
              className="w-full rounded-2xl boon-input px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed font-sans"
            />
          )}
        </div>

        {/* Mode Selector */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Select Interview Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setMode("practice")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${mode === "practice"
                  ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xl">🎯</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-bold">
                  Casual
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Practice Mode</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Tap-to-record, optional camera toggle, no screen lock.
              </p>
            </div>

            <div
              onClick={() => setMode("serious")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${mode === "serious"
                  ? "bg-red-50 border-red-500 shadow-lg shadow-red-500/10"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xl">⚔️</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-700 font-bold">
                  Proctored
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Serious Interview</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Fullscreen takeover, mandatory video, hands-free auto recording.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <button
          id="start-interview-btn"
          onClick={handleStartSession}
          disabled={loading || !jobDescription.trim() || !resumeText.trim()}
          className="w-full py-5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/35 flex items-center justify-center gap-3 font-jakarta"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Parrot is generating tailored interview questions...
            </span>
          ) : (
            <>
              <span>Launch Mock Interview Session</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
