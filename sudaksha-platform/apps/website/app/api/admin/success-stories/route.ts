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

export async function GET(req: NextRequest) {
  try {
    const stories = await prisma.successStory.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, stories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const story = await prisma.successStory.create({
      data: {
        headline: body.headline,
        company: body.company,
        results: body.results || {},
        fullStory: body.fullStory,
        imageUrl: body.imageUrl || null,
        featured: body.featured || false,
        status: body.status || 'DRAFT',
      }
    });
    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
