import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseFormSchema } from "@/lib/validation";
import { getSession } from "@/lib/admin-auth";
import { canCreate } from "@/lib/admin-permissions";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-utils";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/courses/[id]
 * Get a single course by id
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        batches: { select: { id: true, name: true, startDate: true, status: true } },
      },
    });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    return successResponse(course);
  } catch (error) {
    console.error("[COURSES] Get error:", error);
    return errorResponse("Failed to fetch course", 500);
  }
}

/**
 * PUT /api/courses/[id]
 * Update a course (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    if (!(await canCreate())) {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = await params;
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Course not found", 404);
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

    if (data.slug !== existing.slug) {
      const slugTaken = await prisma.course.findUnique({
        where: { slug: data.slug },
      });
      if (slugTaken) {
        return errorResponse("Course slug already exists", 400);
      }
    }

    const course = await prisma.course.update({
      where: { id },
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
      },
      include: {
        trainer: { select: { id: true, name: true, email: true } },
      },
    });

    console.log(`[COURSES] Updated course: ${course.id}`);
    return successResponse(course, "Course updated successfully");
  } catch (error) {
    console.error("[COURSES] Update error:", error);
    return errorResponse("Failed to update course", 500);
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete a course (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    if (!(await canCreate())) {
      return errorResponse("Insufficient permissions", 403);
    }

    const { id } = await params;
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Course not found", 404);
    }

    await prisma.course.delete({ where: { id } });
    console.log(`[COURSES] Deleted course: ${id}`);
    return successResponse({ id }, "Course deleted successfully");
  } catch (error) {
    console.error("[COURSES] Delete error:", error);
    return errorResponse("Failed to delete course", 500);
  }
}
