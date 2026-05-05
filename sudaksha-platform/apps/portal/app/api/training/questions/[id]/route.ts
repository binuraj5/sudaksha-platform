/**
 * Question Bank PATCH Route — Deactivate a Question
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T18
 *
 * PATCH /api/training/questions/[id]
 * Body: { isActive: boolean }
 * Requires: questions:upload permission
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions/trainingPermissions';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const role = (authSession.user as { role?: string }).role ?? '';
  if (!hasPermission(role, 'questions:upload')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { isActive } = await req.json();
  const question = await prisma.trainingSessionQuestion.update({
    where: { id: (await context.params).id },
    data: { isActive: Boolean(isActive) },
  });

  return Response.json({ question });
}
