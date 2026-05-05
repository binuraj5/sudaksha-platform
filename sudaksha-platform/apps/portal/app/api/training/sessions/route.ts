/**
 * Training Sessions API — Create + List
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T8 + T10
 *
 * POST — create a new TrainingSession for an activity
 * GET  — list sessions filtered by trainerId, status, limit
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import { selectQuestionsForSession } from '@/lib/training/sessionQuestionSelector';
import { hasPermission, isCrossTenantRole } from '@/lib/permissions/trainingPermissions';

export async function POST(req: Request) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const user = authSession.user as {
    role?: string; id?: string; tenantId?: string; clientId?: string; cohortType?: string;
  };
  const role = user.role ?? '';

  if (!hasPermission(role, 'session:create')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const {
    activityId,
    sessionDate,
    questionCount = 10,
    durationMinutes = 10,
    moduleTitle,
  } = body;

  if (!activityId || !sessionDate || !moduleTitle) {
    return Response.json({ error: 'activityId, sessionDate, and moduleTitle are required' }, { status: 400 });
  }

  // Select questions using stratified random selection (T7)
  const { questionIds, seed } = await selectQuestionsForSession({
    sessionId: 'pending',
    activityId,
    targetCount: questionCount,
    targetCohort: user.cohortType ?? null,
  });

  const session = await prisma.trainingSession.create({
    data: {
      activityId,
      tenantId: user.tenantId ?? '',
      clientId: user.clientId ?? null,
      trainerId: user.id ?? null,
      moduleTitle,
      sessionDate: new Date(sessionDate),
      questionCount: questionIds.length,
      durationMinutes,
      status: 'DRAFT',
      randomSeed: seed,
      createdBy: user.id ?? 'unknown',
    },
  });

  return Response.json({ session, questionIds, seed });
}

export async function GET(req: Request) {
  const authSession = await getServerSession();
  if (!authSession?.user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const user = authSession.user as { role?: string; id?: string; tenantId?: string };
  const role = user.role ?? '';

  if (!hasPermission(role, 'session:read')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);
  const trainerId = searchParams.get('trainerId');

  const statuses = statusParam ? statusParam.split(',') : undefined;

  // Cross-tenant roles can query any trainer; scoped roles only see their own sessions
  const trainerFilter = isCrossTenantRole(role)
    ? (trainerId ? { trainerId } : {})
    : { trainerId: user.id };

  const sessions = await prisma.trainingSession.findMany({
    where: {
      ...trainerFilter,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    orderBy: { sessionDate: 'desc' },
    take: limit,
  });

  return Response.json({ sessions });
}
