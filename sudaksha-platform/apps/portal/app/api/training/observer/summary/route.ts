/**
 * Observer Cross-Tenant Summary API
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T14
 *
 * GET — returns per-tenant aggregates for the Observer dashboard:
 * - Session count, participant count, avg score, question bank health
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { isCrossTenantRole } from '@/lib/permissions/trainingPermissions';

export async function GET(_req: Request) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const role = (authSession.user as { role?: string }).role ?? '';
  if (!isCrossTenantRole(role)) {
    return Response.json({ error: 'This endpoint requires SUDAKSHA_OBSERVER role' }, { status: 403 });
  }

  // Platform-wide totals
  const [totalSessions, activeSessions, totalResults, questionBankTotal] = await Promise.all([
    prisma.trainingSession.count(),
    prisma.trainingSession.count({ where: { status: 'ACTIVE' } }),
    prisma.trainingSessionResult.findMany({ select: { rawScore: true, sessionId: true } }),
    prisma.trainingSessionQuestion.count({ where: { isActive: true } }),
  ]);

  const avgScore = totalResults.length
    ? Math.round(totalResults.reduce((a, r) => a + r.rawScore, 0) / totalResults.length * 10) / 10
    : 0;

  // Per-tenant breakdown (group by tenantId)
  const sessionsByTenant = await prisma.trainingSession.groupBy({
    by: ['tenantId'],
    _count: { id: true },
    _sum: { totalParticipants: true },
  });

  return Response.json({
    platformStats: {
      totalSessions,
      activeSessions,
      avgScore,
      questionBankTotal,
      totalParticipants: totalResults.length,
    },
    byTenant: sessionsByTenant.map(t => ({
      tenantId: t.tenantId,
      sessions: t._count.id,
      participants: t._sum.totalParticipants ?? 0,
    })),
  });
}
