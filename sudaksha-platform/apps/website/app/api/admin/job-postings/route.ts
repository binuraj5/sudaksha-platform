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
    const postings = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, postings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const posting = await prisma.jobPosting.create({
      data: {
        title: body.title,
        company: body.company,
        description: body.description,
        location: body.location,
        jobType: body.jobType || 'Full-time',
        salary: body.salary || null,
        requirements: body.requirements || [],
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        status: body.status || 'ACTIVE',
        featured: body.featured || false,
      }
    });
    return NextResponse.json({ success: true, posting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
