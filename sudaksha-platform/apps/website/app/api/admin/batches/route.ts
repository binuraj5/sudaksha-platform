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

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "50"));

  const where: any = {};
  if (statusFilter) where.status = statusFilter;
  if (search) where.OR = [
    { batchName: { contains: search, mode: "insensitive" } },
    { course: { name: { contains: search, mode: "insensitive" } } },
  ];

  const [batches, total] = await Promise.all([
    prisma.batch.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, duration: true, trainerId: true, trainer: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { startDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.batch.count({ where }),
  ]);

  return NextResponse.json({ success: true, batches, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const batch = await prisma.batch.create({
      data: {
        courseId: body.courseId,
        batchName: body.batchName || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        sessionTimings: body.sessionTimings || null,
        platform: body.platform || null,
        timezone: body.timezone || "IST",
        venueName: body.venueName || null,
        venueAddress: body.venueAddress || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || "India",
        availableSeats: parseInt(body.availableSeats) || parseInt(body.maxStudents) || 30,
        totalSeats: parseInt(body.totalSeats) || parseInt(body.maxStudents) || 30,
        status: body.status || "UPCOMING",
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
      },
      include: { course: { select: { id: true, name: true, duration: true } } },
    });
    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
