/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Track-agnostic Groq LLM integration for interview question, follow-up, and feedback report generation.
 */

import { saveFeedbackReport } from "@/lib/store";
import {
  BANNED_TOPIC_PATTERN,
  FOLLOW_UP_RULES,
  INTERVIEW_BLUEPRINT,
  INTERVIEWER_RULES,
  buildGreeting,
  buildQuestionPlanSystemPrompt,
  pickIntroAngle,
  type QuestionDetail,
} from "@/lib/ai/interviewerRules";
import { FOLLOW_UP_PROMPTS, buildScriptedFollowUpMessage } from "@/lib/ai/trackRules";
import {
  mergeTallies,
  scoreBodyLanguage,
  summarizeForPrompt,
  type BodyLanguageTally,
} from "@/lib/bodyLanguage/metrics";

export interface TrackPromptTemplate {
  systemPrompt?: string;
  systemPromptFollowUp: string;
  feedbackSystemPrompt: string;
}

export const promptTemplates: Record<string, TrackPromptTemplate> = {
  "mock-interview": {
    systemPrompt: buildQuestionPlanSystemPrompt(),
    systemPromptFollowUp: `${INTERVIEWER_RULES}\n\n${FOLLOW_UP_RULES}`,
    feedbackSystemPrompt:
      "You are an expert technical interviewer and executive career coach. Evaluate the interview transcript against the candidate's resume and job description. Each question lists the competency it assessed and the signals of a strong answer (Look for). For each answer: 1) evaluate structure using the STAR method (Situation, Task, Action, Result), except for questions marked easy (the opening introduction and background questions): judge those on a clear, confident and concise self-presentation, do not mark them down for missing STAR, and leave their starAnalysis fields empty; 2) assign a structureScore (0-100) and relevanceScore (0-100), where relevance reflects how well the answer demonstrated the target competency; 3) provide honest, specific feedback on what worked well and what needs improvement, naming which Look for signals were present and which were missing (avoid generic praise); 4) provide a rewritten example answer anchored directly in the candidate's actual spoken response (not a generic template). Output a valid JSON object with a 'perAnswerFeedback' array and an 'overallSummary' string.",
  },
  "communication-builder": {
    systemPromptFollowUp: FOLLOW_UP_PROMPTS["method-probe"],
    feedbackSystemPrompt:
      "You are an expert communication and public speaking coach. Each prompt in the transcript names the speaking method it practiced. The ARE method (Anchor, Reveal, Encourage) is small talk: judge whether the user anchored to the shared moment, revealed something genuine about themselves, encouraged the other person with an open question, and sounded warm and natural rather than scripted. For the other methods (STAR, CAR, SEE, PAR, PREP, Past-Present-Future), judge how clearly each step of that method came through. For each answer: 1) structureScore (0-100) for how well the method's steps were used; 2) relevanceScore (0-100) for how directly, concisely and naturally the answer fit the prompt or conversation; 3) honest, actionable whatWorked and whatToImprove, naming any missing step (avoid generic praise); 4) a rewrittenExample anchored in what the user actually said, using the method properly. Output a valid JSON object containing a 'perAnswerFeedback' array (with structureScore, relevanceScore, whatWorked, whatToImprove, rewrittenExample) and an 'overallSummary' string.",
  },
  "debate-practice": {
    systemPromptFollowUp: FOLLOW_UP_PROMPTS["debate-rebuttal"],
    feedbackSystemPrompt:
      "You are an experienced debate coach and adjudicator. The user argued an assigned side of a motion against Tota in three rounds: an opening statement (then answered Tota's rebuttal), an evidence round (then answered Tota's cross-examination question), and a closing statement. For each round: 1) structureScore (0-100) for argument structure: a clear assertion, reasoning, evidence and impact (for the closing: naming the clash, weighing, and a clear finish); 2) relevanceScore (0-100) for persuasiveness and responsiveness: did they stay on their side, directly answer Tota's rebuttal or question, and avoid unsupported claims; 3) honest whatWorked and whatToImprove that reference their actual words and name logical gaps or missing evidence; 4) a rewrittenExample: a stronger version of their own argument, not a new one. In overallSummary, state whether the user won the debate on the strength of their arguments and the single most important thing to practice next. Output a valid JSON object with a 'perAnswerFeedback' array and an 'overallSummary' string.",
  },
  "negotiation-practice": {
    systemPromptFollowUp: FOLLOW_UP_PROMPTS["negotiation-counterpart"],
    feedbackSystemPrompt:
      "You are an expert negotiation coach. The user role-played a negotiation against Tota playing the counterpart, over four rounds: opening, handling an objection, responding to a conditional offer under pressure, and closing. The context includes the user's private goal and walk-away point, and the counterpart's hidden interests and real flexibility. For each round: 1) structureScore (0-100) for negotiation technique: building rapport, anchoring ambitiously with a justification, asking open questions to uncover interests, labelling the other side's concerns, trading concessions with if-then offers instead of giving them away, resisting pressure tactics, and summarising terms clearly at the close; 2) relevanceScore (0-100) for outcome and relationship: did they move toward their goal, stay above their walk-away, and keep a collaborative tone; 3) honest whatWorked and whatToImprove that reference their actual words and name specific techniques they used or missed; 4) a rewrittenExample: a stronger version of what they said in that round. In overallSummary, estimate the deal they reached compared with their goal and walk-away, say whether they left value on the table (mention any of the counterpart's flexibility or interests they never discovered), and name the single most important technique to practice next. Output a valid JSON object with a 'perAnswerFeedback' array and an 'overallSummary' string.",
  },
  "ielts-speaking": {
    systemPromptFollowUp:
      "You are an official IELTS Speaking examiner conducting Part 3 (Two-way Discussion). Based on the candidate's Part 2 Cue Card topic and their spoken responses so far, generate ONE Part 3 discussion question. Part 3 questions MUST be abstract, analytical, and broader in scope than Part 1 or Part 2 (focusing on societal trends, opinions, comparisons, future predictions, or causes and effects related to the cue card topic). Do NOT ask personal questions about the candidate's own life. Return ONLY the text of the discussion question.",
    feedbackSystemPrompt:
      "You are an expert IELTS Speaking coach evaluating a candidate's full 3-part speaking test transcript. CRITICAL: This is an uncertified practice estimate only — NEVER claim or imply that this is an official or certified IELTS score. Evaluate each response using the 4 official IELTS criteria on a 1.0 - 9.0 band scale (half bands like 5.5, 6.0, 6.5, 7.0 allowed): 1) Fluency & Coherence (fluencyCoherence) — use filler-word counts and speaking pace WPM as supporting signals; 2) Lexical Resource (lexicalResource) — vocabulary range, precision, and collocation; 3) Grammatical Range & Accuracy (grammaticalRange); 4) Pronunciation (pronunciation) — clarity, stress, and intonation based on transcript indicators. Calculate overallBand as the average of the 4 criteria rounded to the nearest half band. For each answer, provide specific whatWorked feedback, whatToImprove feedback, and a high-scoring rewrittenExample. Output a valid JSON object matching the requested schema.",
  },
};

const DEFAULT_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
    });
    if (res.ok) {
      const data = await res.json();
      const modelList: Array<{ id: string }> = data.data || [];
      const chatModels = modelList
        .map((m) => m.id)
        .filter(
          (id) =>
            !id.includes("whisper") &&
            !id.includes("guard") &&
            !id.includes("safeguard") &&
            !id.includes("orpheus")
        );
      if (chatModels.length > 0) {
        chatModels.sort((a, b) => {
          if (a.includes("gpt-oss-120b")) return -1;
          if (b.includes("gpt-oss-120b")) return 1;
          if (a.includes("gpt-oss-20b")) return -1;
          if (b.includes("gpt-oss-20b")) return 1;
          return 0;
        });
        return chatModels;
      }
    }
  } catch (e) {
    // Fallback to default models
  }
  return DEFAULT_MODELS;
}

export type InitialQuestionsResult =
  | { questions: string[]; details?: QuestionDetail[]; error?: never }
  | { questions?: never; details?: never; error: string };

export async function generateInitialQuestions(
  track: string,
  resumeText: string,
  jobDescription: string
): Promise<InitialQuestionsResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const error = "GROQ_API_KEY is missing in environment variables.";
    console.error("❌ [generateInitialQuestions Error]", {
      function: "generateInitialQuestions",
      track,
      resumeSnippet: resumeText.slice(0, 100),
      jobDescriptionSnippet: jobDescription.slice(0, 100),
      error,
    });
    return { error };
  }

  const template = promptTemplates[track];
  if (!template) {
    const error = `Unknown interview track '${track}'.`;
    console.error("❌ [generateInitialQuestions Error]", {
      function: "generateInitialQuestions",
      track,
      error,
    });
    return { error };
  }

  const questionCount = INTERVIEW_BLUEPRINT.length;
  // A random opening angle keeps the first question from always being "Tell me about yourself"
  const userMessageContent = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nOPENING ANGLE for the Introduction question: ${pickIntroAngle()}\n\nPlease generate exactly ${questionCount} interview questions following the blueprint, as a JSON object with "roleTitle" and a "questions" array.`;
  const models = await getAvailableModels(apiKey);
  const errors: string[] = [];

  for (const model of models) {
    try {
      const sendRequest = async (messages: Array<{ role: string; content: string }>) => {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq API (${model} status ${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
      };

      const initialMessages = [
        { role: "system", content: template.systemPrompt || "" },
        { role: "user", content: userMessageContent },
      ];

      let content = await sendRequest(initialMessages);
      let plan = parseQuestionsJson(content);

      // If parsing fails or the plan breaks the rulebook, retry once with explicit instructions
      if (!isValidPlan(plan, questionCount)) {
        console.warn(`⚠️ [generateInitialQuestions] First JSON parse attempt failed for model ${model}, retrying once...`);
        const retryMessages = [
          ...initialMessages,
          { role: "assistant", content },
          {
            role: "user",
            content:
              `Your response was not a valid plan. Return ONLY a JSON object with a "questions" array of exactly ${questionCount} objects (stage, question, competency, anchor, lookFor), one per blueprint stage, and make sure no question touches a protected personal topic.`,
          },
        ];

        content = await sendRequest(retryMessages);
        plan = parseQuestionsJson(content);
      }

      if (isValidPlan(plan, questionCount)) {
        return { questions: plan.questions, details: plan.details };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(errMsg);
      console.warn(`⚠️ [generateInitialQuestions Model ${model} failed]:`, errMsg);
    }
  }

  const finalError = `Groq API failed across all available models (${models.join(", ")}):\n${errors.join("\n")}`;
  console.error("❌ [generateInitialQuestions Error]", {
    function: "generateInitialQuestions",
    track,
    resumeSnippet: resumeText.slice(0, 100),
    jobDescriptionSnippet: jobDescription.slice(0, 100),
    error: finalError,
  });

  return { error: finalError };
}

type ParsedQuestionPlan = { questions: string[]; details: QuestionDetail[] };

function parseQuestionsJson(raw: string): ParsedQuestionPlan | null {
  try {
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const startIdx = cleaned.indexOf("{");
    const endIdx = cleaned.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.slice(startIdx, endIdx + 1);
    }
    const parsed = JSON.parse(cleaned);
    const rawQuestions = parsed.questions || parsed.interviewQuestions;
    if (Array.isArray(rawQuestions) && rawQuestions.length > 0) {
      const details: QuestionDetail[] = rawQuestions
        .map((q: any, i: number) => ({
          // Fixed stage names keep report labels consistent; the model sometimes renames them
          stage: INTERVIEW_BLUEPRINT[i]?.stage || (typeof q === "object" && q?.stage ? String(q.stage) : ""),
          question: typeof q === "string" ? q : q?.question || q?.text || String(q),
          competency: typeof q === "object" && q?.competency ? String(q.competency) : "",
          anchor: typeof q === "object" && q?.anchor ? String(q.anchor) : "",
          lookFor: typeof q === "object" && Array.isArray(q?.lookFor) ? q.lookFor.map(String) : [],
          // Difficulty comes from the blueprint, not the model, so the ramp always holds
          difficulty: INTERVIEW_BLUEPRINT[i]?.difficulty,
        }))
        .filter((d: QuestionDetail) => Boolean(d.question));
      if (details[0]) {
        // Tota greets the candidate, and the opening introduction gets no follow-up
        details[0].spokenPrefix = buildGreeting(typeof parsed.roleTitle === "string" ? parsed.roleTitle : undefined);
        details[0].followUpStyle = null;
      }
      return { questions: details.map((d) => d.question), details };
    }
  } catch (e) {
    // Return null to signal parse failure for retry trigger
  }
  return null;
}

function isValidPlan(plan: ParsedQuestionPlan | null, expectedCount: number): plan is ParsedQuestionPlan {
  if (!plan || plan.questions.length < expectedCount) return false;
  return !plan.questions.some((q) => BANNED_TOPIC_PATTERN.test(q));
}

export type FollowUpResult =
  | { followUpQuestion: string; error?: never }
  | { followUpQuestion?: never; error: string };

export interface FollowUpContext {
  resumeText?: string;
  jobDescription?: string;
  /** The current question's detail; its followUpStyle picks the follow-up persona. */
  detail?: any;
  /** Earlier turns of the conversation, for role-plays that must stay consistent (negotiation). */
  history?: string;
}

const CONTEXT_CHAR_LIMIT = 3000;

function buildFollowUpUserMessage(
  currentQuestion: string,
  userAnswerTranscript: string,
  context?: FollowUpContext
): string {
  const base = `INTERVIEW QUESTION ASKED:\n${currentQuestion}\n\nCANDIDATE'S TRANSCRIBED ANSWER:\n${userAnswerTranscript}`;
  if (!context) return `${base}\n\nPlease generate ONE natural, specific follow-up question.`;

  const { detail, resumeText, jobDescription } = context;
  const intent = detail
    ? `\n\nQUESTION INTENT:\nStage: ${detail.stage || "N/A"}\nDifficulty: ${detail.difficulty || "medium"}\nCompetency: ${detail.competency || "N/A"}\nAnchor: ${detail.anchor || "N/A"}\nLook for: ${(detail.lookFor || []).join("; ") || "N/A"}`
    : "";
  const cv = resumeText ? `\n\nCANDIDATE CV (excerpt):\n${resumeText.slice(0, CONTEXT_CHAR_LIMIT)}` : "";
  const jd = jobDescription ? `\n\nJOB DESCRIPTION (excerpt):\n${jobDescription.slice(0, CONTEXT_CHAR_LIMIT)}` : "";

  // Models lean toward probing, so spell out the light touch the opening questions need
  const ask =
    detail?.difficulty === "easy"
      ? "This is an easy opening question. Generate ONE light, friendly follow-up out of curiosity about something the candidate just mentioned, like a person getting to know them. Do NOT ask for examples, impact, results, metrics or proof."
      : "Judge the answer against the question intent, then generate ONE follow-up question following the follow-up rules.";
  return `${base}${intent}${cv}${jd}\n\n${ask}`;
}

export async function generateFollowUp(
  track: string,
  currentQuestion: string,
  userAnswerTranscript: string,
  context?: FollowUpContext
): Promise<FollowUpResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    const error = "GROQ_API_KEY is missing in environment variables.";
    console.error("❌ [generateFollowUp Error]", {
      function: "generateFollowUp",
      track,
      currentQuestion,
      userAnswerSnippet: userAnswerTranscript.slice(0, 100),
      error,
    });
    return { error };
  }

  const template = promptTemplates[track];
  if (!template) {
    const error = `Unknown interview track '${track}'.`;
    console.error("❌ [generateFollowUp Error]", {
      function: "generateFollowUp",
      track,
      error,
    });
    return { error };
  }

  // Scripted tracks pick a persona per question (examiner probe, small-talk partner, coach, debate opponent)
  const style = context?.detail?.followUpStyle;
  const scriptedStyle: keyof typeof FOLLOW_UP_PROMPTS | null =
    style && style !== "interview" && style in FOLLOW_UP_PROMPTS ? style : null;

  const models = await getAvailableModels(apiKey);
  const errors: string[] = [];

  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: scriptedStyle ? FOLLOW_UP_PROMPTS[scriptedStyle] : template.systemPromptFollowUp },
            {
              role: "user",
              content: scriptedStyle
                ? buildScriptedFollowUpMessage(scriptedStyle, currentQuestion, userAnswerTranscript, context?.detail, context?.history)
                : buildFollowUpUserMessage(currentQuestion, userAnswerTranscript, context),
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API (${model} status ${response.status}): ${errorText}`);
      }

      const data = await response.json();
      let followUpQuestion = data.choices[0]?.message?.content || "";
      followUpQuestion = followUpQuestion.trim().replace(/^["']|["']$/g, "").trim();

      if (followUpQuestion) {
        return { followUpQuestion };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errors.push(errMsg);
      console.warn(`⚠️ [generateFollowUp Model ${model} failed]:`, errMsg);
    }
  }

  const finalError = `Groq API failed across models (${models.join(", ")}):\n${errors.join("\n")}`;
  console.error("❌ [generateFollowUp Error]", {
    function: "generateFollowUp",
    track,
    currentQuestion,
    userAnswerSnippet: userAnswerTranscript.slice(0, 100),
    error: finalError,
  });

  return { error: finalError };
}

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"
];

function detectFillerWords(text: string): { word: string; position: number }[] {
  if (!text) return [];
  const fillers: { word: string; position: number }[] = [];
  const lowerText = text.toLowerCase();

  for (const filler of FILLER_WORDS) {
    let startIndex = 0;
    while (true) {
      const idx = lowerText.indexOf(filler, startIndex);
      if (idx === -1) break;

      const before = idx === 0 ? " " : lowerText[idx - 1];
      const after =
        idx + filler.length >= lowerText.length
          ? " "
          : lowerText[idx + filler.length];

      if (/[\s,.]/.test(before) && /[\s,.]/.test(after)) {
        fillers.push({ word: filler, position: idx });
      }
      startIndex = idx + filler.length;
    }
  }

  return fillers.sort((a, b) => a.position - b.position);
}

function calculateSpeakingPace(text: string, durationSeconds: number): number {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = durationSeconds / 60;
  return Math.round(wordCount / minutes);
}

export async function generateFeedbackReport(track: string, session: any): Promise<any> {
  const sessionId = session.sessionId;
  const answers: any[] = session.answers || [];

  // 1. Non-LLM calculations first (pure JS, no API call)
  let totalFillerCount = 0;
  let totalPace = 0;
  let paceCount = 0;

  let totalEyeContact = 0;
  let eyeContactCount = 0;
  const movementCounts: Record<string, number> = { low: 0, moderate: 0, high: 0 };
  const sessionTallies: { tally: BodyLanguageTally; q: number }[] = [];

  const perAnswerMetrics = answers.map((answer, answerIdx) => {
    const mainTranscript = answer.answerTranscript || "";
    const followUpTranscript = answer.followUpTranscript || "";
    const combinedTranscript = `${mainTranscript} ${followUpTranscript}`.trim();

    const mainFillers = detectFillerWords(mainTranscript);
    const followUpFillers = followUpTranscript ? detectFillerWords(followUpTranscript) : [];
    const allFillers = [...mainFillers, ...followUpFillers];
    const fillerCount = allFillers.length;
    totalFillerCount += fillerCount;

    const duration = answer.audioDurationSeconds || answer.audioDuration || 0;
    const pace = calculateSpeakingPace(combinedTranscript, duration);
    if (pace > 0) {
      totalPace += pace;
      paceCount++;
    }

    // Main answer + follow-up eye-movement/posture tallies, scored together
    const q = (typeof answer.questionIndex === "number" ? answer.questionIndex : answerIdx) + 1;
    const blTally = mergeTallies([
      { tally: answer.bodyLanguage, q },
      { tally: answer.followUpBodyLanguage, q },
    ]);
    if (blTally) sessionTallies.push({ tally: blTally, q });
    const bodyLanguage = blTally ? scoreBodyLanguage(blTally) : null;

    const eyeContact = bodyLanguage
      ? bodyLanguage.stats.eyeContactPercent
      : typeof answer.eyeContactPercent === "number"
      ? answer.eyeContactPercent
      : null;
    const movement = bodyLanguage ? bodyLanguage.stats.headMovement : answer.movementScore || null;
    if (eyeContact !== null) {
      totalEyeContact += eyeContact;
      eyeContactCount++;
    }
    if (movement && movementCounts[movement] !== undefined) {
      movementCounts[movement]++;
    }

    return {
      questionText: answer.questionText,
      answerTranscript: mainTranscript,
      followUpText: answer.followUpText || null,
      followUpTranscript: followUpTranscript || null,
      fillerWordCount: fillerCount,
      fillerWords: allFillers,
      speakingPace: pace,
      eyeContactPercent: eyeContact,
      movementScore: movement,
      bodyLanguage: bodyLanguage
        ? { scores: bodyLanguage.scores, stats: bodyLanguage.stats, insights: bodyLanguage.insights.slice(0, 4), moments: bodyLanguage.moments }
        : null,
    };
  });

  const sessionTally = mergeTallies(sessionTallies);
  const readingInQuestions = perAnswerMetrics
    .map((m, i) => (m.bodyLanguage?.stats.readingDetected ? i + 1 : null))
    .filter((q): q is number => q !== null);
  const bodyLanguageReport = sessionTally ? scoreBodyLanguage(sessionTally, { readingInQuestions }) : null;

  const avgPace = paceCount > 0 ? Math.round(totalPace / paceCount) : 0;

  // 2. LLM Call to Groq (wrapped in try/catch)
  let llmFeedbackList: any[] = [];
  let overallSummary = "";

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in environment variables.");
    }

    const template = promptTemplates[track];
    if (!template) {
      throw new Error(`Unknown interview track '${track}'.`);
    }

    const isIelts = track === "ielts-speaking";

    const fullTranscript = perAnswerMetrics
      .map((m, i) => {
        const detail = session.questionDetails?.[i] || {};
        const ieltsKind = detail.kind === "cue-card" ? " cue card" : detail.kind === "rounding-off" ? " rounding-off question" : "";
        const frameworkName = isIelts
          ? `IELTS Part ${detail.part || (i < 2 ? 1 : i === 2 ? 2 : 3)}${ieltsKind}${detail.topic ? `, ${detail.topic}` : ""}`
          : detail.framework || (track === "communication-builder" ? "Communication Framework" : "STAR Framework");
        const intent = detail.competency
          ? `\nCompetency: ${detail.competency}${detail.lookFor?.length ? `\nLook for: ${detail.lookFor.join("; ")}` : ""}`
          : "";
        const label =
          track === "mock-interview"
            ? `${detail.stage || frameworkName}${detail.difficulty ? `, ${detail.difficulty}` : ""}`
            : frameworkName;
        const blLine = m.bodyLanguage ? `\n${summarizeForPrompt(m.bodyLanguage as any)}` : "";
        return `Q${i + 1} (${label}): ${m.questionText}${intent}${blLine}\nCandidate Answer: ${m.answerTranscript}\n(Filler Words: ${m.fillerWordCount}, Pace: ${m.speakingPace} WPM)${
          m.followUpText
            ? `\nFollow-up: ${m.followUpText}\nFollow-up Answer: ${m.followUpTranscript || "(not answered)"}`
            : ""
        }`;
      })
      .join("\n\n---\n\n");

    // Role-play tracks need their brief (motion and side, or goal, walk-away and hidden interests) to be judged fairly
    const first = session.questionDetails?.[0] || {};
    const trackBrief =
      track === "debate-practice"
        ? `DEBATE BRIEF:\nMotion: ${first.motion || "N/A"}\nUser argued: ${first.side || "N/A"} the motion\n\n`
        : track === "negotiation-practice"
        ? `NEGOTIATION BRIEF:\nScenario: ${first.scenarioTitle || "N/A"}\nUser's role: ${first.yourRole || "N/A"}\nSituation: ${first.situation || "N/A"}\nUser's goal: ${first.yourGoal || "N/A"}\nUser's walk-away point: ${first.yourWalkAway || "N/A"}\nCounterpart: ${first.counterpart || "N/A"}\nCounterpart's hidden interests: ${(first.counterpartInterests || []).join(" | ")}\nCounterpart's real flexibility: ${first.counterpartFlexibility || "N/A"}\n\n`
        : "";
    const feedbackContext = `${trackBrief}JOB DESCRIPTION:\n${session.jobDescription || "N/A"}\n\nRESUME:\n${session.resumeText || "N/A"}\n\nFULL TRANSCRIPT:\n${fullTranscript}`;

    const numAnswers = answers.length;
    const bodyLanguageNote = bodyLanguageReport
      ? `\n\nSome answers include a "Body language" line measured from the webcam (eye contact, look-aways, reading from notes, blinking, posture, face touching). Mention body language in whatToImprove only when it is a notable problem for that answer, and include one sentence about the candidate's overall body language and eye contact in the overallSummary.`
      : "";
    const feedbackUserPrompt = isIelts
      ? `You are an IELTS Speaking examiner. Evaluate EACH answer using the 4 official IELTS criteria. Assign REAL, differentiated band scores (1.0–9.0, half bands allowed: 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0). DO NOT default all fields to 6.5 — give honest scores that reflect actual response quality. Short, weak, or repetitive answers should score 4.0–5.5. Fluent, well-structured answers may score 7.0–8.5. Compute overallBand per answer as the arithmetic mean of its 4 criteria, rounded to nearest 0.5. Then compute the top-level "overallBand" as the mean of all individual overallBand values, rounded to nearest 0.5.

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "perAnswerFeedback": [
    {
      "fluencyCoherence": <REAL score 1.0-9.0>,
      "lexicalResource": <REAL score 1.0-9.0>,
      "grammaticalRange": <REAL score 1.0-9.0>,
      "pronunciation": <REAL score 1.0-9.0>,
      "overallBand": <mean of above 4, nearest 0.5>,
      "whatWorked": "<specific praise referencing candidate's own words>",
      "whatToImprove": "<specific, actionable feedback referencing candidate's own words>",
      "rewrittenExample": "<a high-scoring rewrite of the candidate's own answer>"
    }
  ],
  "overallBand": <mean of all individual overallBand values, nearest 0.5>,
  "overallSummary": "<2-3 sentence holistic examiner comment>"
}

The perAnswerFeedback array MUST contain exactly ${numAnswers} object(s), in transcript order. Keep whatWorked and whatToImprove to one sentence each and rewrittenExample under 50 words. Do not include any text outside the JSON.${bodyLanguageNote}`
      : `Evaluate the interview session transcript above. Return ONLY a valid JSON object matching this schema:
{
  "perAnswerFeedback": [
    {
      "structureScore": 85,
      "relevanceScore": 90,
      "whatWorked": "...",
      "whatToImprove": "...",
      "rewrittenExample": "..."
    }
  ],
  "overallSummary": "..."
}

The perAnswerFeedback array MUST contain exactly ${numAnswers} entry/entries, in transcript order. Keep whatWorked and whatToImprove to one or two sentences each. Do not include markdown formatting or extraneous text.${bodyLanguageNote}`;

    const models = await getAvailableModels(apiKey);
    let rawLlmOutput = "";

    for (const model of models) {
      try {
        const sendRequest = async (messages: Array<{ role: string; content: string }>) => {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey.trim()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages,
              response_format: { type: "json_object" },
              temperature: 0.3,
              max_tokens: 4096,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API (${model} status ${response.status}): ${errorText}`);
          }

          const data = await response.json();
          return data.choices[0]?.message?.content || "";
        };

        const initialMessages = [
          { role: "system", content: template.feedbackSystemPrompt },
          { role: "user", content: `${feedbackUserPrompt}\n\nCONTEXT:\n${feedbackContext}` },
        ];

        rawLlmOutput = await sendRequest(initialMessages);
        let parsed = parseFeedbackJson(rawLlmOutput);

        // Retry once on parse failure
        if (!parsed || !Array.isArray(parsed.perAnswerFeedback) || parsed.perAnswerFeedback.length === 0) {
          console.warn(`⚠️ [generateFeedbackReport] First JSON parse attempt failed for model ${model}, retrying once...`);
          const retryMessages = [
            ...initialMessages,
            { role: "assistant", content: rawLlmOutput },
            {
              role: "user",
              content:
                "Your response could not be parsed into a JSON object with 'perAnswerFeedback' array and 'overallSummary' string. Please return ONLY a valid JSON object.",
            },
          ];

          rawLlmOutput = await sendRequest(retryMessages);
          parsed = parseFeedbackJson(rawLlmOutput);
        }

        if (parsed && Array.isArray(parsed.perAnswerFeedback)) {
          llmFeedbackList = parsed.perAnswerFeedback;
          overallSummary = parsed.overallSummary || "Interview completed. Detailed analysis generated for all responses.";
          break;
        }
      } catch (err) {
        console.warn(`⚠️ [generateFeedbackReport Model ${model} failed]:`, err);
      }
    }

    if (llmFeedbackList.length === 0) {
      throw new Error("Groq API failed to return valid feedback structure across all models.");
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ [generateFeedbackReport Error]", {
      function: "generateFeedbackReport",
      track,
      sessionId,
      error: errMsg,
    });
    overallSummary = `Feedback report completed with calculated audio metrics. Qualitative AI feedback unavailable due to error: ${errMsg}`;
  }

  // 3. Merge non-LLM metrics with qualitative feedback
  const isIeltsTrack = track === "ielts-speaking";
  let totalBands = 0;
  let bandCount = 0;

  const perAnswerFeedback = perAnswerMetrics.map((metric, idx) => {
    const llmItem = llmFeedbackList[idx] || {};
    const whatWorked = llmItem.whatWorked || "Clear explanation provided in response.";
    const whatToImprove = llmItem.whatToImprove || (isIeltsTrack ? "Use a broader range of vocabulary and connect your ideas smoothly." : "Incorporate specific metrics and the STAR method to strengthen your answer.");
    const rewrittenExample = llmItem.rewrittenExample || metric.answerTranscript;

    if (isIeltsTrack) {
      const fluencyCoherence = typeof llmItem.fluencyCoherence === "number" ? llmItem.fluencyCoherence : 6.5;
      const lexicalResource = typeof llmItem.lexicalResource === "number" ? llmItem.lexicalResource : 6.5;
      const grammaticalRange = typeof llmItem.grammaticalRange === "number" ? llmItem.grammaticalRange : 6.0;
      const pronunciation = typeof llmItem.pronunciation === "number" ? llmItem.pronunciation : 6.5;
      const overallBand = typeof llmItem.overallBand === "number"
        ? llmItem.overallBand
        : Math.round(((fluencyCoherence + lexicalResource + grammaticalRange + pronunciation) / 4) * 2) / 2;

      totalBands += overallBand;
      bandCount++;

      return {
        ...metric,
        fluencyCoherence,
        lexicalResource,
        grammaticalRange,
        pronunciation,
        overallBand,
        structureScore: Math.round(overallBand * 10),
        relevanceScore: Math.round(overallBand * 10),
        whatWorked,
        whatToImprove,
        rewrittenExample,
        relevanceNotes: whatWorked,
        suggestions: [whatToImprove, `Band 8+ Rewritten Answer: ${rewrittenExample}`],
      };
    }

    const structureScore = typeof llmItem.structureScore === "number" ? llmItem.structureScore : 70;
    const relevanceScore = typeof llmItem.relevanceScore === "number" ? llmItem.relevanceScore : 70;

    return {
      ...metric,
      structureScore,
      relevanceScore,
      whatWorked,
      whatToImprove,
      rewrittenExample,
      starAnalysis: llmItem.starAnalysis || {
        situation: whatWorked,
        task: "Addressed question requirements.",
        action: "Explained past experience.",
        result: whatToImprove,
      },
      relevanceNotes: whatWorked,
      suggestions: [whatToImprove, `Rewritten Example: ${rewrittenExample}`],
    };
  });

  const computedOverallBand = bandCount > 0 ? Math.round((totalBands / bandCount) * 2) / 2 : undefined;

  const avgEyeContactPercent = eyeContactCount > 0 ? Math.round(totalEyeContact / eyeContactCount) : null;
  let overallMovementScore: "low" | "moderate" | "high" | null = null;
  const totalMovementAnswers = movementCounts.low + movementCounts.moderate + movementCounts.high;
  if (totalMovementAnswers > 0) {
    if (movementCounts.high >= movementCounts.moderate && movementCounts.high >= movementCounts.low) {
      overallMovementScore = "high";
    } else if (movementCounts.moderate >= movementCounts.low) {
      overallMovementScore = "moderate";
    } else {
      overallMovementScore = "low";
    }
  }

  // 4. Save to FeedbackReport model in Mongo / store
  const reportData = {
    sessionId,
    perAnswerFeedback,
    fillerWordCount: totalFillerCount,
    totalFillerWordCount: totalFillerCount,
    avgPace,
    overallSummary,
    overallBand: computedOverallBand,
    avgEyeContactPercent: bodyLanguageReport ? bodyLanguageReport.stats.eyeContactPercent : avgEyeContactPercent,
    overallMovementScore: bodyLanguageReport ? bodyLanguageReport.stats.headMovement : overallMovementScore,
    bodyLanguageReport,
  };

  const report = await saveFeedbackReport(sessionId, reportData);

  return {
    perAnswerFeedback: report.perAnswerFeedback || perAnswerFeedback,
    fillerWordCount: totalFillerCount,
    totalFillerWordCount: totalFillerCount,
    avgPace: report.avgPace ?? avgPace,
    overallSummary: report.overallSummary || overallSummary,
    overallBand: report.overallBand ?? computedOverallBand,
    avgEyeContactPercent: report.avgEyeContactPercent ?? avgEyeContactPercent,
    overallMovementScore: report.overallMovementScore ?? overallMovementScore,
    bodyLanguageReport: report.bodyLanguageReport ?? bodyLanguageReport,
  };
}

function parseFeedbackJson(raw: string): { perAnswerFeedback?: any[]; overallSummary?: string } | null {
  try {
    let cleaned = raw.trim();
    cleaned = cleaned.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    const startIdx = cleaned.indexOf("{");
    const endIdx = cleaned.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.slice(startIdx, endIdx + 1);
    }
    const parsed = JSON.parse(cleaned);
    if (parsed && (Array.isArray(parsed.perAnswerFeedback) || parsed.overallSummary)) {
      return parsed;
    }
  } catch (e) {
    // Return null to trigger retry
  }
  return null;
}

/**
 * General LLM caller preserved for backwards compatibility.
 */
export async function callLLM(
  prompt: string,
  context?: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in .env.local");
  }

  const cleanKey = apiKey.trim();
  const models = await getAvailableModels(cleanKey);
  const errors: string[] = [];

  for (const model of models) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cleanKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert technical interviewer and career coach. IMPORTANT: Output ONLY raw valid JSON. No markdown, no backticks, no explanations outside JSON. Your entire response must be parseable by JSON.parse().",
              },
              {
                role: "user",
                content: context ? `${prompt}\n\nCONTEXT:\n${context}` : prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 4096,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || "";
        return cleanJsonString(content);
      }

      const errorText = await response.text();
      errors.push(`[${model} status ${response.status}]: ${errorText}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`[${model} exception]: ${msg}`);
    }
  }

  throw new Error(`Groq LLM API failed across models:\n${errors.join("\n")}`);
}

function cleanJsonString(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
  }
  return cleaned;
}
