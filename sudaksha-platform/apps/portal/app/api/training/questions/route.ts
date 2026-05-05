/**
 * Training Question Bank API Route
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T6
 *
 * POST { activityId, questions: QuestionInput[] }
 * Requires: TRAINER | OPS_DELIVERY | SUDAKSHA_OBSERVER | SUDAKSHA_ADMIN session
 * Returns: { created, skipped, errors }
 */
import { getApiSession as getServerSession } from '@/lib/get-session';
import { uploadQuestionsForModule } from '@/lib/training/questionBankService';
import { hasPermission } from '@/lib/permissions/trainingPermissions';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role ?? '';
  if (!hasPermission(role, 'questions:upload')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { activityId, questions } = await req.json();
  if (!activityId || !Array.isArray(questions)) {
    return Response.json({ error: 'activityId and questions[] are required' }, { status: 400 });
  }

  const memberId = (session.user as { id?: string }).id ?? session.user.email ?? 'unknown';
  const result = await uploadQuestionsForModule(activityId, questions, memberId);
  return Response.json(result);
}
