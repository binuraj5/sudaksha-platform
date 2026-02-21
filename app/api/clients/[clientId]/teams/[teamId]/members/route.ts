import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; teamId: string }> }
) {
    const session = await getApiSession();
    const { clientId, teamId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const { memberIds } = await req.json();

        if (!Array.isArray(memberIds)) {
            return NextResponse.json({ error: "memberIds must be an array" }, { status: 400 });
        }

        // First, removing any members currently assigned to this team that are NOT in the new list
        await prisma.member.updateMany({
            where: { tenantId: clientId, orgUnitId: teamId, id: { notIn: memberIds } },
            data: { orgUnitId: null }
        });

        // Next, update all provided members to belong to this team
        if (memberIds.length > 0) {
            await prisma.member.updateMany({
                where: { tenantId: clientId, id: { in: memberIds } },
                data: { orgUnitId: teamId }
            });
        }

        return NextResponse.json({ success: true, message: "Team members updated successfully" });

    } catch (error) {
        console.error("Failed to sync team members", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
