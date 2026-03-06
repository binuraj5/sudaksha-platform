import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function requireAdminSession() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('admin_session')?.value;
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.email ? session : null;
  } catch {
    return null;
  }
}

// Map FormSubmission data to the shape the enrollments page expects
function mapSubmission(sub: any) {
  const data = (sub.formData ?? {}) as Record<string, any>;
  return {
    id: sub.id,
    type: sub.formType ?? 'enrollment',
    firstName: data.firstName ?? data.name?.split(' ')[0] ?? '',
    lastName: data.lastName ?? data.name?.split(' ').slice(1).join(' ') ?? '',
    email: data.email ?? '',
    phone: data.phone ?? data.phoneNumber ?? '',
    status: sub.status?.toLowerCase() ?? 'new',
    crmWebhookStatus: data.crmWebhookStatus ?? sub.notes ? 'sent' : 'pending',
    crmLeadId: data.crmLeadId,
    course: data.courseId
      ? { id: data.courseId, title: data.courseTitle ?? '', slug: data.courseSlug ?? '' }
      : undefined,
    createdAt: sub.createdAt,
  };
}

// GET /api/admin/enrollments
export async function GET(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'));
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const type = searchParams.get('type') ?? '';

  try {
    const where: any = {};

    if (status) {
      where.status = status.toUpperCase();
    }
    if (type) {
      where.formType = type;
    }
    // Search across formData JSON fields (email/name in the JSON blob)
    if (search) {
      where.OR = [
        { formData: { path: ['email'], string_contains: search } },
        { formData: { path: ['firstName'], string_contains: search } },
        { formData: { path: ['lastName'], string_contains: search } },
        { formData: { path: ['name'], string_contains: search } },
        { formData: { path: ['phone'], string_contains: search } },
      ];
    }

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.formSubmission.count({ where }),
    ]);

    // Summary stats (always across all records, ignoring current filters for totals)
    const [totalAll, byStatusRaw, crmPendingCount] = await Promise.all([
      prisma.formSubmission.count(),
      prisma.formSubmission.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.formSubmission.count({
        where: { notes: null, status: { not: 'CONVERTED' } },
      }),
    ]);

    const byStatus = { new: 0, contacted: 0, converted: 0, spam: 0 };
    byStatusRaw.forEach((r) => {
      const k = r.status.toLowerCase() as keyof typeof byStatus;
      if (k in byStatus) byStatus[k] = r._count.id;
    });

    const byTypeRaw = await prisma.formSubmission.groupBy({ by: ['formType'], _count: { id: true } });
    const byType = { enrollment: 0, demo_request: 0, counselor_inquiry: 0 };
    byTypeRaw.forEach((r) => {
      const k = r.formType as keyof typeof byType;
      if (k in byType) byType[k] = r._count.id;
    });

    return NextResponse.json({
      data: submissions.map(mapSubmission),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      summary: {
        total: totalAll,
        byType,
        byStatus,
        crmSyncPending: crmPendingCount,
      },
    });
  } catch (error) {
    console.error('Admin enrollments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/enrollments — update status on a single submission
export async function PUT(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { submissionId, status } = await req.json();
    if (!submissionId || !status) {
      return NextResponse.json({ error: 'submissionId and status are required' }, { status: 400 });
    }

    const allowed = ['NEW', 'CONTACTED', 'CONVERTED', 'SPAM'];
    const normalized = status.toUpperCase();
    if (!allowed.includes(normalized)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: { status: normalized },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin enrollments PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/enrollments — bulk actions
export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { action, submissionIds } = await req.json();
    if (!action || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json({ error: 'action and submissionIds are required' }, { status: 400 });
    }

    const actionToStatus: Record<string, string> = {
      'mark-contacted': 'CONTACTED',
      'mark-converted': 'CONVERTED',
      'mark-spam': 'SPAM',
    };

    const newStatus = actionToStatus[action];
    if (!newStatus) {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    await prisma.formSubmission.updateMany({
      where: { id: { in: submissionIds } },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, updated: submissionIds.length });
  } catch (error) {
    console.error('Admin enrollments POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
