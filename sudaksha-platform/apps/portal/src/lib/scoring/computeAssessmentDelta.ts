/**
 * AssessmentDelta Computation Service
 * SEPL/INT/2026/IMPL-GAPS-01 Step G4
 * Patent claim C-04 — closed-loop pre/post competency delta
 */
import { prisma } from '@/lib/prisma';

export async function computeAndStoreDelta(
  memberId: string,
  followupAssessmentId: string,
  assessmentType: string = 'RBCA'
): Promise<void> {
  // Find the most recent COMPLETED baseline assessment for this member
  const baseline = await prisma.memberAssessment.findFirst({
    where: {
      member: { id: memberId },
      isBaseline: true,
      status: 'COMPLETED',
      id: { not: followupAssessmentId },
    },
    orderBy: { completedAt: 'desc' },
  });

  if (!baseline) return; // No baseline exists yet — this becomes the baseline

  // Fetch competency scores for both sessions
  const [baselineScores, followupScores] = await Promise.all([
    prisma.competencyScore.findMany({
      where: { memberAssessmentId: baseline.id, assessmentType },
      select: { competencyCode: true, proficiencyLevel: true, compositeRawScore: true },
    }),
    prisma.competencyScore.findMany({
      where: { memberAssessmentId: followupAssessmentId, assessmentType },
      select: { competencyCode: true, proficiencyLevel: true, compositeRawScore: true },
    }),
  ]);

  if (!baselineScores.length || !followupScores.length) return;

  // Compute delta per competency
  const deltaScores: Record<string, number> = {};
  const followupMap = Object.fromEntries(followupScores.map((s) => [s.competencyCode, s]));

  let totalDelta = 0;
  let count = 0;

  for (const base of baselineScores) {
    const followup = followupMap[base.competencyCode];
    if (!followup) continue;
    const delta = followup.proficiencyLevel - base.proficiencyLevel;
    deltaScores[base.competencyCode] = delta;
    totalDelta += delta;
    count++;
  }

  const overallDelta = count > 0 ? Math.round((totalDelta / count) * 100) / 100 : 0;

  await prisma.assessmentDelta.upsert({
    where: {
      // Unique constraint on baseline + followup pair
      id: `${baseline.id}_${followupAssessmentId}`,
    },
    update: { deltaScores, overallDelta, calculatedAt: new Date() },
    create: {
      memberId,
      baselineAssessmentId: baseline.id,
      followupAssessmentId,
      deltaScores,
      overallDelta,
      assessmentType,
    },
  }).catch(async () => {
    // Upsert by composite key if ID-based fails
    await prisma.assessmentDelta.create({
      data: {
        memberId,
        baselineAssessmentId: baseline.id,
        followupAssessmentId,
        deltaScores,
        overallDelta,
        assessmentType,
      },
    }).catch(() => {}); // Silently skip if already exists
  });
}

export async function flagAsBaseline(memberAssessmentId: string): Promise<void> {
  await prisma.memberAssessment.update({
    where: { id: memberAssessmentId },
    data: { isBaseline: true },
  });
}
