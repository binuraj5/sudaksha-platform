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

    // Safety check: if they're patching isActive directly here to true,
    // it's better to use the /activate endpoint. But we'll handle it via transaction if so.
    if (body.isActive) {
      await prisma.$transaction([
        prisma.homepageHero.updateMany({ where: { isActive: true }, data: { isActive: false } }),
        prisma.homepageHero.update({ where: { id }, data: body })
      ]);
      revalidatePath('/');
      revalidatePath('/admin/homepage/hero');
      return NextResponse.json({ success: true });
    }

    const hero = await prisma.homepageHero.update({
      where: { id },
      data: body
    });
    revalidatePath('/');
    revalidatePath('/admin/homepage/hero');
    return NextResponse.json({ success: true, hero });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.homepageHero.delete({
      where: { id }
    });
    revalidatePath('/');
    revalidatePath('/admin/homepage/hero');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
