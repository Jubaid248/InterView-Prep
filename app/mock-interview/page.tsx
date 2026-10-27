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
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-1.5 text-sm text-stone-muted hover:text-ink transition-colors"
      >
        ← Back to home
      </button>

      {/* Title */}
      <div className="space-y-3 text-left">
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-moss-light">Mock interview setup</p>
        <h1 className="font-serif font-normal text-5xl sm:text-6xl leading-[1.02] text-ink">
          Tell Tota about <span className="italic text-moss">the role.</span>
        </h1>
        <p className="text-base text-stone-muted max-w-2xl leading-relaxed">
          Paste the job description and add your resume. Tota writes behavioral and technical questions that match
          your experience to the job.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="boon-card rounded-3xl p-5 sm:p-10 space-y-8">
        {/* Job Description */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="job-description"
              className="text-sm font-semibold text-ink flex items-center gap-2"
            >
              <span className="font-mono text-xs text-moss-light">01</span>
              Job description
            </label>
            <span className="text-stone-soft font-mono">{jobDescription.length} chars</span>
          </div>
          <textarea
            id="job-description"
            rows={7}
            value={jobDescription}
            onChange={(e) => handleJdChange(e.target.value)}
            placeholder="Paste the target job description, role responsibilities, and required technical skills..."
            className="w-full rounded-2xl boon-input px-5 py-4 text-sm text-ink placeholder:text-stone-soft focus:outline-none resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Resume Input Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink flex items-center gap-2">
              <span className="font-mono text-xs text-moss-light">02</span>
              Your resume
            </label>
            <div className="flex items-center bg-cream p-1 rounded-xl border border-line text-xs">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${inputMode === "upload"
                    ? "bg-white text-ink shadow-sm"
                    : "text-stone-muted hover:text-ink"
                  }`}
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${inputMode === "paste"
                    ? "bg-white text-ink shadow-sm"
                    : "text-stone-muted hover:text-ink"
                  }`}
              >
                Paste text
              </button>
            </div>
          </div>

          {inputMode === "upload" ? (
            <div className="space-y-3">
              <FileUpload onTextExtracted={handleFileTextExtracted} />
              {resumeText && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-muted px-1">
                    <span>Extracted Resume Content</span>
                    <span className="font-mono">{resumeText.length} characters</span>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={(e) => handleResumeChange(e.target.value)}
                    className="w-full rounded-2xl boon-input px-4 py-3 text-xs text-ink/80 focus:outline-none resize-y"
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
              className="w-full rounded-2xl boon-input px-5 py-4 text-sm text-ink placeholder:text-stone-soft focus:outline-none resize-y leading-relaxed font-sans"
            />
          )}
        </div>

        {/* Mode Selector */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="font-mono text-xs text-moss-light">03</span>
            Interview format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setMode("practice")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${mode === "practice"
                  ? "bg-moss/5 border-moss-light shadow-lg shadow-moss-light/10"
                  : "bg-cream/60 border-line hover:border-stone-soft/40"
                }`}
            >
              <div className="flex items-center justify-between pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-moss-light" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-moss-light/20 text-moss font-bold">
                  Casual
                </span>
              </div>
              <h4 className="text-base font-semibold text-ink">Practice</h4>
              <p className="text-[11px] text-stone-muted mt-1">
                Tap-to-record, optional camera toggle, no screen lock.
              </p>
            </div>

            <div
              onClick={() => setMode("serious")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${mode === "serious"
                  ? "bg-beak-soft border-beak shadow-lg shadow-beak/10"
                  : "bg-cream/60 border-line hover:border-stone-soft/40"
                }`}
            >
              <div className="flex items-center justify-between pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-beak" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-beak/20 text-beak-deep font-bold">
                  Proctored
                </span>
              </div>
              <h4 className="text-base font-semibold text-ink">Proctored interview</h4>
              <p className="text-[11px] text-stone-muted mt-1">
                Fullscreen takeover, mandatory video, hands-free auto recording.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-beak/10 border border-beak/30 rounded-2xl p-4 text-sm text-beak font-medium">
            {error}
          </div>
        )}

        <button
          id="start-interview-btn"
          onClick={handleStartSession}
          disabled={loading || !jobDescription.trim() || !resumeText.trim()}
          className="w-full py-4 px-8 rounded-2xl bg-moss hover:bg-moss-deep disabled:bg-line disabled:text-stone-soft disabled:shadow-none disabled:cursor-not-allowed text-cream font-semibold text-base transition-all shadow-[0_3px_0_#1C3B16] active:translate-y-[3px] active:shadow-none flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-cream" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Tota is writing your questions…
            </span>
          ) : (
            <>
              <span>Start mock interview</span>
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
