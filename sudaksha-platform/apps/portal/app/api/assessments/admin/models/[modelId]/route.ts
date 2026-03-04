import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAssessmentVisibilityFilter, getRoleCompetencyPermissions } from "@/lib/permissions/role-competency-permissions";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId || user.clientId,
            tenantType: (user.tenant?.type as any) || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };
        const { modelId } = await params;
        const include = {
            role: true,
            components: {
                include: {
                    competency: {
                        include: { indicators: true }
                    },
                    _count: { select: { questions: true } }
                },
                orderBy: { order: 'asc' as const }
            }
        };

        const visibilityFilter = buildAssessmentVisibilityFilter(userContext);
        const whereClause: any = { id: modelId, isActive: true, ...visibilityFilter };

        let model = await prisma.assessmentModel.findFirst({
            where: whereClause,
            include
        });
        // Fallback: model may exist but isActive=false (e.g. just created, or edge case)
        if (!model) {
            model = await prisma.assessmentModel.findUnique({
                where: { id: modelId },
                include
            });
        }
        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        return NextResponse.json(model);
    } catch (error) {
        console.error("Fetch model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId || user.clientId,
            tenantType: (user.tenant?.type as any) || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };
        const permissions = getRoleCompetencyPermissions(userContext);

        const body = await request.json();
        const { name, description, status, passingScore, maxAttempts, randomizeQuestions, showResultsImmediately } = body;

        const { modelId } = await params;

        const existingModel = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, status: true, createdBy: true, tenantId: true, clientId: true }
        });

        if (!existingModel) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        // Authorization check
        const isCreator = existingModel.createdBy === user.id;
        const isSameTenant = (existingModel.tenantId === userContext.tenantId) || (existingModel.clientId === userContext.tenantId);

        if (!permissions.canEditGlobal) {
            if (!(isCreator && permissions.canEditOwn) && !(isSameTenant && permissions.canEditOrg)) {
                return NextResponse.json({ error: "You don't have permission to edit this model" }, { status: 403 });
            }
        }

        if (existingModel.status === "PUBLISHED" && status !== "ARCHIVED") {
            return NextResponse.json({ error: "Cannot edit a published model without unpublishing first" }, { status: 400 });
        }

        const model = await prisma.assessmentModel.update({
            where: { id: modelId },
            data: {
                name,
                description,
                status,
                passingScore,
                maxAttempts,
                randomizeQuestions,
                showResultsImmediately
            }
        });

        return NextResponse.json(model);
    } catch (error) {
        console.error("Update model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userContext = {
            id: user.id,
            role: user.role,
            tenantId: user.tenantId || user.clientId,
            tenantType: (user.tenant?.type as any) || "CORPORATE",
            departmentId: user.departmentId,
            teamId: user.teamId,
            classId: user.classId,
        };
        const permissions = getRoleCompetencyPermissions(userContext);

        const { modelId } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, tenantId: true, clientId: true, createdBy: true, status: true }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        if (model.status === "PUBLISHED" || model.status === "ARCHIVED") {
            return NextResponse.json({ error: "Cannot delete a published or archived model" }, { status: 400 });
        }

        const isCreator = model.createdBy === user.id;
        const isSameTenant = (model.tenantId === userContext.tenantId) || (model.clientId === userContext.tenantId);

        if (!permissions.canDeleteGlobal) {
            if (!(isCreator && permissions.canDeleteOwn) && !(isSameTenant && permissions.canDeleteOrg)) {
                return NextResponse.json({ error: "You don't have permission to delete this model" }, { status: 403 });
            }
        }

        // Soft delete: update isActive and status
        await prisma.assessmentModel.update({
            where: { id: modelId },
            data: {
                isActive: false,
                status: "ARCHIVED"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete model error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
