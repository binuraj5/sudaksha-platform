/**
 * Session Join API
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T17
 *
 * POST — participant joins an active session
 * Increments totalParticipants only if this is a first join (idempotent)
 * Returns: { joined, questionCount }
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const user = authSession.user as { id?: string; memberId?: string; email?: string };
  const memberId = user.memberId ?? user.id ?? user.email ?? 'unknown';

  const session = await prisma.trainingSession.findUnique({ where: { id: (await context.params).id } });
  if (!session || session.status !== 'ACTIVE') {
    return Response.json({ error: 'Session not active' }, { status: 400 });
  }

  // Check if participant already joined (has any response)
  const existingResponse = await prisma.trainingSessionResponse.findFirst({
    where: { sessionId: (await context.params).id, memberId },
  });

  if (!existingResponse) {
    // First join — increment participant count atomically
    await prisma.trainingSession.update({
      where: { id: (await context.params).id },
      data: { totalParticipants: { increment: 1 } },
    });
  }

  return Response.json({ joined: true, questionCount: session.questionCount });
}
