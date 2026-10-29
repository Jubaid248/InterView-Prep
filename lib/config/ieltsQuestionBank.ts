import { pickRandom, type ScriptedTurn } from "@/lib/config/sessionScript";

/**
 * IELTS Speaking question bank and examiner script.
 *
 * Mirrors the real test (11–14 minutes):
 *  - Part 1 (4–5 min): introduction, then short questions on 3 familiar topics.
 *    The first topic is always work/study, hometown or home.
 *  - Part 2 (3–4 min): a cue card with 1 minute to prepare and up to 2 minutes
 *    to speak, followed by one short rounding-off question.
 *  - Part 3 (4–5 min): an abstract two-way discussion on two themes linked to the
 *    cue card. The examiner may probe an answer once per theme.
 */

export interface IeltsTopic {
  id: string;
  /** Lowercase so it reads naturally in "Let's talk about ..." */
  topic: string;
  questions: string[];
}

export interface IeltsPart3Theme {
  /** Lowercase so it reads naturally in "Let's consider first of all ..." */
  theme: string;
  questions: string[];
}

export interface IeltsCueCard {
  id: string;
  topic: string;
  mainPrompt: string;
  bulletPoints: string[];
  roundingOff: string;
  /** Lowercase phrase for "We've been talking about ..." */
  discussionLead: string;
  part3Themes: [IeltsPart3Theme, IeltsPart3Theme];
}

export type IeltsTurnKind = "part1" | "cue-card" | "rounding-off" | "part3";

export interface IeltsQuestionDetail extends ScriptedTurn {
  part: 1 | 2 | 3;
  kind: IeltsTurnKind;
  topic: string;
  question: string;
  bulletPoints?: string[];
}

// Part 1 always opens with one of these. The first question of each is asked first.
export const IELTS_FRAME_TOPICS: IeltsTopic[] = [
  {
    id: "work-study",
    topic: "your work or studies",
    questions: [
      "Do you work, or are you a student?",
      "Why did you choose that job, or that subject?",
      "What do you enjoy most about it?",
      "Is there anything you would like to change about it?",
    ],
  },
  {
    id: "hometown",
    topic: "your hometown",
    questions: [
      "Where is your hometown, and what kind of place is it?",
      "What do you like most about your hometown?",
      "Has your hometown changed much since you were a child?",
      "Would you like to live there in the future?",
    ],
  },
  {
    id: "home",
    topic: "where you live",
    questions: [
      "Do you live in a house or an apartment?",
      "Which room in your home do you spend the most time in?",
      "How long have you lived there?",
      "Is there anything you would like to change about your home?",
    ],
  },
];

export const IELTS_PART1_TOPICS: IeltsTopic[] = [
  {
    id: "music",
    topic: "music",
    questions: [
      "What kind of music do you like listening to?",
      "When do you usually listen to music?",
      "Did you learn to play a musical instrument as a child?",
      "Has the music you like changed as you've got older?",
    ],
  },
  {
    id: "reading",
    topic: "reading",
    questions: [
      "Do you enjoy reading?",
      "What kind of things do you usually read?",
      "Do you prefer reading on paper or on a screen?",
      "Did you read a lot when you were a child?",
    ],
  },
  {
    id: "weather",
    topic: "the weather",
    questions: [
      "What's the weather usually like where you live?",
      "What kind of weather do you like best?",
      "Does the weather ever change your plans?",
      "Do you check the weather forecast often?",
    ],
  },
  {
    id: "food",
    topic: "food",
    questions: [
      "What's your favourite kind of food?",
      "Do you enjoy cooking?",
      "Do you prefer eating at home or eating out?",
      "Is there any food you didn't like as a child but enjoy now?",
    ],
  },
  {
    id: "shopping",
    topic: "shopping",
    questions: [
      "Do you enjoy shopping?",
      "Do you prefer shopping online or in shops?",
      "What was the last thing you bought for yourself?",
      "Are there any shops you visit regularly?",
    ],
  },
  {
    id: "sport",
    topic: "sport and exercise",
    questions: [
      "Do you do any sport or exercise?",
      "Which sports are popular in your country?",
      "Did you play much sport at school?",
      "Do you prefer watching sport or playing it?",
    ],
  },
  {
    id: "phones",
    topic: "mobile phones",
    questions: [
      "How often do you use your mobile phone?",
      "What do you mostly use your phone for?",
      "Could you go a whole day without your phone?",
      "How old were you when you got your first phone?",
    ],
  },
  {
    id: "friends",
    topic: "friends",
    questions: [
      "Do you prefer having a few close friends or lots of friends?",
      "How often do you see your friends?",
      "What do you usually do together?",
      "Is it easy to make new friends where you live?",
    ],
  },
  {
    id: "holidays",
    topic: "holidays",
    questions: [
      "What do you usually do on holiday?",
      "Do you prefer holidays in your own country or abroad?",
      "Who do you usually go on holiday with?",
      "Is there anywhere you'd really like to visit?",
    ],
  },
  {
    id: "mornings",
    topic: "mornings",
    questions: [
      "Are you a morning person?",
      "What do you usually do in the morning?",
      "Has your morning routine changed over the years?",
      "Do you have breakfast every day?",
    ],
  },
  {
    id: "social-media",
    topic: "social media",
    questions: [
      "Which social media apps do you use?",
      "How much time do you spend on social media each day?",
      "Do you ever post things yourself, or do you mostly read?",
      "Would you like to spend less time on social media?",
    ],
  },
  {
    id: "art",
    topic: "art",
    questions: [
      "Do you like art?",
      "Have you ever been to an art gallery or museum?",
      "Did you enjoy drawing or painting at school?",
      "Do you have any art on the walls at home?",
    ],
  },
  {
    id: "transport",
    topic: "transport",
    questions: [
      "How do you usually travel around your city?",
      "Do you use public transport often?",
      "What do you think of public transport where you live?",
      "Would you like to learn to drive, or do you already drive?",
    ],
  },
  {
    id: "birthdays",
    topic: "birthdays",
    questions: [
      "How do you usually celebrate your birthday?",
      "Do you think birthdays are more important for children than adults?",
      "What's the best birthday present you've ever received?",
      "Do you remember any of your childhood birthdays?",
    ],
  },
  {
    id: "plants",
    topic: "plants and flowers",
    questions: [
      "Do you have any plants at home?",
      "Do you enjoy spending time in parks or gardens?",
      "Do people in your country often give flowers as gifts?",
      "Would you like to grow your own vegetables?",
    ],
  },
  {
    id: "photos",
    topic: "photographs",
    questions: [
      "Do you like taking photos?",
      "What do you usually take photos of?",
      "Do you prefer taking photos with a phone or a camera?",
      "Do you ever print your photos?",
    ],
  },
  {
    id: "neighbours",
    topic: "neighbours",
    questions: [
      "Do you know your neighbours well?",
      "How often do you talk to your neighbours?",
      "What makes someone a good neighbour?",
      "Have you ever helped a neighbour with something?",
    ],
  },
  {
    id: "sky",
    topic: "the sky and stars",
    questions: [
      "Do you like looking at the sky?",
      "Can you see the stars clearly where you live?",
      "Have you ever watched a sunrise or sunset somewhere special?",
      "Would you like to learn more about the stars?",
    ],
  },
];

export const IELTS_CUE_CARDS: IeltsCueCard[] = [
  {
    id: "place",
    topic: "An interesting place",
    mainPrompt: "Describe a place you visited that you found interesting.",
    bulletPoints: ["where it was", "when you went there", "what you did there", "and explain why you found it interesting"],
    roundingOff: "Would you like to go back there one day?",
    discussionLead: "a place you found interesting",
    part3Themes: [
      {
        theme: "tourism",
        questions: [
          "Why do people enjoy travelling to new places?",
          "What are the advantages and disadvantages of tourism for local communities?",
          "How has tourism changed in your country in recent years?",
        ],
      },
      {
        theme: "protecting historic places",
        questions: [
          "Why is it important to preserve historic buildings?",
          "Who should pay to protect historic sites, the government or private companies?",
          "Do modern cities lose their character when old buildings are replaced?",
        ],
      },
    ],
  },
  {
    id: "person",
    topic: "An influential person",
    mainPrompt: "Describe a person who has had a strong influence on your life.",
    bulletPoints: ["who this person is", "how you know them", "what they have done for you", "and explain why they have influenced you so much"],
    roundingOff: "Do you still keep in touch with this person?",
    discussionLead: "a person who influenced you",
    part3Themes: [
      {
        theme: "role models",
        questions: [
          "What qualities make someone a good role model?",
          "Do celebrities have a responsibility to set a good example?",
          "How have the people young people admire changed over time?",
        ],
      },
      {
        theme: "family influence",
        questions: [
          "Who has more influence on children, their parents or their friends?",
          "How are family roles different now compared with the past?",
          "Should schools teach values, or should that be left to families?",
        ],
      },
    ],
  },
  {
    id: "skill",
    topic: "A useful skill",
    mainPrompt: "Describe a skill you learned that you have found useful.",
    bulletPoints: ["what the skill is", "when and how you learned it", "how often you use it", "and explain why it has been useful to you"],
    roundingOff: "Is there a skill you'd like to learn next?",
    discussionLead: "a useful skill",
    part3Themes: [
      {
        theme: "learning new skills",
        questions: [
          "Is it better to learn a skill from a teacher or teach yourself online?",
          "Which skills will be most important for young people in the future?",
          "Why do some adults find it difficult to learn new things?",
        ],
      },
      {
        theme: "skills and work",
        questions: [
          "How has technology changed the skills employers look for?",
          "Do you think machines will replace people in many jobs?",
          "Should companies be responsible for training their staff?",
        ],
      },
    ],
  },
  {
    id: "book-film",
    topic: "A memorable book or film",
    mainPrompt: "Describe a book or film that made a strong impression on you.",
    bulletPoints: ["what it was", "when you read or watched it", "what it was about", "and explain why it made such an impression on you"],
    roundingOff: "Would you recommend it to your friends?",
    discussionLead: "a book or film that impressed you",
    part3Themes: [
      {
        theme: "reading habits",
        questions: [
          "Do you think people read less than they used to?",
          "What are the benefits of reading fiction?",
          "Should children be encouraged to read printed books rather than screens?",
        ],
      },
      {
        theme: "films and culture",
        questions: [
          "Why are films from some countries popular all over the world?",
          "Can films influence the way people behave?",
          "Is going to the cinema still important today?",
        ],
      },
    ],
  },
  {
    id: "helping",
    topic: "Helping someone",
    mainPrompt: "Describe a time when you helped someone.",
    bulletPoints: ["who you helped", "what the situation was", "how you helped them", "and explain how you felt afterwards"],
    roundingOff: "Do you often help people in your community?",
    discussionLead: "helping other people",
    part3Themes: [
      {
        theme: "volunteering",
        questions: [
          "Why do some people volunteer their time to help others?",
          "Should community service be compulsory for students?",
          "Do people help strangers less than they did in the past?",
        ],
      },
      {
        theme: "community",
        questions: [
          "What makes a neighbourhood a good place to live?",
          "How can cities help people get to know their neighbours?",
          "Is community spirit stronger in villages or in big cities?",
        ],
      },
    ],
  },
  {
    id: "goal",
    topic: "A difficult goal",
    mainPrompt: "Describe a difficult goal you set for yourself and achieved.",
    bulletPoints: ["what the goal was", "why you set it", "what challenges you faced", "and explain how you felt when you achieved it"],
    roundingOff: "Are you working towards a goal at the moment?",
    discussionLead: "setting and achieving goals",
    part3Themes: [
      {
        theme: "ambition",
        questions: [
          "Is it important for young people to set long-term goals?",
          "Why do some people give up on their goals?",
          "Is being ambitious always a positive quality?",
        ],
      },
      {
        theme: "success",
        questions: [
          "How do people in your country usually define success?",
          "Is success more about hard work or luck?",
          "Has social media changed the way people see success?",
        ],
      },
    ],
  },
  {
    id: "technology",
    topic: "A piece of technology",
    mainPrompt: "Describe a piece of technology you use often.",
    bulletPoints: ["what it is", "when you got it", "what you use it for", "and explain how your life would be different without it"],
    roundingOff: "Could you manage without it for a week?",
    discussionLead: "technology you use",
    part3Themes: [
      {
        theme: "technology in daily life",
        questions: [
          "How has technology changed the way families spend time together?",
          "Do people rely too much on their phones?",
          "What kinds of technology are most useful for older people?",
        ],
      },
      {
        theme: "the future of technology",
        questions: [
          "Which new technology will change daily life the most in the next twenty years?",
          "Should governments control how technology companies use personal data?",
          "Is technological progress always good for society?",
        ],
      },
    ],
  },
  {
    id: "celebration",
    topic: "A memorable celebration",
    mainPrompt: "Describe a celebration or festival you remember well.",
    bulletPoints: ["what the celebration was", "where and when it took place", "who you were with", "and explain why it was memorable"],
    roundingOff: "Do you generally enjoy big celebrations?",
    discussionLead: "celebrations and festivals",
    part3Themes: [
      {
        theme: "traditional festivals",
        questions: [
          "Why are traditional festivals important to a country?",
          "Are traditional festivals becoming too commercial?",
          "How can young people be encouraged to keep traditions alive?",
        ],
      },
      {
        theme: "celebrations today",
        questions: [
          "How have weddings and other celebrations changed in your country?",
          "Do people spend too much money on celebrations?",
          "Is it better to celebrate with family or with friends?",
        ],
      },
    ],
  },
  {
    id: "busy",
    topic: "A busy time",
    mainPrompt: "Describe a time when you were very busy.",
    bulletPoints: ["when it was", "why you were so busy", "how you managed your time", "and explain how you felt during that period"],
    roundingOff: "How do you usually relax after a busy day?",
    discussionLead: "being busy",
    part3Themes: [
      {
        theme: "work-life balance",
        questions: [
          "Why do so many people feel busier now than in the past?",
          "Should employers limit how many hours people work?",
          "How does stress affect people's health and relationships?",
        ],
      },
      {
        theme: "managing time",
        questions: [
          "What are the most effective ways to manage time?",
          "Should time management be taught at school?",
          "Can being very busy ever be a good thing?",
        ],
      },
    ],
  },
  {
    id: "outdoors",
    topic: "An outdoor activity",
    mainPrompt: "Describe an outdoor activity you enjoy.",
    bulletPoints: ["what the activity is", "where you do it", "who you do it with", "and explain why you enjoy it"],
    roundingOff: "Do you prefer doing it alone or with other people?",
    discussionLead: "outdoor activities",
    part3Themes: [
      {
        theme: "spending time outdoors",
        questions: [
          "Why do people spend less time outdoors than they used to?",
          "How can cities create more green spaces?",
          "Should children be encouraged to play outside more?",
        ],
      },
      {
        theme: "sport and health",
        questions: [
          "Why are some sports more popular than others?",
          "Are professional athletes paid too much?",
          "What can governments do to encourage people to exercise?",
        ],
      },
    ],
  },
  {
    id: "good-news",
    topic: "Good news",
    mainPrompt: "Describe a time when you received some good news.",
    bulletPoints: ["what the news was", "how you heard about it", "who you shared it with", "and explain how you felt about it"],
    roundingOff: "How did you celebrate?",
    discussionLead: "receiving good news",
    part3Themes: [
      {
        theme: "news and the media",
        questions: [
          "How do most people get their news nowadays?",
          "Can people trust the news they read online?",
          "Why does bad news often get more attention than good news?",
        ],
      },
      {
        theme: "sharing feelings",
        questions: [
          "Do people share their feelings more openly than in the past?",
          "Is it better to share good news in person or online?",
          "Why do some people prefer to keep their successes private?",
        ],
      },
    ],
  },
  {
    id: "teacher",
    topic: "A memorable teacher",
    mainPrompt: "Describe a teacher you remember well.",
    bulletPoints: ["who the teacher was", "what subject they taught", "what they were like", "and explain why you remember them so well"],
    roundingOff: "Would you ever like to be a teacher?",
    discussionLead: "a teacher you remember",
    part3Themes: [
      {
        theme: "teaching and learning",
        questions: [
          "What makes a good teacher?",
          "Will online learning ever replace classroom teaching?",
          "Should students be able to choose what they study at school?",
        ],
      },
      {
        theme: "exams",
        questions: [
          "Are exams a fair way to measure someone's ability?",
          "How much pressure do exams put on young people in your country?",
          "What other ways could schools assess students?",
        ],
      },
    ],
  },
];

const PART1_OPENING =
  "Good afternoon. My name is Tota, and I'll be your examiner today. In this first part, I'd like to ask you some questions about yourself.";

const PART2_INSTRUCTIONS =
  "Thank you. Now, I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. Before you talk, you'll have one minute to think about what you're going to say. You can make some notes if you wish. Here is your topic.";

export function formatCueCard(card: Pick<IeltsCueCard, "mainPrompt" | "bulletPoints">): string {
  return `${card.mainPrompt}\n\nYou should say:\n${card.bulletPoints.map((bp) => `• ${bp}`).join("\n")}`;
}

function part1Turns(topic: IeltsTopic, count: number, opener: string): IeltsQuestionDetail[] {
  // Keep the topic's natural opening question first, then sample the rest
  const [first, ...rest] = topic.questions;
  const questions = [first, ...pickRandom(rest, count - 1)];
  return questions.map((question, i) => ({
    part: 1,
    kind: "part1",
    topic: topic.topic,
    question,
    spokenPrefix: i === 0 ? opener : undefined,
    followUpStyle: null,
  }));
}

/**
 * Builds a full IELTS Speaking session: 7 Part 1 questions across 3 topics,
 * a cue card with a rounding-off question, and 4 Part 3 questions over 2 themes
 * (the first question of each theme gets one examiner probe).
 */
export function getIeltsSpeakingSessionQuestions(): {
  questions: string[];
  details: IeltsQuestionDetail[];
} {
  const [frame] = pickRandom(IELTS_FRAME_TOPICS, 1);
  const [topicA, topicB] = pickRandom(IELTS_PART1_TOPICS, 2);
  const [card] = pickRandom(IELTS_CUE_CARDS, 1);

  const details: IeltsQuestionDetail[] = [
    ...part1Turns(frame, 3, `${PART1_OPENING} Let's talk about ${frame.topic}.`),
    ...part1Turns(topicA, 2, `Now let's talk about ${topicA.topic}.`),
    ...part1Turns(topicB, 2, `Let's move on to ${topicB.topic}.`),
    {
      part: 2,
      kind: "cue-card",
      topic: card.topic,
      question: card.mainPrompt,
      bulletPoints: card.bulletPoints,
      spokenPrefix: PART2_INSTRUCTIONS,
      followUpStyle: null,
    },
    {
      part: 2,
      kind: "rounding-off",
      topic: card.topic,
      question: card.roundingOff,
      spokenPrefix: "Thank you.",
      followUpStyle: null,
    },
  ];

  card.part3Themes.forEach((theme, themeIdx) => {
    const lead =
      themeIdx === 0
        ? `We've been talking about ${card.discussionLead}, and I'd like to discuss with you one or two more general questions related to this. Let's consider first of all ${theme.theme}.`
        : `Now let's move on to ${theme.theme}.`;
    pickRandom(theme.questions, 2).forEach((question, qIdx) => {
      details.push({
        part: 3,
        kind: "part3",
        topic: theme.theme,
        question,
        spokenPrefix: qIdx === 0 ? lead : undefined,
        followUpStyle: qIdx === 0 ? "ielts-part3-probe" : null,
      });
    });
  });

  const questions = details.map((d) => (d.kind === "cue-card" ? formatCueCard(card) : d.question));
  return { questions, details };
}
