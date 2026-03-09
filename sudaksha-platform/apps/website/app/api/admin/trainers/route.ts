import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return !!session?.email;
  } catch { return false; }
}

// GET /api/admin/trainers — list all trainers
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "50"));

  const where: any = search ? {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  } : {};

  const [trainers, total] = await Promise.all([
    prisma.trainer.findMany({
      where,
      select: {
        id: true, name: true, email: true, bio: true, expertise: true,
        experience: true, rating: true, status: true, imageUrl: true,
        linkedinUrl: true, currentDesignation: true, currentCompany: true,
        totalStudentsTaught: true, totalTeachingExperienceYears: true,
        isPublished: true, createdAt: true,
        _count: { select: { courses: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trainer.count({ where }),
  ]);

  return NextResponse.json({ success: true, trainers, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

// POST /api/admin/trainers — create trainer
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const trainer = await prisma.trainer.create({
      data: {
        name: body.name,
        email: body.email,
        bio: body.bio || "",
        expertise: body.expertise || [],
        experience: parseInt(body.experience) || 0,
        rating: parseFloat(body.rating) || 0,
        imageUrl: body.imageUrl || null,
        linkedinUrl: body.linkedinUrl || null,
        status: body.status || "ACTIVE",
        currentDesignation: body.currentDesignation || null,
        currentCompany: body.currentCompany || null,
        totalTeachingExperienceYears: body.totalTeachingExperienceYears ? parseInt(body.totalTeachingExperienceYears) : null,
        isPublished: body.isPublished ?? false,
      },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ success: true, trainer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
