import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    return !!JSON.parse(raw)?.email;
  } catch { return false; }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    if (body.isActive) {
      await prisma.$transaction([
        prisma.announcement.updateMany({ where: { isActive: true }, data: { isActive: false } }),
        prisma.announcement.update({ where: { id }, data: body })
      ]);
      revalidatePath('/');
      revalidatePath('/admin/homepage/announcements');
      return NextResponse.json({ success: true });
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: body
    });
    revalidatePath('/');
    revalidatePath('/admin/homepage/announcements');
    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.announcement.delete({
      where: { id }
    });
    revalidatePath('/');
    revalidatePath('/admin/homepage/announcements');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
