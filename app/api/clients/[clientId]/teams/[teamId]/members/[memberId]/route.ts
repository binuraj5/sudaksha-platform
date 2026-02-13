import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; teamId: string; memberId: string }> }
) {
    const session = await getApiSession();
    const { clientId, teamId, memberId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        // We need to move the member OUT of the team.
        // Where to? The parent Department.

        const team = await prisma.organizationUnit.findUnique({
            where: { id: teamId },
            select: { parentId: true }
        });

        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

        await prisma.member.update({
            where: { id: memberId },
            data: {
                orgUnitId: team.parentId // Move back to Department
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
