/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Track-agnostic Groq LLM integration for interview question, follow-up, and feedback report generation.
 */

import { saveFeedbackReport } from "@/lib/store";

export interface TrackPromptTemplate {
  systemPrompt?: string;
  systemPromptFollowUp: string;
  feedbackSystemPrompt: string;
}

export const promptTemplates: Record<string, TrackPromptTemplate> = {
  "mock-interview": {
    systemPrompt:
      "You are an expert technical interviewer and executive career coach. Your task is to analyze the candidate's resume and job description, then generate 5 to 6 realistic, highly tailored interview questions — a mix of behavioral and role-specific questions. Reference specific details, skills, and past experience from the resume and job description. You MUST return a JSON object containing a 'questions' key with an array of 5 to 6 question strings.",
    systemPromptFollowUp:
      "You are an expert interviewer conducting a live interview. Based on the interview question asked and the candidate's transcribed response, generate ONE natural follow-up question that references something specific the user said in their answer. Probe deeper into their technical decisions, metrics, outcomes, or reasoning. Do NOT ask generic questions like 'Can you elaborate?' or 'Tell me more'. Return only the text of the follow-up question.",
    feedbackSystemPrompt:
      "You are an expert technical interviewer and executive career coach. Evaluate the interview transcript against the candidate's resume and job description. For each answer: 1) evaluate structure using the STAR method (Situation, Task, Action, Result); 2) assign a structureScore (0-100) and relevanceScore (0-100); 3) provide honest, specific feedback on what worked well and what needs improvement (avoid generic praise); 4) provide a rewritten example answer anchored directly in the candidate's actual spoken response (not a generic template). Output a valid JSON object with a 'perAnswerFeedback' array and an 'overallSummary' string.",
  },
  "communication-builder": {
    systemPromptFollowUp:
      "You are an expert communication and speech coach conducting a live communication practice session. Based on the prompt given and the candidate's transcribed response, generate ONE natural, concise follow-up question. The follow-up MUST reference something specific the user said in their answer to probe deeper into their clarity, reasoning, structure, or example. Do NOT ask generic questions like 'Can you elaborate?'. Return only the text of the follow-up question.",
    feedbackSystemPrompt:
      "You are an expert communication and public speaking coach. Evaluate the user's speech transcript against the prompt provided. For each answer: 1) evaluate structureScore (0-100) based on the clarity, structure, and logical flow of the response (not STAR specifically, since there is no job context); 2) evaluate relevanceScore (0-100) based on how directly and concisely the answer addressed the prompt; 3) provide honest, actionable feedback on whatWorked and whatToImprove (avoid generic praise); 4) provide a rewrittenExample answer anchored directly in what the user actually said (not a generic template). Output a valid JSON object containing a 'perAnswerFeedback' array (with structureScore, relevanceScore, whatWorked, whatToImprove, rewrittenExample) and an 'overallSummary' string.",
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
  | { questions: string[]; error?: never }
  | { questions?: never; error: string };

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

  const userMessageContent = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nPlease generate 5-6 tailored interview questions as a JSON object with a "questions" array of strings.`;
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
      let questions = parseQuestionsJson(content);

      // If parsing fails, retry once with explicit JSON instruction
      if (!questions || questions.length === 0) {
        console.warn(`⚠️ [generateInitialQuestions] First JSON parse attempt failed for model ${model}, retrying once...`);
        const retryMessages = [
          ...initialMessages,
          { role: "assistant", content },
          {
            role: "user",
            content:
              "Your response could not be parsed into a JSON object with a 'questions' array. Please return ONLY a valid JSON object matching format: { \"questions\": [\"Question 1\", \"Question 2\", ...] }",
          },
        ];

        content = await sendRequest(retryMessages);
        questions = parseQuestionsJson(content);
      }

      if (questions && questions.length > 0) {
        return { questions };
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

function parseQuestionsJson(raw: string): string[] | null {
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
      return rawQuestions
        .map((q: any) => (typeof q === "string" ? q : q?.question || q?.text || String(q)))
        .filter(Boolean);
    }
  } catch (e) {
    // Return null to signal parse failure for retry trigger
  }
  return null;
}

export type FollowUpResult =
  | { followUpQuestion: string; error?: never }
  | { followUpQuestion?: never; error: string };

export async function generateFollowUp(
  track: string,
  currentQuestion: string,
  userAnswerTranscript: string
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
            { role: "system", content: template.systemPromptFollowUp },
            {
              role: "user",
              content: `INTERVIEW QUESTION ASKED:\n${currentQuestion}\n\nCANDIDATE'S TRANSCRIBED ANSWER:\n${userAnswerTranscript}\n\nPlease generate ONE natural, specific follow-up question.`,
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

  const perAnswerMetrics = answers.map((answer) => {
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

    const eyeContact = typeof answer.eyeContactPercent === "number" ? answer.eyeContactPercent : null;
    const movement = answer.movementScore || null;
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
    };
  });

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
        const frameworkName = detail.framework || (track === "communication-builder" ? "Communication Framework" : isIelts ? `IELTS Part ${detail.part || (i < 2 ? 1 : i === 2 ? 2 : 3)}` : "STAR Framework");
        return `Q${i + 1} (${frameworkName}): ${m.questionText}\nCandidate Answer: ${m.answerTranscript}\n(Filler Words: ${m.fillerWordCount}, Pace: ${m.speakingPace} WPM)${
          m.followUpText
            ? `\nFollow-up: ${m.followUpText}\nFollow-up Answer: ${m.followUpTranscript || "(not answered)"}`
            : ""
        }`;
      })
      .join("\n\n---\n\n");

    const feedbackContext = `JOB DESCRIPTION:\n${session.jobDescription || "N/A"}\n\nRESUME:\n${session.resumeText || "N/A"}\n\nFULL TRANSCRIPT:\n${fullTranscript}`;

    const numAnswers = answers.length;
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

The perAnswerFeedback array MUST contain exactly ${numAnswers} object(s). Do not include any text outside the JSON.`
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

The perAnswerFeedback array MUST contain exactly ${numAnswers} entry/entries. Do not include markdown formatting or extraneous text.`;

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
    avgEyeContactPercent,
    overallMovementScore,
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
