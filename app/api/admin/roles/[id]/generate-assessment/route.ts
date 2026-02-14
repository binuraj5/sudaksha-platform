import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        const { id } = await params;

        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                competencies: {
                    include: { competency: true }
                }
            }
        });

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        // Logic to "Smart Build" an assessment
        // 1. Identify existing components that match the competency categories
        // 2. Propose a balanced model

        const proposedComponents = role.competencies.map(rc => ({
            name: `${rc.competency.name} Assessment`,
            type: rc.competency.category === 'TECHNICAL' ? 'CODING_CHALLENGE' : 'QUESTIONNAIRE',
            weight: rc.weight,
            competencyId: rc.competencyId,
            level: rc.requiredLevel
        }));

        return NextResponse.json({
            proposedModelName: `${role.name} Standard Assessment`,
            components: proposedComponents
        });
    } catch (error) {
        console.error("Generate role assessment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
