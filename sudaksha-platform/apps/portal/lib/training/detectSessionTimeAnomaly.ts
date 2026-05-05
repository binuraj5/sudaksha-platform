/**
 * TDAS Session Time Anomaly Detection
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T23
 *
 * Lower thresholds than Phase 2 detectTimeAnomaly.ts —
 * live classroom context allows faster responses.
 * These are separate functions — Phase 2 detectTimeAnomaly.ts is NOT modified.
 *
 * Phase 2 MCQ threshold: 8000ms
 * TDAS MCQ threshold:    3000ms (live class, simpler questions, trainer controls pace)
 */

// Minimum plausible response times for LIVE SESSION context (milliseconds)
const TDAS_MIN_RESPONSE_MS: Record<string, number> = {
  MULTIPLE_CHOICE: 3000,   // 3s — read question + pick option
  TRUE_FALSE:      2000,   // 2s — binary decision
  SHORT_ANSWER:   10000,   // 10s — minimal typing required
  RATING:          2000,   // 2s — slider / star selection
};

export function isTDASAnomalouslyFast(
  questionType: string,
  responseTimeMs: number
): boolean {
  const min = TDAS_MIN_RESPONSE_MS[questionType] ?? 3000;
  return responseTimeMs < min;
}

export function computeTDASSessionAnomalyScore(
  responses: Array<{ questionType: string; responseTimeMs: number | null }>
): { anomalyScore: number; flagged: boolean } {
  const timed = responses.filter(r => r.responseTimeMs !== null);
  if (!timed.length) return { anomalyScore: 0, flagged: false };

  const anomalousCount = timed.filter(r =>
    isTDASAnomalouslyFast(r.questionType, r.responseTimeMs!)
  ).length;

  const anomalyScore = anomalousCount / timed.length;
  return {
    anomalyScore: Math.round(anomalyScore * 100) / 100,
    // Flag if >50% responses too fast (higher threshold for live than Phase 2's 30%)
    flagged: anomalyScore > 0.5,
  };
}
