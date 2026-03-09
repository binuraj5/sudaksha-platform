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

export async function GET(_req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Fetch all active/upcoming batches with their course and trainer
    const batches = await prisma.batch.findMany({
      where: { status: { in: ["UPCOMING", "ONGOING"] } },
      include: {
        course: { select: { id: true, name: true, trainerId: true, trainer: { select: { id: true, name: true } } } },
      },
      orderBy: { startDate: "asc" },
    });

    const conflicts: any[] = [];

    // Detect trainer double-bookings: batches with same trainer whose date ranges overlap
    const trainerBatches: Record<string, typeof batches> = {};
    for (const b of batches) {
      const tId = b.course.trainer?.id;
      if (!tId) continue;
      if (!trainerBatches[tId]) trainerBatches[tId] = [];
      trainerBatches[tId].push(b);
    }

    for (const [, tBatches] of Object.entries(trainerBatches)) {
      for (let i = 0; i < tBatches.length; i++) {
        for (let j = i + 1; j < tBatches.length; j++) {
          const a = tBatches[i], b = tBatches[j];
          const aEnd = a.endDate ?? new Date(a.startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
          const bEnd = b.endDate ?? new Date(b.startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
          if (a.startDate <= bEnd && aEnd >= b.startDate) {
            conflicts.push({
              id: `trainer-${a.id}-${b.id}`,
              type: "TRAINER",
              severity: "HIGH",
              status: "OPEN",
              title: `Trainer Double-Booked: ${a.course.trainer?.name}`,
              description: `${a.course.trainer?.name} is assigned to "${a.course.name}" and "${b.course.name}" with overlapping dates.`,
              affectedItems: [a.batchName || a.course.name, b.batchName || b.course.name],
              detectedAt: new Date().toISOString(),
              courseId: a.course.id,
              courseName: a.course.name,
              batchId: a.id,
              batchName: a.batchName,
            });
          }
        }
      }
    }

    // Detect oversubscribed batches
    for (const b of batches) {
      const enrolled = await prisma.enrollment.count({ where: { batchId: b.id } });
      if (enrolled > b.totalSeats) {
        conflicts.push({
          id: `seats-${b.id}`,
          type: "ENROLLMENT",
          severity: "MEDIUM",
          status: "OPEN",
          title: `Batch Oversubscribed`,
          description: `"${b.batchName || b.course.name}" has ${enrolled} enrollments but only ${b.totalSeats} seats.`,
          affectedItems: [b.batchName || b.course.name],
          detectedAt: new Date().toISOString(),
          batchId: b.id,
          batchName: b.batchName,
        });
      }
    }

    return NextResponse.json({ success: true, conflicts, total: conflicts.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
