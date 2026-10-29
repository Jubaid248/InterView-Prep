/**
 * Turns failed requests into calm, user-facing messages.
 *
 * API routes keep returning detailed errors (useful in logs); pages pass the
 * response status and raw text here and show only the friendly message.
 * The raw error is logged to the console so it isn't lost.
 */

export type ErrorContext =
  | "start-questions"
  | "start-track"
  | "answer"
  | "report"
  | "load-session"
  | "load-report"
  | "resume";

/** A failed fetch with its HTTP status, so callers can throw it and friendlyError can read it. */
export class RequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "RequestError";
    this.status = status;
  }
}

/** Reads a failed response's error message (JSON or text) without throwing. */
export async function requestErrorFrom(res: Response): Promise<RequestError> {
  let message = `HTTP ${res.status}`;
  try {
    const text = await res.text();
    try {
      message = JSON.parse(text).error || message;
    } catch {
      message = text.slice(0, 300) || message;
    }
  } catch {
    // keep the status-only message
  }
  return new RequestError(res.status, message);
}

const BUSY: Record<ErrorContext, string> = {
  "start-questions": "Tota couldn't write your questions just now. This usually clears up in a minute.",
  "start-track": "Couldn't start that practice. Try again in a moment.",
  answer: "That answer didn't send. Your recording is still here.",
  report: "Tota couldn't finish your report. Your answers are saved, so nothing's lost.",
  "load-session": "We couldn't load your practice session. Try again in a moment.",
  "load-report": "We couldn't load your report. Try again in a moment.",
  resume: "Something went wrong uploading your file. Try again.",
};

const NOT_FOUND: Partial<Record<ErrorContext, string>> = {
  answer: "We can't find this practice session any more. It may have expired.",
  report: "We can't find this practice session. It may have expired.",
  "load-session": "We can't find this practice session. It may have expired.",
  "load-report": "We can't find this report. The practice session may have expired.",
};

function isOffline(err: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  // fetch() rejects with a TypeError when the network is unreachable
  return err instanceof TypeError && /fetch|network|load failed/i.test(err.message);
}

export function friendlyError(context: ErrorContext, err: unknown): string {
  console.error(`[${context}]`, err);

  if (isOffline(err)) return "You seem to be offline. Check your connection, then try again.";

  const status = err instanceof RequestError ? err.status : 0;
  const raw = err instanceof Error ? err.message : String(err ?? "");

  if (status === 404 && NOT_FOUND[context]) return NOT_FOUND[context] as string;

  if (context === "resume") {
    if (/extract readable text|no text|scanned/i.test(raw)) {
      return "We couldn't read text from that file. If it's a scanned PDF, paste your resume as text instead.";
    }
    if (status === 400 && /file/i.test(raw)) return "Upload a PDF, TXT or Markdown file.";
  }

  if (context === "report" && /no answers/i.test(raw)) {
    return "Answer at least one question to get feedback.";
  }

  return BUSY[context] ?? "Something went wrong on our side. Try again in a moment.";
}
