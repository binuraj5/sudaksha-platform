import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseFormSchema } from "@/lib/validation";
import { getSession } from "@/lib/admin-auth";
import { canCreate } from "@/lib/admin-permissions";
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  calculatePagination,
} from "@/lib/api-utils";

/**
 * GET /api/courses
 * List all courses with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);

    const { page, pageSize } = getPaginationParams(searchParams);
    const skip = (page - 1) * pageSize;

    const filters: Record<string, unknown> = {};

    if (searchParams.industry) {
      filters.industry = searchParams.industry;
    }

    if (searchParams.trainingType) {
      filters.courseType = searchParams.trainingType;
    }

    if (searchParams.status) {
      filters.status = searchParams.status;
    }

    if (searchParams.search) {
      const q = (searchParams.search as string).trim();
      filters.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ];
    }

    const total = await prisma.course.count({ where: filters });

    const courses = await prisma.course.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        title: true,
        slug: true,
        shortDescription: true,
        imageUrl: true,
        durationHours: true,
        durationWeeks: true,
        price: true,
        audienceLevel: true,
        status: true,
        industry: true,
        courseType: true,
        trainer: { select: { id: true, name: true, email: true } },
        batches: { select: { id: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const pagination = calculatePagination(total, page, pageSize);

    const data = courses.map((c) => ({
      id: c.id,
      title: c.title ?? c.name,
      slug: c.slug,
      shortDescription: c.shortDescription,
      thumbnail: c.imageUrl,
      durationHours: c.durationHours,
      durationWeeks: c.durationWeeks,
      baseFee: c.price,
      level: c.audienceLevel,
      status: c.status,
      industry: { name: c.industry, slug: c.industry?.toLowerCase().replace(/\s+/g, "-") ?? "" },
      trainingType: { name: c.courseType },
      batches: c.batches,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination,
    });
  } catch (error) {
    console.error("[COURSES] List error:", error);
    return errorResponse("Failed to fetch courses", 500);
  }
}

/**
 * POST /api/courses
 * Create a new course (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    if (!(await canCreate())) {
      return errorResponse("Insufficient permissions", 403);
    }

    const body = await request.json();

    const validation = courseFormSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        `Validation error: ${validation.error.issues[0].message}`,
        400
      );
    }

    const data = validation.data;

    const existingCourse = await prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existingCourse) {
      return errorResponse("Course slug already exists", 400);
    }

    const course = await prisma.course.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription ?? "",
        duration: data.duration,
        price: data.price,
        trainerId: data.trainerId,
        audienceLevel: data.audienceLevel,
        status: data.status ?? "DRAFT",
        industry: data.industry ?? "Generic/All Industries",
        deliveryMode: data.deliveryMode ?? "ONLINE",
        category: data.category ?? "Technology",
        categoryType: data.categoryType ?? "TECHNOLOGY",
        targetLevel: data.targetLevel ?? "ALL_LEVELS",
        courseType: data.courseType ?? "TECHNOLOGY",
        skillTags: [],
        learningObjectives: [],
        moduleBreakdown: [],
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
      },
    });

    console.log(`[COURSES] Created course: ${course.id}`);

    return successResponse(course, "Course created successfully", 201);
  } catch (error) {
    console.error("[COURSES] Create error:", error);
    return errorResponse("Failed to create course", 500);
  }
}
