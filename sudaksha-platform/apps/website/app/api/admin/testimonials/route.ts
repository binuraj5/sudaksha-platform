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
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const testimonial = await prisma.testimonial.create({
      data: {
        content: body.content,
        author: body.author,
        company: body.company || null,
        role: body.role || null,
        rating: body.rating || 5,
        mediaType: body.mediaType || 'TEXT',
        mediaUrl: body.mediaUrl || null,
        verified: body.verified || false,
        featured: body.featured || false,
        status: body.status || 'PUBLISHED',
      }
    });
    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
