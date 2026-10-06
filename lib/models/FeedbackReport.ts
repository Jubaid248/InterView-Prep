import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPerAnswerFeedback {
  questionText: string;
  answerTranscript: string;
  followUpText: string | null;
  followUpTranscript: string | null;
  starAnalysis?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  structureScore?: number;
  relevanceScore: number;
  relevanceNotes?: string;
  whatWorked?: string;
  whatToImprove?: string;
  rewrittenExample?: string;
  fillerWordCount: number;
  fillerWords?: { word: string; position: number }[];
  speakingPace: number;
  suggestions?: string[];
  // Body language signals (optional — only set when camera was enabled)
  eyeContactPercent?: number | null;
  movementScore?: "low" | "moderate" | "high" | null;
  // IELTS Speaking criteria (1.0 - 9.0 band scale)
  fluencyCoherence?: number;
  lexicalResource?: number;
  grammaticalRange?: number;
  pronunciation?: number;
  overallBand?: number;
}

export interface IFeedbackReport extends Document {
  sessionId: string;
  perAnswerFeedback: IPerAnswerFeedback[];
  fillerWordCount: number;
  totalFillerWordCount: number;
  avgPace: number;
  overallSummary: string;
  overallBand?: number;
  avgEyeContactPercent?: number | null;
  overallMovementScore?: "low" | "moderate" | "high" | null;
  createdAt: Date;
}

const PerAnswerFeedbackSchema = new Schema<IPerAnswerFeedback>(
  {
    questionText: { type: String, required: true },
    answerTranscript: { type: String, required: true },
    followUpText: { type: String, default: null },
    followUpTranscript: { type: String, default: null },
    starAnalysis: {
      situation: { type: String, default: "" },
      task: { type: String, default: "" },
      action: { type: String, default: "" },
      result: { type: String, default: "" },
    },
    structureScore: { type: Number, default: 0 },
    relevanceScore: { type: Number, default: 0 },
    relevanceNotes: { type: String, default: "" },
    whatWorked: { type: String, default: "" },
    whatToImprove: { type: String, default: "" },
    rewrittenExample: { type: String, default: "" },
    fillerWordCount: { type: Number, default: 0 },
    fillerWords: [
      {
        word: { type: String },
        position: { type: Number },
      },
    ],
    speakingPace: { type: Number, default: 0 },
    suggestions: { type: [String], default: [] },
    eyeContactPercent: { type: Number, default: null },
    movementScore: { type: String, enum: ["low", "moderate", "high", null], default: null },
    fluencyCoherence: { type: Number },
    lexicalResource: { type: Number },
    grammaticalRange: { type: Number },
    pronunciation: { type: Number },
    overallBand: { type: Number },
  },
  { _id: false }
);

const FeedbackReportSchema = new Schema<IFeedbackReport>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    perAnswerFeedback: { type: [PerAnswerFeedbackSchema], default: [] },
    fillerWordCount: { type: Number, default: 0 },
    totalFillerWordCount: { type: Number, default: 0 },
    avgPace: { type: Number, default: 0 },
    overallSummary: { type: String, default: "" },
    overallBand: { type: Number },
    avgEyeContactPercent: { type: Number, default: null },
    overallMovementScore: { type: String, enum: ["low", "moderate", "high", null], default: null },
  },
  { timestamps: true }
);

const FeedbackReport: Model<IFeedbackReport> =
  mongoose.models.FeedbackReport ||
  mongoose.model<IFeedbackReport>("FeedbackReport", FeedbackReportSchema);

export default FeedbackReport;
