/**
 * Response Time Anomaly Detection
 * SEPL/INT/2026/IMPL-GAPS-01 Step G12
 * Patent claim C-09 — response-time monitoring sub-module
 *
 * Strategy:
 *   1. Each question type has a minimum plausible response time (read + think + answer).
 *   2. A response below that minimum is "anomalously fast" — likely answered without
 *      genuine engagement (random clicking, AI auto-fill, copy-paste from peer).
 *   3. If > 30% of responses in a session are anomalously fast → flag the session.
 *   4. Flag is persisted as a BiasFlag with flagType = 'RAPID_COMPLETION'.
 *
 * Acceptance tests this satisfies:
 *   - isAnomalouslyFast('SCENARIO_BASED', 5)  === true   (below 20s minimum)
 *   - isAnomalouslyFast('SCENARIO_BASED', 25) === false  (above 20s minimum)
 */

import { prisma } from '@/lib/prisma';

// Minimum plausible response times per question type (in seconds).
// Calibrated from cognitive load research on assessment item formats.
const MIN_RESPONSE_TIMES: Record<string, number> = {
  MULTIPLE_CHOICE:  8,   // read stem + 4 options + select
  TRUE_FALSE:       5,   // read stem + binary choice
  LIKERT:           6,   // read item + 5-point selection
  RATING:           5,   // read prompt + scale selection
  SCENARIO_BASED:  20,   // SJT — read scenario + 4 contextual options
  SJT:             20,   // synonym for SCENARIO_BASED
  ESSAY:           60,   // read prompt + compose written response
  OPEN_TEXT:       60,   // synonym for ESSAY
  SIMULATION:      30,   // read scenario + interact with simulation
  VIDEO_RESPONSE:  45,   // read prompt + record video response
  VOICE_RESPONSE:  30,   // read prompt + record voice response
  CODING_CHALLENGE: 60,  // read problem + write code
};

// Default minimum for unknown question types
const DEFAULT_MIN_TIME = 8;

// Threshold: fraction of anomalously fast responses required to flag the session
const ANOMALY_THRESHOLD = 0.3;

// Severity bands based on anomaly score
const HIGH_SEVERITY_THRESHOLD = 0.6;

export interface ResponseTiming {
  questionType: string;
  responseTimeSeconds: number;
}

export interface SessionAnomalyResult {
  anomalyScore: number;      // 0..1 fraction of anomalously fast responses
  anomalousCount: number;    // raw count of fast responses
  totalResponses: number;    // total responses analysed
  flagged: boolean;          // anomalyScore > ANOMALY_THRESHOLD
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Returns true if `responseTimeSeconds` is below the minimum plausible time
 * for the given question type. Pure function — easily unit-testable.
 */
export function isAnomalouslyFast(
  questionType: string,
  responseTimeSeconds: number,
): boolean {
  if (responseTimeSeconds < 0) return false; // garbage input — ignore
  const key = (questionType ?? '').toUpperCase();
  const minTime = MIN_RESPONSE_TIMES[key] ?? DEFAULT_MIN_TIME;
  return responseTimeSeconds < minTime;
}

/**
 * Computes the session-wide anomaly score from an array of per-response timings.
 * Pure function — easily unit-testable.
 */
export function computeSessionAnomalyScore(
  responses: ResponseTiming[],
): SessionAnomalyResult {
  const total = responses.length;
  if (total === 0) {
    return { anomalyScore: 0, anomalousCount: 0, totalResponses: 0, flagged: false, severity: 'LOW' };
  }

  const anomalousCount = responses.filter(r =>
    isAnomalouslyFast(r.questionType, r.responseTimeSeconds),
  ).length;

  const rawScore = anomalousCount / total;
  const anomalyScore = Math.round(rawScore * 100) / 100;
  const flagged = anomalyScore > ANOMALY_THRESHOLD;

  const severity: 'LOW' | 'MEDIUM' | 'HIGH' =
    anomalyScore >= HIGH_SEVERITY_THRESHOLD ? 'HIGH' :
    flagged ? 'MEDIUM' : 'LOW';

  return { anomalyScore, anomalousCount, totalResponses: total, flagged, severity };
}

/**
 * Builds per-response timing data from persisted ComponentQuestionResponse records.
 *
 * Strategy:
 *   1. Use ComponentQuestionResponse.timeSpent if present (preferred — set by
 *      the response submission route from client-tracked timing).
 *   2. Otherwise fall back to deltas between consecutive `createdAt` timestamps,
 *      using userComponent.startedAt as the anchor for the first response.
 *
 * The fallback path makes anomaly detection work for sessions completed
 * before G12 deployment (no timeSpent stored) and for any client that
 * fails to send timing.
 */
export async function buildResponseTimings(memberAssessmentId: string): Promise<ResponseTiming[]> {
  // 1) Find the UserAssessmentModel for this member assessment.
  //    BiasFlag.memberAssessmentId references MemberAssessment, not UserAssessmentModel.
  //    Bridge via member + assessmentModelId.
  const memberAssessment = await prisma.memberAssessment.findUnique({
    where: { id: memberAssessmentId },
    select: { memberId: true, assessmentModelId: true },
  });
  if (!memberAssessment) return [];

  // 2) Find the UserAssessmentModel for the same model + user (member.email → user)
  const member = await prisma.member.findUnique({
    where: { id: memberAssessment.memberId },
    select: { email: true },
  });
  if (!member?.email) return [];

  const userAssessmentModel = await prisma.userAssessmentModel.findFirst({
    where: {
      modelId: memberAssessment.assessmentModelId,
      user: { email: member.email },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
  if (!userAssessmentModel) return [];

  // 3) Fetch all UserAssessmentComponents for this UAM
  const userComponents = await prisma.userAssessmentComponent.findMany({
    where: { userAssessmentModelId: userAssessmentModel.id },
    select: { id: true, startedAt: true },
  });

  if (userComponents.length === 0) return [];

  // 4) Fetch all responses with question type
  const responses = await prisma.componentQuestionResponse.findMany({
    where: { userComponentId: { in: userComponents.map(c => c.id) } },
    select: {
      userComponentId: true,
      timeSpent: true,
      createdAt: true,
      question: { select: { questionType: true } },
    },
    orderBy: [{ userComponentId: 'asc' }, { createdAt: 'asc' }],
  });

  if (responses.length === 0) return [];

  // 5) Build timings — prefer stored timeSpent, fallback to createdAt deltas
  const startedAtMap = new Map(userComponents.map(c => [c.id, c.startedAt]));
  const timings: ResponseTiming[] = [];
  let prevByComponent: Record<string, Date> = {};

  for (const r of responses) {
    const questionType = r.question?.questionType ?? '';
    let seconds: number;

    if (typeof r.timeSpent === 'number' && r.timeSpent >= 0) {
      seconds = r.timeSpent;
    } else {
      // Fallback: derive from timestamps
      const prev = prevByComponent[r.userComponentId] ?? startedAtMap.get(r.userComponentId);
      if (!prev) {
        // No anchor — skip this response (can't compute timing)
        prevByComponent[r.userComponentId] = r.createdAt;
        continue;
      }
      const deltaMs = r.createdAt.getTime() - prev.getTime();
      seconds = Math.max(0, Math.floor(deltaMs / 1000));
    }

    timings.push({ questionType, responseTimeSeconds: seconds });
    prevByComponent[r.userComponentId] = r.createdAt;
  }

  return timings;
}

/**
 * End-to-end orchestration for completion-route wiring:
 *   1. Loads timings for the member assessment.
 *   2. Computes anomaly score.
 *   3. Persists a BiasFlag with flagType = 'RAPID_COMPLETION' if flagged.
 *
 * Designed to be called fire-and-forget — never throws. Returns the result
 * for diagnostics/testing.
 */
export async function detectAndFlagTimeAnomaly(
  memberAssessmentId: string,
): Promise<SessionAnomalyResult | null> {
  try {
    const timings = await buildResponseTimings(memberAssessmentId);
    if (timings.length === 0) return null;

    const result = computeSessionAnomalyScore(timings);

    if (result.flagged) {
      await prisma.biasFlag.create({
        data: {
          memberAssessmentId,
          flagType: 'RAPID_COMPLETION',
          severity: result.severity,
          affectedLayer: 'ALL',
          correctionApplied: false,
          details: {
            anomalyScore: result.anomalyScore,
            anomalousCount: result.anomalousCount,
            totalResponses: result.totalResponses,
          },
        },
      });
    }

    return result;
  } catch (err) {
    // Anti-cheat must never break the user flow.
    console.error('[TimeAnomaly] Detection failed:', err);
    return null;
  }
}
