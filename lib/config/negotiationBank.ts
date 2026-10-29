import { pickRandom, type ScriptedTurn } from "@/lib/config/sessionScript";
import type { FrameworkStep } from "@/lib/config/questionBank";

/**
 * Negotiation practice: a role-play where Tota plays the other side of a realistic
 * negotiation. The user gets a private brief (goal and walk-away point); Tota gets
 * the counterpart's hidden interests and a pressure tactic to test them with.
 *
 * Flow (4 rounds, 7 speaking turns):
 *  1. Opening      -> counterpart reacts to the user's anchor
 *  2. Objection    -> counterpart pushes back; rewards good questions with information
 *  3. Conditional offer -> counterpart applies a pressure tactic
 *  4. Close        -> user summarises the deal and next steps
 */

export type NegotiationStage = "opening" | "interests" | "trade" | "close";

export interface NegotiationScenario {
  id: string;
  category: string;
  title: string;
  /** Who the user plays, in second person. */
  yourRole: string;
  counterpartName: string;
  counterpartRole: string;
  situation: string;
  yourGoal: string;
  yourWalkAway: string;
  /** Only Tota sees these: what the counterpart really cares about. */
  counterpartInterests: string[];
  /** What the counterpart can realistically give, used to reward good negotiating. */
  counterpartFlexibility: string;
  openingLine: string;
  objectionLine: string;
  conditionalOffer: string;
  pressureTactic: string;
}

export interface NegotiationTurnDetail extends ScriptedTurn {
  stage: NegotiationStage;
  scenarioTitle: string;
  yourRole: string;
  counterpart: string;
  situation: string;
  yourGoal: string;
  yourWalkAway: string;
  counterpartInterests: string[];
  counterpartFlexibility: string;
  pressureTactic: string;
  framework: string;
  frameworkSteps: FrameworkStep[];
  /** Scripted line, also the fallback if the AI can't generate the beat. */
  question: string;
  /**
   * For mid-negotiation rounds: what the counterpart should do next. Tota turns it into
   * a line that fits the numbers already said, so the conversation stays consistent.
   */
  beat?: string;
}

const STAGE_STEPS: Record<NegotiationStage, { framework: string; steps: FrameworkStep[] }> = {
  opening: {
    framework: "Open strong",
    steps: [
      { letter: "R", label: "Rapport", description: "Start warm: thank them and show you want a deal that works for both sides." },
      { letter: "A", label: "Anchor", description: "Make the first ambitious but defensible offer." },
      { letter: "J", label: "Justify", description: "Give one or two objective reasons for your number." },
    ],
  },
  interests: {
    framework: "Explore interests",
    steps: [
      { letter: "L", label: "Label", description: "Acknowledge their concern: “It sounds like budget is tight this year.”" },
      { letter: "A", label: "Ask", description: "Ask an open question about what really matters to them." },
      { letter: "H", label: "Hold", description: "Stay calm and don't drop your number just because they pushed back." },
    ],
  },
  trade: {
    framework: "Trade, don't give",
    steps: [
      { letter: "I", label: "If…then", description: "Only concede in exchange: “If you can do X, then I can do Y.”" },
      { letter: "P", label: "Package", description: "Combine several terms so both sides gain something." },
      { letter: "W", label: "Walk-away", description: "Know your limit and be ready to say no to a bad deal." },
    ],
  },
  close: {
    framework: "Close the deal",
    steps: [
      { letter: "S", label: "Summarise", description: "Restate every term you've agreed on." },
      { letter: "C", label: "Confirm", description: "Check they agree, out loud." },
      { letter: "N", label: "Next steps", description: "Agree who does what, and by when." },
    ],
  },
};

export const NEGOTIATION_SCENARIOS: NegotiationScenario[] = [
  {
    id: "job-offer",
    category: "Career",
    title: "Negotiating a job offer",
    yourRole: "a candidate who has just received a job offer for a marketing manager role",
    counterpartName: "Dana",
    counterpartRole: "the hiring manager",
    situation: "The company offered $72,000. Similar roles in your city pay $78,000 to $85,000, and you have five years of relevant experience.",
    yourGoal: "A salary of $82,000, or a strong package close to it.",
    yourWalkAway: "Anything below $76,000 with no other benefits.",
    counterpartInterests: [
      "Wants to hire quickly; the role has been open for two months.",
      "The salary band tops out at $80,000 without director approval.",
      "Can offer a signing bonus, extra holiday, or a six-month salary review more easily than base pay.",
    ],
    counterpartFlexibility: "Can go up to $78,000 base, plus a $4,000 signing bonus or a six-month review.",
    openingLine: "Thanks for getting back to us so quickly. We're excited to have you. So, how are you feeling about the offer?",
    objectionLine: "I hear you, but honestly that number is above what we budgeted for this role. Other candidates were happy with our offer.",
    conditionalOffer: "Here's what I can do. I can move base salary to $76,000, but I'd need your answer by the end of today.",
    pressureTactic: "Deadline pressure: insist the offer is only open until the end of the day.",
  },
  {
    id: "raise",
    category: "Career",
    title: "Asking for a raise",
    yourRole: "an employee asking your manager for a raise after taking on extra responsibilities",
    counterpartName: "Marcus",
    counterpartRole: "your manager",
    situation: "You've been in your role for two years, now lead two junior colleagues, and delivered a project that saved the company money.",
    yourGoal: "A 12% raise, effective this quarter.",
    yourWalkAway: "Less than 6%, or a vague promise with no date.",
    counterpartInterests: [
      "Values you and is worried about losing you to a competitor.",
      "Annual budget is already set; mid-year raises need HR approval.",
      "Could offer a title change, training budget, or a guaranteed review date.",
    ],
    counterpartFlexibility: "Can approve up to 8% now, with a title change or a written review in six months.",
    openingLine: "Hi, thanks for setting this up. You said you wanted to talk about your role. What's on your mind?",
    objectionLine: "I appreciate everything you've done, I really do. But budgets are locked for this year, and everyone's being asked to wait for the annual review.",
    conditionalOffer: "Let me be honest. I could probably get you 5% now, and we revisit the rest at the annual review.",
    pressureTactic: "Authority limit: say anything above 5% has to go through HR and could take months.",
  },
  {
    id: "freelance-rate",
    category: "Business",
    title: "Setting a freelance rate",
    yourRole: "a freelance web designer quoting for a new website project",
    counterpartName: "Priya",
    counterpartRole: "the owner of a growing bakery chain",
    situation: "The project is a five-page website with online ordering. You usually charge $6,000 for projects like this.",
    yourGoal: "$6,000 with 50% paid upfront.",
    yourWalkAway: "Less than $4,500, or no upfront payment.",
    counterpartInterests: [
      "Wants the site live before a new branch opens in six weeks.",
      "Had a bad experience with a cheap designer before and values reliability.",
      "Cash flow is tight this month but better next quarter.",
    ],
    counterpartFlexibility: "Can pay $5,500, or the full $6,000 if paid in three instalments.",
    openingLine: "Thanks for coming over! We love your portfolio. So, what would a site like this cost us?",
    objectionLine: "Wow, that's quite a bit more than we expected. Another designer quoted us $3,500.",
    conditionalOffer: "Okay, how about this: we pay $4,500, but we'd want to pay it all once the site is finished.",
    pressureTactic: "Competing offer: keep mentioning the cheaper designer as a real option.",
  },
  {
    id: "used-car",
    category: "Personal",
    title: "Buying a used car",
    yourRole: "a buyer looking at a five-year-old hatchback at a dealership",
    counterpartName: "Rick",
    counterpartRole: "the car salesperson",
    situation: "The car is listed at $14,500. Similar cars online sell for $12,500 to $13,500. It needs new tyres soon.",
    yourGoal: "$12,800 including new tyres.",
    yourWalkAway: "More than $13,600, or no tyres included.",
    counterpartInterests: [
      "Needs to hit a monthly sales target in the next few days.",
      "The car has been on the lot for 60 days.",
      "Makes extra profit on warranties and financing.",
    ],
    counterpartFlexibility: "Can go down to $13,000 and include tyres, or $12,800 without tyres.",
    openingLine: "She's a great little car, isn't she? Low mileage, one owner. Shall we talk numbers?",
    objectionLine: "Ooh, I can't go that low. I'd be losing money. This car's priced fairly for the condition it's in.",
    conditionalOffer: "Alright, I'll talk to my manager. I can do $13,900, and I'll throw in an extended warranty.",
    pressureTactic: "Scarcity: mention another couple is coming to look at the car this afternoon.",
  },
  {
    id: "rent-renewal",
    category: "Personal",
    title: "Renewing your lease",
    yourRole: "a tenant whose landlord wants to raise the rent at renewal",
    counterpartName: "Mrs. Okafor",
    counterpartRole: "your landlord",
    situation: "You pay $1,500 a month. The landlord wants $1,700. You've paid on time for three years and similar flats nearby rent for $1,550 to $1,650.",
    yourGoal: "Keep the rent at $1,550 or less for a two-year lease.",
    yourWalkAway: "More than $1,620, since you could move to a similar flat nearby.",
    counterpartInterests: [
      "Hates vacancies; finding a new tenant costs a month's rent and agency fees.",
      "Property taxes went up this year.",
      "Would value a longer lease and a tenant who handles small repairs.",
    ],
    counterpartFlexibility: "Will accept $1,575 for a two-year lease, or $1,600 for one year.",
    openingLine: "Hello, thanks for calling back. So you got my letter about the new rent for next year?",
    objectionLine: "I understand, but my costs have gone up a lot. Taxes, repairs, everything. $1,700 is still fair for this area.",
    conditionalOffer: "I could do $1,650, but only if you sign for two years.",
    pressureTactic: "Take it or leave it: say you already have people asking about the flat.",
  },
  {
    id: "supplier",
    category: "Business",
    title: "Negotiating with a supplier",
    yourRole: "the owner of a small coffee shop renegotiating your coffee bean supply contract",
    counterpartName: "Leo",
    counterpartRole: "the account manager at your coffee supplier",
    situation: "You buy 200 kg a month at $14 per kg. A new supplier offered $12.50, but you like your current supplier's quality.",
    yourGoal: "$12.50 per kg with free delivery.",
    yourWalkAway: "More than $13.20 per kg; at that point you'd switch suppliers.",
    counterpartInterests: [
      "You're a steady, reliable customer they don't want to lose.",
      "Their costs rose with bean prices this year.",
      "Would love a longer contract or a bigger monthly volume.",
    ],
    counterpartFlexibility: "Can offer $12.90 with a 12-month contract, or $12.60 if you increase to 250 kg a month.",
    openingLine: "Good to see you! You mentioned you wanted to review the contract. What's up?",
    objectionLine: "Honestly, our margins are already thin. Bean prices are up almost 20% this year.",
    conditionalOffer: "I can drop to $13.50, but delivery would become $40 per order.",
    pressureTactic: "Nibble: once a price is close, try to add a small extra cost like delivery or a minimum order.",
  },
  {
    id: "project-scope",
    category: "Business",
    title: "Pushing back on scope creep",
    yourRole: "a project lead whose client wants extra features without changing the deadline or budget",
    counterpartName: "Helen",
    counterpartRole: "the client's product director",
    situation: "Your team agreed to deliver an app in eight weeks for $40,000. The client now wants two extra features, which would take three more weeks.",
    yourGoal: "Either more time and budget for the new features, or move them to a second phase.",
    yourWalkAway: "Adding the features with no extra time or money.",
    counterpartInterests: [
      "Promised the features to her own boss and is under pressure.",
      "The launch date is tied to a marketing campaign that can't move.",
      "Has some leftover budget she could use this quarter.",
    ],
    counterpartFlexibility: "Can add $8,000 for one feature now, and the other in phase two.",
    openingLine: "Thanks for jumping on. So, the two new features, we really need those in the launch. Can your team make that work?",
    objectionLine: "I don't really see why this is a big deal. They're small features, and we're already paying a lot for this project.",
    conditionalOffer: "Okay, if your team can squeeze in both features, I'll make sure you get the next project too.",
    pressureTactic: "Future promise: offer vague future work instead of money now.",
  },
  {
    id: "software-vendor",
    category: "Business",
    title: "Buying software for your team",
    yourRole: "an operations manager buying project management software for 50 people",
    counterpartName: "Jason",
    counterpartRole: "the software company's sales representative",
    situation: "The list price is $20 per user per month, $12,000 a year. A competitor offers similar software for $15 per user.",
    yourGoal: "$14 per user with free onboarding and a 30-day exit clause.",
    yourWalkAway: "More than $17 per user, or no way to cancel in the first year.",
    counterpartInterests: [
      "It's the last week of the quarter and he's close to his target.",
      "Prefers annual upfront payment and multi-year deals.",
      "Onboarding costs them little; discounts on price need approval.",
    ],
    counterpartFlexibility: "Can do $15 per user with free onboarding on an annual plan, or $14 on a two-year plan.",
    openingLine: "Great to finally meet! I hear your team loved the trial. Ready to get everyone set up?",
    objectionLine: "I'll be honest, our pricing is pretty firm. You're getting a lot more features than with the competitor.",
    conditionalOffer: "I could do $17 per user, but it has to be a three-year contract, paid annually.",
    pressureTactic: "Limited-time discount: say the offer expires when the quarter ends on Friday.",
  },
  {
    id: "team-resources",
    category: "Workplace",
    title: "Borrowing a colleague's team",
    yourRole: "a team lead who needs two developers from another team for a month",
    counterpartName: "Sofia",
    counterpartRole: "the manager of the other team",
    situation: "Your project is behind, and leadership wants it shipped next month. Sofia's team has two developers who know the system well.",
    yourGoal: "Both developers, full-time, for four weeks.",
    yourWalkAway: "Less than one developer half-time, which wouldn't make a difference.",
    counterpartInterests: [
      "Her own team has a deadline in six weeks.",
      "Wants her team's help to be visible to leadership.",
      "Would appreciate help from your team on her project later.",
    ],
    counterpartFlexibility: "Can give one developer full-time and one half-time for three weeks, with credit in the launch update.",
    openingLine: "Hey! I got your message. You said you needed some help from my team?",
    objectionLine: "I want to help, but we've got our own deadline coming. I really can't lose two people right now.",
    conditionalOffer: "I could maybe spare one developer for two weeks, but only part-time.",
    pressureTactic: "Lowball: offer far less than needed and act like it's generous.",
  },
  {
    id: "refund",
    category: "Personal",
    title: "Getting compensation for a cancelled flight",
    yourRole: "a passenger whose flight was cancelled, making you miss a family wedding",
    counterpartName: "Tom",
    counterpartRole: "the airline's customer service supervisor",
    situation: "Your $480 flight was cancelled at the last minute for technical reasons. You had to buy a $350 train ticket and lost a $200 hotel booking.",
    yourGoal: "A full refund of $480 plus $550 in expenses.",
    yourWalkAway: "Only a travel voucher with no cash refund.",
    counterpartInterests: [
      "Is authorised to give refunds and vouchers up to a limit.",
      "Wants to avoid formal complaints and bad reviews.",
      "Prefers vouchers over cash because they cost the airline less.",
    ],
    counterpartFlexibility:
      "Can refund the $480 ticket in cash plus up to $350 cash for expenses, or offer travel vouchers worth up to $800 instead of cash. Vouchers are cheaper for the airline, so push them first.",
    openingLine: "Hello, I'm the supervisor. I understand you're unhappy about your cancelled flight. How can I help?",
    objectionLine: "I'm sorry about the wedding. But our policy only covers the ticket price, not other expenses.",
    conditionalOffer: "What I can do is give you a $600 travel voucher, which is more than your ticket cost.",
    pressureTactic: "Policy wall: keep pointing to company policy as if it can't change.",
  },
  {
    id: "partnership",
    category: "Business",
    title: "Agreeing a partnership deal",
    yourRole: "a founder of a fitness app negotiating a partnership with a gym chain",
    counterpartName: "Grace",
    counterpartRole: "the gym chain's head of partnerships",
    situation: "The gym would promote your app to 40,000 members. You want a revenue share; they want a flat fee from you.",
    yourGoal: "A 70/30 revenue split in your favour with no upfront fee.",
    yourWalkAway: "Paying any upfront fee above $5,000.",
    counterpartInterests: [
      "Wants a digital offer to compete with rival gyms.",
      "Worries about the app's quality reflecting badly on the gym brand.",
      "Would accept a revenue share if there were performance guarantees.",
    ],
    counterpartFlexibility: "Can accept 65/35 in your favour with no fee, if there's a three-month pilot first.",
    openingLine: "Thanks for presenting today. Our team liked the app. So, how do you see this partnership working?",
    objectionLine: "A revenue share is risky for us. If the app doesn't perform, we've given our members to you for free.",
    conditionalOffer: "We could do a 50/50 split, but we'd also want a $10,000 setup fee to cover our marketing.",
    pressureTactic: "Good cop, bad cop: say your CFO is the one insisting on the fee.",
  },
  {
    id: "car-repair",
    category: "Personal",
    title: "Disputing a repair bill",
    yourRole: "a customer picking up your car from a garage, with a bill much higher than the quote",
    counterpartName: "Sam",
    counterpartRole: "the garage manager",
    situation: "You were quoted $400 for brake repairs. The bill is $650 because the mechanic replaced extra parts without calling you.",
    yourGoal: "Pay the original $400 quote.",
    yourWalkAway: "Paying more than $480 without proof the extra parts were necessary.",
    counterpartInterests: [
      "The parts were genuinely worn, but the mechanic should have called first.",
      "Relies on repeat customers and online reviews.",
      "Can't sell the old parts back; already paid for the new ones.",
    ],
    counterpartFlexibility: "Can charge $450, or $400 plus a free service next time.",
    openingLine: "Hi there, your car's all ready. That'll be $650. How would you like to pay?",
    objectionLine: "The extra parts were worn out. If we hadn't replaced them, your brakes could have failed. We did you a favour.",
    conditionalOffer: "Okay, I'll knock $50 off, so $600. That's the best I can do.",
    pressureTactic: "Leverage: point out they can't take the car until the bill is paid.",
  },
];

/** Builds a negotiation session on a random scenario. */
export function getNegotiationSessionQuestions(): {
  questions: string[];
  details: NegotiationTurnDetail[];
} {
  const [sc] = pickRandom(NEGOTIATION_SCENARIOS, 1);
  const counterpart = `${sc.counterpartName}, ${sc.counterpartRole}`;
  const base = {
    scenarioTitle: sc.title,
    yourRole: sc.yourRole,
    counterpart,
    situation: sc.situation,
    yourGoal: sc.yourGoal,
    yourWalkAway: sc.yourWalkAway,
    counterpartInterests: sc.counterpartInterests,
    counterpartFlexibility: sc.counterpartFlexibility,
    pressureTactic: sc.pressureTactic,
  };
  const turn = (
    stage: NegotiationStage,
    question: string,
    spokenPrefix: string | undefined,
    followUpStyle: NegotiationTurnDetail["followUpStyle"],
    beat?: string
  ): NegotiationTurnDetail => ({
    ...base,
    stage,
    framework: STAGE_STEPS[stage].framework,
    frameworkSteps: STAGE_STEPS[stage].steps,
    question,
    spokenPrefix,
    followUpStyle,
    ...(beat ? { beat } : {}),
  });

  const details: NegotiationTurnDetail[] = [
    turn(
      "opening",
      sc.openingLine,
      `Let's practice a negotiation. You're ${sc.yourRole}, and I'm ${counterpart}. Here we go.`,
      "negotiation-counterpart"
    ),
    turn(
      "interests",
      sc.objectionLine,
      undefined,
      "negotiation-counterpart",
      `Push back firmly on the user's position with this objection, in your own words: "${sc.objectionLine}"`
    ),
    turn(
      "trade",
      sc.conditionalOffer,
      undefined,
      "negotiation-pressure",
      `Make a conditional offer like this one, adjusted to the numbers already discussed. It should move toward the user but stay below what they asked for, and come with a condition: "${sc.conditionalOffer}"`
    ),
    turn(
      "close",
      "Okay. I think we're close to something. Can you sum up where we've landed, and what happens next?",
      undefined,
      null
    ),
  ];

  return { questions: details.map((d) => d.question), details };
}
