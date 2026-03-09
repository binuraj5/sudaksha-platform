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

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80) + "-" + Date.now();
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "50"));

  const where: any = {};
  if (status && status !== "ALL") where.status = status;
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { speaker: { contains: search, mode: "insensitive" } },
  ];

  const [webinars, total] = await Promise.all([
    prisma.webinar.findMany({
      where,
      select: {
        id: true, title: true, slug: true, description: true, speaker: true,
        date: true, time: true, duration: true, timezone: true, status: true,
        registeredCount: true, maxAttendees: true, category: true, featured: true,
        recordingUrl: true, imageUrl: true, meetingUrl: true, createdAt: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.webinar.count({ where }),
  ]);

  return NextResponse.json({ success: true, webinars, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const slug = body.slug?.trim() || slugify(body.title || "webinar");
    const existing = await prisma.webinar.findUnique({ where: { slug }, select: { id: true } });
    const finalSlug = existing ? slugify(body.title || "webinar") : slug;

    const webinar = await prisma.webinar.create({
      data: {
        title: body.title,
        slug: finalSlug,
        description: body.description || "",
        speaker: body.speaker || "",
        speakerBio: body.speakerBio || null,
        date: new Date(body.date),
        time: body.time || "10:00",
        duration: parseInt(body.duration) || 60,
        timezone: body.timezone || "IST",
        imageUrl: body.imageUrl || null,
        meetingUrl: body.meetingUrl || null,
        status: body.status || "UPCOMING",
        maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : null,
        category: body.category || null,
        tags: body.tags || [],
        featured: body.featured ?? false,
      },
      select: { id: true, slug: true, title: true },
    });
    return NextResponse.json({ success: true, webinar });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
