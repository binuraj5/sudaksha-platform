import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Map form delivery mode strings to DB BatchMode enum
function toDeliveryMode(v: string | string[]): "ONLINE" | "OFFLINE" | "HYBRID" {
  const val = (Array.isArray(v) ? v[0] : v) ?? "";
  if (val.toLowerCase().includes("offline")) return "OFFLINE";
  if (val.toLowerCase().includes("hybrid")) return "HYBRID";
  return "ONLINE";
}

// Generate URL-safe slug from name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) + "-" + Date.now();
}

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return !!session?.email;
  } catch {
    return false;
  }
}

// POST — create a new course
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();

    const trainerId: string | undefined = body.trainerId || undefined;

    const slug = body.slug?.trim() || slugify(body.name ?? "course");

    // Ensure unique slug
    const existing = await prisma.course.findUnique({ where: { slug }, select: { id: true } });
    const finalSlug = existing ? slugify(body.name ?? "course") : slug;

    const course = await prisma.course.create({
      data: {
        name: body.name ?? "Untitled Course",
        slug: finalSlug,
        description: body.description ?? "",
        shortDescription: body.shortDescription ?? null,
        category: body.category ?? "General",
        categoryType: body.domain ?? body.categoryType ?? "IT",
        courseType: body.courseType ?? "Technology",
        targetLevel: body.targetLevel ?? "Beginner",
        industry: body.industry ?? "Generic/All Industries",
        audienceLevel: (body.audienceLevel ? body.audienceLevel : (body.targetLevel ? body.targetLevel.toUpperCase().replace(/\s+/g, '_') : "ALL_LEVELS")) as any,
        deliveryMode: toDeliveryMode(body.deliveryMode),
        duration: Math.round(body.durationHours ?? 40),
        price: body.price ?? 0,
        status: (body.status ?? "DRAFT") as any,
        skillTags: body.skillTags ?? [],
        learningObjectives: body.learningObjectives ?? [],
        moduleBreakdown: body.curriculum ?? [],
        certification: body.certification ?? false,
        hasProjects: body.hasProjects ?? false,
        hasCaseStudies: body.hasCaseStudies ?? false,
        hasProcessFrameworks: body.hasProcessFrameworks ?? false,
        hasPersonalActivities: body.hasPersonalActivities ?? false,
        prerequisites: body.prerequisites ?? null,
        ...(trainerId ? { trainerId } : {}),
        ...(body.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
      select: { id: true, slug: true, name: true },
    });

    return NextResponse.json({ success: true, courseId: course.id, slug: course.slug });
  } catch (error: any) {
    console.error("Admin create course error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create course" }, { status: 500 });
  }
}

// Admin course listing — returns ALL courses (published + drafts)
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "50"));

  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { courseType: { contains: search, mode: "insensitive" } },
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
          status: true,
          publishedAt: true,
          skillTags: true,
          trainer: { select: { name: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      courses,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Admin courses API error:", error);
    return NextResponse.json({ success: false, courses: [], error: "Failed to fetch courses" }, { status: 500 });
  }
}
