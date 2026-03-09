import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public course listing — no auth required
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(24, parseInt(searchParams.get("pageSize") || "12"));

  // Multi-value filters (comma-separated)
  const courseTypes = searchParams.get("courseTypes")?.split(",").filter(Boolean) || [];
  const targetLevels = searchParams.get("targetLevels")?.split(",").filter(Boolean) || [];
  const industries = searchParams.get("industries")?.split(",").filter(Boolean) || [];
  const deliveryModes = searchParams.get("deliveryModes")?.split(",").filter(Boolean) || [];
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];

  // Domain: IT | Non-IT | All (maps to categoryType in DB)
  const domain = searchParams.get("domain") || "All";

  // Sort: popularity | newest | rating
  const sort = searchParams.get("sort") || "popularity";

  // Map delivery mode labels to DB enum values
  const modeMap: Record<string, string> = {
    "Live Online": "ONLINE",
    "Offline": "OFFLINE",
    "Hybrid": "HYBRID",
    "ONLINE": "ONLINE",
    "OFFLINE": "OFFLINE",
    "HYBRID": "HYBRID",
  };

  try {
    const where: any = {
      status: "PUBLISHED",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (domain === "IT") where.categoryType = "IT";
    else if (domain === "Non-IT") where.categoryType = "NON_IT";

    if (courseTypes.length > 0) {
      where.courseType = { in: courseTypes };
    }

    if (categories.length > 0) {
      where.category = { in: categories };
    }

    if (targetLevels.length > 0) {
      where.targetLevel = { in: targetLevels };
    }

    if (industries.length > 0) {
      where.industry = { in: industries };
    }

    if (deliveryModes.length > 0) {
      const dbModes = deliveryModes.map(m => modeMap[m] || m).filter(Boolean);
      if (dbModes.length > 0) where.deliveryMode = { in: dbModes };
    }

    const orderBy: any[] =
      sort === "newest" ? [{ createdAt: "desc" }] :
      sort === "rating" ? [{ rating: "desc" }, { createdAt: "desc" }] :
      [{ rating: "desc" }, { createdAt: "desc" }]; // popularity default

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
          industry: true,
          targetLevel: true,
          categoryType: true,
          trainer: { select: { name: true } },
        },
        orderBy,
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
