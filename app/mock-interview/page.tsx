"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";

export default function MockInterviewSetupPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileTextExtracted = (text: string) => {
    setResumeText(text);
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

      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors glass-card px-4 py-2 rounded-xl border border-white/10"
        >
          ← Back to Studios
        </button>
        <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
          STUDIO // MOCK INTERVIEW
        </span>
      </div>

      {/* Title */}
      <div className="space-y-2 text-left">
        <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-amber-400">
          TAILORED REASONING ENGINE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-jakarta">
          Mock Interview Setup
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Provide your target Job Description and Resume data. TotaPakhi AI will generate tailored behavioral & technical interview questions aligned with your exact profile.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="boon-card rounded-3xl p-8 sm:p-12 space-y-8 border border-white/10 shadow-2xl">
        {/* Job Description */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="job-description"
              className="font-bold uppercase tracking-wider text-zinc-200 font-jakarta flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Target Job Description
            </label>
            <span className="text-zinc-500 font-mono">{jobDescription.length} chars</span>
          </div>
          <textarea
            id="job-description"
            rows={7}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the target job description, role responsibilities, and required technical skills..."
            className="w-full rounded-2xl boon-input px-5 py-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Resume Input Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-jakarta flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Resume / CV Data
            </label>
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                  inputMode === "upload"
                    ? "bg-amber-400 text-zinc-950 font-black"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                  inputMode === "paste"
                    ? "bg-amber-400 text-zinc-950 font-black"
                    : "text-zinc-400 hover:text-zinc-200"
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
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <span>Extracted Resume Content</span>
                    <span className="font-mono">{resumeText.length} characters</span>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full rounded-2xl boon-input px-4 py-3 text-xs text-zinc-300 focus:outline-none resize-y"
                  />
                </div>
              )}
            </div>
          ) : (
            <textarea
              id="resume-text"
              rows={7}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content, experience, accomplishments, and skills here..."
              className="w-full rounded-2xl boon-input px-5 py-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-y leading-relaxed font-sans"
            />
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <button
          id="start-interview-btn"
          onClick={handleStartSession}
          disabled={loading || !jobDescription.trim() || !resumeText.trim()}
          className="w-full py-5 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-950 font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-3 font-jakarta"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-zinc-950" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              TotaPakhi is generating tailored interview questions...
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
