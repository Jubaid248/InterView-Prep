"use client";

import { friendlyError, requestErrorFrom } from "@/lib/friendlyError";
import { useState, useRef, ChangeEvent, DragEvent } from "react";

interface FileUploadProps {
  onTextExtracted: (text: string, fileName: string) => void;
  disabled?: boolean;
}

export default function FileUpload({
  onTextExtracted,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const validExtensions = [".pdf", ".txt", ".md"];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt && !file.type.startsWith("text/")) {
      setError("Upload a PDF, TXT or Markdown file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw await requestErrorFrom(res);
      const data = await res.json();

      setUploadedFileName(data.fileName);
      onTextExtracted(data.text, data.fileName);
    } catch (err) {
      setError(friendlyError("resume", err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setUploadedFileName(null);
    setError(null);
    onTextExtracted("", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,text/plain,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="resume-file-input"
        disabled={disabled || loading}
      />

      {uploadedFileName ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-moss-light/10 border border-moss-light/20 text-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-moss-light/20 flex items-center justify-center shrink-0 text-moss font-bold text-xs">
              PDF
            </div>
            <div className="min-w-0">
              <p className="text-ink font-medium truncate">
                {uploadedFileName}
              </p>
              <p className="text-xs text-moss">Resume added</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-stone-muted hover:text-beak-deep transition-colors px-2 py-1 rounded-md hover:bg-line"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !loading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-moss-light bg-moss-light/10"
              : "border-line hover:border-stone-soft/40 bg-cream hover:bg-cream"
          } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <svg
                className="animate-spin h-6 w-6 text-moss"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-xs text-stone-muted">Reading your resume…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-line flex items-center justify-center text-stone-muted">
                📄
              </div>
              <div>
                <p className="text-sm font-medium text-ink/80">
                  Click to upload or drag & drop your Resume/CV
                </p>
                <p className="text-xs text-stone-soft mt-0.5">
                  Supports PDF, TXT, or Markdown (.pdf, .txt, .md)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-beak-deep px-1">{error}</p>
      )}
    </div>
  );
}
