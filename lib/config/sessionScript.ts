/**
 * Shared shape for scripted practice sessions (IELTS, communication builder, debate).
 *
 * Every session is a list of turns. Each turn's detail can carry a line Tota says
 * before the question (spokenPrefix) and the kind of follow-up Tota should ask
 * after the answer (followUpStyle). A null followUpStyle means Tota moves straight
 * on to the next turn, like an examiner working through a script.
 */

export type FollowUpStyle =
  | "interview"
  | "ielts-part3-probe"
  | "small-talk"
  | "method-probe"
  | "debate-rebuttal"
  | "debate-cross-exam"
  | "negotiation-counterpart"
  | "negotiation-pressure"
  | "negotiation-beat";

export interface ScriptedTurn {
  /** Spoken by Tota before the question, e.g. an examiner transition. Not shown on screen. */
  spokenPrefix?: string;
  /** Follow-up to generate after the answer; null means no follow-up. */
  followUpStyle?: FollowUpStyle | null;
}

export function pickRandom<T>(items: readonly T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}
