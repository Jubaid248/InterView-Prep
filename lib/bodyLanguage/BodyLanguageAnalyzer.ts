/**
 * Body Language Analyzer
 *
 * Runs entirely client-side with MediaPipe:
 *  - Face Landmarker (with iris landmarks and blendshapes) for eye gaze, blinks,
 *    head pose and facial expression
 *  - Pose Landmarker (lite) for posture, hand gestures and face touching
 *
 * One 15 fps loop analyses the camera continuously. It powers the live overlay
 * and, while an answer is being recorded, feeds a TallyBuilder. Gaze is judged
 * relative to a calibration taken in the first seconds (the candidate looking at
 * the screen), so camera placement doesn't skew results.
 *
 * No video or landmark data is ever sent anywhere; only summary counts leave the browser.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { FaceLandmarker, PoseLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { TallyBuilder, type BodyLanguageTally, type GazeState, type PoseSample } from "@/lib/bodyLanguage/metrics";

export type MovementBucket = "low" | "moderate" | "high";
export type PostureState = "upright" | "slouch" | "tilt" | "lean-in" | "lean-back";

export interface BodyLanguageMetrics {
  eyeContactPercent: number;
  movementScore: MovementBucket;
  /** Full per-answer tally (eye movements, posture, gestures, timed moments). */
  details: BodyLanguageTally | null;
}

/** Latest analysed frame, for the live overlay in CameraPreview. */
export interface LiveFrame {
  faceDetected: boolean;
  calibrated: boolean;
  gaze: GazeState;
  eyeContact: boolean;
  posture: PostureState | null;
  handsVisible: boolean | null;
  faceTouch: boolean;
  /** Iris centres and eye corners in normalised video coordinates, for drawing. */
  irises: { x: number; y: number }[];
  eyeCorners: { x: number; y: number }[];
  noseX: number;
  noseY: number;
  /** Head yaw relative to calibration, degrees. */
  yaw: number;
}

const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

const TICK_MS = 66; // ~15 fps for face and eyes
const POSE_EVERY = 3; // pose at ~5 fps

// Face mesh indices
const NOSE_TIP = 4;
const CHIN = 152;
const R_EYE_OUTER = 33;
const R_EYE_INNER = 133;
const L_EYE_INNER = 362;
const L_EYE_OUTER = 263;
const R_IRIS = 468;
const L_IRIS = 473;

// Pose indices
const P_NOSE = 0;
const P_L_SHOULDER = 11;
const P_R_SHOULDER = 12;
const P_HAND_POINTS = [15, 16, 19, 20]; // wrists and index fingers

// Gaze thresholds, relative to calibration
const SIDE_YAW_DEG = 18;
const SIDE_IRIS = 0.11;
const PITCH_RATIO = 0.07;
const EYES_DOWN = 0.28;
const EYES_UP = 0.3;
const BLINK_CLOSED = 0.5;
// Posture thresholds, relative to calibration
const TILT_DEG = 7;
const SLOUCH_RATIO = 0.8;
const LEAN_IN_RATIO = 1.18;
const LEAN_BACK_RATIO = 0.85;
const GESTURE_MOVE = 0.025;

const CALIBRATION_FRAMES = 30;
const POSE_CALIBRATION_FRAMES = 10;

let facePromise: Promise<FaceLandmarker> | null = null;
let posePromise: Promise<PoseLandmarker | null> | null = null;

async function createWithFallback<T>(create: (delegate: "GPU" | "CPU") => Promise<T>): Promise<T> {
  try {
    return await create("GPU");
  } catch {
    return await create("CPU");
  }
}

function loadFaceLandmarker(): Promise<FaceLandmarker> {
  facePromise ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
    return createWithFallback((delegate) =>
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      })
    );
  })();
  return facePromise;
}

// Pose is optional: if it fails to load, eye tracking still works
function loadPoseLandmarker(): Promise<PoseLandmarker | null> {
  posePromise ??= (async () => {
    try {
      const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return await createWithFallback((delegate) =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
        })
      );
    } catch (err) {
      console.warn("[BodyLanguageAnalyzer] Pose model unavailable, posture tracking disabled:", err);
      return null;
    }
  })();
  return posePromise;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

function yawFromMatrix(result: any): number | null {
  const mat = result.facialTransformationMatrixes?.[0];
  const raw = mat?.data || mat;
  if (!raw || !(Array.isArray(raw) || ArrayBuffer.isView(raw))) return null;
  const m = Array.from(raw as ArrayLike<number>);
  if (m.length < 16) return null;
  return Math.atan2(m[8], m[0]) * (180 / Math.PI);
}

function blendshapeMap(result: any): Record<string, number> {
  const cats = result.faceBlendshapes?.[0]?.categories || [];
  const map: Record<string, number> = {};
  for (const c of cats) map[c.categoryName] = c.score;
  return map;
}

/** Iris position across the eye opening: 0 = image-left corner, 1 = image-right corner. */
function irisRatio(iris: NormalizedLandmark, a: NormalizedLandmark, b: NormalizedLandmark): number {
  const left = Math.min(a.x, b.x);
  const width = Math.abs(a.x - b.x);
  return width > 1e-4 ? (iris.x - left) / width : 0.5;
}

interface FaceFeatures {
  yaw: number;
  noseRatio: number;
  gazeH: number;
  gazeV: number;
  lookDown: number;
  blink: number;
  smile: number;
  frown: number;
  nose: { x: number; y: number };
  iod: number;
  box: { minX: number; maxX: number; minY: number; maxY: number };
  irises: { x: number; y: number }[];
  eyeCorners: { x: number; y: number }[];
}

function extractFace(result: any): FaceFeatures | null {
  const lm: NormalizedLandmark[] | undefined = result?.faceLandmarks?.[0];
  if (!lm || lm.length < 474) return null;
  const bs = blendshapeMap(result);
  const g = (k: string) => bs[k] ?? 0;

  const nose = lm[NOSE_TIP];
  const eyeMidY = (lm[R_EYE_OUTER].y + lm[L_EYE_OUTER].y) / 2;
  const chinDist = lm[CHIN].y - eyeMidY;
  const noseRatio = chinDist > 1e-4 ? (nose.y - eyeMidY) / chinDist : 0.4;

  const gazeH =
    (irisRatio(lm[R_IRIS], lm[R_EYE_OUTER], lm[R_EYE_INNER]) + irisRatio(lm[L_IRIS], lm[L_EYE_INNER], lm[L_EYE_OUTER])) / 2;
  const lookDown = (g("eyeLookDownLeft") + g("eyeLookDownRight")) / 2;
  const lookUp = (g("eyeLookUpLeft") + g("eyeLookUpRight")) / 2;

  let yaw = yawFromMatrix(result);
  if (yaw === null) {
    // Fallback: nose offset between the outer eye corners
    const midX = (lm[R_EYE_OUTER].x + lm[L_EYE_OUTER].x) / 2;
    const half = Math.abs(lm[L_EYE_OUTER].x - lm[R_EYE_OUTER].x) / 2;
    yaw = half > 0.01 ? ((nose.x - midX) / half) * 45 : 0;
  }

  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const p of lm) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  return {
    yaw,
    noseRatio,
    gazeH,
    gazeV: lookUp - lookDown,
    lookDown,
    blink: (g("eyeBlinkLeft") + g("eyeBlinkRight")) / 2,
    smile: (g("mouthSmileLeft") + g("mouthSmileRight")) / 2,
    frown: (g("browDownLeft") + g("browDownRight")) / 2,
    nose: { x: nose.x, y: nose.y },
    iod: Math.hypot(lm[L_IRIS].x - lm[R_IRIS].x, lm[L_IRIS].y - lm[R_IRIS].y),
    box: { minX, maxX, minY, maxY },
    irises: [lm[R_IRIS], lm[L_IRIS]].map((p) => ({ x: p.x, y: p.y })),
    eyeCorners: [R_EYE_OUTER, R_EYE_INNER, L_EYE_INNER, L_EYE_OUTER].map((i) => ({ x: lm[i].x, y: lm[i].y })),
  };
}

export class BodyLanguageAnalyzer {
  private videoEl: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private face: FaceLandmarker | null = null;
  private pose: PoseLandmarker | null = null;
  private loop: ReturnType<typeof setInterval> | null = null;
  private tick = 0;
  private lastFaceTs = 0;
  private lastPoseTs = 0;

  // Calibration: the candidate's neutral "looking at the screen" position
  private calib = { yaw: [] as number[], noseRatio: [] as number[], gazeH: [] as number[], gazeV: [] as number[] };
  private base: { yaw: number; noseRatio: number; gazeH: number; gazeV: number } | null = null;
  private poseCalib = { neck: [] as number[], width: [] as number[] };
  private poseBase: { neck: number; width: number } | null = null;

  private lastNose: { x: number; y: number } | null = null;
  private lastWrists: ({ x: number; y: number } | null)[] = [null, null];
  private lastFaceBox: FaceFeatures["box"] | null = null;
  private latestPose: PoseSample | null = null;
  private live: LiveFrame | null = null;

  private recorder: TallyBuilder | null = null;
  private recordStart = 0;

  /** Requests the camera, loads the models and starts the analysis loop. */
  async init(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      audio: false,
    });

    // Off-screen but "visible" to the browser engine; display:none would stop playback
    const video = document.createElement("video");
    video.setAttribute("playsinline", "true");
    video.muted = true;
    video.autoplay = true;
    video.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;pointer-events:none;opacity:0;";
    document.body.appendChild(video);
    video.srcObject = this.stream;
    this.videoEl = video;

    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) return void video.play().then(resolve).catch(resolve);
      video.onloadeddata = () => void video.play().then(resolve).catch(resolve);
      setTimeout(resolve, 5000);
    });

    const [face, pose] = await Promise.all([loadFaceLandmarker(), loadPoseLandmarker()]);
    this.face = face;
    this.pose = pose;
    this.loop = setInterval(() => this.step(), TICK_MS);
    // Dev only: lets the raw signals be inspected from the console while tuning thresholds
    if (process.env.NODE_ENV !== "production") (window as any).__bodyLanguage = this;
  }

  /** Dev/tuning: raw features of the latest frame and the calibration baseline. */
  debug: { features: Omit<FaceFeatures, "box" | "irises" | "eyeCorners"> | null; base: unknown; poseBase: unknown } = {
    features: null,
    base: null,
    poseBase: null,
  };

  getStream(): MediaStream | null {
    return this.stream;
  }

  /** Latest analysed frame for the live overlay (no extra detection work). */
  getLiveFrame(): LiveFrame | null {
    return this.live;
  }

  /** @deprecated Use getLiveFrame(); kept so older callers keep working. */
  detectLiveFrame(): LiveFrame | null {
    return this.live;
  }

  isCalibrated(): boolean {
    return this.base !== null;
  }

  /** Start recording metrics for an answer. */
  startSampling(): void {
    this.recorder = new TallyBuilder();
    this.recordStart = performance.now();
  }

  /** Stop recording and return the answer's metrics. */
  stopSampling(): BodyLanguageMetrics {
    const tally = this.recorder?.finish() ?? null;
    this.recorder = null;
    if (!tally || tally.samples === 0) return { eyeContactPercent: 0, movementScore: "low", details: null };

    const open = Math.max(1, tally.faceFrames - tally.closedFrames);
    const avgMove = tally.faceFrames ? tally.moveSum / tally.faceFrames : 0;
    return {
      eyeContactPercent: Math.round((tally.contactFrames / open) * 100),
      movementScore: avgMove < 0.025 ? "low" : avgMove < 0.06 ? "moderate" : "high",
      details: tally,
    };
  }

  stop(): void {
    if (this.loop) clearInterval(this.loop);
    this.loop = null;
    this.recorder = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl.remove();
      this.videoEl = null;
    }
  }

  private step(): void {
    const video = this.videoEl;
    if (!video || !this.face || video.readyState < 2) return;
    this.tick++;

    const now = performance.now();
    if (this.tick % POSE_EVERY === 0) this.runPose(video, now);

    let result: any;
    try {
      const ts = Math.max(now, this.lastFaceTs + 1);
      this.lastFaceTs = ts;
      result = this.face.detectForVideo(video, ts);
    } catch (err) {
      console.warn("[BodyLanguageAnalyzer] Face detection error:", err);
      return;
    }

    const f = extractFace(result);
    const t = (now - this.recordStart) / 1000;

    if (!f) {
      this.lastNose = null;
      this.lastFaceBox = null;
      this.live = {
        faceDetected: false,
        calibrated: this.base !== null,
        gaze: "absent",
        eyeContact: false,
        posture: this.postureState(),
        handsVisible: this.latestPose?.handsVisible ?? null,
        faceTouch: false,
        irises: [],
        eyeCorners: [],
        noseX: 0.5,
        noseY: 0.5,
        yaw: 0,
      };
      this.recorder?.add({ t, gaze: "absent", gazeH: 0, blink: 0, headMove: 0, smile: 0, frown: 0, pose: this.takePose() });
      return;
    }

    this.lastFaceBox = f.box;
    this.calibrate(f);
    this.debug = {
      features: { yaw: f.yaw, noseRatio: f.noseRatio, gazeH: f.gazeH, gazeV: f.gazeV, lookDown: f.lookDown, blink: f.blink, smile: f.smile, frown: f.frown, nose: f.nose, iod: f.iod },
      base: this.base,
      poseBase: this.poseBase,
    };
    const gaze = this.classifyGaze(f);
    const headMove = this.lastNose && f.iod > 0 ? Math.hypot(f.nose.x - this.lastNose.x, f.nose.y - this.lastNose.y) / f.iod : 0;
    this.lastNose = f.nose;
    const yawDev = f.yaw - (this.base?.yaw ?? 0);

    this.live = {
      faceDetected: true,
      calibrated: this.base !== null,
      gaze,
      eyeContact: gaze === "contact" || gaze === "closed",
      posture: this.postureState(),
      handsVisible: this.latestPose?.handsVisible ?? null,
      faceTouch: this.latestPose?.faceTouch ?? false,
      irises: f.irises,
      eyeCorners: f.eyeCorners,
      noseX: f.nose.x,
      noseY: f.nose.y,
      yaw: yawDev,
    };

    this.recorder?.add({
      t,
      gaze,
      gazeH: f.gazeH - (this.base?.gazeH ?? 0.5),
      blink: f.blink,
      headMove,
      smile: f.smile,
      frown: f.frown,
      pose: this.takePose(),
    });
  }

  private calibrate(f: FaceFeatures): void {
    if (this.base || f.blink > 0.4 || Math.abs(f.yaw) > 25 || f.lookDown > 0.45) return;
    const c = this.calib;
    c.yaw.push(f.yaw);
    c.noseRatio.push(f.noseRatio);
    c.gazeH.push(f.gazeH);
    c.gazeV.push(f.gazeV);
    if (c.yaw.length >= CALIBRATION_FRAMES) {
      this.base = { yaw: median(c.yaw), noseRatio: median(c.noseRatio), gazeH: median(c.gazeH), gazeV: median(c.gazeV) };
    }
  }

  private classifyGaze(f: FaceFeatures): GazeState {
    const base = this.base ?? { yaw: 0, noseRatio: f.noseRatio, gazeH: 0.5, gazeV: 0 };
    const pitch = f.noseRatio - base.noseRatio; // positive = head tipped down
    const eyesV = f.gazeV - base.gazeV; // negative = eyes looking down

    const lookingDown = pitch > PITCH_RATIO || eyesV < -EYES_DOWN;
    // Lowered eyelids when looking down register as a half-blink; don't call that "closed"
    if (f.blink >= BLINK_CLOSED && !(lookingDown && f.lookDown > 0.4)) return "closed";
    if (lookingDown) return "down";
    if (pitch < -PITCH_RATIO || eyesV > EYES_UP) return "up";
    if (Math.abs(f.yaw - base.yaw) > SIDE_YAW_DEG || Math.abs(f.gazeH - base.gazeH) > SIDE_IRIS) return "side";
    return "contact";
  }

  private runPose(video: HTMLVideoElement, now: number): void {
    if (!this.pose) return;
    let lm: NormalizedLandmark[] | undefined;
    try {
      const ts = Math.max(now, this.lastPoseTs + 1);
      this.lastPoseTs = ts;
      lm = this.pose.detectForVideo(video, ts)?.landmarks?.[0];
    } catch {
      return;
    }
    const vis = (p?: NormalizedLandmark) => (p?.visibility ?? 0) > 0.6;
    if (!lm || !vis(lm[P_L_SHOULDER]) || !vis(lm[P_R_SHOULDER])) {
      this.latestPose = null;
      return;
    }

    const ls = lm[P_L_SHOULDER];
    const rs = lm[P_R_SHOULDER];
    const width = Math.abs(ls.x - rs.x);
    if (width < 0.05) {
      this.latestPose = null;
      return;
    }
    const tiltDeg = Math.abs(Math.atan2(ls.y - rs.y, Math.abs(ls.x - rs.x)) * (180 / Math.PI));
    const neck = ((ls.y + rs.y) / 2 - lm[P_NOSE].y) / width;

    if (!this.poseBase && tiltDeg < TILT_DEG) {
      this.poseCalib.neck.push(neck);
      this.poseCalib.width.push(width);
      if (this.poseCalib.neck.length >= POSE_CALIBRATION_FRAMES) {
        this.poseBase = { neck: median(this.poseCalib.neck), width: median(this.poseCalib.width) };
      }
    }

    const widthRatio = this.poseBase ? width / this.poseBase.width : 1;
    const leanIn = widthRatio > LEAN_IN_RATIO;
    const leanBack = widthRatio < LEAN_BACK_RATIO;
    const slouch = !!this.poseBase && !leanIn && neck < this.poseBase.neck * SLOUCH_RATIO;
    const tilt = tiltDeg > TILT_DEG;

    // Hands: wrists in view, moving between samples = gesturing, inside the face box = touching
    const wrists = [lm[15], lm[16]].map((p) => (p && (p.visibility ?? 0) > 0.5 && p.y < 1 ? { x: p.x, y: p.y } : null));
    const handsVisible = wrists.some(Boolean);
    const gesturing = wrists.some((w, i) => {
      const prev = this.lastWrists[i];
      return !!w && !!prev && Math.hypot(w.x - prev.x, w.y - prev.y) > GESTURE_MOVE;
    });
    this.lastWrists = wrists;

    let faceTouch = false;
    const box = this.lastFaceBox;
    if (box) {
      const padX = (box.maxX - box.minX) * 0.2;
      const padY = (box.maxY - box.minY) * 0.2;
      faceTouch = P_HAND_POINTS.some((i) => {
        const p = lm![i];
        return (
          p &&
          (p.visibility ?? 0) > 0.5 &&
          p.x > box.minX - padX &&
          p.x < box.maxX + padX &&
          p.y > box.minY - padY &&
          p.y < box.maxY + padY
        );
      });
    }

    this.latestPose = { upright: !slouch && !tilt, slouch, tilt, leanIn, leanBack, handsVisible, gesturing, faceTouch };
    this.poseFresh = true;
  }

  private poseFresh = false;

  /** Hands the newest pose sample to the recorder once, so pose frames aren't double-counted. */
  private takePose(): PoseSample | null {
    if (!this.poseFresh) return null;
    this.poseFresh = false;
    return this.latestPose;
  }

  private postureState(): PostureState | null {
    const p = this.latestPose;
    if (!p) return null;
    if (p.slouch) return "slouch";
    if (p.leanIn) return "lean-in";
    if (p.leanBack) return "lean-back";
    if (p.tilt) return "tilt";
    return "upright";
  }
}
