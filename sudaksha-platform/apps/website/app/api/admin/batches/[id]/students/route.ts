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

// GET /api/admin/batches/[id]/students — list enrollments for a batch
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: batchId } = await params;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { batchId },
      orderBy: { enrollmentDate: "desc" },
    });

    // Look up user details for each enrollment
    const userIds = [...new Set(enrollments.map((e) => e.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const result = enrollments.map((e) => ({
      id: e.id,
      userId: e.userId,
      name: userMap[e.userId]?.name ?? "—",
      email: userMap[e.userId]?.email ?? "—",
      status: e.status,
      amountPaid: e.amountPaid,
      enrollmentDate: e.enrollmentDate,
    }));

    return NextResponse.json({ success: true, students: result, total: result.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/batches/[id]/students — add a student to the batch
// Body: { name, email, phone?, amountPaid?, status? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: batchId } = await params;

  try {
    const { name, email, amountPaid, status } = await req.json();
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: "name and email are required" }, { status: 400 });
    }

    // Check batch exists and has capacity
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      select: { id: true, totalSeats: true, availableSeats: true, enrollments: { select: { id: true } } },
    });
    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const enrolled = batch.enrollments.length;
    if (enrolled >= batch.totalSeats) {
      return NextResponse.json({ success: false, error: "Batch is full" }, { status: 400 });
    }

    // Find or create user by email
    let user = await prisma.user.findUnique({ where: { email: email.trim() }, select: { id: true } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.trim(),
          name: name.trim(),
          password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
          role: "ASSESSOR",
          accountType: "INDIVIDUAL",
        },
        select: { id: true },
      });
    }

    // Check for duplicate enrollment
    const existing = await prisma.enrollment.findFirst({ where: { batchId, userId: user.id } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Student already enrolled in this batch" }, { status: 409 });
    }

    // Create enrollment and decrement available seats
    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.create({
        data: {
          batchId,
          userId: user.id,
          status: status ?? "CONFIRMED",
          amountPaid: amountPaid ? parseFloat(amountPaid) : null,
        },
      }),
      prisma.batch.update({
        where: { id: batchId },
        data: { availableSeats: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
