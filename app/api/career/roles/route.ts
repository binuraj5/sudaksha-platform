import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: Request) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = session.user as any;
        const tenantId = user.tenantId; // Might be null if B2C, but this is Corporate module

        const whereClause: any = {
            status: 'APPROVED',
            isActive: true
        };

        if (tenantId) {
            whereClause.OR = [
                { tenantId: tenantId },
                { visibility: 'UNIVERSAL' },
                { tenantId: null } // Legacy support for global roles
            ];
        } else {
            // If no tenant (e.g. B2C), just show universal/public
            whereClause.OR = [
                { visibility: 'UNIVERSAL' },
                { tenantId: null }
            ];
        }

        const roles = await prisma.role.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                description: true,
                competencies: {
                    select: {
                        competency: {
                            select: { id: true, name: true, category: true }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error("[CAREER_ROLES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
