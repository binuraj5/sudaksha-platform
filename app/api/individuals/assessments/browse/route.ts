import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * M15 B2C: List available assessment models for individuals
 * GET: Returns AssessmentModels (published/active, global or system tenant)
 */
export async function GET(req: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "INDIVIDUAL") {
            return NextResponse.json({ error: "Forbidden: Individual users only" }, { status: 403 });
        }

        const models = await prisma.assessmentModel.findMany({
            where: {
                isActive: true,
                status: { in: ["PUBLISHED", "ACTIVE"] },
                OR: [
                    { tenantId: null }, // Global
                    { tenant: { type: "SYSTEM" } },
                ],
            },
            select: {
                id: true,
                name: true,
                description: true,
                durationMinutes: true,
                targetLevel: true,
                _count: {
                    select: { memberAssessments: true },
                },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(
            models.map((m) => ({
                id: m.id,
                name: m.name,
                description: m.description,
                durationMinutes: m.durationMinutes ?? 30,
                targetLevel: m.targetLevel,
                _count: m._count,
            }))
        );
    } catch (error) {
        console.error("[INDIVIDUALS_ASSESSMENTS_BROWSE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
