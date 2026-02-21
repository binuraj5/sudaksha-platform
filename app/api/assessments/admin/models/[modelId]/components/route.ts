import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canEditModelComponents } from "@/lib/assessments/model-edit-permission";

/**
 * GET /api/assessments/admin/models/[modelId]/components
 * List all components for a specific assessment model
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userTenantId = user.tenantId || user.clientId;
        const isSuperAdmin = user.role === "SUPER_ADMIN" || user.userType === "SUPER_ADMIN";

        const { modelId } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, tenantId: true, clientId: true }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        if (!isSuperAdmin) {
            const isSameTenant = (model.tenantId === userTenantId) || (model.clientId === userTenantId);
            if (!isSameTenant && user.role !== "MEMBER") { // MBMERS might be viewing assigned components elsewhere, but for Admin UI this is correct.
                return NextResponse.json({ error: "Outside organization hierarchy" }, { status: 403 });
            }
        }

        const components = await prisma.assessmentModelComponent.findMany({
            where: { modelId },
            include: {
                competency: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        indicators: true
                    }
                },
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: { order: "asc" }
        });

        return NextResponse.json(components);
    } catch (error) {
        console.error("Error fetching components:", error);
        return NextResponse.json({ error: "Failed to fetch components" }, { status: 500 });
    }
}

/**
 * POST /api/assessments/admin/models/[modelId]/components
 * Add a new component (competency-based) to the model
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { modelId: modelIdPost } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelIdPost },
            select: { id: true, status: true, tenantId: true, clientId: true }
        });
        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }
        const editCheck = await canEditModelComponents(model, session);
        if (!editCheck.allowed) {
            return NextResponse.json({ error: editCheck.reason }, { status: 403 });
        }

        const body = await req.json();
        const { competencyId, weight, targetLevel, order, isRequired, isTimed, customDuration, componentType } = body;

        if (!competencyId) {
            return NextResponse.json({ error: "Competency ID is required" }, { status: 400 });
        }

        // Get default indicator IDs from the competency if none provided
        let indicatorIds = body.indicatorIds;
        if (!indicatorIds) {
            const competency = await prisma.competency.findUnique({
                where: { id: competencyId },
                include: { indicators: { select: { id: true } } }
            });
            indicatorIds = competency?.indicators.map(i => i.id) || [];
        }

        const component = await prisma.assessmentModelComponent.create({
            data: {
                modelId: modelIdPost,
                competencyId,
                componentType: componentType ?? "QUESTIONNAIRE",
                weight: weight ?? 1.0,
                targetLevel,
                indicatorIds,
                order: order ?? 0,
                isRequired: isRequired ?? true,
                isTimed: isTimed ?? true,
                customDuration
            },
            include: {
                competency: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(component);
    } catch (error) {
        console.error("Error creating component:", error);
        return NextResponse.json({ error: "Failed to add component" }, { status: 500 });
    }
}
