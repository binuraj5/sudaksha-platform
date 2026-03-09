import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    return !!JSON.parse(raw)?.email;
  } catch { return false; }
}

// PUT — update enrollment status or amount paid
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; enrollmentId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { enrollmentId } = await params;

  try {
    const { status, amountPaid } = await req.json();
    const data: any = {};
    if (status) data.status = status;
    if (amountPaid !== undefined) data.amountPaid = amountPaid ? parseFloat(amountPaid) : null;

    const enrollment = await prisma.enrollment.update({ where: { id: enrollmentId }, data });
    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — remove student from batch
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; enrollmentId: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: batchId, enrollmentId } = await params;

  try {
    await prisma.$transaction([
      prisma.enrollment.delete({ where: { id: enrollmentId } }),
      prisma.batch.update({ where: { id: batchId }, data: { availableSeats: { increment: 1 } } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
