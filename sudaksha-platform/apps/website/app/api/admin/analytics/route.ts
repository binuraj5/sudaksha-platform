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
    const now = new Date();

    // Overview counts
    const [totalEnrollments, activeCourses, totalBatches, completedEnrollments, revenueAgg, totalFormSubmissions] = await Promise.all([
      prisma.enrollment.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.batch.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
      prisma.enrollment.count({ where: { status: "COMPLETED" } }),
      prisma.enrollment.aggregate({ _sum: { amountPaid: true } }),
      prisma.formSubmission.count(),
    ]);

    const totalRevenue = Number(revenueAgg._sum.amountPaid ?? 0);
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100 * 10) / 10 : 0;

    // Monthly stats: last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [count, revAgg] = await Promise.all([
        prisma.enrollment.count({ where: { enrollmentDate: { gte: start, lte: end } } }),
        prisma.enrollment.aggregate({
          _sum: { amountPaid: true },
          where: { enrollmentDate: { gte: start, lte: end } },
        }),
      ]);

      monthlyStats.push({
        month: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        enrollments: count,
        revenue: Number(revAgg._sum.amountPaid ?? 0),
      });
    }

    // Top courses by enrollment
    const batches = await prisma.batch.findMany({
      select: {
        courseId: true,
        course: { select: { id: true, name: true, price: true } },
        enrollments: { select: { amountPaid: true } },
      },
    });

    const courseMap: Record<string, { name: string; enrollments: number; revenue: number }> = {};
    for (const b of batches) {
      if (!courseMap[b.courseId]) courseMap[b.courseId] = { name: b.course.name, enrollments: 0, revenue: 0 };
      courseMap[b.courseId].enrollments += b.enrollments.length;
      courseMap[b.courseId].revenue += b.enrollments.reduce((s, e) => s + Number(e.amountPaid ?? b.course.price ?? 0), 0);
    }

    const topCourses = Object.entries(courseMap)
      .map(([id, d]) => ({ id, name: d.name, enrollments: d.enrollments, revenue: d.revenue }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Recent form submissions (leads) count by type
    const leadsByType = await prisma.formSubmission.groupBy({
      by: ["formType"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    return NextResponse.json({
      success: true,
      overview: {
        totalStudents: totalEnrollments,
        totalRevenue,
        activeCourses,
        totalBatches,
        completionRate,
        totalLeads: totalFormSubmissions,
      },
      monthlyStats,
      topCourses,
      leadsByType: leadsByType.map(l => ({ type: l.formType, count: l._count.id })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
