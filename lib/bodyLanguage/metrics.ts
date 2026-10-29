/**
 * Pure body-language and eye-movement metrics.
 *
 * The browser-side analyzer classifies each video frame (gaze direction, blink,
 * expression, posture) and feeds it to a TallyBuilder, which handles everything
 * that depends on time: look-away episodes, blinks, reading sweeps, face touches.
 * Tallies are plain summable counts, so main answers and follow-ups (and whole
 * sessions) can be merged, then scored into insights on the server.
 *
 * No video or landmark data ever leaves the browser; only these counts do.
 */

export type GazeState = "contact" | "down" | "up" | "side" | "closed" | "absent";

export interface PoseSample {
  upright: boolean;
  slouch: boolean;
  tilt: boolean;
  leanIn: boolean;
  leanBack: boolean;
  handsVisible: boolean;
  gesturing: boolean;
  faceTouch: boolean;
}

export interface FrameSample {
  /** Seconds since sampling started. */
  t: number;
  gaze: GazeState;
  /** Horizontal eye-in-head position relative to the calibrated centre (iris ratio units). */
  gazeH: number;
  /** Max eyelid closure across both eyes, 0–1. */
  blink: number;
  /** Head displacement since the previous frame, in inter-eye distances. */
  headMove: number;
  smile: number;
  frown: number;
  pose?: PoseSample | null;
}

export type MomentKind = "look-down" | "look-side" | "look-up" | "eyes-closed" | "face-touch" | "out-of-frame" | "reading";

export interface Moment {
  t: number;
  kind: MomentKind;
  durationSec?: number;
  /** Question number, set when tallies from several answers are merged. */
  q?: number;
}

export interface BodyLanguageTally {
  durationSec: number;
  samples: number;
  faceFrames: number;
  contactFrames: number;
  downFrames: number;
  upFrames: number;
  sideFrames: number;
  closedFrames: number;
  absentFrames: number;
  lookAways: number;
  lookAwayDown: number;
  lookAwaySide: number;
  lookAwayUp: number;
  longestLookAwaySec: number;
  blinks: number;
  longClosures: number;
  readingSweeps: number;
  gazeShifts: number;
  smileFrames: number;
  frownFrames: number;
  moveSum: number;
  poseFrames: number;
  uprightFrames: number;
  slouchFrames: number;
  tiltFrames: number;
  leanInFrames: number;
  leanBackFrames: number;
  handsVisibleFrames: number;
  gestureFrames: number;
  faceTouches: number;
  moments: Moment[];
}

export const LOOK_AWAY_MIN_SEC = 1.2;
const MOMENT_MIN_SEC = 2;
const LONG_CLOSURE_SEC = 0.8;
const OUT_OF_FRAME_MIN_SEC = 1.5;
const BLINK_ON = 0.5;
const SMILE_ON = 0.35;
const FROWN_ON = 0.4;
const MAX_MOMENTS = 12;
// Reading: a slow drift in one direction, then a fast return saccade
const SWEEP_RETURN = 0.07;
const SWEEP_DRIFT = 0.04;
const SWEEP_WINDOW = 12;
const GAZE_SHIFT = 0.1;

export function emptyTally(): BodyLanguageTally {
  return {
    durationSec: 0,
    samples: 0,
    faceFrames: 0,
    contactFrames: 0,
    downFrames: 0,
    upFrames: 0,
    sideFrames: 0,
    closedFrames: 0,
    absentFrames: 0,
    lookAways: 0,
    lookAwayDown: 0,
    lookAwaySide: 0,
    lookAwayUp: 0,
    longestLookAwaySec: 0,
    blinks: 0,
    longClosures: 0,
    readingSweeps: 0,
    gazeShifts: 0,
    smileFrames: 0,
    frownFrames: 0,
    moveSum: 0,
    poseFrames: 0,
    uprightFrames: 0,
    slouchFrames: 0,
    tiltFrames: 0,
    leanInFrames: 0,
    leanBackFrames: 0,
    handsVisibleFrames: 0,
    gestureFrames: 0,
    faceTouches: 0,
    moments: [],
  };
}

/** Accumulates classified frames for one recording and tracks timed events. */
export class TallyBuilder {
  private tally = emptyTally();
  private lastT = 0;
  // Look-away episode
  private awayStart: number | null = null;
  private awayDirs = { down: 0, side: 0, up: 0 };
  // Eye closure
  private closedStart: number | null = null;
  private wasClosed = false;
  // Out of frame
  private absentStart: number | null = null;
  // Face touch
  private touching = false;
  // Reading / darting: recent horizontal gaze values
  private gazeHist: number[] = [];
  private sweepCooldown = 0;
  private sweepTimes: number[] = [];

  add(f: FrameSample): void {
    const t = this.tally;
    t.samples++;
    this.lastT = f.t;

    if (f.gaze === "absent") {
      t.absentFrames++;
      this.endLookAway(f.t);
      this.endClosure(f.t);
      if (this.absentStart === null) this.absentStart = f.t;
      this.gazeHist = [];
      this.addPose(f, t);
      return;
    }
    this.endAbsent(f.t);
    t.faceFrames++;
    t.moveSum += f.headMove;
    if (f.smile >= SMILE_ON) t.smileFrames++;
    if (f.frown >= FROWN_ON) t.frownFrames++;

    // Blinks: count each closure once; long closures are their own signal
    const closed = f.gaze === "closed" || f.blink >= BLINK_ON;
    if (closed) {
      t.closedFrames++;
      if (!this.wasClosed) {
        t.blinks++;
        this.closedStart = f.t;
      }
    } else {
      this.endClosure(f.t);
    }
    this.wasClosed = closed;

    if (!closed) {
      if (f.gaze === "contact") {
        t.contactFrames++;
        this.endLookAway(f.t);
      } else {
        if (f.gaze === "down") t.downFrames++;
        if (f.gaze === "up") t.upFrames++;
        if (f.gaze === "side") t.sideFrames++;
        if (this.awayStart === null) this.awayStart = f.t;
        this.awayDirs[f.gaze as "down" | "side" | "up"]++;
      }
      this.trackSaccades(f);
    }

    this.addPose(f, t);
  }

  private addPose(f: FrameSample, t: BodyLanguageTally): void {
    const p = f.pose;
    if (!p) return;
    t.poseFrames++;
    if (p.upright) t.uprightFrames++;
    if (p.slouch) t.slouchFrames++;
    if (p.tilt) t.tiltFrames++;
    if (p.leanIn) t.leanInFrames++;
    if (p.leanBack) t.leanBackFrames++;
    if (p.handsVisible) t.handsVisibleFrames++;
    if (p.gesturing) t.gestureFrames++;
    if (p.faceTouch && !this.touching) {
      t.faceTouches++;
      this.pushMoment({ t: f.t, kind: "face-touch" });
    }
    this.touching = p.faceTouch;
  }

  private trackSaccades(f: FrameSample): void {
    const h = this.gazeHist;
    h.push(f.gazeH);
    if (h.length > SWEEP_WINDOW + 2) h.shift();
    if (this.sweepCooldown > 0) this.sweepCooldown--;
    if (h.length < 7) return;

    const n = h.length;
    const jump = h[n - 1] - h[n - 2];
    if (Math.abs(jump) < SWEEP_RETURN) return;

    // Eyes reading a line drift slowly (a few thousandths per frame at 15 fps), so
    // measure the drift across the whole window before the jump, not just a few frames
    let drift = 0;
    let sameSign = 0;
    const steps = n - 2;
    for (let i = 1; i < n - 1; i++) {
      const step = h[i] - h[i - 1];
      drift += step;
      if (Math.sign(step) === -Math.sign(jump) && Math.abs(step) > 0.002) sameSign++;
    }
    const isSweep =
      this.sweepCooldown === 0 &&
      Math.sign(drift) === -Math.sign(jump) &&
      Math.abs(drift) >= SWEEP_DRIFT &&
      sameSign >= Math.ceil(steps * 0.6);

    if (isSweep) {
      this.tally.readingSweeps++;
      this.sweepCooldown = 4;
      this.sweepTimes.push(f.t);
      // Several sweeps within 10 seconds is a reading run worth pointing out once
      const recent = this.sweepTimes.filter((s) => f.t - s <= 10);
      if (recent.length === 3) this.pushMoment({ t: recent[0], kind: "reading", durationSec: round1(f.t - recent[0]) });
    } else if (Math.abs(jump) >= GAZE_SHIFT) {
      this.tally.gazeShifts++;
    }
  }

  private endLookAway(now: number): void {
    if (this.awayStart === null) return;
    const dur = now - this.awayStart;
    const dirs = this.awayDirs;
    const dir = dirs.down >= dirs.side && dirs.down >= dirs.up ? "down" : dirs.side >= dirs.up ? "side" : "up";
    if (dur >= LOOK_AWAY_MIN_SEC) {
      const t = this.tally;
      t.lookAways++;
      if (dir === "down") t.lookAwayDown++;
      if (dir === "side") t.lookAwaySide++;
      if (dir === "up") t.lookAwayUp++;
      t.longestLookAwaySec = Math.max(t.longestLookAwaySec, round1(dur));
      if (dur >= MOMENT_MIN_SEC) {
        this.pushMoment({ t: round1(this.awayStart), kind: `look-${dir}` as MomentKind, durationSec: round1(dur) });
      }
    }
    this.awayStart = null;
    this.awayDirs = { down: 0, side: 0, up: 0 };
  }

  private endClosure(now: number): void {
    if (this.closedStart !== null) {
      const dur = now - this.closedStart;
      if (dur >= LONG_CLOSURE_SEC) {
        this.tally.longClosures++;
        this.pushMoment({ t: round1(this.closedStart), kind: "eyes-closed", durationSec: round1(dur) });
      }
    }
    this.closedStart = null;
    this.wasClosed = false;
  }

  private endAbsent(now: number): void {
    if (this.absentStart === null) return;
    const dur = now - this.absentStart;
    if (dur >= OUT_OF_FRAME_MIN_SEC) {
      this.pushMoment({ t: round1(this.absentStart), kind: "out-of-frame", durationSec: round1(dur) });
    }
    this.absentStart = null;
  }

  private pushMoment(m: Moment): void {
    if (this.tally.moments.length < MAX_MOMENTS) this.tally.moments.push(m);
  }

  finish(): BodyLanguageTally {
    this.endLookAway(this.lastT);
    this.endClosure(this.lastT);
    this.endAbsent(this.lastT);
    this.tally.durationSec = round1(this.lastT);
    return this.tally;
  }
}

/** Sums tallies; moments are tagged with their question number. */
export function mergeTallies(items: { tally: BodyLanguageTally | null | undefined; q?: number }[]): BodyLanguageTally | null {
  const present = items.filter((i) => i.tally && i.tally.samples > 0);
  if (present.length === 0) return null;
  const out = emptyTally();
  for (const { tally, q } of present) {
    const t = tally as BodyLanguageTally;
    for (const key of Object.keys(out) as (keyof BodyLanguageTally)[]) {
      if (key === "moments" || key === "longestLookAwaySec") continue;
      (out[key] as number) += (t[key] as number) || 0;
    }
    out.longestLookAwaySec = Math.max(out.longestLookAwaySec, t.longestLookAwaySec || 0);
    out.moments.push(...(t.moments || []).map((m) => ({ ...m, q: m.q ?? q })));
  }
  out.durationSec = round1(out.durationSec);
  return out;
}

export type InsightArea = "eyes" | "posture" | "gestures" | "expression" | "composure";
export type InsightLevel = "good" | "watch" | "issue";

export interface BodyLanguageInsight {
  area: InsightArea;
  level: InsightLevel;
  title: string;
  detail: string;
  tip?: string;
}

export interface BodyLanguageReport {
  scores: {
    overall: number;
    eyeContact: number;
    posture: number | null;
    composure: number;
    engagement: number;
  };
  stats: {
    durationSec: number;
    eyeContactPercent: number;
    facePresencePercent: number;
    lookAways: number;
    lookAwaysPerMin: number;
    longestLookAwaySec: number;
    lookingDownPercent: number;
    lookingSidePercent: number;
    blinksPerMin: number;
    readingDetected: boolean;
    gazeShiftsPerMin: number;
    smilePercent: number;
    uprightPercent: number | null;
    gesturePercent: number | null;
    handsVisiblePercent: number | null;
    faceTouches: number;
    headMovement: "low" | "moderate" | "high";
  };
  insights: BodyLanguageInsight[];
  moments: Moment[];
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function describeMoment(m: Moment): string {
  const at = `${m.q ? `Q${m.q}, ` : ""}${formatTime(m.t)}`;
  const d = m.durationSec ? ` for ${m.durationSec}s` : "";
  switch (m.kind) {
    case "look-down":
      return `looked down${d} (${at})`;
    case "look-side":
      return `looked to the side${d} (${at})`;
    case "look-up":
      return `looked up${d} (${at})`;
    case "eyes-closed":
      return `closed your eyes${d} (${at})`;
    case "face-touch":
      return `touched your face (${at})`;
    case "out-of-frame":
      return `moved out of frame${d} (${at})`;
    case "reading":
      return `eye pattern looked like reading (${at})`;
  }
}

function longestMoment(moments: Moment[], kinds: MomentKind[]): Moment | undefined {
  return moments
    .filter((m) => kinds.includes(m.kind))
    .sort((a, b) => (b.durationSec || 0) - (a.durationSec || 0))[0];
}

/**
 * Turns a tally into scores, headline stats and plain-language insights.
 * For a whole session, pass the questions where reading was detected per answer:
 * one answer read from notes is worth flagging even if the session average hides it.
 */
export function scoreBodyLanguage(t: BodyLanguageTally, opts: { readingInQuestions?: number[] } = {}): BodyLanguageReport {
  const openFrames = Math.max(1, t.faceFrames - t.closedFrames);
  const minutes = Math.max(t.durationSec / 60, 1 / 60);
  const faceMinutes = Math.max((t.durationSec * (t.faceFrames / Math.max(1, t.samples))) / 60, 1 / 60);

  const eyeContactPercent = pct(t.contactFrames, openFrames);
  const lookingDownPercent = pct(t.downFrames, openFrames);
  const lookingSidePercent = pct(t.sideFrames, openFrames);
  const blinksPerMin = Math.round(t.blinks / faceMinutes);
  const readingPerMin = t.readingSweeps / minutes;
  const readingQs = opts.readingInQuestions ?? [];
  const readingDetected = (t.readingSweeps >= 4 && readingPerMin >= 8) || readingQs.length > 0;
  const gazeShiftsPerMin = Math.round(t.gazeShifts / minutes);
  const lookAwaysPerMin = round1(t.lookAways / minutes);
  const smilePercent = pct(t.smileFrames, t.faceFrames);
  const frownPercent = pct(t.frownFrames, t.faceFrames);
  const facePresencePercent = pct(t.faceFrames, t.samples);
  const avgMove = t.faceFrames > 0 ? t.moveSum / t.faceFrames : 0;
  const headMovement: "low" | "moderate" | "high" = avgMove < 0.025 ? "low" : avgMove < 0.06 ? "moderate" : "high";

  const hasPose = t.poseFrames >= 10;
  const uprightPercent = hasPose ? pct(t.uprightFrames, t.poseFrames) : null;
  const slouchPercent = hasPose ? pct(t.slouchFrames, t.poseFrames) : 0;
  const tiltPercent = hasPose ? pct(t.tiltFrames, t.poseFrames) : 0;
  const leanInPercent = hasPose ? pct(t.leanInFrames, t.poseFrames) : 0;
  const leanBackPercent = hasPose ? pct(t.leanBackFrames, t.poseFrames) : 0;
  const handsVisiblePercent = hasPose ? pct(t.handsVisibleFrames, t.poseFrames) : null;
  const gesturePercent = hasPose ? pct(t.gestureFrames, t.poseFrames) : null;

  // --- Scores ---
  let eyeScore = clamp(((eyeContactPercent - 30) / 55) * 100);
  if (readingDetected) eyeScore -= 20;
  if (t.longestLookAwaySec >= 5) eyeScore -= 10;
  if (gazeShiftsPerMin > 30) eyeScore -= 10;
  if (t.longClosures >= 2) eyeScore -= 5;
  eyeScore = clamp(eyeScore);

  const postureScore = hasPose
    ? clamp((uprightPercent as number) - tiltPercent * 0.3 - leanBackPercent * 0.2 - leanInPercent * 0.1 + 10)
    : null;

  let composure = 100;
  if (blinksPerMin > 35) composure -= Math.min(25, (blinksPerMin - 35) * 1.5);
  if (headMovement === "moderate") composure -= 10;
  if (headMovement === "high") composure -= 25;
  composure -= Math.min(30, t.faceTouches * 8);
  if (frownPercent > 30) composure -= 10;
  if (facePresencePercent < 80) composure -= 10;
  composure = clamp(composure);

  // Engagement: some smiling and some gesturing is ideal; none or constant is less so
  const smilePart = smilePercent >= 10 && smilePercent <= 70 ? 100 : smilePercent < 10 ? 50 + smilePercent * 5 : 80;
  const gesturePart =
    gesturePercent === null ? 70 : gesturePercent >= 15 && gesturePercent <= 60 ? 100 : gesturePercent < 15 ? 55 + gesturePercent * 3 : 75;
  const engagement = clamp(Math.round(smilePart * 0.5 + gesturePart * 0.5));

  const weighted: [number, number][] = [
    [eyeScore, 40],
    [composure, 25],
    [engagement, 15],
  ];
  if (postureScore !== null) weighted.push([postureScore, 20]);
  const overall = Math.round(weighted.reduce((s, [v, w]) => s + v * w, 0) / weighted.reduce((s, [, w]) => s + w, 0));

  // --- Insights ---
  const insights: BodyLanguageInsight[] = [];
  const add = (i: BodyLanguageInsight) => insights.push(i);

  if (eyeContactPercent >= 75) {
    add({ area: "eyes", level: "good", title: "Strong eye contact", detail: `You looked at the interviewer ${eyeContactPercent}% of the time.` });
  } else if (eyeContactPercent >= 50) {
    add({
      area: "eyes",
      level: "watch",
      title: "Eye contact dropped at times",
      detail: `You held eye contact ${eyeContactPercent}% of the time. Aim for around 70–80%.`,
      tip: "Look at the camera when you make your main point and when you finish an answer.",
    });
  } else {
    add({
      area: "eyes",
      level: "issue",
      title: "Low eye contact",
      detail: `You looked at the interviewer only ${eyeContactPercent}% of the time.`,
      tip: "Put a small sticker next to your camera and talk to it, as if it were the interviewer's eyes.",
    });
  }

  if (readingDetected) {
    const m = t.moments.find((x) => x.kind === "reading");
    add({
      area: "eyes",
      level: "issue",
      title: "Your eyes moved like you were reading",
      detail: readingQs.length
        ? `Your eye movements showed a reading pattern in ${readingQs.map((q) => `Q${q}`).join(", ")}${m ? `, starting at ${m.q ? `Q${m.q}, ` : ""}${formatTime(m.t)}` : ""}. Interviewers notice this quickly.`
        : `We saw ${t.readingSweeps} left-to-right reading sweeps${m ? `, starting at ${m.q ? `Q${m.q}, ` : ""}${formatTime(m.t)}` : ""}. Interviewers notice this quickly.`,
      tip: "Keep only 3–4 keywords as notes. Glance at a keyword, then look up and say it in your own words.",
    });
  }

  const downMoment = longestMoment(t.moments, ["look-down"]);
  if (t.lookAwayDown >= 3 || lookingDownPercent > 20) {
    add({
      area: "eyes",
      level: "watch",
      title: "You often looked down",
      detail: `${t.lookAwayDown} times, ${lookingDownPercent}% of your speaking time${downMoment ? `; the longest: ${describeMoment(downMoment)}` : ""}.`,
      tip: "Looking down reads as unsure or checking notes. Raise your screen so the camera is at eye level.",
    });
  }

  const sideMoment = longestMoment(t.moments, ["look-side"]);
  if (t.lookAwaySide >= 3 || lookingSidePercent > 15) {
    add({
      area: "eyes",
      level: "watch",
      title: "Frequent glances to the side",
      detail: `${t.lookAwaySide} side glances${sideMoment ? `; the longest: ${describeMoment(sideMoment)}` : ""}.`,
      tip: "Side glances can look distracted or like reading another screen. Close other windows and keep notes beside the camera.",
    });
  }

  if (t.lookAwayUp >= 3) {
    add({
      area: "eyes",
      level: "watch",
      title: "Looking up while thinking",
      detail: `You looked up ${t.lookAwayUp} times. A short glance while thinking is natural.`,
      tip: "Pause, think, then bring your eyes back before you start speaking.",
    });
  }

  if (t.longestLookAwaySec >= 4 && !insights.some((i) => i.title.includes("down") || i.title.includes("side"))) {
    const m = longestMoment(t.moments, ["look-down", "look-side", "look-up"]);
    add({
      area: "eyes",
      level: "watch",
      title: "One long look away",
      detail: `Your longest look away lasted ${t.longestLookAwaySec}s${m ? `: you ${describeMoment(m)}` : ""}.`,
      tip: "If you need to think, say “Let me think about that for a second” and keep your eyes up.",
    });
  }

  if (gazeShiftsPerMin > 30 && !readingDetected) {
    add({
      area: "eyes",
      level: "issue",
      title: "Eyes moving around a lot",
      detail: `Your gaze jumped about ${gazeShiftsPerMin} times a minute, which can come across as nervous.`,
      tip: "Pick one point (the camera) and return to it at the end of every sentence.",
    });
  }

  if (blinksPerMin > 35) {
    add({
      area: "composure",
      level: "watch",
      title: "Fast blinking",
      detail: `About ${blinksPerMin} blinks a minute (typical is 15–20). Rapid blinking often shows nerves.`,
      tip: "Slow your breathing before answering: in for 4, out for 6.",
    });
  } else if (blinksPerMin < 6 && t.durationSec >= 30 && t.faceFrames > 100) {
    add({
      area: "eyes",
      level: "watch",
      title: "Very few blinks",
      detail: `Only about ${blinksPerMin} blinks a minute, which can look like staring.`,
      tip: "Relax your face and let yourself blink naturally.",
    });
  }

  if (t.longClosures >= 2) {
    add({
      area: "eyes",
      level: "watch",
      title: "Eyes closed for long moments",
      detail: `You closed your eyes for more than a second ${t.longClosures} times.`,
      tip: "If you need to think, look slightly away for a moment instead of closing your eyes.",
    });
  }

  if (hasPose) {
    if (slouchPercent > 30) {
      add({
        area: "posture",
        level: "issue",
        title: "You slouched",
        detail: `You sank lower in your seat for ${slouchPercent}% of the time.`,
        tip: "Sit back in the chair with both feet flat, and imagine a string pulling the top of your head up.",
      });
    } else if ((uprightPercent as number) >= 70) {
      add({ area: "posture", level: "good", title: "Upright, confident posture", detail: `You sat upright ${uprightPercent}% of the time.` });
    }
    if (tiltPercent > 30) {
      add({
        area: "posture",
        level: "watch",
        title: "Shoulders tilted",
        detail: `Your shoulders were uneven ${tiltPercent}% of the time, often from leaning on one arm.`,
        tip: "Keep both shoulders level and your weight centred.",
      });
    }
    if (leanBackPercent > 40) {
      add({
        area: "posture",
        level: "watch",
        title: "Leaning back",
        detail: `You leaned away from the camera ${leanBackPercent}% of the time, which can read as disengaged.`,
        tip: "Lean slightly forward when you make an important point.",
      });
    } else if (leanInPercent > 40) {
      add({
        area: "posture",
        level: "watch",
        title: "Very close to the camera",
        detail: `You were much closer to the camera than at the start ${leanInPercent}% of the time.`,
        tip: "Sit about an arm's length away so your shoulders and hands are in view.",
      });
    }

    if ((handsVisiblePercent as number) < 15) {
      add({
        area: "gestures",
        level: "watch",
        title: "Hands mostly out of view",
        detail: "Your hands were visible for only a small part of your answers.",
        tip: "Sit back a little so your hands show. Open-palm gestures build trust.",
      });
    } else if ((gesturePercent as number) >= 15 && (gesturePercent as number) <= 60) {
      add({ area: "gestures", level: "good", title: "Natural hand gestures", detail: `You used your hands to support your points ${gesturePercent}% of the time.` });
    } else if ((gesturePercent as number) > 60) {
      add({
        area: "gestures",
        level: "watch",
        title: "A lot of hand movement",
        detail: `Your hands were moving ${gesturePercent}% of the time, which can distract from your words.`,
        tip: "Use a gesture to mark a key point, then rest your hands.",
      });
    }
  }

  if (t.faceTouches >= 2) {
    const first = t.moments.find((m) => m.kind === "face-touch");
    add({
      area: "composure",
      level: "issue",
      title: `You touched your face ${t.faceTouches} times`,
      detail: `Face touching is one of the most noticeable nervous habits${first ? `; the first was at ${first.q ? `Q${first.q}, ` : ""}${formatTime(first.t)}` : ""}.`,
      tip: "Rest your hands on the desk or in your lap between gestures.",
    });
  }

  if (headMovement === "high") {
    add({
      area: "composure",
      level: "watch",
      title: "Lots of head movement",
      detail: "Your head was moving a lot while you spoke, which can look restless.",
      tip: "Keep your head steady and let your voice carry the energy.",
    });
  } else if (headMovement === "low" && t.faceTouches < 2 && blinksPerMin <= 35) {
    add({ area: "composure", level: "good", title: "Calm and composed", detail: "Your head stayed steady and you showed few nervous habits." });
  }

  if (smilePercent >= 10) {
    add({ area: "expression", level: "good", title: "Warm, friendly expression", detail: `You smiled ${smilePercent}% of the time.` });
  } else {
    add({
      area: "expression",
      level: "watch",
      title: "Serious expression throughout",
      detail: `You smiled only ${smilePercent}% of the time.`,
      tip: "Smile when you greet the interviewer and when you talk about something you enjoyed.",
    });
  }
  if (frownPercent > 30) {
    add({
      area: "expression",
      level: "watch",
      title: "Tense brow",
      detail: `Your brow was furrowed ${frownPercent}% of the time, which can look stressed.`,
      tip: "Relax your forehead and jaw before each answer.",
    });
  }

  if (facePresencePercent < 80) {
    add({
      area: "composure",
      level: "watch",
      title: "You moved out of frame",
      detail: `Your face was visible only ${facePresencePercent}% of the time.`,
      tip: "Centre yourself in the camera and stay in one position.",
    });
  }

  // Issues first, then things to watch, then strengths
  const order: Record<InsightLevel, number> = { issue: 0, watch: 1, good: 2 };
  insights.sort((a, b) => order[a.level] - order[b.level]);

  return {
    scores: {
      overall,
      eyeContact: Math.round(eyeScore),
      posture: postureScore === null ? null : Math.round(postureScore),
      composure: Math.round(composure),
      engagement,
    },
    stats: {
      durationSec: t.durationSec,
      eyeContactPercent,
      facePresencePercent,
      lookAways: t.lookAways,
      lookAwaysPerMin,
      longestLookAwaySec: t.longestLookAwaySec,
      lookingDownPercent,
      lookingSidePercent,
      blinksPerMin,
      readingDetected,
      gazeShiftsPerMin,
      smilePercent,
      uprightPercent,
      gesturePercent,
      handsVisiblePercent,
      faceTouches: t.faceTouches,
      headMovement,
    },
    insights,
    moments: [...t.moments].sort((a, b) => (a.q || 0) - (b.q || 0) || a.t - b.t),
  };
}

/** One-line summary for the LLM feedback prompt. */
export function summarizeForPrompt(r: BodyLanguageReport): string {
  const s = r.stats;
  const parts = [
    `eye contact ${s.eyeContactPercent}%`,
    `${s.lookAways} look-aways (longest ${s.longestLookAwaySec}s)`,
    s.readingDetected ? "eye movements suggest reading from notes" : "",
    s.lookingDownPercent > 20 ? `looking down ${s.lookingDownPercent}% of the time` : "",
    `${s.blinksPerMin} blinks/min`,
    s.uprightPercent !== null ? `upright posture ${s.uprightPercent}%` : "",
    s.faceTouches > 0 ? `${s.faceTouches} face touches` : "",
    `smiling ${s.smilePercent}%`,
  ].filter(Boolean);
  return `Body language: ${parts.join(", ")}.`;
}
