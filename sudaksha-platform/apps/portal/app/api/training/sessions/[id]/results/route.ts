/**
 * Session Results API
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T12
 *
 * GET — returns full class report for a completed session:
 * - Session metadata
 * - Per-participant TrainingSessionResults
 * - Question-level correct % stats
 * - Class average / median / range
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { hasPermission, isCrossTenantRole } from '@/lib/permissions/trainingPermissions';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const user = authSession.user as { role?: string; id?: string };
  const role = user.role ?? '';

  if (!hasPermission(role, 'results:read')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await prisma.trainingSession.findUnique({
    where: { id: (await context.params).id },
    include: {
      results: true,
      responses: {
        include: { question: { select: { id: true, questionText: true, difficultyLevel: true, competencyCode: true } } },
      },
      activity: { select: { name: true } },
    },
  });

  if (!session) return Response.json({ error: 'Not found' }, { status: 404 });

  // Non-observer trainers only see their own sessions
  if (!isCrossTenantRole(role) && session.trainerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Question-level stats
  const questionStats: Record<string, { text: string; difficulty: number; correct: number; total: number; competencyCode: string | null }> = {};
  for (const r of session.responses) {
    const qId = r.question.id;
    if (!questionStats[qId]) {
      questionStats[qId] = {
        text: r.question.questionText,
        difficulty: r.question.difficultyLevel,
        correct: 0,
        total: 0,
        competencyCode: r.question.competencyCode,
      };
    }
    questionStats[qId].total++;
    if (r.isCorrect) questionStats[qId].correct++;
  }

  // Class aggregate stats
  const scores = session.results.map(r => r.rawScore);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const minScore = scores.length ? Math.min(...scores) : 0;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;

  return Response.json({
    session: {
      id: session.id,
      moduleTitle: session.moduleTitle,
      sessionDate: session.sessionDate,
      status: session.status,
      totalParticipants: session.totalParticipants,
      questionCount: session.questionCount,
      activityName: session.activity.name,
    },
    results: session.results.sort((a, b) => b.rawScore - a.rawScore),
    questionStats: Object.values(questionStats).sort((a, b) => a.difficulty - b.difficulty),
    classStats: {
      avgScore: Math.round(avgScore * 10) / 10,
      median: Math.round(median * 10) / 10,
      minScore: Math.round(minScore * 10) / 10,
      maxScore: Math.round(maxScore * 10) / 10,
    },
  });
}
