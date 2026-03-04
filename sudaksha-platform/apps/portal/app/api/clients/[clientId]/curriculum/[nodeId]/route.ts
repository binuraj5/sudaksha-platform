import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string, nodeId: string }> }
) {
    const session = await getApiSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userClientId = (session.user as any).clientId || (session.user as any).tenantId;
    if ((session.user as any).role !== "SUPER_ADMIN" && userClientId !== (await params).clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { clientId, nodeId } = await params;
    const body = await req.json();

    try {
        const node = await prisma.curriculumNode.update({
            where: { id: nodeId, tenantId: clientId },
            data: body
        });
        return NextResponse.json(node);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update node" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string, nodeId: string }> }
) {
    const session = await getApiSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userClientId = (session.user as any).clientId || (session.user as any).tenantId;
    if ((session.user as any).role !== "SUPER_ADMIN" && userClientId !== (await params).clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { clientId, nodeId } = await params;

    try {
        // Find if it has children or linked activities
        const node = await prisma.curriculumNode.findUnique({
            where: { id: nodeId },
            include: {
                _count: { select: { children: true, activities: true } }
            }
        });

        if (node && (node._count.children > 0 || node._count.activities > 0)) {
            return NextResponse.json({
                error: "Cannot delete node with children or linked activities. Delete them first."
            }, { status: 400 });
        }

        await prisma.curriculumNode.delete({
            where: { id: nodeId, tenantId: clientId }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete node" }, { status: 500 });
    }
}
