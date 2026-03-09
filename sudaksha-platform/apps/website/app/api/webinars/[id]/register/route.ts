import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: webinarId } = await params;

  try {
    const body = await req.json();
    const { name, email, phone, company } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
      select: { id: true, status: true, maxAttendees: true, registeredCount: true },
    });

    if (!webinar) return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
    if (webinar.status === "CANCELLED") return NextResponse.json({ error: "This webinar has been cancelled" }, { status: 400 });
    if (webinar.maxAttendees && webinar.registeredCount >= webinar.maxAttendees) {
      return NextResponse.json({ error: "This webinar is fully booked" }, { status: 400 });
    }

    // Prevent duplicate
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
