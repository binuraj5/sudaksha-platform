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
  const trainer = await prisma.trainer.findUnique({ where: { id } });
  if (!trainer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, trainer });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  try {
    const trainer = await prisma.trainer.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.expertise !== undefined && { expertise: body.expertise }),
        ...(body.experience !== undefined && { experience: parseInt(body.experience) }),
        ...(body.rating !== undefined && { rating: parseFloat(body.rating) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.linkedinUrl !== undefined && { linkedinUrl: body.linkedinUrl }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.currentDesignation !== undefined && { currentDesignation: body.currentDesignation }),
        ...(body.currentCompany !== undefined && { currentCompany: body.currentCompany }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      },
      select: { id: true, name: true },
    });
    return NextResponse.json({ success: true, trainer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.trainer.update({ where: { id }, data: { status: "INACTIVE" } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
