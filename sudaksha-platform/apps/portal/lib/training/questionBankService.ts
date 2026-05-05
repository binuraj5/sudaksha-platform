/**
 * Training Question Bank Service
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T6
 *
 * Manages the question pool for each training module (Activity).
 * Questions belong to an Activity (module), not to a specific session.
 * Trainers and Ops team upload questions; sessions randomly draw from the pool.
 */
import { prisma } from '@/lib/prisma';

export interface QuestionInput {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'RATING';
  options?: Array<{ id: string; text: string; isCorrect?: boolean; competencyCode?: string }>;
  correctOptionId?: string;
  competencyCode?: string;
  difficultyLevel?: 1 | 2 | 3;
  targetCohort?: 'STUDENT' | 'PROFESSIONAL' | 'CORPORATE' | null;
}

export async function uploadQuestionsForModule(
  activityId: string,
  questions: QuestionInput[],
  uploadedBy: string
): Promise<{ created: number; skipped: number; errors: string[] }> {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Verify activity exists
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, name: true },
  });
  if (!activity) {
    return { created: 0, skipped: 0, errors: [`Activity ${activityId} not found`] };
  }

  for (const q of questions) {
    try {
      if (!q.questionText?.trim()) {
        errors.push(`Skipped: empty question text`);
        skipped++;
        continue;
      }
      if (q.questionType === 'MULTIPLE_CHOICE' && (!q.options || q.options.length < 2)) {
        errors.push(`Skipped: "${q.questionText.slice(0, 40)}" — needs ≥2 options`);
        skipped++;
        continue;
      }

      await prisma.trainingSessionQuestion.create({
        data: {
          activityId,
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          options: q.options ?? [],
          correctOptionId: q.correctOptionId ?? null,
          competencyCode: q.competencyCode ?? null,
          difficultyLevel: q.difficultyLevel ?? 2,
          targetCohort: q.targetCohort ?? null,
          uploadedBy,
          isActive: true,
        },
      });
      created++;
    } catch (err) {
      errors.push(`Error on "${q.questionText?.slice(0, 40)}": ${String(err)}`);
    }
  }

  console.log(`[QuestionBank] Activity ${activityId}: ${created} created, ${skipped} skipped`);
  return { created, skipped, errors };
}

export async function getQuestionBankStats(activityId: string) {
  const total = await prisma.trainingSessionQuestion.count({ where: { activityId, isActive: true } });
  const byDifficulty = await prisma.trainingSessionQuestion.groupBy({
    by: ['difficultyLevel'],
    where: { activityId, isActive: true },
    _count: { id: true },
  });
  const byCompetency = await prisma.trainingSessionQuestion.groupBy({
    by: ['competencyCode'],
    where: { activityId, isActive: true, competencyCode: { not: null } },
    _count: { id: true },
  });
  return { total, byDifficulty, byCompetency };
}

export async function deactivateQuestion(questionId: string): Promise<void> {
  await prisma.trainingSessionQuestion.update({
    where: { id: questionId },
    data: { isActive: false },
  });
}
