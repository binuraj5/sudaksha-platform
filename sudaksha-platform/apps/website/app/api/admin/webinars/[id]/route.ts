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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const webinar = await prisma.webinar.findUnique({ where: { id } });
  if (!webinar) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, webinar });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  try {
    const webinar = await prisma.webinar.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.speaker !== undefined && { speaker: body.speaker }),
        ...(body.speakerBio !== undefined && { speakerBio: body.speakerBio }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.time !== undefined && { time: body.time }),
        ...(body.duration !== undefined && { duration: parseInt(body.duration) }),
        ...(body.timezone !== undefined && { timezone: body.timezone }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.meetingUrl !== undefined && { meetingUrl: body.meetingUrl }),
        ...(body.recordingUrl !== undefined && { recordingUrl: body.recordingUrl }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.maxAttendees !== undefined && { maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : null }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.featured !== undefined && { featured: body.featured }),
      },
      select: { id: true, slug: true },
    });
    return NextResponse.json({ success: true, webinar });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.webinar.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
