# Parrot user research plan

**Study type:** Moderated usability test + interview (hybrid), with a short follow-up survey
**Participants:** 6–8 · **Session length:** 60 minutes, remote (video call with screen share)
**Timeline:** about 2–3 weeks · **Output:** notes in `session-notes-template.md`, synthesized afterwards with `/design:research-synthesis`

---

## 1. Why we're doing this

Parrot now has five practice tracks, an AI interviewer (Tota), and webcam body-language feedback, but nobody outside the team has used it. Before adding more features, we need to know:

- whether people understand what Parrot is and start a session without help,
- whether practicing with Tota feels useful and realistic, or awkward,
- whether people trust the feedback, especially scores and body-language analysis,
- which tracks people actually want, and why they'd come back.

## 2. Research questions

| # | Question | How we'll answer it |
|---|---|---|
| RQ1 | Can first-time users understand what Parrot does and start a practice session unaided? | 5-second test, Task 1–2 success and time |
| RQ2 | Does a session with Tota feel realistic and useful? Where does it feel awkward? | Think-aloud during Task 3, reaction questions |
| RQ3 | Do people trust and act on the report (scores, rewritten answers, STAR feedback)? | Task 6 + "what would you change next time?" |
| RQ4 | Are people comfortable turning on the camera, and do they find body-language and eye-contact feedback accurate and worth it? | Task 4 opt-in rate, accuracy rating, reactions |
| RQ5 | How do people feel about "Real interview" mode (full screen, auto-recording)? | Task 5 choice + reactions |
| RQ6 | Which tracks matter to which people, and what would bring them back? | Card ranking + survey |

## 3. Who to recruit

Aim for **6–8 people** across these groups. Five or six sessions usually surface most usability issues; the extra two give each segment at least two voices.

| Segment | Who | Target |
|---|---|---|
| **Job seekers** | Students, new grads, people actively applying for jobs in the next 3 months | 3 |
| **IELTS takers** | People preparing for IELTS in the next 6 months | 2 |
| **Working professionals** | Non-native English speakers who want to improve small talk, presenting or negotiating at work | 2 |
| **Wildcard** (optional) | A career switcher or someone with interview anxiety | 1 |

**Mix across the group:** at least 2 people on a laptop with a built-in camera, at least 2 who are camera-shy, and a range of English confidence.

**Avoid:** close friends or family (they're too kind), people who've seen the app being built, and people who work in UX or tech recruiting.

### Screener questions

1. Are you preparing for any of these in the next 6 months? *(Job interview / IELTS speaking test / Important work conversations like negotiations or presentations / None → screen out)*
2. How did you prepare last time? *(Open, so we can see their current approach)*
3. How confident do you feel speaking English in a formal situation? *(1–5)*
4. Have you used an AI interview or speaking practice tool before? Which one? *(Mix of yes and no is ideal)*
5. Which device would you use? Does it have a working camera and microphone? *(Must have a mic; camera preferred)*
6. Are you comfortable sharing your screen during a 60-minute video call? *(Must be yes)*
7. Do you work in UX research, design, or recruiting? *(Yes → screen out)*

**Incentive:** a small gift card or equivalent, about 60 minutes' worth of a local hourly wage, or a free resume and interview review.

## 4. Before the sessions

- [ ] **Pilot session** with one friendly person to time the script and catch bugs. (Important: live camera tracking hasn't been tested with a real face yet. If it misfires in the pilot, fix the thresholds before real sessions.)
- [ ] Deploy Parrot somewhere participants can open (a staging URL), or run it locally and give the participant remote control.
- [ ] Check that the AI service has enough quota: one session uses roughly 15–25 AI calls.
- [ ] Prepare a **sample job description** for people without one (for example a junior marketing role) and tell participants to bring their CV.
- [ ] Have the consent form ready (section 9).
- [ ] Set up the notes template, one copy per participant.
- [ ] Recruit a note-taker if possible, so the moderator can focus on the conversation.

## 5. Session guide (60 minutes)

**Moderator rules:** stay neutral and don't explain or rescue. If they're stuck, wait 20–30 seconds, then ask "What would you expect to happen?" before helping. Ask "why" more than "do you like it". Remind them often: *"There are no wrong answers. We're testing the app, not you."*

### Warm-up (5 min)
- Introduce yourself and explain the session, recording and consent.
- "Please think aloud: tell me what you're looking at, what you expect, and what surprises you."
- "Tell me a bit about yourself. What are you preparing for right now?"

### Context (8 min)
- "Walk me through the last time you prepared for an interview, test or important conversation. What did you do?"
- "What was the hardest part?" *(Probe: nerves, not knowing what to say, getting feedback, English, time)*
- "Have you ever practiced out loud, with a person or a tool? How did it go?"
- "If you could get feedback on one thing, what would it be?"

### Task 1: First impression (4 min)
Open the homepage for **5 seconds**, then cover the screen or switch tabs.
- "What do you remember? What do you think this product does? Who is it for?"

Show it again with no time limit:
- "What would you do first? What's the parrot about? Is anything confusing?"

📋 **Observe:** Do they understand "Tota is the AI interviewer"? Do they find **Start interview**? Do they read or skip the "How it works" and sample report sections?

### Task 2: Set up a mock interview (7 min)
> "Imagine you have an interview coming up. Use Parrot to start practicing for it."

- Let them upload or paste their CV and job description and choose a format.
- At the **Practice / Real interview** choice, ask: "Which would you pick, and why?" *(Have them choose **Practice** for now.)*

📋 **Observe:** time to reach the first question, errors with upload, hesitation at the format choice, and whether they read the framework intro screens or skip them.

### Task 3: Answer questions with Tota (12 min)
> "Answer the first two questions as if this were the real interview."

Let them answer two questions, including Tota's follow-ups. Interrupt as little as possible.

Afterwards:
- "How did that feel compared with a real interview?" *(1–5: not at all realistic → very realistic)*
- "Did the questions feel like they were about *you*, your CV and this job? Any that felt off?"
- "What did you think of Tota's follow-up questions?"
- "What did you think of the parrot itself: helpful, distracting, fun, childish?"

📋 **Observe:** Do they understand when to tap the mic and when to stop? Do they notice "Hear it again"? Do they freeze? Do they read the STAR hint?

### Task 4: Camera and body language (6 min)
> "There's a camera option here. What would you do?"

- If they decline, ask why, and don't push. *(This is data!)*
- If they turn it on, answer one more question with the camera, then ask:
  - "What do you think it's tracking? Did the live labels (eye contact, posture) feel accurate?" *(Accuracy 1–5)*
  - "Was the live feedback helpful or distracting while you answered?"
  - "How do you feel about the camera being on? Did you notice it says video stays on your device?"

📋 **Observe:** opt-in yes or no, privacy concerns, and whether "Looking down" or "Looking away" triggered when it shouldn't have (note the exact moment).

### Task 5: Another track (8 min)
Pick the track that matches their segment:
- **Job seekers:** Negotiation (salary scenario if possible) or Debate
- **IELTS takers:** IELTS Speaking, through Part 1 into the Part 2 cue card with the prep timer
- **Professionals:** Communication Builder (small talk) or Negotiation

> "Find another kind of practice that would help you, and try it for a few minutes."

- "How did this compare with the mock interview?"
- IELTS: "How close is this to the real test?"
- Negotiation or small talk: "Did Tota react like a real person would?"

📋 **Observe:** Can they find **More practice** in the nav? Do they understand the brief or intro screen?

### Task 6: The report (6 min)
Use a report from an earlier session (pre-generate one if time is short).
> "This is your feedback. Take a look and tell me what you'd do with it."

- "What's the first thing you notice?"
- "Is anything here surprising, wrong or unfair?"
- "What would you change in your next attempt?" *(Can they name a concrete action? That's the key signal.)*
- "How much do you trust these scores?" *(1–5)*
- If body-language data exists: "Does the body-language section match how you think you came across?"

📋 **Observe:** Where do they look first? Do they scroll to the per-question feedback? Do they read the rewritten example answers?

### Reaction and ranking (2 min)
Show the five tracks as cards (mock interview, IELTS, communication or small talk, debate, negotiation).
- "Rank these from most to least useful for you."
- "Is anything missing that you'd want?"

### Wrap-up (2 min)
- "If you had one magic wand for Parrot, what would you change?"
- "Would you use this before your next interview or test? How often?"
- "Would you pay for it? What would make it worth paying for?"
- "Anything we didn't ask that you want to tell us?"
- Thank them, send the survey link, and explain the incentive.

## 6. Post-session survey (send right after, about 3 minutes)

1. How easy was it to start your first practice session? *(1 Very hard – 7 Very easy)*
2. How realistic did practicing with Tota feel? *(1–7)*
3. How useful was the feedback report? *(1–7)*
4. How much do you trust the scores? *(1–7)*
5. How accurate was the body-language and eye-contact feedback? *(1–7, or "Didn't use the camera")*
6. How comfortable were you with the camera on? *(1–7, or "Didn't use it")*
7. How likely are you to use Parrot before your next interview or test? *(0–10)*
8. Which part was most valuable? *(Choose one: questions tailored to my CV / Tota's follow-ups / feedback report / body-language feedback / IELTS practice / small talk / debate / negotiation)*
9. What was the most frustrating moment? *(Open)*
10. Anything else? *(Open)*

## 7. What we'll measure

| Metric | Target that suggests "good enough" |
|---|---|
| Starts a practice session unaided (Task 2) | 6 of 8 or more |
| Time from homepage to first question | Under 3 minutes |
| Realism rating (Task 3) | Average 4/5 or higher |
| Camera opt-in when offered | Track it; no target, it's exploratory |
| Body-language accuracy rating | Average 3.5/5 or higher, otherwise tune detection |
| Can name a concrete next step after reading the report | 6 of 8 or more |
| Trust in scores | Average 3.5/5 or higher |
| Likely to use before next interview or test (0–10) | Average 7 or higher |

## 8. Timeline

| Week | Activity |
|---|---|
| Week 1 | Recruit with the screener, deploy a test URL, run the pilot session, adjust the script |
| Week 2 | Run 6–8 sessions (2 per day at most, so notes stay fresh), send surveys, write up notes the same day |
| Week 3 | Affinity mapping, then synthesis with `/design:research-synthesis`, then prioritised fixes |

## 9. Consent and privacy

Read this aloud and get a recorded "yes", or a signature:

> "Thanks for helping us. We're testing the Parrot app, not you. With your permission, we'll record this call (screen and audio) so we can review it later. Recordings are only seen by the research team and are deleted within 30 days. If you turn on your camera inside Parrot, the analysis runs on your own device; Parrot doesn't upload your video. You can skip any question or stop at any time, and you'll still receive the thank-you gift. Is that okay?"

- Store notes with participant codes (P1, P2…), never real names.
- Don't record CV contents in the notes. Write "uploaded own CV (marketing, 3 years)" instead.
- Delete recordings after synthesis.

## 10. Limitations to keep in mind

- **Small sample:** 6–8 people show *what* problems exist and *why*, not *how many* users have them. Don't report percentages from interviews as if they were statistics.
- **Moderator effect:** people are more patient and positive when someone is watching. Weigh actual behaviour (what they did) above opinions (what they said).
- **Lab, not life:** a 60-minute session doesn't show whether people come back. If results are promising, follow up with a 2-week diary study or usage analytics.
- **Recruiting bias:** if participants come from your own network, say so in the synthesis.
- **AI variability:** Tota's questions and feedback differ every session, so note which questions each participant got when comparing reactions.

## 11. After the sessions

1. Fill in `session-notes-template.md` for each participant **the same day**.
2. Export the survey results as CSV.
3. Run `/design:research-synthesis` and paste or attach all notes and the survey CSV. The tags in the template map directly onto the research questions, so themes group cleanly.
