import { prisma } from '@/lib/prisma';

/**
 * CareerFitScore Computation Service
 * SEPL/INT/2026/IMPL-GAPS-01 Step G6
 * Patent claim C-07 — career-competency mapping engine
 * Algorithm: weighted inverse-distance between member profile and role archetype
 */
export async function computeCareerFitScores(memberId: string): Promise<void> {
  // 1. Get member's latest CompetencyScore records (all instrument types)
  const latestAssessment = await prisma.memberAssessment.findFirst({
    where: { member: { id: memberId }, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });
  if (!latestAssessment) return;

  const memberScores = await prisma.competencyScore.findMany({
    where: { memberAssessmentId: latestAssessment.id },
    select: { competencyCode: true, proficiencyLevel: true, assessmentType: true },
  });
  if (!memberScores.length) return;

  // Map: competencyCode → proficiencyLevel (1–4)
  const profileMap = Object.fromEntries(
    memberScores.map((s) => [s.competencyCode, s.proficiencyLevel])
  );

  // 2. Get all active roles with their competency requirements
  const roles = await prisma.role.findMany({
    where: { isActive: true },
    include: {
      competencies: {
        select: {
          competencyId: true,
          requiredLevel: true,
          weight: true,
          isCritical: true,
          competency: {
            select: { name: true },
          },
        },
      },
    },
    take: 100, // Cap at 100 roles per computation
  });

  // Level mapping: JUNIOR=1, MIDDLE=2, SENIOR=3, EXPERT=4
  const LEVEL_MAP: Record<string, number> = {
    JUNIOR: 1, MIDDLE: 2, SENIOR: 3, EXPERT: 4,
    EMERGING: 1, DEVELOPING: 2, PROFICIENT: 3, ADVANCED: 4,
  };

  // 3. Compute weighted inverse-distance fit score per role
  const fitScores: Array<{
    role: (typeof roles)[number];
    fitScore: number;
    gapAnalysis: Record<string, { required: number; current: number; gap: number }>;
  }> = [];

  for (const role of roles) {
    if (!role.competencies.length) continue;

    const gapAnalysis: Record<string, { required: number; current: number; gap: number }> = {};
    let weightedDistanceSum = 0;
    let totalWeight = 0;
    let criticalGapFound = false;

    for (const rc of role.competencies) {
      const required = LEVEL_MAP[String(rc.requiredLevel)] ?? 2;
      const competencyCode = rc.competency?.name ?? rc.competencyId;
      const current = profileMap[competencyCode] ?? 1;
      const gap = required - current;
      const weight = (rc.weight ?? 1.0) * (rc.isCritical ? 1.5 : 1.0);

      gapAnalysis[competencyCode] = { required, current, gap };

      // Inverse distance: larger gap = larger penalty
      // Critical competency gaps are penalised 1.5×
      const distance = Math.abs(gap) / 3; // normalise: max gap = 3 levels
      weightedDistanceSum += distance * weight;
      totalWeight += weight;

      if (rc.isCritical && gap > 1) criticalGapFound = true;
    }

    // Fit score: 100 = perfect match, decreases with distance
    const avgWeightedDistance = totalWeight > 0 ? weightedDistanceSum / totalWeight : 1;
    let fitScore = Math.max(0, Math.round((1 - avgWeightedDistance) * 100));

    // Apply critical gap penalty: if member is >1 level below a critical competency
    if (criticalGapFound) fitScore = Math.max(0, fitScore - 15);

    fitScores.push({ role, fitScore, gapAnalysis });
  }

  // 4. Sort by fit score and assign rank
  fitScores.sort((a, b) => b.fitScore - a.fitScore);

  // 5. Upsert CareerFitScore records
  for (let i = 0; i < fitScores.length; i++) {
    const { role, fitScore, gapAnalysis } = fitScores[i];
    await prisma.careerFitScore.upsert({
      where: {
        memberId_roleId_memberAssessmentId: {
          memberId, roleId: role.id, memberAssessmentId: latestAssessment.id,
        },
      },
      update: { fitScore, gapAnalysis, rank: i + 1, calculatedAt: new Date() },
      create: {
        memberId, roleId: role.id, memberAssessmentId: latestAssessment.id,
        fitScore, gapAnalysis, rank: i + 1,
        instrumentsUsed: [...new Set(memberScores.map((s) => s.assessmentType))],
      },
    });
  }

  console.log(`[CareerFit] Computed ${fitScores.length} role fit scores for member ${memberId}`);
}
