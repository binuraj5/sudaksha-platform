/**
 * Training Session Response Submission Route
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T8
 *
 * POST — participant submits answer for one question
 * Body: { questionId, selectedOptionId?, shortAnswerText?, responseTimeMs? }
 * Stores response + marks correct/incorrect immediately for MCQ/T-F
 * Idempotent: re-submission upserts (overwrites previous answer)
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const user = authSession.user as { id?: string; memberId?: string; email?: string };
  const memberId = user.memberId ?? user.id ?? user.email ?? 'unknown';

  // Verify session is active
  const session = await prisma.trainingSession.findUnique({ where: { id: (await context.params).id } });
  if (!session || session.status !== 'ACTIVE') {
    return Response.json({ error: 'Session not active' }, { status: 400 });
  }

  const { questionId, selectedOptionId, shortAnswerText, responseTimeMs } = await req.json();

  if (!questionId) {
    return Response.json({ error: 'questionId is required' }, { status: 400 });
  }

  // Evaluate correctness immediately for auto-graded question types
  const question = await prisma.trainingSessionQuestion.findUnique({ where: { id: questionId } });
  const isCorrect = question?.correctOptionId
    ? selectedOptionId === question.correctOptionId
    : null;
  const pointsAwarded = isCorrect === true ? 1 : isCorrect === false ? 0 : 0;

  await prisma.trainingSessionResponse.upsert({
    where: {
      sessionId_questionId_memberId: {
        sessionId: (await context.params).id,
        questionId,
        memberId,
      },
    },
    update: {
      selectedOptionId: selectedOptionId ?? null,
      shortAnswerText: shortAnswerText ?? null,
      isCorrect,
      pointsAwarded,
      responseTimeMs: responseTimeMs ?? null,
    },
    create: {
      sessionId: (await context.params).id,
      questionId,
      memberId,
      selectedOptionId: selectedOptionId ?? null,
      shortAnswerText: shortAnswerText ?? null,
      isCorrect,
      pointsAwarded,
      responseTimeMs: responseTimeMs ?? null,
    },
  });

  return Response.json({ recorded: true, isCorrect });
}
