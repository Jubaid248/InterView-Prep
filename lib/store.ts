/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import dbConnect from "./db";
import InterviewSession, { IInterviewSession } from "./models/InterviewSession";
import Answer, { IAnswer } from "./models/Answer";
import FeedbackReport, { IFeedbackReport } from "./models/FeedbackReport";

interface GlobalMemoryStore {
  sessions: Map<string, any>;
  answers: any[];
  reports: Map<string, any>;
}

declare global {
  // eslint-disable-next-line no-var
  var memoryStoreCache: GlobalMemoryStore | undefined;
}

const memoryStore: GlobalMemoryStore = global.memoryStoreCache ?? {
  sessions: new Map<string, any>(),
  answers: [],
  reports: new Map<string, any>(),
};

if (!global.memoryStoreCache) {
  global.memoryStoreCache = memoryStore;
}

const memorySessions = memoryStore.sessions;
const memoryAnswers = memoryStore.answers;
const memoryReports = memoryStore.reports;

let isMongoAvailable: boolean | null = null;

async function checkMongoConnection(): Promise<boolean> {
  if (isMongoAvailable !== null) return isMongoAvailable;
  try {
    await dbConnect();
    isMongoAvailable = true;
    console.log("✅ [DB] Connected to MongoDB database successfully.");
    return true;
  } catch (err) {
    isMongoAvailable = false;
    console.warn(
      "⚠️ [DB] MongoDB not running locally. Using fast in-memory session store."
    );
    return false;
  }
}

export async function createInterviewSession(data: {
  sessionId: string;
  jobDescription: string;
  resumeText: string;
  questions: string[];
  questionDetails?: any[];
  track?: string;
}): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await InterviewSession.create({
      track: "mock-interview",
      ...data,
      status: "in_progress",
      currentQuestionIndex: 0,
      awaitingFollowUp: false,
    });
  } else {
    const session = {
      track: "mock-interview",
      ...data,
      status: "in_progress",
      currentQuestionIndex: 0,
      awaitingFollowUp: false,
      createdAt: new Date(),
    };
    memorySessions.set(data.sessionId, session);
    return session;
  }
}

export async function getInterviewSession(sessionId: string): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await InterviewSession.findOne({ sessionId });
  } else {
    return memorySessions.get(sessionId) || null;
  }
}

export async function updateInterviewSession(
  sessionId: string,
  updates: Partial<IInterviewSession>
): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await InterviewSession.findOneAndUpdate({ sessionId }, updates, {
      new: true,
    });
  } else {
    const session = memorySessions.get(sessionId);
    if (!session) return null;
    Object.assign(session, updates);
    memorySessions.set(sessionId, session);
    return session;
  }
}

export async function createAnswerRecord(data: {
  sessionId: string;
  questionIndex: number;
  questionText: string;
  answerTranscript: string;
  audioBase64: string;
  audioDuration: number;
  followUpText?: string | null;
  followUpTranscript?: string | null;
  followUpAudioBase64?: string | null;
  followUpAudioDuration?: number | null;
  eyeContactPercent?: number | null;
  movementScore?: "low" | "moderate" | "high" | null;
}): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await Answer.create(data);
  } else {
    const answer = {
      ...data,
      followUpText: data.followUpText || null,
      followUpTranscript: data.followUpTranscript || null,
      followUpAudioBase64: data.followUpAudioBase64 || null,
      followUpAudioDuration: data.followUpAudioDuration || null,
      eyeContactPercent: data.eyeContactPercent ?? null,
      movementScore: data.movementScore ?? null,
      createdAt: new Date(),
    };
    memoryAnswers.push(answer);
    return answer;
  }
}

export async function findAnswerRecord(
  sessionId: string,
  questionIndex: number
): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await Answer.findOne({ sessionId, questionIndex });
  } else {
    return (
      memoryAnswers.find(
        (a) => a.sessionId === sessionId && a.questionIndex === questionIndex
      ) || null
    );
  }
}

export async function updateAnswerRecord(
  sessionId: string,
  questionIndex: number,
  updates: Partial<IAnswer>
): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    const answer = await Answer.findOne({ sessionId, questionIndex });
    if (answer) {
      Object.assign(answer, updates);
      await answer.save();
    }
    return answer;
  } else {
    const answer = memoryAnswers.find(
      (a) => a.sessionId === sessionId && a.questionIndex === questionIndex
    );
    if (answer) {
      Object.assign(answer, updates);
    }
    return answer;
  }
}

export async function getAnswersForSession(sessionId: string): Promise<any[]> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await Answer.find({ sessionId }).sort({ questionIndex: 1 });
  } else {
    return memoryAnswers
      .filter((a) => a.sessionId === sessionId)
      .sort((a, b) => a.questionIndex - b.questionIndex);
  }
}

export async function saveFeedbackReport(
  sessionId: string,
  reportData: any
): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await FeedbackReport.findOneAndUpdate({ sessionId }, reportData, {
      upsert: true,
      new: true,
    });
  } else {
    const report = {
      sessionId,
      ...reportData,
      createdAt: new Date(),
    };
    memoryReports.set(sessionId, report);
    return report;
  }
}

export async function getFeedbackReport(sessionId: string): Promise<any> {
  const useMongo = await checkMongoConnection();
  if (useMongo) {
    return await FeedbackReport.findOne({ sessionId });
  } else {
    return memoryReports.get(sessionId) || null;
  }
}
