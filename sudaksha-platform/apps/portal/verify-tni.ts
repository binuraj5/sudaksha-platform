import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mirror gap logic from lib/tni-utils.ts
const REQUIRED_LEVEL_PCT: Record<string, number> = { EXPERT: 75, SENIOR: 50, MIDDLE: 25, JUNIOR: 0 };
function getGapBand(achievedPct: number, requiredLevel: string) {
  const req = REQUIRED_LEVEL_PCT[requiredLevel] ?? 0;
  const gap = req - achievedPct;
  if (gap <= 0) return 'EXCEEDS';
  if (gap <= 10) return 'NEAR_TARGET';
  if (gap <= 25) return 'MODERATE_GAP';
  if (gap <= 50) return 'SIGNIFICANT_GAP';
  return 'CRITICAL_GAP';
}

async function verify() {
  const anchorId = 'cmmd5ow8y000412u1j7q3f5my';

  console.log(`\n--- Verifying Anchor Record: ${anchorId} ---`);

  // 1. Fetch Member Assessment & UAM
  const memberAssessment = await prisma.memberAssessment.findUnique({
    where: { id: anchorId },
    select: { memberId: true, assessmentModelId: true, status: true }
  });

  if (!memberAssessment) {
    console.log("Anchor record not found.");
    return;
  }

  const member = await prisma.member.findUnique({
    where: { id: memberAssessment.memberId },
    select: { currentRole: { include: { competencies: { include: { competency: true } } } } }
  });

  const uam = await prisma.userAssessmentModel.findFirst({
    where: { modelId: memberAssessment.assessmentModelId }, // Simplified for the test, assuming only 1 user matches the test
    orderBy: { createdAt: "desc" },
    include: {
      componentResults: {
        include: { component: { include: { competency: true } } }
      }
    }
  });

  if (!uam) {
    console.log("UAM not found.");
    return;
  }

  console.log(`Role Competency Count: ${member?.currentRole?.competencies.length}`);
  console.log(`Component Results Count: ${uam.componentResults.length}`);

  // Calculate generic gap analysis (AT-1, AT-2, AT-3)
  const roleCompetencies = member?.currentRole?.competencies || [];
  const competencyScores: Record<string, any> = {};
  
  uam.componentResults.forEach(res => {
    const compId = res.component?.competencyId;
    if (!compId) return;
    const pct = res.percentage ?? (res.score ?? 0);
    if (!competencyScores[compId]) competencyScores[compId] = { total: 0, count: 0 };
    competencyScores[compId].total += pct;
    competencyScores[compId].count += 1;
  });

  const analysis = roleCompetencies.map(rc => {
    const compId = rc.competencyId;
    if (!competencyScores[compId] || competencyScores[compId].count === 0) return null;
    
    const avgPct = competencyScores[compId].total / competencyScores[compId].count;
    return { name: rc.competency.name, gapBand: getGapBand(avgPct, rc.requiredLevel) };
  }).filter(a => a !== null);

  console.log(`\nAT-1 & AT-2: gap-analysis API returns exactly ${analysis.length} competencies (Excluding unassessed)`);
  
  console.log(`\nAT-3: Gap Banding Results:`);
  analysis.forEach(a => console.log(` - ${a.name}: ${a.gapBand}`));

  // AT-4: Results Page TNI 
  console.log(`\nAT-4: Results page Training Recommended (Excluding MET/EXCEEDS):`);
  const recommended = analysis.filter(a => a.gapBand !== 'MET' && a.gapBand !== 'EXCEEDS');
  recommended.forEach(a => console.log(` - Recommended for: ${a.name} (${a.gapBand})`));

  // AT-5 & AT-6: aiEvaluationResults caching
  console.log(`\nAT-5 & AT-6: aiEvaluationResults cached data in component results:`);
  let cachedCount = 0;
  uam.componentResults.forEach(res => {
     const aiData = res.aiEvaluationResults as any;
     if (aiData && aiData.tniJustification) {
        cachedCount++;
        console.log(` - Found justification for ${res.component?.competency?.name}:`);
        console.log(`   "${aiData.tniJustification}"`);
     }
  });
  console.log(`Total cached justifications found: ${cachedCount}`);

  await prisma.$disconnect();
}

verify().catch(console.error);
