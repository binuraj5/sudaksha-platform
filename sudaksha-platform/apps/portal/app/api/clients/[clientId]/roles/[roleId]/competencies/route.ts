import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; roleId: string }> }
) {
    const session = await getApiSession();
    const { clientId, roleId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const role = await prisma.role.findFirst({
            where: {
                id: roleId,
                OR: [{ tenantId: clientId }, { visibility: 'UNIVERSAL' }]
            }
        });
        if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

        const competencies = await prisma.roleCompetency.findMany({
            where: { roleId },
            include: { competency: true },
            orderBy: { competency: { name: 'asc' } }
        });

        return NextResponse.json(competencies);
    } catch (error) {
        console.error("Fetch role competencies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
