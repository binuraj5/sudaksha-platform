import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: Request) {
    const session = await getApiSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const member = await prisma.member.findUnique({
            where: { email: session.user.email },
            select: { tenantId: true }
        });

        const tenantId = member?.tenantId;

        // Handle B2C (no tenantId) vs B2B (has tenantId)
        let orConditions: any[] = [{ visibility: "UNIVERSAL" }];

        if (tenantId) {
            orConditions.push({ tenantId });
        }

        const roles = await prisma.role.findMany({
            where: {
                OR: orConditions
            },
            select: {
                id: true,
                name: true,
                description: true,
                competencies: {
                    select: { competency: { select: { id: true, name: true, category: true } } }
                }
            },
            orderBy: { name: 'asc' }
        });

        const mapped = roles.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description ?? '',
            competencies: (r.competencies ?? []).map((rc) => ({
                id: rc.competency.id,
                name: rc.competency.name
            }))
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("[ONBOARDING_ROLES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
