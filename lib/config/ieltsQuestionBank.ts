export interface IeltsPart1Question {
  id: string;
  topic: string;
  question: string;
}

export interface IeltsCueCard {
  id: string;
  topic: string;
  mainPrompt: string;
  bulletPoints: string[];
}

export interface IeltsQuestionDetail {
  part: 1 | 2 | 3;
  topic: string;
  question: string;
  bulletPoints?: string[];
}

export const IELTS_PART1_QUESTIONS: IeltsPart1Question[] = [
  {
    id: "p1-1",
    topic: "Work or Study",
    question: "Do you work or are you a student? Can you describe what you do?",
  },
  {
    id: "p1-2",
    topic: "Free Time",
    question: "What do you like to do in your free time, and why do you enjoy it?",
  },
  {
    id: "p1-3",
    topic: "Hometown",
    question: "How has your hometown changed over the last few years?",
  },
  {
    id: "p1-4",
    topic: "Music",
    question: "What kind of music do you enjoy listening to, and when do you usually listen to it?",
  },
  {
    id: "p1-5",
    topic: "Social Connections",
    question: "Do you prefer spending time with family or friends? Why?",
  },
  {
    id: "p1-6",
    topic: "Food & Cooking",
    question: "Do you enjoy cooking at home or eating out at restaurants more? Why?",
  },
  {
    id: "p1-7",
    topic: "Seasons & Weather",
    question: "What is your favorite season of the year, and what do you like about it?",
  },
  {
    id: "p1-8",
    topic: "Technology & Media",
    question: "How often do you use social media, and what do you mostly use it for?",
  },
];

export const IELTS_CUE_CARDS: IeltsCueCard[] = [
  {
    id: "p2-1",
    topic: "An Interesting Place",
    mainPrompt: "Describe a place you visited that you found interesting.",
    bulletPoints: [
      "Where it was",
      "When you went there",
      "What you did there",
      "Explain why you found it interesting",
    ],
  },
  {
    id: "p2-2",
    topic: "An Influential Person",
    mainPrompt: "Describe a person who has had a significant influence on your life.",
    bulletPoints: [
      "Who this person is",
      "How you met them",
      "What qualities they have",
      "Explain how they influenced you",
    ],
  },
  {
    id: "p2-3",
    topic: "A Future Skill",
    mainPrompt: "Describe a skill you would like to learn in the future.",
    bulletPoints: [
      "What the skill is",
      "Why you want to learn it",
      "How you plan to learn it",
      "Explain how this skill would benefit you",
    ],
  },
  {
    id: "p2-4",
    topic: "A Memorable Event",
    mainPrompt: "Describe a memorable event or celebration you attended.",
    bulletPoints: [
      "What the event was",
      "Where and when it took place",
      "Who was there with you",
      "Explain why it was memorable to you",
    ],
  },
  {
    id: "p2-5",
    topic: "An Impressive Book or Movie",
    mainPrompt: "Describe a book or movie that made a deep impression on you.",
    bulletPoints: [
      "What book or movie it was",
      "What the story was about",
      "When you read or watched it",
      "Explain why it made a deep impression on you",
    ],
  },
  {
    id: "p2-6",
    topic: "A Challenging Goal",
    mainPrompt: "Describe a difficult goal you set for yourself and achieved.",
    bulletPoints: [
      "What the goal was",
      "Why you set it",
      "What challenges you faced",
      "Explain how you felt when you achieved it",
    ],
  },
];

export function getIeltsSpeakingSessionQuestions(): {
  questions: string[];
  details: IeltsQuestionDetail[];
} {
  // 1. Randomly pick 2 distinct questions from Part 1
  const shuffledP1 = [...IELTS_PART1_QUESTIONS].sort(() => Math.random() - 0.5);
  const selectedP1 = shuffledP1.slice(0, 2);

  // 2. Randomly pick 1 Cue Card from Part 2
  const shuffledP2 = [...IELTS_CUE_CARDS].sort(() => Math.random() - 0.5);
  const selectedP2 = shuffledP2[0];

  // Format Cue Card prompt string with bullet points for display
  const cueCardFormatted = `${selectedP2.mainPrompt}\n\nYou should say:\n${selectedP2.bulletPoints
    .map((bp) => `• ${bp}`)
    .join("\n")}`;

  const questions = [
    selectedP1[0].question,
    selectedP1[1].question,
    cueCardFormatted,
  ];

  const details: IeltsQuestionDetail[] = [
    { part: 1, topic: selectedP1[0].topic, question: selectedP1[0].question },
    { part: 1, topic: selectedP1[1].topic, question: selectedP1[1].question },
    {
      part: 2,
      topic: selectedP2.topic,
      question: selectedP2.mainPrompt,
      bulletPoints: selectedP2.bulletPoints,
    },
  ];

  return { questions, details };
}
