import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single lead
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await prisma.formSubmission.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — update status or add a reply to the thread
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reply } = body;

    const lead = await prisma.formSubmission.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updateData: any = {};

    if (status) updateData.status = status;

    if (reply && typeof reply === 'string' && reply.trim()) {
      // Parse existing thread from notes field
      let thread: any[] = [];
      try { thread = JSON.parse(lead.notes || '[]'); } catch { thread = []; }
      thread.push({ from: 'admin', message: reply.trim(), timestamp: new Date().toISOString() });
      updateData.notes = JSON.stringify(thread);
    }

    const updated = await prisma.formSubmission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
