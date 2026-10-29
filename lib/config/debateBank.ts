import { pickRandom, type ScriptedTurn } from "@/lib/config/sessionScript";
import type { FrameworkStep } from "@/lib/config/questionBank";

/**
 * Debate practice: a one-on-one debate where the user argues an assigned side of a
 * motion and Tota argues the other side.
 *
 * Flow (3 rounds, 5 speaking turns):
 *  1. Opening statement -> Tota rebuts the weakest argument and asks for a response
 *  2. Evidence round    -> Tota cross-examines with one pointed question
 *  3. Closing statement
 */

export type DebateSide = "for" | "against";
export type DebateStage = "opening" | "evidence" | "closing";

export interface DebateMotion {
  id: string;
  category: string;
  motion: string;
  context: string;
  forPoints: string[];
  againstPoints: string[];
}

export interface DebateTurnDetail extends ScriptedTurn {
  stage: DebateStage;
  motion: string;
  side: DebateSide;
  context: string;
  /** Talking points Tota can draw on when arguing the opposing side. */
  opponentPoints: string[];
  framework: string;
  frameworkSteps: FrameworkStep[];
  question: string;
}

const AREI_STEPS: FrameworkStep[] = [
  { letter: "A", label: "Assertion", description: "State your claim in one clear sentence." },
  { letter: "R", label: "Reasoning", description: "Explain why the claim is true." },
  { letter: "E", label: "Evidence", description: "Back it up with a fact, statistic or real example." },
  { letter: "I", label: "Impact", description: "Explain why it matters for the motion." },
];

const CLOSING_STEPS: FrameworkStep[] = [
  { letter: "C", label: "Clash", description: "Name the main point of disagreement." },
  { letter: "W", label: "Weigh", description: "Explain why your side's arguments matter more." },
  { letter: "F", label: "Finish", description: "End with a confident one-line conclusion." },
];

export const DEBATE_MOTIONS: DebateMotion[] = [
  {
    id: "social-media",
    category: "Technology",
    motion: "This house believes social media does more harm than good.",
    context: "Billions of people use social media daily for news, connection and entertainment.",
    forPoints: [
      "It is linked to anxiety and poor sleep, especially in teenagers.",
      "It spreads misinformation faster than corrections can catch up.",
      "Its business model rewards outrage and addictive scrolling.",
    ],
    againstPoints: [
      "It keeps families and friends connected across distances.",
      "It gives small businesses and creators a free way to reach customers.",
      "It has helped organise charity drives and disaster relief quickly.",
    ],
  },
  {
    id: "homework",
    category: "Education",
    motion: "This house would ban homework in primary schools.",
    context: "Young children often spend an hour or more on homework after school.",
    forPoints: [
      "Research shows little academic benefit from homework for young children.",
      "Children need time to play, rest and be with family.",
      "Homework widens the gap between children with and without support at home.",
    ],
    againstPoints: [
      "Homework builds discipline and independent study habits early.",
      "It lets parents see what their children are learning.",
      "Short practice at home reinforces reading and maths skills.",
    ],
  },
  {
    id: "remote-work",
    category: "Work",
    motion: "This house believes remote work is better than working in an office.",
    context: "Since 2020, many companies have let employees work from home some or all of the time.",
    forPoints: [
      "It removes commuting time, saving hours every week.",
      "Companies can hire talent from anywhere, not just one city.",
      "Many people report better focus and work-life balance at home.",
    ],
    againstPoints: [
      "Junior staff learn faster by watching experienced colleagues in person.",
      "Spontaneous collaboration and creativity happen more easily in the office.",
      "Remote work can lead to isolation and blurred boundaries.",
    ],
  },
  {
    id: "compulsory-voting",
    category: "Society",
    motion: "This house would make voting compulsory.",
    context: "Countries such as Australia require citizens to vote, while most countries do not.",
    forPoints: [
      "Governments would reflect the whole population, not just the most motivated voters.",
      "It reduces the influence of extreme groups with highly motivated supporters.",
      "It makes voting a normal civic habit, like paying taxes.",
    ],
    againstPoints: [
      "Forcing people to vote limits personal freedom.",
      "Uninformed or reluctant voters may vote randomly.",
      "It treats a symptom; disengagement should be fixed with better politics.",
    ],
  },
  {
    id: "ai-jobs",
    category: "Technology",
    motion: "This house believes artificial intelligence will create more jobs than it destroys.",
    context: "AI tools are now writing, designing and coding tasks that people used to do.",
    forPoints: [
      "Past technologies, like computers, created more jobs than they removed.",
      "AI creates new roles in building, maintaining and supervising AI systems.",
      "Lower costs lead to new businesses and new demand.",
    ],
    againstPoints: [
      "AI can automate thinking work, not just manual work, so the scale is new.",
      "New jobs may require skills most displaced workers don't have.",
      "The benefits may go to a few companies while many workers lose income.",
    ],
  },
  {
    id: "plastics",
    category: "Environment",
    motion: "This house would ban single-use plastics.",
    context: "Plastic bags, straws and packaging are used once and often end up in the ocean.",
    forPoints: [
      "Single-use plastics pollute oceans and harm wildlife for centuries.",
      "Bans in several countries have quickly cut plastic waste.",
      "Alternatives already exist for most single-use items.",
    ],
    againstPoints: [
      "Some plastics are essential in healthcare and food safety.",
      "Alternatives like paper can have a higher carbon footprint.",
      "Better recycling and waste collection would solve more of the problem.",
    ],
  },
  {
    id: "free-university",
    category: "Education",
    motion: "This house believes university education should be free.",
    context: "University fees vary widely, from free in some countries to very expensive in others.",
    forPoints: [
      "Free tuition gives talented students from poor families equal opportunity.",
      "Society benefits from more educated workers and citizens.",
      "Graduates avoid years of debt that delay buying homes and starting families.",
    ],
    againstPoints: [
      "Taxpayers who never attend university would pay for those who do.",
      "Free places can lead to overcrowding and lower quality.",
      "Graduates often earn more, so it's fair they contribute.",
    ],
  },
  {
    id: "four-day-week",
    category: "Work",
    motion: "This house would introduce a four-day working week.",
    context: "Trials in several countries have tested working four days for the same pay.",
    forPoints: [
      "Trials have shown productivity stays the same or improves.",
      "Workers are healthier and less burnt out.",
      "Companies find it easier to attract and keep staff.",
    ],
    againstPoints: [
      "Some jobs, like healthcare and retail, need cover every day.",
      "Squeezing work into four days can increase stress.",
      "Small businesses may not be able to afford it.",
    ],
  },
  {
    id: "space",
    category: "Science",
    motion: "This house believes space exploration is a waste of money.",
    context: "Governments and private companies spend billions on rockets, satellites and missions to Mars.",
    forPoints: [
      "The money could solve urgent problems on Earth, like poverty and disease.",
      "Many missions offer little direct benefit to ordinary people.",
      "Private space projects mainly serve billionaires' ambitions.",
    ],
    againstPoints: [
      "Space research has produced everyday technology like GPS and weather forecasting.",
      "Satellites help monitor climate change and natural disasters.",
      "Exploration inspires young people to study science and engineering.",
    ],
  },
  {
    id: "child-advertising",
    category: "Society",
    motion: "This house would ban advertising aimed at children.",
    context: "Children see thousands of ads a year on TV, games and video platforms.",
    forPoints: [
      "Children can't easily tell the difference between ads and content.",
      "Ads for junk food are linked to rising childhood obesity.",
      "Advertising creates pressure on families to buy things they can't afford.",
    ],
    againstPoints: [
      "Parents, not governments, should decide what their children see.",
      "Ads fund free children's content and apps.",
      "Learning to judge advertising is an important life skill.",
    ],
  },
  {
    id: "zoos",
    category: "Ethics",
    motion: "This house believes zoos should be abolished.",
    context: "Zoos keep wild animals in captivity for conservation, education and entertainment.",
    forPoints: [
      "Even good enclosures can't match an animal's natural habitat.",
      "Many zoo animals show signs of stress and boredom.",
      "Conservation money is better spent protecting habitats in the wild.",
    ],
    againstPoints: [
      "Zoos run breeding programmes that have saved species from extinction.",
      "They teach millions of people, especially children, to care about wildlife.",
      "They fund research and protect animals that can't survive in the wild.",
    ],
  },
  {
    id: "rent-vs-buy",
    category: "Economy",
    motion: "This house believes it is better to rent than to buy a home.",
    context: "In many cities, home prices have risen much faster than wages.",
    forPoints: [
      "Renting gives flexibility to move for jobs and opportunities.",
      "Renters avoid huge debt and surprise repair costs.",
      "Money not spent on a deposit can be invested elsewhere.",
    ],
    againstPoints: [
      "Owning builds long-term wealth instead of paying a landlord.",
      "Owners have security and can't be asked to leave.",
      "Mortgage payments can be cheaper than rent over time.",
    ],
  },
  {
    id: "exams",
    category: "Education",
    motion: "This house would replace final exams with continuous assessment.",
    context: "Many school systems decide grades mostly through one set of final exams.",
    forPoints: [
      "One bad day can unfairly define a student's results.",
      "Continuous assessment rewards steady effort and real understanding.",
      "It reduces the intense stress of a single high-stakes exam.",
    ],
    againstPoints: [
      "Exams are harder to cheat on than coursework.",
      "They test whether knowledge is remembered, not just completed.",
      "Continuous assessment can mean constant pressure all year.",
    ],
  },
  {
    id: "celebrities",
    category: "Culture",
    motion: "This house believes celebrities have a responsibility to be role models.",
    context: "Celebrities have millions of followers, many of them young people.",
    forPoints: [
      "Their influence over young people comes with responsibility.",
      "They profit from public attention, so they owe something back.",
      "Positive celebrity behaviour has encouraged causes like mental health awareness.",
    ],
    againstPoints: [
      "Celebrities are famous for their talent, not for being moral guides.",
      "Expecting perfection from anyone is unfair and unrealistic.",
      "Parents and teachers should be children's main role models.",
    ],
  },
];

/** Builds a debate session on a random motion with a randomly assigned side. */
export function getDebateSessionQuestions(): { questions: string[]; details: DebateTurnDetail[] } {
  const [m] = pickRandom(DEBATE_MOTIONS, 1);
  const side: DebateSide = Math.random() < 0.5 ? "for" : "against";
  const opponentPoints = side === "for" ? m.againstPoints : m.forPoints;
  const base = { motion: m.motion, side, context: m.context, opponentPoints };

  const details: DebateTurnDetail[] = [
    {
      ...base,
      stage: "opening",
      framework: "Opening statement",
      frameworkSteps: AREI_STEPS,
      question: "Give your opening statement: state your position and your two strongest arguments.",
      spokenPrefix: `Welcome to debate practice. Today's motion is: ${m.motion} You'll be arguing ${side} the motion, and I'll argue the other side. The floor is yours.`,
      followUpStyle: "debate-rebuttal",
    },
    {
      ...base,
      stage: "evidence",
      framework: "Evidence round",
      frameworkSteps: AREI_STEPS,
      question: "Give me your strongest piece of evidence or a real-world example that supports your side.",
      spokenPrefix: "Let's move to the evidence round.",
      followUpStyle: "debate-cross-exam",
    },
    {
      ...base,
      stage: "closing",
      framework: "Closing statement",
      frameworkSteps: CLOSING_STEPS,
      question: "Give your closing statement: summarise the key clash and explain why your side should win.",
      spokenPrefix: "Thank you. We're coming to the end of the debate.",
      followUpStyle: null,
    },
  ];

  return { questions: details.map((d) => d.question), details };
}
