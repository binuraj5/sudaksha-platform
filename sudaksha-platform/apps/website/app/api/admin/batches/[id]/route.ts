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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: { course: { select: { id: true, name: true, duration: true, trainer: { select: { id: true, name: true } } } } },
  });
  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, batch });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  try {
    const batch = await prisma.batch.update({
      where: { id },
      data: {
        ...(body.batchName !== undefined && { batchName: body.batchName }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.sessionTimings !== undefined && { sessionTimings: body.sessionTimings }),
        ...(body.platform !== undefined && { platform: body.platform }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.availableSeats !== undefined && { availableSeats: parseInt(body.availableSeats) }),
        ...(body.totalSeats !== undefined && { totalSeats: parseInt(body.totalSeats) }),
        ...(body.venueName !== undefined && { venueName: body.venueName }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.registrationDeadline !== undefined && { registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null }),
      },
      select: { id: true },
    });
    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.batch.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
