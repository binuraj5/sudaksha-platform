import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "upcoming";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

  const where: any = {};
  if (status === "upcoming") where.status = "UPCOMING";
  else if (status === "live") where.status = "LIVE";
  else if (status === "completed") where.status = "COMPLETED";
  // "all" → no filter

  try {
    const [webinars, total] = await Promise.all([
      prisma.webinar.findMany({
        where,
        select: {
          id: true, title: true, slug: true, description: true, speaker: true,
          speakerBio: true, speakerImage: true, date: true, time: true, duration: true,
          timezone: true, imageUrl: true, status: true, registeredCount: true,
          maxAttendees: true, category: true, featured: true, recordingUrl: true,
        },
        orderBy: [{ featured: "desc" }, { date: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.webinar.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      webinars,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, webinars: [], error: error.message }, { status: 500 });
  }
}

// POST /api/webinars — register for a webinar
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webinarId, name, email, phone, company } = body;
    if (!webinarId || !name || !email) {
      return NextResponse.json({ error: "webinarId, name, and email are required" }, { status: 400 });
    }

    // Check webinar exists
    const webinar = await prisma.webinar.findUnique({ where: { id: webinarId }, select: { id: true, maxAttendees: true, registeredCount: true } });
    if (!webinar) return NextResponse.json({ error: "Webinar not found" }, { status: 404 });

    // Check capacity
    if (webinar.maxAttendees && webinar.registeredCount >= webinar.maxAttendees) {
      return NextResponse.json({ error: "This webinar is fully booked" }, { status: 400 });
    }

    // Prevent duplicate registration
    const existing = await prisma.webinarRegistration.findFirst({ where: { webinarId, email } });
    if (existing) return NextResponse.json({ success: true, message: "Already registered" });

    await prisma.$transaction([
      prisma.webinarRegistration.create({ data: { webinarId, name, email, phone: phone || null, company: company || null } }),
      prisma.webinar.update({ where: { id: webinarId }, data: { registeredCount: { increment: 1 } } }),
    ]);

    return NextResponse.json({ success: true, message: "Registered successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
