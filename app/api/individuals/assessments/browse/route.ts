import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get published, active assessment models
    const models = await prisma.assessmentModel.findMany({
        where: {
            isActive: true,
            OR: [
                { visibility: "GLOBAL" as any },
                { visibility: "ORGANIZATION" as any, tenantId: session.user.clientId || "" },
            ],
        },
        include: {
            role: true,
            components: {
                include: {
                    competency: true,
                },
            },
        },
        orderBy: { createdAt: "desc" }, // No publishedAt in schema for AssessmentModel, using createdAt
    });

    return NextResponse.json({ models });
}
