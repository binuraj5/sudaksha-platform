/**
 * SCIP — Full Question Bank Seed
 * SEPL/INT/2026/IMPL-GAPS-01 Step G18
 * Patent claim C-01 equivalent — composite psychometric instrument items
 *
 * Total items: 168
 *   • 50 OCEAN  — IPIP-50 Big Five (public domain, Goldberg)
 *   • 36 RIASEC — Forced-choice career interest pairs (Holland model)
 *   • 24 EI     — Sudaksha-authored SJTs across Goleman's 4 EI domains
 *   • 28 VALUES — Portrait Values Questionnaire (Schwartz; public domain)
 *   • 30 COG    — Placeholder cognitive items, difficulty 1–5 (REVIEW REQUIRED)
 *
 * Public-domain sources:
 *   • IPIP (International Personality Item Pool, Goldberg et al.) — 50-item Big Five.
 *     https://ipip.ori.org/ — All IPIP items are public domain.
 *   • Schwartz PVQ (Portrait Values Questionnaire) — public-domain academic instrument.
 *   • Holland RIASEC categories — public-domain career-interest taxonomy.
 *
 * Items requiring psychometrician review BEFORE deploying:
 *   • All 30 COG items — placeholders only. Real cognitive items must be authored
 *     and IRT-calibrated by a qualified psychometrician.
 *   • All 24 EI SJT items — Sudaksha-authored, must be reviewed for cultural
 *     fit and behavioural-anchor accuracy by a content expert.
 *
 * Estimated review time before safe to deploy: ~40–60 hours of psychometrician
 * time for COG calibration; ~10–15 hours for EI SJT validation.
 *
 * ⚠️  DO NOT RUN automatically. This file is created for review and
 *     psychometrician sign-off. Execute manually only after sign-off:
 *       npx ts-node apps/portal/prisma/seeds/scip-questions.ts
 *
 * Pre-conditions for execution:
 *   • SCIP AssessmentModel must exist (slug = 'scip-full', see scip-instrument.ts).
 *   • All 5 components (SCIP-COG, SCIP-OCEAN, SCIP-RIASEC, SCIP-EI, SCIP-VALUES)
 *     must be created under that model.
 */

import { PrismaClient } from '../../generated/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// SCIP-OCEAN — 50 IPIP items (10 per Big Five factor)
// ═══════════════════════════════════════════════════════════════════════════
//
// Stored as MULTIPLE_CHOICE with 5-point Likert response scale.
// Per-item metadata: { factor: 'O'|'C'|'E'|'A'|'N', valence: 'POSITIVE'|'NEGATIVE' }
// Reverse-scored items (valence: 'NEGATIVE') invert their numeric score at
// scoring time — handled in computeSCIPScores.ts, not in the question itself.

const LIKERT_OPTIONS = [
  { text: 'Strongly Disagree' },
  { text: 'Disagree' },
  { text: 'Neither Agree nor Disagree' },
  { text: 'Agree' },
  { text: 'Strongly Agree' },
];

interface OceanItem { text: string; factor: 'O' | 'C' | 'E' | 'A' | 'N'; valence: 'POSITIVE' | 'NEGATIVE' }

const OCEAN_ITEMS: OceanItem[] = [
  // Openness (O) — 10 items, 6 positive + 4 reverse-scored
  { text: 'I have a vivid imagination.', factor: 'O', valence: 'POSITIVE' },
  { text: 'I have excellent ideas.', factor: 'O', valence: 'POSITIVE' },
  { text: 'I have a rich vocabulary.', factor: 'O', valence: 'POSITIVE' },
  { text: 'I am full of ideas.', factor: 'O', valence: 'POSITIVE' },
  { text: 'I am quick to understand things.', factor: 'O', valence: 'POSITIVE' },
  { text: 'I use difficult words.', factor: 'O', valence: 'POSITIVE' },
  { text: 'I am not interested in abstract ideas.', factor: 'O', valence: 'NEGATIVE' },
  { text: 'I do not have a good imagination.', factor: 'O', valence: 'NEGATIVE' },
  { text: 'I have difficulty understanding abstract ideas.', factor: 'O', valence: 'NEGATIVE' },
  { text: 'I avoid philosophical discussions.', factor: 'O', valence: 'NEGATIVE' },

  // Conscientiousness (C) — 10 items, 6 positive + 4 reverse-scored
  { text: 'I am always prepared.', factor: 'C', valence: 'POSITIVE' },
  { text: 'I pay attention to details.', factor: 'C', valence: 'POSITIVE' },
  { text: 'I get chores done right away.', factor: 'C', valence: 'POSITIVE' },
  { text: 'I like order.', factor: 'C', valence: 'POSITIVE' },
  { text: 'I follow a schedule.', factor: 'C', valence: 'POSITIVE' },
  { text: 'I am exacting in my work.', factor: 'C', valence: 'POSITIVE' },
  { text: 'I leave my belongings around.', factor: 'C', valence: 'NEGATIVE' },
  { text: 'I make a mess of things.', factor: 'C', valence: 'NEGATIVE' },
  { text: 'I often forget to put things back in their proper place.', factor: 'C', valence: 'NEGATIVE' },
  { text: 'I shirk my duties.', factor: 'C', valence: 'NEGATIVE' },

  // Extraversion (E) — 10 items, 6 positive + 4 reverse-scored
  { text: 'I am the life of the party.', factor: 'E', valence: 'POSITIVE' },
  { text: 'I don’t mind being the centre of attention.', factor: 'E', valence: 'POSITIVE' },
  { text: 'I feel comfortable around people.', factor: 'E', valence: 'POSITIVE' },
  { text: 'I start conversations.', factor: 'E', valence: 'POSITIVE' },
  { text: 'I talk to a lot of different people at parties.', factor: 'E', valence: 'POSITIVE' },
  { text: 'I am full of energy.', factor: 'E', valence: 'POSITIVE' },
  { text: 'I don’t talk a lot.', factor: 'E', valence: 'NEGATIVE' },
  { text: 'I keep in the background.', factor: 'E', valence: 'NEGATIVE' },
  { text: 'I have little to say.', factor: 'E', valence: 'NEGATIVE' },
  { text: 'I don’t like to draw attention to myself.', factor: 'E', valence: 'NEGATIVE' },

  // Agreeableness (A) — 10 items, 6 positive + 4 reverse-scored
  { text: 'I am interested in people.', factor: 'A', valence: 'POSITIVE' },
  { text: 'I sympathise with others’ feelings.', factor: 'A', valence: 'POSITIVE' },
  { text: 'I have a soft heart.', factor: 'A', valence: 'POSITIVE' },
  { text: 'I take time out for others.', factor: 'A', valence: 'POSITIVE' },
  { text: 'I feel others’ emotions.', factor: 'A', valence: 'POSITIVE' },
  { text: 'I make people feel at ease.', factor: 'A', valence: 'POSITIVE' },
  { text: 'I am not really interested in others.', factor: 'A', valence: 'NEGATIVE' },
  { text: 'I insult people.', factor: 'A', valence: 'NEGATIVE' },
  { text: 'I am not interested in other people’s problems.', factor: 'A', valence: 'NEGATIVE' },
  { text: 'I feel little concern for others.', factor: 'A', valence: 'NEGATIVE' },

  // Neuroticism (N) — 10 items, 6 positive (high N) + 4 reverse-scored
  { text: 'I get stressed out easily.', factor: 'N', valence: 'POSITIVE' },
  { text: 'I worry about things.', factor: 'N', valence: 'POSITIVE' },
  { text: 'I am easily disturbed.', factor: 'N', valence: 'POSITIVE' },
  { text: 'I get upset easily.', factor: 'N', valence: 'POSITIVE' },
  { text: 'I change my mood a lot.', factor: 'N', valence: 'POSITIVE' },
  { text: 'I have frequent mood swings.', factor: 'N', valence: 'POSITIVE' },
  { text: 'I am relaxed most of the time.', factor: 'N', valence: 'NEGATIVE' },
  { text: 'I seldom feel blue.', factor: 'N', valence: 'NEGATIVE' },
  { text: 'I am not easily bothered by things.', factor: 'N', valence: 'NEGATIVE' },
  { text: 'I rarely get irritated.', factor: 'N', valence: 'NEGATIVE' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCIP-RIASEC — 36 forced-choice career-interest pairs
// ═══════════════════════════════════════════════════════════════════════════
//
// Each item presents two activities; the user picks the one they prefer.
// Each Holland type appears in exactly 12 pairs (6 type × 12 ÷ 2 sides = 36 items).
// Per-item metadata: { pairTypes: [letterA, letterB] }
//
// R = Realistic   (hands-on, tools, mechanics)
// I = Investigative (analysis, research, science)
// A = Artistic    (creative, expressive, design)
// S = Social      (helping, teaching, healing)
// E = Enterprising (persuading, leading, selling)
// C = Conventional (organising, data, administration)

interface RiasecItem { optionA: string; typeA: string; optionB: string; typeB: string }

const RIASEC_ITEMS: RiasecItem[] = [
  // R-paired items (R appears 12 times across the set)
  { optionA: 'Repair a broken machine', typeA: 'R', optionB: 'Investigate why a phenomenon happens', typeB: 'I' },
  { optionA: 'Build a piece of furniture', typeA: 'R', optionB: 'Compose a piece of music', typeB: 'A' },
  { optionA: 'Wire an electrical circuit', typeA: 'R', optionB: 'Counsel someone in distress', typeB: 'S' },
  { optionA: 'Fix a vehicle engine', typeA: 'R', optionB: 'Pitch a new idea to investors', typeB: 'E' },
  { optionA: 'Operate heavy equipment', typeA: 'R', optionB: 'Manage a corporate filing system', typeB: 'C' },
  { optionA: 'Tend to a farm or garden', typeA: 'R', optionB: 'Run a laboratory experiment', typeB: 'I' },

  // I-paired items (I additional pairs)
  { optionA: 'Design a clinical trial', typeA: 'I', optionB: 'Direct a stage play', typeB: 'A' },
  { optionA: 'Analyse statistical data', typeA: 'I', optionB: 'Mentor a junior colleague', typeB: 'S' },
  { optionA: 'Research a complex problem', typeA: 'I', optionB: 'Negotiate a business deal', typeB: 'E' },
  { optionA: 'Develop a scientific theory', typeA: 'I', optionB: 'Audit a company’s books', typeB: 'C' },
  { optionA: 'Conduct field observations', typeA: 'I', optionB: 'Build a custom workshop bench', typeB: 'R' },
  { optionA: 'Write a peer-reviewed paper', typeA: 'I', optionB: 'Compose a short story', typeB: 'A' },

  // A-paired items
  { optionA: 'Paint or sketch from imagination', typeA: 'A', optionB: 'Lead a community service drive', typeB: 'S' },
  { optionA: 'Design a marketing campaign', typeA: 'A', optionB: 'Pitch a startup to a venture firm', typeB: 'E' },
  { optionA: 'Choreograph a dance piece', typeA: 'A', optionB: 'Maintain a precise inventory ledger', typeB: 'C' },
  { optionA: 'Direct a short film', typeA: 'A', optionB: 'Restore a vintage motorcycle', typeB: 'R' },
  { optionA: 'Write poetry or song lyrics', typeA: 'A', optionB: 'Investigate a chemistry problem', typeB: 'I' },
  { optionA: 'Photograph wildlife on location', typeA: 'A', optionB: 'Coach a sports team', typeB: 'S' },

  // S-paired items
  { optionA: 'Teach a workshop to beginners', typeA: 'S', optionB: 'Run a sales territory', typeB: 'E' },
  { optionA: 'Volunteer at a community shelter', typeA: 'S', optionB: 'Process tax filings for clients', typeB: 'C' },
  { optionA: 'Provide emotional support to a peer', typeA: 'S', optionB: 'Build a backyard deck', typeB: 'R' },
  { optionA: 'Advise students on careers', typeA: 'S', optionB: 'Interpret a complex dataset', typeB: 'I' },
  { optionA: 'Facilitate a group therapy session', typeA: 'S', optionB: 'Curate a gallery exhibit', typeB: 'A' },
  { optionA: 'Mediate a workplace conflict', typeA: 'S', optionB: 'Lead a fundraising campaign', typeB: 'E' },

  // E-paired items
  { optionA: 'Lead a sales meeting', typeA: 'E', optionB: 'Maintain regulatory paperwork', typeB: 'C' },
  { optionA: 'Start a new business venture', typeA: 'E', optionB: 'Refurbish a classic car', typeB: 'R' },
  { optionA: 'Lobby for a new policy', typeA: 'E', optionB: 'Read research on cognitive bias', typeB: 'I' },
  { optionA: 'Host a televised debate', typeA: 'E', optionB: 'Sketch concept art for a game', typeB: 'A' },
  { optionA: 'Coach an executive', typeA: 'E', optionB: 'Tutor underprivileged children', typeB: 'S' },
  { optionA: 'Pitch a product on stage', typeA: 'E', optionB: 'Reconcile monthly accounts', typeB: 'C' },

  // C-paired items
  { optionA: 'Organise a project tracker', typeA: 'C', optionB: 'Drive a delivery route', typeB: 'R' },
  { optionA: 'Build a financial model', typeA: 'C', optionB: 'Run a hypothesis test', typeB: 'I' },
  { optionA: 'Format a quarterly report', typeA: 'C', optionB: 'Edit a documentary film', typeB: 'A' },
  { optionA: 'Schedule volunteer rotations', typeA: 'C', optionB: 'Lead a youth mentorship circle', typeB: 'S' },
  { optionA: 'Review contract terms line-by-line', typeA: 'C', optionB: 'Pitch a new acquisition target', typeB: 'E' },
  { optionA: 'Maintain a customer database', typeA: 'C', optionB: 'Perform routine equipment checks', typeB: 'R' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCIP-EI — 24 SJTs across Goleman's 4 EI domains (Sudaksha-authored)
// ═══════════════════════════════════════════════════════════════════════════
//
// Each item is a SCENARIO_BASED question with 4 behavioural options:
//   Option A = optimal response (correctAnswer)
//   Option B = acceptable response
//   Option C = suboptimal but common
//   Option D = clearly poor response
//
// Per-item metadata: { domain: 'SELF_AWARENESS' | 'SELF_MANAGEMENT' | 'SOCIAL_AWARENESS' | 'RELATIONSHIP_MANAGEMENT' }
//
// ⚠️  Items must be reviewed by an EI content expert before production deploy.

interface EIItem {
  scenario: string;
  options: { text: string; isCorrect?: boolean }[];
  domain: 'SELF_AWARENESS' | 'SELF_MANAGEMENT' | 'SOCIAL_AWARENESS' | 'RELATIONSHIP_MANAGEMENT';
}

const EI_ITEMS: EIItem[] = [
  // ── SELF_AWARENESS (6) ───────────────────────────────────────────────────
  {
    scenario: 'During a presentation, you notice your heart racing and your voice tightening. What do you do?',
    options: [
      { text: 'Pause briefly, breathe, name the feeling internally, and continue with measured pace.', isCorrect: true },
      { text: 'Power through the presentation without acknowledging it.' },
      { text: 'Apologise to the audience for being nervous.' },
      { text: 'End the presentation early and step out.' },
    ],
    domain: 'SELF_AWARENESS',
  },
  {
    scenario: 'A peer’s offhand comment leaves you irritated for hours. The most useful next step is:',
    options: [
      { text: 'Reflect on what specifically about the comment landed — past trigger or current value?', isCorrect: true },
      { text: 'Confront the peer immediately to release the tension.' },
      { text: 'Vent about it to a different colleague.' },
      { text: 'Suppress the irritation and assume it will pass.' },
    ],
    domain: 'SELF_AWARENESS',
  },
  {
    scenario: 'You receive harsh feedback in a review. Internally, you feel defensive. The healthiest internal response is:',
    options: [
      { text: 'Notice the defensiveness, separate it from the feedback’s content, then evaluate the content on merit.', isCorrect: true },
      { text: 'Mentally rebut every point as it is raised.' },
      { text: 'Decide the reviewer simply doesn’t understand your work.' },
      { text: 'Assume all feedback is correct and feel ashamed.' },
    ],
    domain: 'SELF_AWARENESS',
  },
  {
    scenario: 'Before a difficult one-on-one with your manager, you feel anxious. The best preparation is to:',
    options: [
      { text: 'Identify what specifically you fear and what outcome you want from the conversation.', isCorrect: true },
      { text: 'Distract yourself with low-stakes tasks until the meeting begins.' },
      { text: 'Rehearse defensive arguments for likely critiques.' },
      { text: 'Postpone the meeting until you feel calmer.' },
    ],
    domain: 'SELF_AWARENESS',
  },
  {
    scenario: 'You realise mid-conversation that your tone has become curt. The most useful action is to:',
    options: [
      { text: 'Acknowledge it briefly, soften your tone, and continue.', isCorrect: true },
      { text: 'Ignore it and hope the other person didn’t notice.' },
      { text: 'Apologise extensively, derailing the conversation.' },
      { text: 'Justify the curtness as a response to the topic.' },
    ],
    domain: 'SELF_AWARENESS',
  },
  {
    scenario: 'You consistently feel drained after a particular type of meeting. The best diagnostic is to:',
    options: [
      { text: 'Identify the specific element (people, format, content) that drains you, then address it.', isCorrect: true },
      { text: 'Avoid all such meetings going forward.' },
      { text: 'Push through and accept the drain as normal.' },
      { text: 'Blame the meeting organiser for poor design.' },
    ],
    domain: 'SELF_AWARENESS',
  },

  // ── SELF_MANAGEMENT (6) ──────────────────────────────────────────────────
  {
    scenario: 'A colleague sends an email that feels accusatory. You feel an urge to fire back. The best response is to:',
    options: [
      { text: 'Draft a reply, save it as draft, return after 30 minutes, and then revise before sending.', isCorrect: true },
      { text: 'Reply immediately while the points are fresh.' },
      { text: 'Forward the email to your manager for backup.' },
      { text: 'Confront them in person right away.' },
    ],
    domain: 'SELF_MANAGEMENT',
  },
  {
    scenario: 'A project deadline slips because of a vendor delay. You are responsible for the outcome. You:',
    options: [
      { text: 'Communicate the slip transparently to stakeholders, propose a recovery plan, and reset expectations.', isCorrect: true },
      { text: 'Hide the slip and hope to recover quietly.' },
      { text: 'Publicly blame the vendor in your status update.' },
      { text: 'Resign yourself to missing the deadline.' },
    ],
    domain: 'SELF_MANAGEMENT',
  },
  {
    scenario: 'You feel stuck on a hard problem and frustration is rising. The most productive move is to:',
    options: [
      { text: 'Take a structured break, then return with a different framing or approach.', isCorrect: true },
      { text: 'Force yourself to keep grinding until it cracks.' },
      { text: 'Switch to a different task and never return.' },
      { text: 'Complain to a peer about how unsolvable it is.' },
    ],
    domain: 'SELF_MANAGEMENT',
  },
  {
    scenario: 'A change in priorities forces you to drop a project you were excited about. You:',
    options: [
      { text: 'Acknowledge the disappointment briefly, then redirect energy to the new priority.', isCorrect: true },
      { text: 'Quietly continue working on the old project on the side.' },
      { text: 'Argue forcefully against the change.' },
      { text: 'Disengage from work for the rest of the day.' },
    ],
    domain: 'SELF_MANAGEMENT',
  },
  {
    scenario: 'You commit to a personal change (exercise, learning, etc.). After two weeks you slip. You:',
    options: [
      { text: 'Treat the slip as data, identify the trigger, and resume without self-judgement.', isCorrect: true },
      { text: 'Abandon the commitment as proof you can’t change.' },
      { text: 'Punish yourself with stricter rules going forward.' },
      { text: 'Pretend the slip didn’t happen.' },
    ],
    domain: 'SELF_MANAGEMENT',
  },
  {
    scenario: 'A high-stakes presentation is in 10 minutes. Your prep feels thin. The best move is to:',
    options: [
      { text: 'Identify the 3 strongest points, mentally rehearse the opening, and accept controllable risk.', isCorrect: true },
      { text: 'Frantically add slides until the last second.' },
      { text: 'Ask to reschedule citing personal reasons.' },
      { text: 'Walk in confident regardless of the prep gap.' },
    ],
    domain: 'SELF_MANAGEMENT',
  },

  // ── SOCIAL_AWARENESS (6) ─────────────────────────────────────────────────
  {
    scenario: 'A team member is unusually quiet in a meeting they normally engage in. The most insightful read is to:',
    options: [
      { text: 'Note the change and check in privately afterward.', isCorrect: true },
      { text: 'Call them out in the meeting to participate.' },
      { text: 'Assume they are bored and ignore it.' },
      { text: 'Conclude they no longer care about the work.' },
    ],
    domain: 'SOCIAL_AWARENESS',
  },
  {
    scenario: 'A direct report’s work quality has dropped over two weeks. Before deciding action, you should:',
    options: [
      { text: 'Open a private conversation to understand context (workload, personal, blockers) before judgement.', isCorrect: true },
      { text: 'Immediately put them on a performance improvement plan.' },
      { text: 'Wait quietly and see if it self-corrects.' },
      { text: 'Reassign their work to someone else without telling them.' },
    ],
    domain: 'SOCIAL_AWARENESS',
  },
  {
    scenario: 'A new hire from a different culture makes a comment that lands awkwardly with the team. You:',
    options: [
      { text: 'Privately discuss the cultural context with them, helping calibration without shame.', isCorrect: true },
      { text: 'Publicly correct them in front of the team.' },
      { text: 'Avoid them to prevent further awkwardness.' },
      { text: 'Assume the comment reflects their character.' },
    ],
    domain: 'SOCIAL_AWARENESS',
  },
  {
    scenario: 'You sense tension between two colleagues, though neither has spoken about it. You:',
    options: [
      { text: 'Note the dynamic, look for opportunities to surface it constructively if it affects work.', isCorrect: true },
      { text: 'Force them into a confrontation immediately.' },
      { text: 'Take sides based on who you’re closer to.' },
      { text: 'Ignore it and assume they will resolve it themselves.' },
    ],
    domain: 'SOCIAL_AWARENESS',
  },
  {
    scenario: 'A client’s tone in emails has shifted from warm to clipped over the past week. You:',
    options: [
      { text: 'Schedule a call to acknowledge the shift and explore what changed.', isCorrect: true },
      { text: 'Continue as if nothing changed.' },
      { text: 'Match their clipped tone in your replies.' },
      { text: 'Escalate to your manager without first checking in.' },
    ],
    domain: 'SOCIAL_AWARENESS',
  },
  {
    scenario: 'In a brainstorm, one strong voice dominates and several others are silent. You:',
    options: [
      { text: 'Gently invite the quieter voices in, asking specific people for their take.', isCorrect: true },
      { text: 'Let the strong voice run the session.' },
      { text: 'Cut the strong voice off mid-sentence to make space.' },
      { text: 'Cancel the brainstorm and decide alone.' },
    ],
    domain: 'SOCIAL_AWARENESS',
  },

  // ── RELATIONSHIP_MANAGEMENT (6) ──────────────────────────────────────────
  {
    scenario: 'You need to deliver hard performance feedback to a sensitive direct report. You:',
    options: [
      { text: 'Lead with specific behaviour, business impact, and a path forward — kind, clear, useful.', isCorrect: true },
      { text: 'Soften it so much the message is lost.' },
      { text: 'Deliver it bluntly and let them deal with the fallout.' },
      { text: 'Avoid the conversation and hope it self-corrects.' },
    ],
    domain: 'RELATIONSHIP_MANAGEMENT',
  },
  {
    scenario: 'Two team members are in conflict and both come to you separately. You:',
    options: [
      { text: 'Listen to each, then convene a structured joint conversation focused on resolution, not blame.', isCorrect: true },
      { text: 'Pick the side that is making the most effort.' },
      { text: 'Tell them both to figure it out themselves.' },
      { text: 'Escalate to HR immediately.' },
    ],
    domain: 'RELATIONSHIP_MANAGEMENT',
  },
  {
    scenario: 'You disagree with a peer’s approach in a senior leadership meeting. You:',
    options: [
      { text: 'Voice the disagreement respectfully, anchor in shared goals, and offer an alternative.', isCorrect: true },
      { text: 'Stay silent in the room and complain afterward.' },
      { text: 'Publicly undermine their credibility in the meeting.' },
      { text: 'Privately complain to senior leadership behind their back.' },
    ],
    domain: 'RELATIONSHIP_MANAGEMENT',
  },
  {
    scenario: 'You must say no to a colleague’s urgent request because you are over-committed. You:',
    options: [
      { text: 'Decline directly, explain why briefly, and propose an alternative or timing.', isCorrect: true },
      { text: 'Agree and silently miss the deadline.' },
      { text: 'Decline curtly without context.' },
      { text: 'Avoid responding until they give up asking.' },
    ],
    domain: 'RELATIONSHIP_MANAGEMENT',
  },
  {
    scenario: 'A teammate takes credit for your work in front of leadership. You:',
    options: [
      { text: 'Address it privately first, naming specific examples, and request joint visibility going forward.', isCorrect: true },
      { text: 'Confront them publicly in the next leadership meeting.' },
      { text: 'Quietly resent them and reduce future collaboration.' },
      { text: 'Take credit for their work in retaliation.' },
    ],
    domain: 'RELATIONSHIP_MANAGEMENT',
  },
  {
    scenario: 'You are joining a new team where trust must be built quickly. The most effective opening move is to:',
    options: [
      { text: 'Listen first, ask focused questions, follow through reliably on small commitments.', isCorrect: true },
      { text: 'Lead with credentials and past achievements.' },
      { text: 'Critique the team’s current approach to demonstrate insight.' },
      { text: 'Stay quiet for the first month to avoid mistakes.' },
    ],
    domain: 'RELATIONSHIP_MANAGEMENT',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCIP-VALUES — 28 PVQ portrait items across Schwartz's 10 basic values
// ═══════════════════════════════════════════════════════════════════════════
//
// Format: a portrait of a person is described, then the user rates how
// much like themselves the person is, on a 5-point Likert.
// Distribution: ~2–3 items per value (10 values × ~3 = 28).
// Per-item metadata: { value: <SchwartzValue> }

interface ValueItem { portrait: string; value:
  | 'SELF_DIRECTION' | 'STIMULATION' | 'HEDONISM' | 'ACHIEVEMENT' | 'POWER'
  | 'SECURITY' | 'CONFORMITY' | 'TRADITION' | 'BENEVOLENCE' | 'UNIVERSALISM';
}

const VALUES_ITEMS: ValueItem[] = [
  // SELF_DIRECTION (3)
  { portrait: 'It is important to this person to think up new ideas and be creative; to do things in their own way.', value: 'SELF_DIRECTION' },
  { portrait: 'It is important to this person to make their own decisions about what they do; to be free.', value: 'SELF_DIRECTION' },
  { portrait: 'It is important to this person to be curious; to try to understand all sorts of things.', value: 'SELF_DIRECTION' },

  // STIMULATION (3)
  { portrait: 'It is important to this person to have all kinds of new experiences; to seek adventure.', value: 'STIMULATION' },
  { portrait: 'It is important to this person to have an exciting life; to take risks.', value: 'STIMULATION' },
  { portrait: 'It is important to this person to do many different things in life; variety matters.', value: 'STIMULATION' },

  // HEDONISM (3)
  { portrait: 'It is important to this person to have a good time; to enjoy life’s pleasures.', value: 'HEDONISM' },
  { portrait: 'It is important to this person to seek every chance to have fun.', value: 'HEDONISM' },
  { portrait: 'It is important to this person to enjoy the small pleasures of daily life.', value: 'HEDONISM' },

  // ACHIEVEMENT (3)
  { portrait: 'It is important to this person to be very successful; to impress others with achievements.', value: 'ACHIEVEMENT' },
  { portrait: 'It is important to this person to show their abilities; to be admired for what they do.', value: 'ACHIEVEMENT' },
  { portrait: 'It is important to this person to get ahead in life through hard work.', value: 'ACHIEVEMENT' },

  // POWER (3)
  { portrait: 'It is important to this person to be wealthy; to have money and expensive things.', value: 'POWER' },
  { portrait: 'It is important to this person to be in charge and tell others what to do.', value: 'POWER' },
  { portrait: 'It is important to this person to be the one who makes decisions; to be a leader.', value: 'POWER' },

  // SECURITY (3)
  { portrait: 'It is important to this person to live in safe surroundings; to avoid anything dangerous.', value: 'SECURITY' },
  { portrait: 'It is important to this person that the country be strong and protect citizens.', value: 'SECURITY' },
  { portrait: 'It is important to this person to have a stable, predictable environment.', value: 'SECURITY' },

  // CONFORMITY (3)
  { portrait: 'It is important to this person always to behave properly; to avoid offending anyone.', value: 'CONFORMITY' },
  { portrait: 'It is important to this person to be obedient; to follow rules at all times.', value: 'CONFORMITY' },
  { portrait: 'It is important to this person to be polite; to show respect for parents and elders.', value: 'CONFORMITY' },

  // TRADITION (2)
  { portrait: 'It is important to this person to be modest and humble; not to draw attention.', value: 'TRADITION' },
  { portrait: 'It is important to this person to follow the customs handed down by their family or religion.', value: 'TRADITION' },

  // BENEVOLENCE (3)
  { portrait: 'It is important to this person to help the people around them; to care for their well-being.', value: 'BENEVOLENCE' },
  { portrait: 'It is important to this person to be loyal to friends; to devote themselves to those close to them.', value: 'BENEVOLENCE' },
  { portrait: 'It is important to this person to forgive others when they have wronged them.', value: 'BENEVOLENCE' },

  // UNIVERSALISM (2)
  { portrait: 'It is important to this person that every person be treated equally; that all have equal opportunities.', value: 'UNIVERSALISM' },
  { portrait: 'It is important to this person to look after the natural environment and protect nature.', value: 'UNIVERSALISM' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCIP-COG — 30 placeholder cognitive items, difficulty 1–5
// ═══════════════════════════════════════════════════════════════════════════
//
// ⚠️  ALL 30 ITEMS ARE PLACEHOLDERS. They MUST be rewritten and IRT-calibrated
//     by a qualified psychometrician before any production deploy.
//
// Distribution: 6 items per difficulty band (1–5) × 5 bands = 30 items.
// Mix: ~10 numerical, ~10 verbal, ~10 abstract reasoning placeholders.
// Per-item metadata: { difficulty: 1..5, subtype: 'NUMERICAL'|'VERBAL'|'ABSTRACT', requiresReview: true }

interface CogItem {
  text: string;
  options: { text: string; isCorrect?: boolean }[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  subtype: 'NUMERICAL' | 'VERBAL' | 'ABSTRACT';
}

const COG_ITEMS: CogItem[] = [
  // Difficulty 1 (6 items)
  { text: 'What number comes next? 2, 4, 6, 8, ?', options: [{ text: '9' }, { text: '10', isCorrect: true }, { text: '12' }, { text: '14' }], difficulty: 1, subtype: 'NUMERICAL' },
  { text: 'Which word means the opposite of "begin"?', options: [{ text: 'Start' }, { text: 'Open' }, { text: 'End', isCorrect: true }, { text: 'Initiate' }], difficulty: 1, subtype: 'VERBAL' },
  { text: 'If A = 1, B = 2, C = 3, what is D?', options: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }, { text: '6' }], difficulty: 1, subtype: 'ABSTRACT' },
  { text: '5 + 3 × 2 = ?', options: [{ text: '11', isCorrect: true }, { text: '13' }, { text: '16' }, { text: '20' }], difficulty: 1, subtype: 'NUMERICAL' },
  { text: 'Pick the word that does NOT belong: cat, dog, fish, table.', options: [{ text: 'cat' }, { text: 'dog' }, { text: 'fish' }, { text: 'table', isCorrect: true }], difficulty: 1, subtype: 'VERBAL' },
  { text: 'Which shape comes next? ▲ ▲ ▲ ?', options: [{ text: '●' }, { text: '▲', isCorrect: true }, { text: '■' }, { text: '◆' }], difficulty: 1, subtype: 'ABSTRACT' },

  // Difficulty 2 (6 items)
  { text: 'A train travels 60 km in 1.5 hours. What is its average speed?', options: [{ text: '30 km/h' }, { text: '40 km/h', isCorrect: true }, { text: '60 km/h' }, { text: '90 km/h' }], difficulty: 2, subtype: 'NUMERICAL' },
  { text: 'Choose the word closest in meaning to "abundant":', options: [{ text: 'plentiful', isCorrect: true }, { text: 'scarce' }, { text: 'narrow' }, { text: 'rare' }], difficulty: 2, subtype: 'VERBAL' },
  { text: 'If 3X = 21, what is X + 4?', options: [{ text: '7' }, { text: '11', isCorrect: true }, { text: '14' }, { text: '21' }], difficulty: 2, subtype: 'NUMERICAL' },
  { text: 'Hand is to glove as foot is to ___.', options: [{ text: 'shoe', isCorrect: true }, { text: 'sock' }, { text: 'leg' }, { text: 'arm' }], difficulty: 2, subtype: 'VERBAL' },
  { text: 'Which number is the odd one out: 9, 16, 25, 30, 36?', options: [{ text: '16' }, { text: '25' }, { text: '30', isCorrect: true }, { text: '36' }], difficulty: 2, subtype: 'ABSTRACT' },
  { text: 'A clock shows 3:15. What angle do the hands form?', options: [{ text: '0°' }, { text: '7.5°', isCorrect: true }, { text: '15°' }, { text: '90°' }], difficulty: 2, subtype: 'ABSTRACT' },

  // Difficulty 3 (6 items)
  { text: 'A shirt costs $80 after a 20% discount. What was its original price?', options: [{ text: '$96' }, { text: '$100', isCorrect: true }, { text: '$110' }, { text: '$120' }], difficulty: 3, subtype: 'NUMERICAL' },
  { text: 'Which of the following is a logical inference from "All A are B; some B are C"?', options: [{ text: 'All A are C' }, { text: 'Some A are C' }, { text: 'Some A might be C', isCorrect: true }, { text: 'No A is C' }], difficulty: 3, subtype: 'VERBAL' },
  { text: 'In the series 5, 10, 20, 40, ?, what comes next?', options: [{ text: '60' }, { text: '70' }, { text: '80', isCorrect: true }, { text: '100' }], difficulty: 3, subtype: 'NUMERICAL' },
  { text: 'Choose the option closest to: "ephemeral".', options: [{ text: 'eternal' }, { text: 'fleeting', isCorrect: true }, { text: 'frequent' }, { text: 'fixed' }], difficulty: 3, subtype: 'VERBAL' },
  { text: 'If today is Wednesday, what day was 100 days ago?', options: [{ text: 'Monday' }, { text: 'Tuesday', isCorrect: true }, { text: 'Wednesday' }, { text: 'Thursday' }], difficulty: 3, subtype: 'ABSTRACT' },
  { text: 'Pattern: 1, 1, 2, 3, 5, 8, ? (Fibonacci)', options: [{ text: '11' }, { text: '12' }, { text: '13', isCorrect: true }, { text: '14' }], difficulty: 3, subtype: 'ABSTRACT' },

  // Difficulty 4 (6 items)
  { text: 'A team finishes a project in 30 days with 6 people. How long would 9 people take (same productivity)?', options: [{ text: '15 days' }, { text: '20 days', isCorrect: true }, { text: '25 days' }, { text: '30 days' }], difficulty: 4, subtype: 'NUMERICAL' },
  { text: 'Pick the statement that strengthens this argument: "Remote work increases productivity because employees save commute time."', options: [{ text: 'Remote employees report lower job satisfaction.' }, { text: 'Most employees use commute time for personal calls.' }, { text: 'Studies show 30% productivity gain when commutes are eliminated.', isCorrect: true }, { text: 'Office workers have access to better equipment.' }], difficulty: 4, subtype: 'VERBAL' },
  { text: 'If 3a + 5 = 2a + 12, what is a²?', options: [{ text: '36' }, { text: '49', isCorrect: true }, { text: '64' }, { text: '81' }], difficulty: 4, subtype: 'NUMERICAL' },
  { text: 'A : C :: D : ? (alphabetic distance)', options: [{ text: 'E' }, { text: 'F', isCorrect: true }, { text: 'G' }, { text: 'H' }], difficulty: 4, subtype: 'ABSTRACT' },
  { text: 'Which option logically completes: "If it rains, the match is cancelled. The match was not cancelled. Therefore..."', options: [{ text: 'It rained.' }, { text: 'It did not rain.', isCorrect: true }, { text: 'It will rain.' }, { text: 'No conclusion possible.' }], difficulty: 4, subtype: 'VERBAL' },
  { text: 'In a 3D cube unfolded into 6 squares, how many edges does the cube originally have?', options: [{ text: '8' }, { text: '10' }, { text: '12', isCorrect: true }, { text: '14' }], difficulty: 4, subtype: 'ABSTRACT' },

  // Difficulty 5 (6 items)
  { text: 'A sphere of radius 3 has the same volume as a cylinder of radius 3. What is the cylinder’s height? (Use V_sphere = 4/3·π·r³)', options: [{ text: '3', isCorrect: false }, { text: '4', isCorrect: true }, { text: '6' }, { text: '9' }], difficulty: 5, subtype: 'NUMERICAL' },
  { text: 'Which of the following best identifies a logical fallacy in: "Every successful person I know wakes up at 5 AM, therefore waking up at 5 AM causes success"?', options: [{ text: 'Ad hominem' }, { text: 'Confirmation bias / cum hoc, ergo propter hoc', isCorrect: true }, { text: 'Straw man' }, { text: 'Slippery slope' }], difficulty: 5, subtype: 'VERBAL' },
  { text: 'A code rotates each letter forward by its position (A→A+1, B→B+2, …). What does "DOG" become?', options: [{ text: 'EQJ', isCorrect: true }, { text: 'EPJ' }, { text: 'FQI' }, { text: 'EOG' }], difficulty: 5, subtype: 'ABSTRACT' },
  { text: 'Six people sit around a circular table; A and B refuse to sit next to each other. How many distinct arrangements are possible?', options: [{ text: '24' }, { text: '48' }, { text: '72', isCorrect: true }, { text: '120' }], difficulty: 5, subtype: 'NUMERICAL' },
  { text: 'Pick the sentence with the strongest underlying assumption: "We should hire more senior engineers because junior engineers ship bugs."', options: [{ text: 'Senior engineers don’t ship bugs.', isCorrect: true }, { text: 'We have a hiring budget.' }, { text: 'Bugs are bad.' }, { text: 'Senior engineers cost more.' }], difficulty: 5, subtype: 'VERBAL' },
  { text: 'A 5×5 grid is filled with 1–25 in random order. What is the probability the number 13 is in the centre cell?', options: [{ text: '1/5' }, { text: '1/13' }, { text: '1/25', isCorrect: true }, { text: '5/25' }], difficulty: 5, subtype: 'ABSTRACT' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Seed orchestration
// ═══════════════════════════════════════════════════════════════════════════

// Sanity check: the file is required to produce exactly 168 items.
const TOTAL =
  OCEAN_ITEMS.length + RIASEC_ITEMS.length + EI_ITEMS.length +
  VALUES_ITEMS.length + COG_ITEMS.length;

async function seed() {
  if (TOTAL !== 168) {
    throw new Error(`SCIP seed: expected 168 items, got ${TOTAL}. Refusing to run.`);
  }

  // Locate the SCIP AssessmentModel + its 5 components
  const model = await prisma.assessmentModel.findUnique({
    where: { slug: 'scip-full' },
    include: { components: true },
  });
  if (!model) {
    throw new Error('SCIP AssessmentModel (slug="scip-full") not found. Run scip-instrument.ts first.');
  }

  const componentByCode: Record<string, string> = {};
  for (const c of model.components) {
    const meta = (c as { metadata?: { code?: string } | null }).metadata as { code?: string } | null;
    if (meta?.code) componentByCode[meta.code] = c.id;
  }

  const required = ['SCIP-OCEAN', 'SCIP-RIASEC', 'SCIP-EI', 'SCIP-VALUES', 'SCIP-COG'];
  for (const code of required) {
    if (!componentByCode[code]) {
      throw new Error(`Missing component for ${code}. Component must exist with metadata.code = ${code}.`);
    }
  }

  let inserted = 0;

  // ── OCEAN ──────────────────────────────────────────────────────────────
  for (let i = 0; i < OCEAN_ITEMS.length; i++) {
    const item = OCEAN_ITEMS[i];
    await prisma.componentQuestion.create({
      data: {
        componentId: componentByCode['SCIP-OCEAN'],
        questionText: item.text,
        questionType: 'MULTIPLE_CHOICE',
        order: i,
        options: LIKERT_OPTIONS,
        targetCohort: null, // SCIP items are universal
        itemPoolTag: `OCEAN-${item.factor}`,
        metadata: { factor: item.factor, valence: item.valence, scale: 'LIKERT_5', source: 'IPIP' },
      },
    });
    inserted++;
  }

  // ── RIASEC ─────────────────────────────────────────────────────────────
  for (let i = 0; i < RIASEC_ITEMS.length; i++) {
    const item = RIASEC_ITEMS[i];
    await prisma.componentQuestion.create({
      data: {
        componentId: componentByCode['SCIP-RIASEC'],
        questionText: 'Which would you rather do?',
        questionType: 'MULTIPLE_CHOICE',
        order: i,
        options: [
          { text: item.optionA, type: item.typeA },
          { text: item.optionB, type: item.typeB },
        ],
        targetCohort: null,
        itemPoolTag: `RIASEC-${item.typeA}${item.typeB}`,
        metadata: { pairTypes: [item.typeA, item.typeB], format: 'FORCED_CHOICE' },
      },
    });
    inserted++;
  }

  // ── EI SJTs ────────────────────────────────────────────────────────────
  for (let i = 0; i < EI_ITEMS.length; i++) {
    const item = EI_ITEMS[i];
    const correct = item.options.find(o => o.isCorrect);
    await prisma.componentQuestion.create({
      data: {
        componentId: componentByCode['SCIP-EI'],
        questionText: item.scenario,
        questionType: 'SCENARIO_BASED',
        order: i,
        options: item.options,
        correctAnswer: correct?.text,
        targetCohort: null,
        itemPoolTag: `EI-${item.domain}`,
        metadata: { domain: item.domain, source: 'SUDAKSHA_AUTHORED', requiresExpertReview: true },
      },
    });
    inserted++;
  }

  // ── VALUES (PVQ) ───────────────────────────────────────────────────────
  for (let i = 0; i < VALUES_ITEMS.length; i++) {
    const item = VALUES_ITEMS[i];
    await prisma.componentQuestion.create({
      data: {
        componentId: componentByCode['SCIP-VALUES'],
        questionText: `${item.portrait} How much like you is this person?`,
        questionType: 'MULTIPLE_CHOICE',
        order: i,
        options: [
          { text: 'Not like me at all' },
          { text: 'A little like me' },
          { text: 'Somewhat like me' },
          { text: 'Like me' },
          { text: 'Very much like me' },
        ],
        targetCohort: null,
        itemPoolTag: `VALUES-${item.value}`,
        metadata: { value: item.value, scale: 'PVQ_5', source: 'SCHWARTZ_PVQ' },
      },
    });
    inserted++;
  }

  // ── COG (placeholders) ─────────────────────────────────────────────────
  for (let i = 0; i < COG_ITEMS.length; i++) {
    const item = COG_ITEMS[i];
    const correct = item.options.find(o => o.isCorrect);
    await prisma.componentQuestion.create({
      data: {
        componentId: componentByCode['SCIP-COG'],
        questionText: item.text,
        questionType: 'MULTIPLE_CHOICE',
        order: i,
        options: item.options,
        correctAnswer: correct?.text,
        targetCohort: null,
        itemPoolTag: `COG-D${item.difficulty}-${item.subtype}`,
        metadata: {
          difficulty: item.difficulty,
          subtype: item.subtype,
          requiresReview: true,
          source: 'PLACEHOLDER',
          notes: 'Replace with psychometrician-authored, IRT-calibrated items before production deploy.',
        },
      },
    });
    inserted++;
  }

  console.log(`SCIP seed complete: ${inserted}/${TOTAL} items inserted across 5 components.`);
  await prisma.$disconnect();
}

if (require.main === module) {
  seed().catch(async (err) => {
    console.error('SCIP seed failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
}

export {
  OCEAN_ITEMS, RIASEC_ITEMS, EI_ITEMS, VALUES_ITEMS, COG_ITEMS, TOTAL,
};
