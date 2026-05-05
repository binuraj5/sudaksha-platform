/**
 * TDAS Session Result Computation Service
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T9
 *
 * Computes per-participant results for a completed TrainingSession,
 * then feeds results into the Phase 2 scoring pipeline:
 * - Response-time anomaly detection (live-session anti-cheat)
 * - Normative calibration (using TDAS cohort type via calibrateScore)
 * - CompetencyScore update (blended with existing TDAS scores)
 * - Session status update to COMPLETED
 *
 * Patent critical: TDAS wire-up to Phase 2 bias + normative engines.
 */
import { prisma } from '@/lib/prisma';
import { calibrateScore } from '@/lib/scoring/calibrateScore';
import { computeTDASSessionAnomalyScore } from '@/lib/training/detectSessionTimeAnomaly';

const BLEND_WEIGHT = 0.3; // TDAS session score weight in CompetencyScore blend

export async function computeSessionResults(sessionId: string): Promise<void> {
  const session = await prisma.trainingSession.findUnique({
    where: { id: sessionId },
    include: {
      responses: {
        include: {
          question: { select: { competencyCode: true, correctOptionId: true, questionType: true } },
        },
      },
    },
  });
  if (!session) return;

  // Get unique participant member IDs
  const participantIds = [...new Set(session.responses.map(r => r.memberId))];

  for (const memberId of participantIds) {
    const memberResponses = session.responses.filter(r => r.memberId === memberId);
    if (!memberResponses.length) continue;

    const totalQuestions = memberResponses.length;
    const correctAnswers = memberResponses.filter(r => r.isCorrect === true).length;
    const rawScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // ── TIME ANOMALY CHECK via T23 TDAS-specific thresholds ─────────────────
    const { flagged: timeFlagged, anomalyScore } = computeTDASSessionAnomalyScore(
      memberResponses.map(r => ({
        questionType: r.question?.questionType ?? 'MULTIPLE_CHOICE',
        responseTimeMs: r.responseTimeMs,
      }))
    );
    const biasFlags: object[] = timeFlagged
      ? [{ type: 'RAPID_RESPONSE', severity: 'MEDIUM', anomalyScore }]
      : [];

    // ── T20 PATTERN BIAS — uniform option selection ───────────────────────────
    const optionSelections = memberResponses
      .filter(r => r.selectedOptionId)
      .map(r => r.selectedOptionId);
    if (optionSelections.length >= 5) {
      const uniqueSelections = new Set(optionSelections).size;
      if (uniqueSelections === 1) {
        biasFlags.push({
          type: 'UNIFORM_SELECTION',
          severity: 'HIGH',
          detail: `Participant selected the same option for all ${optionSelections.length} questions`,
        });
      }
    }

    // ── NORMATIVE CALIBRATION ─────────────────────────────────────────────────
    const competencyCodes = [...new Set(
      memberResponses
        .map(r => r.question.competencyCode)
        .filter(Boolean) as string[]
    )];

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { type: true },
    });
    const cohortType = member?.type ?? 'PROFESSIONAL';

    let normalisedScore: number | undefined;
    let proficiencyLevel: number | undefined;
    let percentileRank: number | undefined;

    if (competencyCodes.length > 0) {
      try {
        const calibration = await calibrateScore(
          rawScore,
          competencyCodes[0],
          cohortType,
          'TDAS'
        );
        normalisedScore = calibration.normalisedScore;
        proficiencyLevel = calibration.proficiencyLevel;
        percentileRank = calibration.percentileRank;
      } catch {
        // Calibration fallback — use raw score only
        normalisedScore = rawScore;
      }

      // ── UPDATE CompetencyScores (blended) ──────────────────────────────────
      for (const competencyCode of competencyCodes) {
        const existing = await prisma.competencyScore.findFirst({
          where: {
            competencyCode,
            assessmentType: 'TDAS',
            memberAssessment: { member: { id: memberId } },
          },
          orderBy: { updatedAt: 'desc' },
        });

        if (existing) {
          const blendedScore = existing.compositeRawScore * (1 - BLEND_WEIGHT) + rawScore * BLEND_WEIGHT;
          await prisma.competencyScore.update({
            where: { id: existing.id },
            data: {
              compositeRawScore: Math.round(blendedScore * 100) / 100,
              normalisedScore: normalisedScore ?? existing.normalisedScore,
              proficiencyLevel: proficiencyLevel ?? existing.proficiencyLevel,
              percentileRank: percentileRank ?? existing.percentileRank,
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    // ── STORE TrainingSessionResult ───────────────────────────────────────────
    await prisma.trainingSessionResult.upsert({
      where: { sessionId_memberId: { sessionId, memberId } },
      update: {
        totalQuestions,
        correctAnswers,
        rawScore: Math.round(rawScore * 100) / 100,
        normalisedScore,
        proficiencyLevel,
        percentileRank,
        biasFlags,
        completedAt: new Date(),
      },
      create: {
        sessionId,
        memberId,
        totalQuestions,
        correctAnswers,
        rawScore: Math.round(rawScore * 100) / 100,
        normalisedScore,
        proficiencyLevel,
        percentileRank,
        biasFlags,
        completedAt: new Date(),
      },
    });

    // ── T22 SESSION-OVER-SESSION DELTA ────────────────────────────────────────
    const previousResult = await prisma.trainingSessionResult.findFirst({
      where: {
        session: { activityId: session.activityId },
        memberId,
        completedAt: { lt: new Date() },
        // Exclude the record we just created by requiring an older completedAt
      },
      orderBy: { completedAt: 'desc' },
      take: 1,
    });
    if (previousResult && previousResult.sessionId !== sessionId) {
      const delta = Math.round((rawScore - previousResult.rawScore) * 100) / 100;
      await prisma.trainingSessionResult.update({
        where: { sessionId_memberId: { sessionId, memberId } },
        data: { deltaFromLastSession: delta },
      });
    }

    // ── T20 Bias flags → BiasFlag table (non-critical) ───────────────────────
    if (biasFlags.length > 0) {
      await prisma.biasFlag.createMany({
        data: (biasFlags as Array<{ type: string; severity: string }>).map(f => ({
          memberAssessmentId: 'TDAS',
          flagType: f.type,
          severity: f.severity,
          affectedLayer: 'TDAS_RESPONSE',
          correctionApplied: false,
          details: { sessionId, memberId, ...f },
        })),
        skipDuplicates: true,
      }).catch(() => {});
    }
  }

  // Mark session COMPLETED
  await prisma.trainingSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      totalParticipants: participantIds.length,
    },
  });

  console.log(`[TDAS] Session ${sessionId} completed. ${participantIds.length} results computed.`);
}
