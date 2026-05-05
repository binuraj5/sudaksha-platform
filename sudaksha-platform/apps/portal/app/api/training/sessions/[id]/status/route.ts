/**
 * Training Session Live Status Route
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T11
 *
 * GET — returns real-time session state for trainer live view (polled every 5s):
 * - session status and timing
 * - response counts per question
 * - participant → answered question IDs map
 *
 * SUDAKSHA_OBSERVER: always allowed
 * TRAINER / OPS_DELIVERY: must own this session
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

  if (!hasPermission(role, 'session:read')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await prisma.trainingSession.findUnique({
    where: { id: (await context.params).id },
    include: {
      responses: {
        select: { questionId: true, memberId: true, isCorrect: true },
      },
    },
  });
  if (!session) return Response.json({ error: 'Not found' }, { status: 404 });

  // Non-observer trainers can only see their own sessions
  if (!isCrossTenantRole(role) && session.trainerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Aggregate response counts per question
  const responseCounts: Record<string, number> = {};
  const participantAnswered: Record<string, string[]> = {}; // memberId → [questionIds]
  for (const r of session.responses) {
    responseCounts[r.questionId] = (responseCounts[r.questionId] ?? 0) + 1;
    if (!participantAnswered[r.memberId]) participantAnswered[r.memberId] = [];
    participantAnswered[r.memberId].push(r.questionId);
  }

  return Response.json({
    sessionId: session.id,
    status: session.status,
    totalParticipants: session.totalParticipants,
    responseCounts,
    participantAnswered,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
  });
}
