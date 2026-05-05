/**
 * Training Session Start Route
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T8
 *
 * POST — activate session so participants can join and answer
 * Sets status: ACTIVE, records startedAt
 * Requires: session:activate permission
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { hasPermission, isCrossTenantRole } from '@/lib/permissions/trainingPermissions';

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const user = authSession.user as { role?: string; id?: string };
  const role = user.role ?? '';

  if (!hasPermission(role, 'session:activate')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Non-observer trainers can only activate their own sessions
  const existing = await prisma.trainingSession.findUnique({ where: { id: (await context.params).id } });
  if (!existing) return Response.json({ error: 'Session not found' }, { status: 404 });

  if (!isCrossTenantRole(role) && existing.trainerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await prisma.trainingSession.update({
    where: { id: (await context.params).id },
    data: { status: 'ACTIVE', startedAt: new Date() },
  });

  return Response.json({ session });
}
