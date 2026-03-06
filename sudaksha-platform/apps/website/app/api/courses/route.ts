import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public course listing — no auth required
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const track = searchParams.get("track") || ""; // Technology | Domain | Behavioural | Cognitive
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(24, parseInt(searchParams.get("pageSize") || "12"));

  // Map track filter to courseType values stored in DB
  const trackToCourseTypes: Record<string, string[]> = {
    Technology: ["TECHNICAL", "TECHNOLOGY", "IT", "SOFTWARE_DEVELOPMENT", "CLOUD_DEVOPS", "DATA_ANALYTICS", "CYBERSECURITY", "AI_ML"],
    Domain: ["DOMAIN", "FUNCTIONAL", "INDUSTRY_SPECIFIC", "BUSINESS", "NON_IT"],
    Behavioural: ["BEHAVIOURAL", "BEHAVIORAL", "SOFT_SKILLS", "LEADERSHIP", "COMMUNICATION"],
    Cognitive: ["COGNITIVE", "ANALYTICAL", "PROBLEM_SOLVING", "CRITICAL_THINKING", "APTITUDE"],
  };

  try {
    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (track && trackToCourseTypes[track]) {
      where.OR = [
        ...(where.OR || []),
        { courseType: { in: trackToCourseTypes[track] } },
        { category: { in: trackToCourseTypes[track] } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          duration: true,
          rating: true,
          audienceLevel: true,
          deliveryMode: true,
          courseType: true,
          category: true,
          skillTags: true,
          certification: true,
          maxStudents: true,
          trainer: { select: { name: true } },
        },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ]);

    const hasNextPage = page * pageSize < total;

    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Public courses API error:", error);
    return NextResponse.json({ success: false, courses: [], error: "Failed to fetch courses" }, { status: 500 });
  }
}
