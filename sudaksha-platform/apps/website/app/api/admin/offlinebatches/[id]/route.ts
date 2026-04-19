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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const batch = await prisma.offlineBatch.findUnique({
      where: { id }
    });
    if (!batch) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    console.log(`[PATCH /api/admin/offlinebatches/${id}]`, body);
    
    // Validate status field if provided
    if (body.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }
    
    const batch = await prisma.offlineBatch.update({
      where: { id },
      data: body
    });
    console.log(`[PATCH SUCCESS] Updated batch:`, { id, status: batch.status, isPublic: batch.isPublic });
    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    console.error(`[PATCH ERROR]`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.offlineBatch.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DEBUG ENDPOINT: Check and fix batch visibility
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // If ID is "check-ai", perform check operation
    if (id === 'check-ai') {
      const batch = await prisma.offlineBatch.findFirst({
        where: {
          programTitle: {
            contains: 'Advanced Enterprise AI',
            mode: 'insensitive'
          }
        }
      });

      if (!batch) {
        const allBatches = await prisma.offlineBatch.findMany({
          select: { id: true, programTitle: true, status: true, isPublic: true }
        });
        return NextResponse.json({
          message: 'No course found',
          allBatches
        });
      }

      const isVisible = batch.isPublic === true && batch.status === 'PUBLISHED';

      if (isVisible) {
        return NextResponse.json({
          message: 'Record is already VISIBLE',
          batch
        });
      }

      // Fix it
      const updated = await prisma.offlineBatch.update({
        where: { id: batch.id },
        data: {
          status: 'PUBLISHED',
          isPublic: true
        }
      });

      return NextResponse.json({
        message: 'Record updated! Now VISIBLE on /our-work',
        batch: updated
      });
    }

    // Regular update for other IDs
    const body = await req.json();
    const batch = await prisma.offlineBatch.update({
      where: { id },
      data: body
    });
    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
