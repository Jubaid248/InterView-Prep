/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewSession extends Document {
  sessionId: string;
  jobDescription: string;
  resumeText: string;
  questions: string[];
  questionDetails?: any[];
  track: string;
  status: "in_progress" | "completed";
  currentQuestionIndex: number;
  awaitingFollowUp: boolean;
  createdAt: Date;
}

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, required: true },
    questions: { type: [String], required: true },
    questionDetails: { type: Schema.Types.Mixed, default: [] },
    track: { type: String, default: "mock-interview" },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    currentQuestionIndex: { type: Number, default: 0 },
    awaitingFollowUp: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InterviewSession: Model<IInterviewSession> =
  mongoose.models.InterviewSession ||
  mongoose.model<IInterviewSession>("InterviewSession", InterviewSessionSchema);

export default InterviewSession;
