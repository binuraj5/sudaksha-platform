/**
 * Training Readiness Index (TRI)
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T24
 *
 * Measures average module assessment performance from training sessions
 * for a client/tenant. Deliberately SEPARATE from WRI (which remains ADAPT-16 only).
 *
 * TRI = weighted average of CompetencyScore.normalisedScore where
 * assessmentType = 'TDAS', across all active members of the tenant.
 *
 * WRI remains ADAPT-16-only — no changes to computeWorkforceReadinessIndex.ts
 */
import { prisma } from '@/lib/prisma';

export async function computeTRI(tenantId: string): Promise<{
  tri: number;
  sessionsIncluded: number;
  memberCount: number;
}> {
  const scores = await prisma.competencyScore.findMany({
    where: {
      memberAssessment: { member: { tenantId } },
      assessmentType: 'TDAS',
      normalisedScore: { not: null },
    },
    select: { normalisedScore: true, memberAssessmentId: true },
  });

  if (!scores.length) {
    return { tri: 0, sessionsIncluded: 0, memberCount: 0 };
  }

  const total = scores.reduce((sum, s) => sum + (s.normalisedScore ?? 0), 0);
  const tri = Math.round(total / scores.length);
  const memberCount = new Set(scores.map(s => s.memberAssessmentId)).size;

  return { tri, sessionsIncluded: scores.length, memberCount };
}
