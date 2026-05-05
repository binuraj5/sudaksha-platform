/**
 * Observer Cross-Tenant Sessions API
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T14
 *
 * GET — returns ALL sessions across ALL tenants
 * STRICTLY requires SUDAKSHA_OBSERVER or SUDAKSHA_ADMIN role
 * Query params: status, date, tenantId (all optional filters)
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { isCrossTenantRole } from '@/lib/permissions/trainingPermissions';

export async function GET(req: Request) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  // Hard requirement — no fallback
  const role = (authSession.user as { role?: string }).role ?? '';
  if (!isCrossTenantRole(role)) {
    return Response.json({ error: 'This endpoint requires SUDAKSHA_OBSERVER role' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const tenantId = searchParams.get('tenantId');
  const dateStr = searchParams.get('date');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (tenantId) where.tenantId = tenantId;
  if (dateStr) {
    const date = new Date(dateStr);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    where.sessionDate = { gte: date, lt: nextDay };
  }

  const sessions = await prisma.trainingSession.findMany({
    where,
    include: {
      activity: { select: { name: true } },
      results: { select: { memberId: true, rawScore: true } },
    },
    orderBy: { sessionDate: 'desc' },
    take: 200,
  });

  return Response.json({ sessions, total: sessions.length });
}
