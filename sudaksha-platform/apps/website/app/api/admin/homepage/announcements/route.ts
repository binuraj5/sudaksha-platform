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

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    
    // Safety check: max 1 active
    if (body.isActive) {
      await prisma.$transaction([
        prisma.announcement.updateMany({ where: { isActive: true }, data: { isActive: false } }),
        prisma.announcement.create({ data: body })
      ]);
      revalidatePath('/');
      revalidatePath('/admin/homepage/announcements');
      return NextResponse.json({ success: true, message: "Created and activated successfully" });
    }
    
    const announcement = await prisma.announcement.create({
      data: body
    });
    revalidatePath('/');
    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
