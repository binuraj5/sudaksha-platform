import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Add members to team
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; teamId: string }> }
) {
    const session = await getApiSession();
    const { clientId, teamId } = await params;

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'TENANT_ADMIN' && session.user.role !== 'DEPARTMENT_HEAD' && session.user.role !== 'TEAM_LEAD')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { memberIds } = body; // Array of member IDs

        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            return NextResponse.json({ error: "No members provided" }, { status: 400 });
        }

        // Update members to set orgUnitId = teamId
        await prisma.member.updateMany({
            where: {
                id: { in: memberIds },
                tenantId: clientId
            },
            data: { orgUnitId: teamId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
