import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/admin/model-components
 * List AssessmentModelComponent across models (optionally filtered by modelId)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getApiSession();
        const user = session?.user as { role?: string; userType?: string; tenantId?: string; clientId?: string } | undefined;
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const modelId = searchParams.get("modelId");

        const modelWhere: Record<string, unknown> = { isActive: true };
        const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!isSuperAdmin) {
            const userTenantId = user?.tenantId || user?.clientId;
            const orClauses: { tenantId?: string; clientId?: string }[] = [];
            if (userTenantId) orClauses.push({ tenantId: userTenantId });
            if (user?.clientId) orClauses.push({ clientId: user.clientId });
            if (orClauses.length > 0) {
                (modelWhere as Record<string, unknown>).OR = orClauses;
            } else {
                (modelWhere as Record<string, unknown>).tenantId = "impossible";
            }
        }
        if (modelId) (modelWhere as Record<string, unknown>).id = modelId;

        const components = await prisma.assessmentModelComponent.findMany({
            where: { model: modelWhere },
            include: {
                model: { select: { id: true, name: true, code: true } },
                competency: { select: { id: true, name: true, category: true } },
                libraryComponent: { select: { id: true, name: true } },
                _count: { select: { questions: true } }
            },
            orderBy: [{ modelId: "asc" }, { order: "asc" }]
        });

        return NextResponse.json(components);
    } catch (error) {
        console.error("Error fetching model components:", error);
        return NextResponse.json({ error: "Failed to fetch components" }, { status: 500 });
    }
}
