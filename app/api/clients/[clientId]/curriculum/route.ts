import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { clientId } = await params;
    const userClientId = (session.user as any).clientId || (session.user as any).tenantId;
    if ((session.user as any).role !== "SUPER_ADMIN" && userClientId !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type');

    try {
        const where: any = { tenantId: clientId };
        if (parentId) where.parentId = parentId === 'null' ? null : parentId;
        if (type) where.type = type;

        const nodes = await prisma.curriculumNode.findMany({
            where,
            include: {
                _count: { select: { children: true, activities: true } }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(nodes);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch curriculum nodes" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clientId } = await params;
    const body = await req.json();

    try {
        const node = await prisma.curriculumNode.create({
            data: {
                ...body,
                tenantId: clientId
            }
        });
        return NextResponse.json(node);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create curriculum node" }, { status: 500 });
    }
}
