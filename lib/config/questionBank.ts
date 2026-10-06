export type FrameworkType = "STAR" | "CAR" | "SEE" | "PAR";

export interface FrameworkStep {
  letter: string;
  label: string;
  description: string;
}

export interface ExampleSentence {
  text: string;
  stepLetter: string;
}

export interface QuestionBankItem {
  id: string;
  framework: FrameworkType;
  promptText: string;
  frameworkSteps: FrameworkStep[];
  exampleAnswer: string;
  exampleSentences: ExampleSentence[];
}

export const FRAMEWORK_DEFINITIONS: Record<FrameworkType, { name: string; description: string; steps: FrameworkStep[] }> = {
  STAR: {
    name: "STAR Framework",
    description: "Best for behavioral stories and structured interview questions.",
    steps: [
      { letter: "S", label: "Situation", description: "Set the scene and provide necessary background context." },
      { letter: "T", label: "Task", description: "Describe your specific responsibility or challenge." },
      { letter: "A", label: "Action", description: "Detail the exact steps you took to address the situation." },
      { letter: "R", label: "Result", description: "Share the outcome, metrics, or key lessons learned." },
    ],
  },
  CAR: {
    name: "CAR Framework",
    description: "Best for small talk, casual conversations, and engaging stories.",
    steps: [
      { letter: "C", label: "Context", description: "Briefly share the background, event, or topic." },
      { letter: "A", label: "Action", description: "Describe what happened, what you did, or what you experienced." },
      { letter: "R", label: "Result", description: "Highlight your takeaway, impression, or how it ended." },
    ],
  },
  SEE: {
    name: "SEE Framework",
    description: "Best for explaining complex concepts, opinions, or ideas clearly.",
    steps: [
      { letter: "S", label: "Statement", description: "Make your core point or state the main concept clearly." },
      { letter: "E", label: "Example", description: "Provide a concrete, relatable example or illustration." },
      { letter: "E", label: "Explanation", description: "Explain why the example proves or clarifies your core statement." },
    ],
  },
  PAR: {
    name: "PAR Framework",
    description: "Best for problem-solving, overcoming obstacles, and personal growth.",
    steps: [
      { letter: "P", label: "Problem", description: "Define the initial problem, obstacle, or friction point." },
      { letter: "A", label: "Action", description: "Explain the strategy and steps implemented to resolve it." },
      { letter: "R", label: "Result", description: "Show the resolution, positive impact, or growth achieved." },
    ],
  },
};

export const questionBank: QuestionBankItem[] = [
  // --- STAR Framework Prompts ---
  {
    id: "star-1",
    framework: "STAR",
    promptText: "Tell me about a time you handled conflict with a team member.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.STAR.steps,
    exampleAnswer:
      "During a launch sprint, a teammate and I disagreed on whether to refactor our API architecture before release. As lead developer, I needed to ensure system stability without delaying our launch date. I scheduled a 30-minute 1-on-1 to review benchmarks together, and we agreed to isolate critical fixes now while deferring non-essential refactoring to sprint two. We launched on time with zero downtime, and our team adopted this review protocol for future sprints.",
    exampleSentences: [
      { text: "During a launch sprint, a teammate and I disagreed on whether to refactor our API architecture before release.", stepLetter: "S" },
      { text: "As lead developer, I needed to ensure system stability without delaying our launch date.", stepLetter: "T" },
      { text: "I scheduled a 30-minute 1-on-1 to review benchmarks together, and we agreed to isolate critical fixes now while deferring non-essential refactoring to sprint two.", stepLetter: "A" },
      { text: "We launched on time with zero downtime, and our team adopted this review protocol for future sprints.", stepLetter: "R" },
    ],
  },
  {
    id: "star-2",
    framework: "STAR",
    promptText: "Describe a mistake you made in a past project and what you learned from it.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.STAR.steps,
    exampleAnswer:
      "Last year, I misconfigured a database index during an off-hours migration, causing elevated latency for 15 minutes. My goal was to complete the update quickly, but I skipped running the validation script on staging. I immediately rolled back the patch, verified the missing index in staging, and re-deployed cleanly. The outage was minimal, and I implemented mandatory pre-flight deployment checks that prevented similar issues since.",
    exampleSentences: [
      { text: "Last year, I misconfigured a database index during an off-hours migration, causing elevated latency for 15 minutes.", stepLetter: "S" },
      { text: "My goal was to complete the update quickly, but I skipped running the validation script on staging.", stepLetter: "T" },
      { text: "I immediately rolled back the patch, verified the missing index in staging, and re-deployed cleanly.", stepLetter: "A" },
      { text: "The outage was minimal, and I implemented mandatory pre-flight deployment checks that prevented similar issues since.", stepLetter: "R" },
    ],
  },
  {
    id: "star-3",
    framework: "STAR",
    promptText: "Tell me about a time you had to deliver difficult news to a stakeholder.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.STAR.steps,
    exampleAnswer:
      "Our team realized a key feature wouldn't meet the client's strict release deadline due to third-party API delays. I had to inform the client early while offering a realistic mitigation plan. I set up an emergency call, clearly explained the technical blocker, and proposed a phased rollout with core features first. The client appreciated the transparency and approved the phased release, which went smoothly without business disruption.",
    exampleSentences: [
      { text: "Our team realized a key feature wouldn't meet the client's strict release deadline due to third-party API delays.", stepLetter: "S" },
      { text: "I had to inform the client early while offering a realistic mitigation plan.", stepLetter: "T" },
      { text: "I set up an emergency call, clearly explained the technical blocker, and proposed a phased rollout with core features first.", stepLetter: "A" },
      { text: "The client appreciated the transparency and approved the phased release, which went smoothly without business disruption.", stepLetter: "R" },
    ],
  },
  {
    id: "star-4",
    framework: "STAR",
    promptText: "Describe a situation where you had to lead a project under tight deadlines.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.STAR.steps,
    exampleAnswer:
      "We had just 2 weeks to build a client-facing analytics dashboard for an upcoming executive presentation. As project lead, I had to coordinate three engineers and prioritize core metrics. I broke down tasks into daily micro-milestones and removed non-essential UI animations. We delivered a functional, high-performing dashboard 2 days early, earning praise from leadership.",
    exampleSentences: [
      { text: "We had just 2 weeks to build a client-facing analytics dashboard for an upcoming executive presentation.", stepLetter: "S" },
      { text: "As project lead, I had to coordinate three engineers and prioritize core metrics.", stepLetter: "T" },
      { text: "I broke down tasks into daily micro-milestones and removed non-essential UI animations.", stepLetter: "A" },
      { text: "We delivered a functional, high-performing dashboard 2 days early, earning praise from leadership.", stepLetter: "R" },
    ],
  },

  // --- CAR Framework Prompts (Small talk & casual conversation) ---
  {
    id: "car-1",
    framework: "CAR",
    promptText: "Tell me about your weekend!",
    frameworkSteps: FRAMEWORK_DEFINITIONS.CAR.steps,
    exampleAnswer:
      "Last weekend was beautiful outside, so a few friends and I decided to go hiking at a state park nearby. We spent Saturday morning on a steep 5-mile trail and grilled burgers at the summit campsite. It was super refreshing to disconnect from screens for a full day and catch up in person.",
    exampleSentences: [
      { text: "Last weekend was beautiful outside, so a few friends and I decided to go hiking at a state park nearby.", stepLetter: "C" },
      { text: "We spent Saturday morning on a steep 5-mile trail and grilled burgers at the summit campsite.", stepLetter: "A" },
      { text: "It was super refreshing to disconnect from screens for a full day and catch up in person.", stepLetter: "R" },
    ],
  },
  {
    id: "car-2",
    framework: "CAR",
    promptText: "What's something interesting you've watched or read recently?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.CAR.steps,
    exampleAnswer:
      "I recently watched a documentary series about deep-sea exploration and marine ecosystems. I ended up bingeing three episodes in one sitting because the underwater camera technology was so mind-blowing. It really changed how I think about deep-ocean conservation and marine life resilience.",
    exampleSentences: [
      { text: "I recently watched a documentary series about deep-sea exploration and marine ecosystems.", stepLetter: "C" },
      { text: "I ended up bingeing three episodes in one sitting because the underwater camera technology was so mind-blowing.", stepLetter: "A" },
      { text: "It really changed how I think about deep-ocean conservation and marine life resilience.", stepLetter: "R" },
    ],
  },
  {
    id: "car-3",
    framework: "CAR",
    promptText: "What is a recent hobby or activity you've been enjoying?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.CAR.steps,
    exampleAnswer:
      "A couple of months ago, I started learning sourdough bread baking at home. I built my own starter from scratch and experimented with flour ratios every Sunday morning. Now I can bake delicious fresh loaves that my family loves, and it has become my favorite relaxing routine.",
    exampleSentences: [
      { text: "A couple of months ago, I started learning sourdough bread baking at home.", stepLetter: "C" },
      { text: "I built my own starter from scratch and experimented with flour ratios every Sunday morning.", stepLetter: "A" },
      { text: "Now I can bake delicious fresh loaves that my family loves, and it has become my favorite relaxing routine.", stepLetter: "R" },
    ],
  },
  {
    id: "car-4",
    framework: "CAR",
    promptText: "Tell me about a great meal or restaurant you tried recently.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.CAR.steps,
    exampleAnswer:
      "Last Friday night, my coworkers and I checked out a new authentic ramen shop downtown. We waited 20 minutes for a table and tried their signature spicy tonkotsu broth with handmade noodles. It turned out to be the best ramen I've had in years, and we've already made plans to return next month.",
    exampleSentences: [
      { text: "Last Friday night, my coworkers and I checked out a new authentic ramen shop downtown.", stepLetter: "C" },
      { text: "We waited 20 minutes for a table and tried their signature spicy tonkotsu broth with handmade noodles.", stepLetter: "A" },
      { text: "It turned out to be the best ramen I've had in years, and we've already made plans to return next month.", stepLetter: "R" },
    ],
  },

  // --- SEE Framework Prompts (Explaining opinions/concepts) ---
  {
    id: "see-1",
    framework: "SEE",
    promptText: "Explain a technical or complex topic you know well, as if to someone with no background in it.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.SEE.steps,
    exampleAnswer:
      "Caching in software is like keeping your favorite book on your desk instead of walking to the library every time you want to read a page. For instance, when you visit a webpage, your phone saves the images locally so it doesn't have to download them again on your next click. This simple technique dramatically speeds up applications and reduces network traffic.",
    exampleSentences: [
      { text: "Caching in software is like keeping your favorite book on your desk instead of walking to the library every time you want to read a page.", stepLetter: "S" },
      { text: "For instance, when you visit a webpage, your phone saves the images locally so it doesn't have to download them again on your next click.", stepLetter: "E" },
      { text: "This simple technique dramatically speeds up applications and reduces network traffic.", stepLetter: "E" },
    ],
  },
  {
    id: "see-2",
    framework: "SEE",
    promptText: "Explain how the internet works to a 10-year-old.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.SEE.steps,
    exampleAnswer:
      "The internet is basically a massive global network of fast delivery drivers sending digital letters back and forth between computers. When you click a YouTube video, your tablet sends a tiny request letter across ocean cables to a computer building, which instantly sends video pieces back. That's why you can watch your favorite creator instantly from thousands of miles away!",
    exampleSentences: [
      { text: "The internet is basically a massive global network of fast delivery drivers sending digital letters back and forth between computers.", stepLetter: "S" },
      { text: "When you click a YouTube video, your tablet sends a tiny request letter across ocean cables to a computer building, which instantly sends video pieces back.", stepLetter: "E" },
      { text: "That's why you can watch your favorite creator instantly from thousands of miles away!", stepLetter: "E" },
    ],
  },
  {
    id: "see-3",
    framework: "SEE",
    promptText: "Explain why taking short breaks improves focus and productivity.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.SEE.steps,
    exampleAnswer:
      "Regular short breaks prevent mental fatigue and help maintain peak cognitive performance throughout the workday. For example, taking a 5-minute walk every hour gives your prefrontal cortex time to reset and synthesize information. As a result, you return to your desk with sharper focus and make significantly fewer mistakes.",
    exampleSentences: [
      { text: "Regular short breaks prevent mental fatigue and help maintain peak cognitive performance throughout the workday.", stepLetter: "S" },
      { text: "For example, taking a 5-minute walk every hour gives your prefrontal cortex time to reset and synthesize information.", stepLetter: "E" },
      { text: "As a result, you return to your desk with sharper focus and make significantly fewer mistakes.", stepLetter: "E" },
    ],
  },
  {
    id: "see-4",
    framework: "SEE",
    promptText: "Explain the concept of compound interest in plain, simple terms.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.SEE.steps,
    exampleAnswer:
      "Compound interest means earning interest not just on your original money, but also on the interest that money has already earned over time. Think of it like a snowball rolling down a hill—it starts small, but as it collects more snow, it grows faster and larger with every turn. That exponential growth is why starting to save early makes such a massive difference in the long run.",
    exampleSentences: [
      { text: "Compound interest means earning interest not just on your original money, but also on the interest that money has already earned over time.", stepLetter: "S" },
      { text: "Think of it like a snowball rolling down a hill—it starts small, but as it collects more snow, it grows faster and larger with every turn.", stepLetter: "E" },
      { text: "That exponential growth is why starting to save early makes such a massive difference in the long run.", stepLetter: "E" },
    ],
  },

  // --- PAR Framework Prompts (Problem-solving/personal growth) ---
  {
    id: "par-1",
    framework: "PAR",
    promptText: "Describe a challenge you overcame and how you approached it.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PAR.steps,
    exampleAnswer:
      "When I moved to remote work, I struggled with blurred boundaries between work and home life, leading to burnout. I established a strict shutdown routine at 6 PM, put my laptop in another room, and scheduled evening workouts. Within three weeks, my energy levels rebounded and my focus during work hours improved dramatically.",
    exampleSentences: [
      { text: "When I moved to remote work, I struggled with blurred boundaries between work and home life, leading to burnout.", stepLetter: "P" },
      { text: "I established a strict shutdown routine at 6 PM, put my laptop in another room, and scheduled evening workouts.", stepLetter: "A" },
      { text: "Within three weeks, my energy levels rebounded and my focus during work hours improved dramatically.", stepLetter: "R" },
    ],
  },
  {
    id: "par-2",
    framework: "PAR",
    promptText: "How do you handle receiving critical feedback on your work?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PAR.steps,
    exampleAnswer:
      "Earlier in my career, receiving sudden critique made me defensive, which hindered my growth. I began practicing active listening—writing down feedback without interrupting and asking clarifying questions after taking a breath. This simple shift transformed constructive feedback into actionable goals, helping me accelerate my skill development.",
    exampleSentences: [
      { text: "Earlier in my career, receiving sudden critique made me defensive, which hindered my growth.", stepLetter: "P" },
      { text: "I began practicing active listening—writing down feedback without interrupting and asking clarifying questions after taking a breath.", stepLetter: "A" },
      { text: "This simple shift transformed constructive feedback into actionable goals, helping me accelerate my skill development.", stepLetter: "R" },
    ],
  },
  {
    id: "par-3",
    framework: "PAR",
    promptText: "Describe a situation where you had to persuade someone to see things from your perspective.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PAR.steps,
    exampleAnswer:
      "My team was hesitant to adopt automated unit testing because they feared it would slow down immediate feature delivery. I offered to write a 1-day prototype demonstrating how tests catch bugs before QA reviews. Seeing the prototype catch two regression bugs instantly convinced the team, and automated tests are now standard in our workflow.",
    exampleSentences: [
      { text: "My team was hesitant to adopt automated unit testing because they feared it would slow down immediate feature delivery.", stepLetter: "P" },
      { text: "I offered to write a 1-day prototype demonstrating how tests catch bugs before QA reviews.", stepLetter: "A" },
      { text: "Seeing the prototype catch two regression bugs instantly convinced the team, and automated tests are now standard in our workflow.", stepLetter: "R" },
    ],
  },
  {
    id: "par-4",
    framework: "PAR",
    promptText: "Tell me about a personal goal you set and how you achieved it.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PAR.steps,
    exampleAnswer:
      "I used to get extremely nervous speaking in front of large groups, which held me back in team meetings. I joined a local Toastmasters club and committed to giving 5 short speeches over 3 months. Overcoming that fear gave me the confidence to present our team roadmap to over 100 executives last quarter.",
    exampleSentences: [
      { text: "I used to get extremely nervous speaking in front of large groups, which held me back in team meetings.", stepLetter: "P" },
      { text: "I joined a local Toastmasters club and committed to giving 5 short speeches over 3 months.", stepLetter: "A" },
      { text: "Overcoming that fear gave me the confidence to present our team roadmap to over 100 executives last quarter.", stepLetter: "R" },
    ],
  },
];

/**
 * Session-start logic for communication-builder:
 * Randomly selects 3 questions from 3 DIFFERENT frameworks out of (STAR, CAR, SEE, PAR).
 * Never repeats a framework twice in one session.
 */
export function getCommunicationBuilderSessionQuestions(): QuestionBankItem[] {
  const frameworks: FrameworkType[] = ["STAR", "CAR", "SEE", "PAR"];

  // Shuffle frameworks to pick 3 distinct frameworks
  const shuffledFrameworks = [...frameworks].sort(() => Math.random() - 0.5);
  const selectedFrameworks = shuffledFrameworks.slice(0, 3);

  const selectedQuestions: QuestionBankItem[] = [];

  for (const fw of selectedFrameworks) {
    const matchingQuestions = questionBank.filter((q) => q.framework === fw);
    const randomIndex = Math.floor(Math.random() * matchingQuestions.length);
    selectedQuestions.push(matchingQuestions[randomIndex]);
  }

  return selectedQuestions;
}
