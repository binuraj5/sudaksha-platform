/**
 * Workforce Readiness Index (WRI) Computation
 * SEPL/INT/2026/IMPL-GAPS-01 Step G7
 * Patent claim C-10 — organisation-level readiness index
 *
 * Formula: WRI = weighted average of domain averages across all org members
 * Calibrated against industry benchmark (default: 70 for tech sector)
 *
 * SEPL/INT/2026/IMPL-GAPS-01 Step G19 — Redis caching layer (1-hour TTL).
 */
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet, cacheKey } from '@/lib/redis';

const INDUSTRY_BENCHMARKS: Record<string, number> = {
  TECHNOLOGY: 70, FINANCE: 68, HEALTHCARE: 65,
  EDUCATION: 62, MANUFACTURING: 60, DEFAULT: 65,
};

interface WRIResult {
  wri: number;
  benchmark: number;
  gap: number;
  domainScores: Record<string, number>;
  memberCount: number;
}

const WRI_CACHE_TTL_SECONDS = 3600; // 1 hour

export async function computeWRI(
  tenantId: string,
  sector: string = 'DEFAULT'
): Promise<WRIResult> {
  // SEPL/INT/2026/IMPL-GAPS-01 Step G19 — cache lookup before DB query.
  // Key includes sector so a tenant changing its industry doesn't serve stale data.
  const key = cacheKey('wri', tenantId, sector);
  const cached = await cacheGet<WRIResult>(key);
  if (cached) return cached;

  // Get all completed assessments for this tenant
  const scores = await prisma.competencyScore.findMany({
    where: {
      memberAssessment: {
        member: { tenantId },
        status: 'COMPLETED',
      },
      assessmentType: 'ADAPT_16',
    },
    select: { competencyCode: true, proficiencyLevel: true, memberAssessmentId: true },
  });

  const benchmark = INDUSTRY_BENCHMARKS[sector] ?? INDUSTRY_BENCHMARKS.DEFAULT;
  if (!scores.length) {
    const empty: WRIResult = { wri: 0, benchmark, gap: 0, domainScores: {}, memberCount: 0 };
    // Short TTL on empty result so the dashboard becomes live as soon as the
    // first assessment lands. 60s is enough to deduplicate a dashboard burst.
    await cacheSet(key, empty, 60);
    return empty;
  }

  // Group by domain
  const DOMAIN_MAP: Record<string, string> = {
    'A-01': 'A', 'A-02': 'A', 'A-03': 'A', 'A-04': 'A',
    'D-01': 'D', 'D-02': 'D', 'D-03': 'D',
    'AL-01': 'AL', 'AL-02': 'AL', 'AL-03': 'AL',
    'P-01': 'P', 'P-02': 'P', 'P-03': 'P',
    'T-01': 'T', 'T-02': 'T', 'T-03': 'T',
  };

  const domainSums: Record<string, number[]> = { A: [], D: [], AL: [], P: [], T: [] };
  for (const s of scores) {
    const domain = DOMAIN_MAP[s.competencyCode];
    if (domain) domainSums[domain].push(s.proficiencyLevel);
  }

  // Convert average proficiency (1–4) to 0–100 scale: (avg - 1) / 3 * 100
  const domainScores: Record<string, number> = {};
  for (const [domain, levels] of Object.entries(domainSums)) {
    if (!levels.length) continue;
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    domainScores[domain] = Math.round(((avg - 1) / 3) * 100);
  }

  const domainValues = Object.values(domainScores);
  const wri = domainValues.length
    ? Math.round(domainValues.reduce((a, b) => a + b, 0) / domainValues.length)
    : 0;

  const memberCount = new Set(scores.map((s) => s.memberAssessmentId)).size;
  const result: WRIResult = { wri, benchmark, gap: wri - benchmark, domainScores, memberCount };
  // SEPL/INT/2026/IMPL-GAPS-01 Step G19 — populate cache for the next request.
  await cacheSet(key, result, WRI_CACHE_TTL_SECONDS);
  return result;
}
