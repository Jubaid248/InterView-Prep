import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnswer extends Document {
  sessionId: string;
  questionIndex: number;
  questionText: string;
  answerTranscript: string;
  audioBase64: string;
  audioDuration: number;
  followUpText: string | null;
  followUpTranscript: string | null;
  followUpAudioBase64: string | null;
  followUpAudioDuration: number | null;
  // Body language signals (optional — only set when camera was enabled)
  eyeContactPercent?: number | null;
  movementScore?: "low" | "moderate" | "high" | null;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    sessionId: { type: String, required: true, index: true },
    questionIndex: { type: Number, required: true },
    questionText: { type: String, required: true },
    answerTranscript: { type: String, required: true },
    audioBase64: { type: String, required: true },
    audioDuration: { type: Number, required: true },
    followUpText: { type: String, default: null },
    followUpTranscript: { type: String, default: null },
    followUpAudioBase64: { type: String, default: null },
    followUpAudioDuration: { type: Number, default: null },
    // Body language signals (optional)
    eyeContactPercent: { type: Number, default: null },
    movementScore: { type: String, enum: ["low", "moderate", "high", null], default: null },
  },
  { timestamps: true }
);

AnswerSchema.index({ sessionId: 1, questionIndex: 1 });

const Answer: Model<IAnswer> =
  mongoose.models.Answer ||
  mongoose.model<IAnswer>("Answer", AnswerSchema);

export default Answer;
