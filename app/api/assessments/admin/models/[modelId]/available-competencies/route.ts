import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEVEL_ORDER: Record<string, number> = {
    JUNIOR: 0,
    MIDDLE: 1,
    SENIOR: 2,
    EXPERT: 3,
};

/**
 * GET /api/assessments/admin/models/[modelId]/available-competencies
 * Returns competencies available to add to this assessment model.
 * - If model has roleId (or roleId query param): returns competencies linked to that role
 * - Else: returns all competencies
 * - Indicators are filtered by model's targetLevel (at or below)
 * - Query param ?roleId=xxx overrides model.roleId (for when user selects a role in the modal)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await getApiSession();
        const user = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { modelId } = await params;
        const { searchParams } = new URL(request.url);
        const roleIdParam = searchParams.get("roleId");

        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            include: {
                role: true,
                components: { select: { competencyId: true } },
            },
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        const targetLevel = model.targetLevel || "JUNIOR";
        const targetOrder = LEVEL_ORDER[targetLevel] ?? 0;
        const usedCompetencyIds = new Set(
            model.components.map((c) => c.competencyId).filter((id): id is string => !!id)
        );

        let competencies: Array<{
            id: string;
            name: string;
            category: string;
            description?: string;
            indicators: Array<{ id: string; text: string; level: string }>;
        }> = [];

        const filterIndicatorsByLevel = (indicators: { id: string; text: string; level: string }[]) =>
            indicators.filter((i) => (LEVEL_ORDER[i.level] ?? 99) <= targetOrder);

        const normalizeCompetency = (c: { id: string; name: string; category: string; description?: string | null; indicators?: { id: string; text: string; level: string }[] }) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            description: c.description ?? undefined,
            indicators: filterIndicatorsByLevel(
                (c.indicators || []).map((i) => ({ id: i.id, text: i.text, level: i.level }))
            ),
        });

        // Use roleId from query param (user-selected) or from model
        const effectiveRoleId = roleIdParam || model.roleId;

        if (effectiveRoleId) {
            // Role-based: get competencies linked to this role
            const roleCompetencies = await prisma.roleCompetency.findMany({
                where: { roleId: effectiveRoleId },
                include: {
                    competency: {
                        include: {
                            indicators: { orderBy: { order: "asc" } },
                        },
                    },
                },
                orderBy: { competency: { name: "asc" } },
            });

            competencies = roleCompetencies
                .map((rc) => rc.competency)
                .filter((c): c is NonNullable<typeof c> => c != null)
                .map(normalizeCompetency);
        }

        // Fallback: when no role, or role has no competencies linked - fetch all competencies
        if (competencies.length === 0) {
            const allCompetencies = await prisma.competency.findMany({
                include: {
                    indicators: { orderBy: { order: "asc" } },
                },
                orderBy: { name: "asc" },
            });

            competencies = allCompetencies.map(normalizeCompetency);
        }

        // Exclude competencies already in the model
        let available = competencies.filter((c) => !usedCompetencyIds.has(c.id));

        // When role-based but all are used, fall back to full library so user can add more
        if (available.length === 0 && effectiveRoleId) {
            const allCompetencies = await prisma.competency.findMany({
                include: {
                    indicators: { orderBy: { order: "asc" } },
                },
                orderBy: { name: "asc" },
            });

            available = allCompetencies
                .map(normalizeCompetency)
                .filter((c) => !usedCompetencyIds.has(c.id));
        }

        return NextResponse.json(available);
    } catch (error) {
        console.error("Fetch available competencies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
