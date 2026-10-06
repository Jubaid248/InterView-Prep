/**
 * Body Language Analyzer
 *
 * Runs entirely client-side via MediaPipe Face Landmarker.
 * Computes eye-contact proxy (head yaw) and movement score from the nose-tip landmark.
 * No video or raw landmark data is ever sent to the backend.
 *
 * The analyzer manages its own off-screen video element internally — callers do NOT
 * need to pass or manage any video DOM element. Use getStream() to display the feed.
 */

"use client";

import type {
  FaceLandmarker,
  FaceLandmarkerOptions,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export type MovementBucket = "low" | "moderate" | "high";

export interface BodyLanguageMetrics {
  eyeContactPercent: number; // 0–100, % of frames within ±20° head yaw
  movementScore: MovementBucket; // "low" | "moderate" | "high"
}

/** Real-time per-frame result for live overlay feedback in CameraPreview. */
export interface LiveFrame {
  faceDetected: boolean;
  yaw: number;         // head yaw in degrees (negative = left, positive = right)
  eyeContact: boolean; // true if |yaw| ≤ 20°
  noseX: number;       // nose tip X position (0–1)
  noseY: number;       // nose tip Y position (0–1)
}

interface SampleFrame {
  yaw: number;     // head yaw in degrees
  noseX: number;   // nose-tip X (0–1)
  noseY: number;   // nose-tip Y (0–1)
}

// Singleton so we only load the model once per page
let faceLandmarkerInstance: FaceLandmarker | null = null;
let loadPromise: Promise<FaceLandmarker> | null = null;

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

/**
 * Load (or return cached) the MediaPipe Face Landmarker.
 * All processing is done locally in the browser — nothing is sent to any server.
 */
async function loadFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { FaceLandmarker: FL, FilesetResolver } = await import(
      "@mediapipe/tasks-vision"
    );

    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    const options: FaceLandmarkerOptions = {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",
      },
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: true, // needed for head rotation
      runningMode: "VIDEO",
      numFaces: 1,
    };

    const fl = await FL.createFromOptions(filesetResolver, options);
    faceLandmarkerInstance = fl;
    return fl;
  })();

  return loadPromise;
}

// MediaPipe face mesh nose-tip index
const NOSE_TIP_IDX = 4;

/**
 * Extract yaw angle (horizontal head rotation) from the transformation matrix.
 */
function extractYawDegrees(matrix: number[]): number {
  if (!matrix || matrix.length < 16) return 0;
  const r00 = matrix[0];
  const r20 = matrix[8];
  const yaw = Math.atan2(r20, r00) * (180 / Math.PI);
  return yaw;
}

const EYE_CONTACT_YAW_THRESHOLD_DEG = 20;
const MOVEMENT_MODERATE_THRESHOLD = 0.004;
const MOVEMENT_HIGH_THRESHOLD = 0.01;

/**
 * Analyze a batch of sampled video frames.
 * Returns eyeContactPercent and movementScore.
 * This function never transmits any raw video or landmark data.
 */
export function computeBodyLanguageMetrics(frames: SampleFrame[]): BodyLanguageMetrics {
  if (frames.length === 0) {
    return { eyeContactPercent: 0, movementScore: "low" };
  }

  const eyeContactFrames = frames.filter(
    (f) => Math.abs(f.yaw) <= EYE_CONTACT_YAW_THRESHOLD_DEG
  ).length;
  const eyeContactPercent = Math.round((eyeContactFrames / frames.length) * 100);

  let totalDisplacement = 0;
  for (let i = 1; i < frames.length; i++) {
    const dx = frames[i].noseX - frames[i - 1].noseX;
    const dy = frames[i].noseY - frames[i - 1].noseY;
    totalDisplacement += Math.sqrt(dx * dx + dy * dy);
  }
  const avgDisplacement = frames.length > 1 ? totalDisplacement / (frames.length - 1) : 0;

  let movementScore: MovementBucket;
  if (avgDisplacement < MOVEMENT_MODERATE_THRESHOLD) {
    movementScore = "low";
  } else if (avgDisplacement < MOVEMENT_HIGH_THRESHOLD) {
    movementScore = "moderate";
  } else {
    movementScore = "high";
  }

  return { eyeContactPercent, movementScore };
}

/**
 * BodyLanguageAnalyzer manages its own off-screen video element internally.
 * Callers do NOT need to create or pass any video element.
 * Call getStream() to get the MediaStream for display purposes (e.g. CameraPreview).
 * All analysis is local — no video data is ever uploaded.
 */
export class BodyLanguageAnalyzer {
  private videoEl: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private landmarker: FaceLandmarker | null = null;
  private sampledFrames: SampleFrame[] = [];
  private samplingInterval: ReturnType<typeof setInterval> | null = null;
  private lastTimestamp = 0;
  private isRunning = false;

  /**
   * Initialize: requests camera permission, creates an internal off-screen video element,
   * and loads the Face Landmarker model. Throws if camera permission is denied.
   */
  async init(): Promise<void> {
    // Request camera stream (video only — audio captured separately by AudioRecorder)
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      audio: false,
    });

    // Create an off-screen video element. We position it outside the viewport
    // rather than display:none — browsers refuse to play video on hidden elements.
    const video = document.createElement("video");
    video.setAttribute("playsinline", "true");
    video.setAttribute("muted", "true");
    video.muted = true;
    video.autoplay = true;
    // Position off-screen but still "visible" to the browser engine
    video.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;pointer-events:none;opacity:0;";
    document.body.appendChild(video);
    this.videoEl = video;

    video.srcObject = this.stream;

    // Wait for the video to be ready to play
    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) {
        video.play().then(resolve).catch(resolve);
        return;
      }
      video.onloadeddata = () => {
        video.play().then(resolve).catch(resolve);
      };
      // Safety timeout — don't block forever
      setTimeout(resolve, 5000);
    });

    // Load Face Landmarker (cached singleton after first load)
    this.landmarker = await loadFaceLandmarker();
  }

  /** Returns the active MediaStream — use this to display the camera feed in a <video> element. */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Run face detection on the current video frame and return live feedback data.
   * Used by CameraPreview to display real-time eye contact / movement overlays.
   * Returns null if the landmarker is not ready or no face is detected.
   */
  detectLiveFrame(): LiveFrame | null {
    if (!this.videoEl || !this.landmarker) return null;
    if (this.videoEl.readyState < 2) return null;

    const timestamp = performance.now();
    try {
      const result = this.landmarker.detectForVideo(this.videoEl, timestamp);
      if (!result?.faceLandmarks?.length) {
        return { faceDetected: false, yaw: 0, eyeContact: false, noseX: 0.5, noseY: 0.5 };
      }

      const landmarks = result.faceLandmarks[0];
      const noseTip = landmarks[NOSE_TIP_IDX];

      let yaw = 0;
      let hasMatrix = false;
      if (result.facialTransformationMatrixes?.length) {
        const mat = result.facialTransformationMatrixes[0];
        const raw = (mat as any)?.data || mat;
        if (raw && (Array.isArray(raw) || ArrayBuffer.isView(raw))) {
          yaw = extractYawDegrees(Array.from(raw as unknown as number[]));
          hasMatrix = true;
        }
      }

      if (!hasMatrix && landmarks[33] && landmarks[263]) {
        const leftX = landmarks[33].x;
        const rightX = landmarks[263].x;
        const dist = Math.abs(rightX - leftX);
        if (dist > 0.02) {
          const midX = (leftX + rightX) / 2;
          yaw = ((noseTip.x - midX) / (dist / 2)) * 45;
        }
      }

      return {
        faceDetected: true,
        yaw,
        eyeContact: Math.abs(yaw) <= EYE_CONTACT_YAW_THRESHOLD_DEG,
        noseX: noseTip.x,
        noseY: noseTip.y,
      };
    } catch {
      return null;
    }
  }

  /** Start sampling frames. Call when the user begins recording their answer. */
  startSampling(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.sampledFrames = [];
    this.lastTimestamp = 0;

    // ~2 fps — sufficient for head pose estimation without performance impact
    this.samplingInterval = setInterval(() => {
      this.sampleFrame();
    }, 500);
  }

  /** Stop sampling and return computed metrics. Call when the user stops recording. */
  stopSampling(): BodyLanguageMetrics {
    this.isRunning = false;
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }
    return computeBodyLanguageMetrics(this.sampledFrames);
  }

  /** Release all resources: stop stream tracks and remove the internal video element. */
  stop(): void {
    this.isRunning = false;
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
      if (this.videoEl.parentNode) {
        this.videoEl.parentNode.removeChild(this.videoEl);
      }
      this.videoEl = null;
    }
  }

  private sampleFrame(): void {
    if (!this.videoEl || !this.landmarker || !this.isRunning) return;
    if (this.videoEl.readyState < 2) return;

    const timestamp = performance.now();
    if (timestamp === this.lastTimestamp) return;
    this.lastTimestamp = timestamp;

    try {
      const result = this.landmarker.detectForVideo(this.videoEl, timestamp);

      if (
        !result ||
        !result.faceLandmarks ||
        result.faceLandmarks.length === 0
      ) {
        return; // No face detected — skip without penalizing
      }

      const landmarks: NormalizedLandmark[] = result.faceLandmarks[0];
      const noseTip = landmarks[NOSE_TIP_IDX];

      // Extract yaw from facial transformation matrix
      let yaw = 0;
      let hasMatrixYaw = false;
      if (
        result.facialTransformationMatrixes &&
        result.facialTransformationMatrixes.length > 0
      ) {
        const mat = result.facialTransformationMatrixes[0];
        const raw = (mat as any)?.data || mat;
        if (raw && (Array.isArray(raw) || ArrayBuffer.isView(raw))) {
          yaw = extractYawDegrees(Array.from(raw as unknown as number[]));
          hasMatrixYaw = true;
        }
      }

      // Fallback: estimate yaw from eye-nose geometry if matrix unavailable
      if (!hasMatrixYaw && landmarks[33] && landmarks[263] && noseTip) {
        const leftEyeX = landmarks[33].x;
        const rightEyeX = landmarks[263].x;
        const eyeDist = Math.abs(rightEyeX - leftEyeX);
        if (eyeDist > 0.02) {
          const eyeMidX = (leftEyeX + rightEyeX) / 2;
          const ratio = (noseTip.x - eyeMidX) / (eyeDist / 2);
          yaw = ratio * 45;
        }
      }

      this.sampledFrames.push({
        yaw,
        noseX: noseTip.x,
        noseY: noseTip.y,
      });
    } catch (err) {
      // Silently skip frames with errors (e.g., GPU context loss)
      console.warn("[BodyLanguageAnalyzer] Frame sampling error:", err);
    }
  }
}
