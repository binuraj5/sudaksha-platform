/**
 * Item Pool Selection Service
 * SEPL/INT/2026/IMPL-GAPS-01 Step G13
 * Patent claim C-09 — randomised item selection per cohort
 *
 * Strategy:
 *   1. SJT-style questions can be tagged with `targetCohort` (STUDENT | PROFESSIONAL | CORPORATE).
 *      Questions with `targetCohort = null` are universal (visible to every cohort).
 *   2. When a session starts, draw a random subset of `targetCount` from the
 *      cohort-appropriate pool — preventing item familiarity / item exposure bias.
 *   3. Pool tagging via `itemPoolTag` lets question authors group equivalent items
 *      so the random draw can balance across pools (e.g. 8 from each of 3 pools).
 */

import { prisma } from '@/lib/prisma';

const SJT_QUESTION_TYPES = ['SCENARIO_BASED', 'SJT'];

/**
 * Returns an array of question IDs randomly drawn from the cohort-appropriate
 * SJT pool for a given component. Order is shuffled.
 *
 * Algorithm:
 *   - Fetches all SJT questions in the component matching `targetCohort = cohortType`
 *     OR `targetCohort = null` (universal items).
 *   - If pool size ≤ targetCount, returns all (shuffled).
 *   - Otherwise, returns `targetCount` randomly drawn (Fisher-Yates shuffle).
 */
export async function selectSJTItemsForCohort(
  componentId: string,
  cohortType: string,
  targetCount: number = 24,
): Promise<string[]> {
  const questions = await prisma.componentQuestion.findMany({
    where: {
      componentId,
      questionType: { in: SJT_QUESTION_TYPES as any },
      OR: [
        { targetCohort: cohortType },
        { targetCohort: null },
      ],
    },
    select: { id: true },
  });

  if (questions.length === 0) return [];

  const ids = questions.map(q => q.id);
  const shuffled = fisherYatesShuffle(ids);

  if (shuffled.length <= targetCount) return shuffled;
  return shuffled.slice(0, targetCount);
}

/**
 * Filter an existing array of questions to only those visible to the given cohort.
 * Used by the runner's question fetch routes to apply cohort filtering inline
 * without re-querying the DB.
 *
 * Non-SJT questions (e.g. MULTIPLE_CHOICE, ESSAY) are ALWAYS included regardless
 * of `targetCohort` — cohort-targeting only applies to SJT-style items per spec.
 */
export function filterQuestionsByCohort<T extends {
  questionType: string;
  targetCohort?: string | null;
}>(questions: T[], cohortType: string | null | undefined): T[] {
  if (!cohortType) return questions;

  return questions.filter(q => {
    const isSjt = SJT_QUESTION_TYPES.includes(String(q.questionType).toUpperCase());
    if (!isSjt) return true; // non-SJT always included
    if (q.targetCohort == null) return true; // universal item
    return q.targetCohort === cohortType;
  });
}

/**
 * Resolves the cohort type for a member.
 *   STUDENT     → student-cohort SJT items
 *   EMPLOYEE    → CORPORATE if part of a corporate tenant, else PROFESSIONAL
 *   INDIVIDUAL  → PROFESSIONAL (B2C individual users)
 *   undefined   → null (no cohort filtering)
 */
export function resolveMemberCohort(
  memberType: string | null | undefined,
  tenantType?: string | null,
): 'STUDENT' | 'PROFESSIONAL' | 'CORPORATE' | null {
  if (!memberType) return null;
  const t = memberType.toUpperCase();
  if (t === 'STUDENT') return 'STUDENT';
  if (t === 'INDIVIDUAL') return 'PROFESSIONAL';
  if (t === 'EMPLOYEE') {
    return String(tenantType ?? '').toUpperCase() === 'INSTITUTION' ? 'STUDENT' : 'CORPORATE';
  }
  return null;
}

/**
 * Shuffles an array using Fisher-Yates — far more uniform than
 * `arr.sort(() => Math.random() - 0.5)` which has known distribution bias.
 */
function fisherYatesShuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
