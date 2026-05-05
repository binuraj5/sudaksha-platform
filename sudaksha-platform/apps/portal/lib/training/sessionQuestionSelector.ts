/**
 * Training Session Question Selector
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T7
 *
 * Stratified random selection of N questions from the module's question bank.
 * Stratification: balanced by difficulty level, then competency coverage.
 * Random seed is stored with the session for audit/reproducibility.
 *
 * Patent claim C-09: per-cohort randomised item selection.
 */
import { prisma } from '@/lib/prisma';

interface SelectionConfig {
  sessionId: string;
  activityId: string;
  targetCount: number;          // e.g. 10
  targetCohort?: string | null; // filter by cohort if specified
  seed?: string;                // optional pre-set seed
}

/**
 * Deterministic PRNG derived from a string seed (xorshift32).
 * Same seed → same sequence → reproducible session question sets.
 */
function seededRandom(seed: string): () => number {
  let state = seed.split('').reduce((acc, ch) => acc ^ ch.charCodeAt(0) * 2654435761, 0x12345678);
  return function () {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export async function selectQuestionsForSession(
  config: SelectionConfig
): Promise<{ questionIds: string[]; seed: string }> {
  const seed = config.seed ?? `${config.activityId}-${Date.now()}`;
  const rand = seededRandom(seed);

  // Fetch active question bank for this module + cohort filter
  const pool = await prisma.trainingSessionQuestion.findMany({
    where: {
      activityId: config.activityId,
      isActive: true,
      OR: [
        { targetCohort: config.targetCohort ?? null },
        { targetCohort: null },
      ],
    },
    select: {
      id: true,
      difficultyLevel: true,
      competencyCode: true,
    },
  });

  if (pool.length === 0) return { questionIds: [], seed };
  if (pool.length <= config.targetCount) {
    // Not enough questions — return all, shuffled
    const shuffled = [...pool].sort(() => rand() - 0.5);
    return { questionIds: shuffled.map(q => q.id), seed };
  }

  // Stratified sampling: equal distribution across difficulty levels (1=Easy, 2=Medium, 3=Hard)
  const byDifficulty: Record<number, typeof pool> = { 1: [], 2: [], 3: [] };
  for (const q of pool) {
    const d = q.difficultyLevel ?? 2;
    if (!byDifficulty[d]) byDifficulty[d] = [];
    byDifficulty[d].push(q);
  }

  // Shuffle each difficulty bucket with seeded PRNG
  for (const d of [1, 2, 3]) {
    byDifficulty[d] = byDifficulty[d].sort(() => rand() - 0.5);
  }

  const selected: string[] = [];
  const perLevel = Math.floor(config.targetCount / 3);
  const remainder = config.targetCount - perLevel * 3;

  // Take perLevel from each difficulty
  for (const d of [1, 2, 3]) {
    selected.push(...byDifficulty[d].slice(0, perLevel).map(q => q.id));
  }

  // Fill remainder from difficulty 2 (medium — most questions typically)
  const remaining = byDifficulty[2].slice(perLevel);
  selected.push(...remaining.slice(0, remainder).map(q => q.id));

  // Final shuffle of the selected set
  const finalSelection = selected.sort(() => rand() - 0.5);

  return { questionIds: finalSelection.slice(0, config.targetCount), seed };
}
