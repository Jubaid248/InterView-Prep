import { pickRandom, type FollowUpStyle } from "@/lib/config/sessionScript";

export type FrameworkType = "ARE" | "STAR" | "CAR" | "SEE" | "PAR" | "PREP" | "PPF";

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
  /** Small talk only: where the conversation happens and who Tota is playing. */
  setting?: string;
  /** Spoken by Tota before the prompt (scene-setting or a transition). */
  spokenPrefix?: string;
  followUpStyle?: FollowUpStyle | null;
}

export const FRAMEWORK_DEFINITIONS: Record<FrameworkType, { name: string; description: string; steps: FrameworkStep[] }> = {
  ARE: {
    name: "ARE Method",
    description: "Best for starting small talk and keeping it flowing naturally.",
    steps: [
      { letter: "A", label: "Anchor", description: "Comment on something you both share: the place, the event or the moment." },
      { letter: "R", label: "Reveal", description: "Share a small, genuine detail about yourself." },
      { letter: "E", label: "Encourage", description: "Hand the conversation back with an open question." },
    ],
  },
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
    description: "Best for telling short, engaging stories in casual conversation.",
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
  PREP: {
    name: "PREP Method",
    description: "Best for sharing an opinion clearly and persuasively in under a minute.",
    steps: [
      { letter: "P", label: "Point", description: "State your opinion in one clear sentence." },
      { letter: "R", label: "Reason", description: "Give the main reason you believe it." },
      { letter: "E", label: "Example", description: "Back it up with a specific example or fact." },
      { letter: "P", label: "Point", description: "Restate your point so it sticks." },
    ],
  },
  PPF: {
    name: "Past–Present–Future",
    description: "Best for introducing yourself and answering 'So, what do you do?'",
    steps: [
      { letter: "P", label: "Past", description: "Where you started or the experience that led you here." },
      { letter: "N", label: "Present", description: "What you do now and what you focus on." },
      { letter: "F", label: "Future", description: "Where you're heading or what you're excited about next." },
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

  // --- CAR Framework Prompts (short stories in conversation) ---
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
  // --- ARE Method: small talk scenarios (Tota plays the other person) ---
  {
    id: "are-1",
    framework: "ARE",
    setting: "A networking event · Tota is Sam, another guest",
    spokenPrefix: "Let's start with some small talk. Imagine we're at a networking event, and I'm Sam, another guest.",
    promptText: "Hi! I don't think we've met. I'm Sam. How do you know the organisers?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "Hi Sam, nice to meet you. This is a great turnout for a Tuesday night. I came with a friend from work who knows one of the organisers, and I'm trying to meet more people in product design. What about you, what brings you here tonight?",
    exampleSentences: [
      { text: "Hi Sam, nice to meet you. This is a great turnout for a Tuesday night.", stepLetter: "A" },
      { text: "I came with a friend from work who knows one of the organisers, and I'm trying to meet more people in product design.", stepLetter: "R" },
      { text: "What about you, what brings you here tonight?", stepLetter: "E" },
    ],
  },
  {
    id: "are-2",
    framework: "ARE",
    setting: "The office coffee machine on a Monday · Tota is Priya, a colleague",
    spokenPrefix: "Let's start with some small talk. It's Monday morning at the office coffee machine, and I'm Priya, a colleague.",
    promptText: "Morning! Did you get up to anything fun this weekend?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "Morning, Priya! I definitely need this coffee after the weekend. I finally tried that new hiking trail by the river, and my legs are still recovering. Did you do anything good, or was it a quiet one?",
    exampleSentences: [
      { text: "Morning, Priya! I definitely need this coffee after the weekend.", stepLetter: "A" },
      { text: "I finally tried that new hiking trail by the river, and my legs are still recovering.", stepLetter: "R" },
      { text: "Did you do anything good, or was it a quiet one?", stepLetter: "E" },
    ],
  },
  {
    id: "are-3",
    framework: "ARE",
    setting: "An airport gate with a delayed flight · Tota is a fellow passenger",
    spokenPrefix: "Let's start with some small talk. We're both waiting at an airport gate, and our flight has just been delayed.",
    promptText: "Looks like we'll be here a while. Are you heading home, or travelling for work?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "It really does. At least we've got good seats by the window. I'm heading home after a conference, so honestly an extra hour isn't the end of the world. How about you, is the delay going to mess up your plans?",
    exampleSentences: [
      { text: "It really does. At least we've got good seats by the window.", stepLetter: "A" },
      { text: "I'm heading home after a conference, so honestly an extra hour isn't the end of the world.", stepLetter: "R" },
      { text: "How about you, is the delay going to mess up your plans?", stepLetter: "E" },
    ],
  },
  {
    id: "are-4",
    framework: "ARE",
    setting: "Lunch on your first day at a new job · Tota is Jordan, a teammate",
    spokenPrefix: "Let's start with some small talk. It's lunchtime on your first day at a new job, and I'm Jordan, your new teammate.",
    promptText: "So you're the new person on the team! How's your first day going so far?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "It's going really well, thanks. Everyone's been so welcoming, and this lunch spot is a nice surprise. I've mostly been setting up my laptop and trying to remember everyone's names. How long have you been on the team?",
    exampleSentences: [
      { text: "It's going really well, thanks. Everyone's been so welcoming, and this lunch spot is a nice surprise.", stepLetter: "A" },
      { text: "I've mostly been setting up my laptop and trying to remember everyone's names.", stepLetter: "R" },
      { text: "How long have you been on the team?", stepLetter: "E" },
    ],
  },
  {
    id: "are-5",
    framework: "ARE",
    setting: "The lift in your building · Tota is a neighbour",
    spokenPrefix: "Let's start with some small talk. We're in the lift of your apartment building, and I'm a neighbour you haven't met yet.",
    promptText: "Hi, I think you've just moved in on the fourth floor? How are you finding the building?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "Yes, that's me! It's been great so far, and this lift is a lot faster than my last one. I moved here for a new job, so I'm still figuring out the neighbourhood. Have you lived here long? Any good places nearby I should know about?",
    exampleSentences: [
      { text: "Yes, that's me! It's been great so far, and this lift is a lot faster than my last one.", stepLetter: "A" },
      { text: "I moved here for a new job, so I'm still figuring out the neighbourhood.", stepLetter: "R" },
      { text: "Have you lived here long? Any good places nearby I should know about?", stepLetter: "E" },
    ],
  },
  {
    id: "are-6",
    framework: "ARE",
    setting: "Waiting for others to join a video call · Tota is Alex, a client",
    spokenPrefix: "Let's start with some small talk. We're on a video call waiting for the others to join, and I'm Alex, a client.",
    promptText: "Looks like we're the first two here. How's your week been so far?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "Always good to be early. It's been a busy week, but in a good way. We've been wrapping up a project, so I'm looking forward to a calmer Friday. How about yours, are things busy on your side too?",
    exampleSentences: [
      { text: "Always good to be early.", stepLetter: "A" },
      { text: "It's been a busy week, but in a good way. We've been wrapping up a project, so I'm looking forward to a calmer Friday.", stepLetter: "R" },
      { text: "How about yours, are things busy on your side too?", stepLetter: "E" },
    ],
  },
  {
    id: "are-7",
    framework: "ARE",
    setting: "A friend's birthday party · Tota is Leo, a friend of the host",
    spokenPrefix: "Let's start with some small talk. We're at a friend's birthday party, and I'm Leo. We've never met.",
    promptText: "Hey, I'm Leo. So how do you know Nadia?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "Hi Leo! She's thrown a great party, the food is amazing. Nadia and I met at university, we were in the same photography club. How about you, how did you two meet?",
    exampleSentences: [
      { text: "Hi Leo! She's thrown a great party, the food is amazing.", stepLetter: "A" },
      { text: "Nadia and I met at university, we were in the same photography club.", stepLetter: "R" },
      { text: "How about you, how did you two meet?", stepLetter: "E" },
    ],
  },
  {
    id: "are-8",
    framework: "ARE",
    setting: "Lunch at a conference · Tota is another attendee",
    spokenPrefix: "Let's start with some small talk. It's lunchtime at a conference, and I'm another attendee looking for a seat.",
    promptText: "Mind if I sit here? What did you think of the morning keynote?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.ARE.steps,
    exampleAnswer:
      "Of course, go ahead. The keynote was a strong start to the day. I really liked the part about remote teams, because that's exactly what we're dealing with at work right now. Which sessions are you planning to see this afternoon?",
    exampleSentences: [
      { text: "Of course, go ahead. The keynote was a strong start to the day.", stepLetter: "A" },
      { text: "I really liked the part about remote teams, because that's exactly what we're dealing with at work right now.", stepLetter: "R" },
      { text: "Which sessions are you planning to see this afternoon?", stepLetter: "E" },
    ],
  },

  // --- PREP Method prompts (opinions) ---
  {
    id: "prep-1",
    framework: "PREP",
    promptText: "Do you think people work better from home or from the office?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PREP.steps,
    exampleAnswer:
      "I think a mix of both works best. Focused work is easier at home, but collaboration is faster in person. On my last team, we kept two office days for planning and reviews, and our delivery speed actually improved. So for most teams, a hybrid setup gets the best of both worlds.",
    exampleSentences: [
      { text: "I think a mix of both works best.", stepLetter: "P" },
      { text: "Focused work is easier at home, but collaboration is faster in person.", stepLetter: "R" },
      { text: "On my last team, we kept two office days for planning and reviews, and our delivery speed actually improved.", stepLetter: "E" },
      { text: "So for most teams, a hybrid setup gets the best of both worlds.", stepLetter: "P" },
    ],
  },
  {
    id: "prep-2",
    framework: "PREP",
    promptText: "What's one habit you think everyone should build, and why?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PREP.steps,
    exampleAnswer:
      "I think everyone should plan their day the night before. It takes five minutes, but it removes the stress of deciding what to do first. When I started doing it, I stopped wasting my first hour on email and finished my most important task before lunch. That's why I'd recommend a simple evening plan to anyone.",
    exampleSentences: [
      { text: "I think everyone should plan their day the night before.", stepLetter: "P" },
      { text: "It takes five minutes, but it removes the stress of deciding what to do first.", stepLetter: "R" },
      { text: "When I started doing it, I stopped wasting my first hour on email and finished my most important task before lunch.", stepLetter: "E" },
      { text: "That's why I'd recommend a simple evening plan to anyone.", stepLetter: "P" },
    ],
  },
  {
    id: "prep-3",
    framework: "PREP",
    promptText: "Is it better to specialise early in your career or to stay a generalist?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PREP.steps,
    exampleAnswer:
      "I'd say stay broad first, then specialise. Trying different areas early shows you what you're genuinely good at. A friend of mine started in sales, moved into marketing, and only then found her real strength in product, and she's thriving now. So explore first, and specialise once you know where you fit.",
    exampleSentences: [
      { text: "I'd say stay broad first, then specialise.", stepLetter: "P" },
      { text: "Trying different areas early shows you what you're genuinely good at.", stepLetter: "R" },
      { text: "A friend of mine started in sales, moved into marketing, and only then found her real strength in product, and she's thriving now.", stepLetter: "E" },
      { text: "So explore first, and specialise once you know where you fit.", stepLetter: "P" },
    ],
  },
  {
    id: "prep-4",
    framework: "PREP",
    promptText: "Should phones be allowed in classrooms?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PREP.steps,
    exampleAnswer:
      "I think phones should be allowed, but only for specific learning activities. Banning them completely ignores how useful they can be for research and practice. My cousin's school lets students use phones for quizzes and language apps, then collects them for the rest of the lesson, and both grades and focus improved. So clear rules work better than a total ban.",
    exampleSentences: [
      { text: "I think phones should be allowed, but only for specific learning activities.", stepLetter: "P" },
      { text: "Banning them completely ignores how useful they can be for research and practice.", stepLetter: "R" },
      { text: "My cousin's school lets students use phones for quizzes and language apps, then collects them for the rest of the lesson, and both grades and focus improved.", stepLetter: "E" },
      { text: "So clear rules work better than a total ban.", stepLetter: "P" },
    ],
  },

  // --- Past–Present–Future prompts (introductions) ---
  {
    id: "ppf-1",
    framework: "PPF",
    promptText: "Tell me a little about yourself.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PPF.steps,
    exampleAnswer:
      "I studied business, and my first job was in customer support, which taught me how much small details matter to people. Now I work as a project coordinator, keeping three teams aligned on deadlines and priorities. Next, I'd love to move into product management, where I can shape what we build, not just how we deliver it.",
    exampleSentences: [
      { text: "I studied business, and my first job was in customer support, which taught me how much small details matter to people.", stepLetter: "P" },
      { text: "Now I work as a project coordinator, keeping three teams aligned on deadlines and priorities.", stepLetter: "N" },
      { text: "Next, I'd love to move into product management, where I can shape what we build, not just how we deliver it.", stepLetter: "F" },
    ],
  },
  {
    id: "ppf-2",
    framework: "PPF",
    promptText: "So, what do you do?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PPF.steps,
    exampleAnswer:
      "I got into design by building websites for friends while I was at university. These days I'm a UX designer at a health app, mostly working on making appointment booking simpler. Over the next year, I'm hoping to lead my first full redesign.",
    exampleSentences: [
      { text: "I got into design by building websites for friends while I was at university.", stepLetter: "P" },
      { text: "These days I'm a UX designer at a health app, mostly working on making appointment booking simpler.", stepLetter: "N" },
      { text: "Over the next year, I'm hoping to lead my first full redesign.", stepLetter: "F" },
    ],
  },
  {
    id: "ppf-3",
    framework: "PPF",
    promptText: "How did you get into your field?",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PPF.steps,
    exampleAnswer:
      "I actually started in accounting, but I kept automating my spreadsheets and realised I enjoyed that part the most. So I took evening classes in programming, and now I work as a data analyst building reports for the finance team. My goal is to become a data engineer and build the systems behind those reports.",
    exampleSentences: [
      { text: "I actually started in accounting, but I kept automating my spreadsheets and realised I enjoyed that part the most.", stepLetter: "P" },
      { text: "So I took evening classes in programming, and now I work as a data analyst building reports for the finance team.", stepLetter: "N" },
      { text: "My goal is to become a data engineer and build the systems behind those reports.", stepLetter: "F" },
    ],
  },
  {
    id: "ppf-4",
    framework: "PPF",
    promptText: "Introduce yourself to your new team in under a minute.",
    frameworkSteps: FRAMEWORK_DEFINITIONS.PPF.steps,
    exampleAnswer:
      "Hi everyone, I'm Rahim. I spent the last four years at a logistics startup, where I helped grow the support team from three people to twenty. I'm joining you as operations lead, so I'll be looking at how we can make onboarding smoother. Over the next few months, I'm excited to learn how each of you works and where I can help most.",
    exampleSentences: [
      { text: "I spent the last four years at a logistics startup, where I helped grow the support team from three people to twenty.", stepLetter: "P" },
      { text: "I'm joining you as operations lead, so I'll be looking at how we can make onboarding smoother.", stepLetter: "N" },
      { text: "Over the next few months, I'm excited to learn how each of you works and where I can help most.", stepLetter: "F" },
    ],
  },
];

const METHOD_FRAMEWORKS: FrameworkType[] = ["STAR", "CAR", "SEE", "PAR", "PREP", "PPF"];

/**
 * Session-start logic for communication-builder:
 * one small-talk scenario (ARE) where Tota plays the other person, then 3 prompts
 * that each practice a different speaking method. Never repeats a method.
 */
export function getCommunicationBuilderSessionQuestions(): QuestionBankItem[] {
  const [smallTalk] = pickRandom(questionBank.filter((q) => q.framework === "ARE"), 1);
  const methods = pickRandom(METHOD_FRAMEWORKS, 3);

  const methodPrompts = methods.map((fw, i) => {
    const [item] = pickRandom(questionBank.filter((q) => q.framework === fw), 1);
    const name = FRAMEWORK_DEFINITIONS[fw].name;
    const transition =
      i === 0
        ? `Thanks for chatting. Now let's practice speaking with a method. For this one, try the ${name}.`
        : `Next, try the ${name}.`;
    return { ...item, spokenPrefix: transition, followUpStyle: "method-probe" as const };
  });

  return [{ ...smallTalk, followUpStyle: "small-talk" }, ...methodPrompts];
}
