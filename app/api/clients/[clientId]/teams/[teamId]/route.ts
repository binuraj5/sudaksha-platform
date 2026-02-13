import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; teamId: string }> }
) {
    const session = await getApiSession();
    const { clientId, teamId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const team = await prisma.organizationUnit.findUnique({
            where: { id: teamId },
            include: {
                manager: true,
                parent: true,
                members: { include: { currentRole: true } },
                _count: { select: { members: true } }
            }
        });

        if (!team || team.tenantId !== clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(team);

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
