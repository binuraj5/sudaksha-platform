import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

function bustPdfCache(courseId: string) {
  try {
    const p = path.join(process.cwd(), "public", "course-pdfs", `${courseId}.pdf`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
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

function toDeliveryMode(v: string | string[]): "ONLINE" | "OFFLINE" | "HYBRID" {
  const val = (Array.isArray(v) ? v[0] : v) ?? "";
  if (val.toLowerCase().includes("offline")) return "OFFLINE";
  if (val.toLowerCase().includes("hybrid")) return "HYBRID";
  return "ONLINE";
}

// PUT /api/admin/courses/[id] — update a course
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDescription !== undefined && { shortDescription: body.shortDescription }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.courseType !== undefined && { courseType: body.courseType }),
        ...(body.targetLevel !== undefined && { targetLevel: body.targetLevel }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.audienceLevel !== undefined && { audienceLevel: body.audienceLevel as any }),
        ...((body.deliveryMode !== undefined) && { deliveryMode: toDeliveryMode(body.deliveryMode) }),
        ...(body.durationHours !== undefined && { duration: Math.round(body.durationHours) }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.status !== undefined && { status: body.status as any }),
        ...(body.skillTags !== undefined && { skillTags: body.skillTags }),
        ...(body.learningObjectives !== undefined && { learningObjectives: body.learningObjectives }),
        ...(body.curriculum !== undefined && { moduleBreakdown: body.curriculum }),
        ...(body.certification !== undefined && { certification: body.certification }),
        ...(body.hasProjects !== undefined && { hasProjects: body.hasProjects }),
        ...(body.hasCaseStudies !== undefined && { hasCaseStudies: body.hasCaseStudies }),
        ...(body.hasProcessFrameworks !== undefined && { hasProcessFrameworks: body.hasProcessFrameworks }),
        ...(body.hasPersonalActivities !== undefined && { hasPersonalActivities: body.hasPersonalActivities }),
        ...(body.prerequisites !== undefined && { prerequisites: body.prerequisites }),
        ...(body.domain !== undefined && { categoryType: body.domain }),
        ...(body.trainerId ? { trainerId: body.trainerId } : {}),
        // Set publishedAt when status changes to PUBLISHED
        ...(body.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
      select: { id: true, slug: true, name: true },
    });

    bustPdfCache(id);
    return NextResponse.json({ success: true, courseId: updated.id, slug: updated.slug });
  } catch (error: any) {
    console.error("Admin update course error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update course" }, { status: 500 });
  }
}

// DELETE /api/admin/courses/[id] — soft delete (archive)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.course.update({ where: { id }, data: { status: "ARCHIVED" } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin archive course error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to archive course" }, { status: 500 });
  }
}

// GET /api/admin/courses/[id] — single course detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { trainer: { select: { id: true, name: true } } },
    });
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
