import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const formType = searchParams.get('formType') || '';

  const where: any = {};
  if (status) where.status = status;
  if (formType) where.formType = formType;

  try {
    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.formSubmission.count({ where }),
    ]);

    // Apply search filter on formData fields (name/email/phone)
    let filtered = submissions;
    if (search) {
      const q = search.toLowerCase();
      filtered = submissions.filter((s) => {
        const d = s.formData as any;
        return (
          (d?.name && String(d.name).toLowerCase().includes(q)) ||
          (d?.email && String(d.email).toLowerCase().includes(q)) ||
          (d?.phone && String(d.phone).toLowerCase().includes(q)) ||
          (s.formName && s.formName.toLowerCase().includes(q)) ||
          (s.pageUrl && s.pageUrl.toLowerCase().includes(q))
        );
      });
    }

    return NextResponse.json({ success: true, leads: filtered, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
