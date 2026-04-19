import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    return !!JSON.parse(raw)?.email;
  } catch { return false; }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.$transaction([
      // Deactivate all
      prisma.homepageHero.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      }),
      // Activate target
      prisma.homepageHero.update({
        where: { id },
        data: { isActive: true, publishedAt: new Date() }
      })
    ]);
    
    // Revalidate the homepage gracefully so the public UI is updated instantly
    revalidatePath("/", "page");
    
    return NextResponse.json({ success: true, message: "Hero activated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
