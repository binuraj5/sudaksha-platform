/**
 * Training Session Complete Route
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T9
 *
 * POST — trainer/ops closes the session
 * Triggers result computation pipeline (fire-and-forget)
 * Requires: session:activate permission
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { hasPermission, isCrossTenantRole } from '@/lib/permissions/trainingPermissions';
import { computeSessionResults } from '@/lib/training/computeSessionResults';

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

  const session = await prisma.trainingSession.findUnique({ where: { id: (await context.params).id } });
  if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });
  if (session.status !== 'ACTIVE') {
    return Response.json({ error: 'Session must be ACTIVE to complete' }, { status: 400 });
  }

  // Non-observer trainers can only complete their own sessions
  if (!isCrossTenantRole(role) && session.trainerId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fire-and-forget result computation — don't block the HTTP response
  computeSessionResults((await context.params).id)
    .catch(err => console.error('[TDAS] Result computation error:', err));

  return Response.json({ status: 'COMPLETING' });
}
