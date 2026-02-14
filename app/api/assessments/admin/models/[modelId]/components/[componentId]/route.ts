import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canEditModelComponents } from "@/lib/assessments/model-edit-permission";

/**
 * PATCH /api/assessments/admin/models/[modelId]/components/[componentId]
 * Update a specific component
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { modelId, componentId } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
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
        const { weight, targetLevel, order, isRequired, isTimed, customDuration, indicatorIds, config } = body;
        const updateData: Record<string, unknown> = {
            weight,
            targetLevel,
            order,
            isRequired,
            isTimed,
            customDuration,
            indicatorIds,
        };
        if (config !== undefined) updateData.config = config;
        const component = await prisma.assessmentModelComponent.update({
            where: { id: componentId },
            data: updateData,
        });

        return NextResponse.json(component);
    } catch (error) {
        console.error("Error updating component:", error);
        return NextResponse.json({ error: "Failed to update component" }, { status: 500 });
    }
}

/**
 * DELETE /api/assessments/admin/models/[modelId]/components/[componentId]
 * Remove a component from the model
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { modelId, componentId: compId } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, status: true, tenantId: true, clientId: true }
        });
        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }
        const editCheck = await canEditModelComponents(model, session);
        if (!editCheck.allowed) {
            return NextResponse.json({ error: editCheck.reason }, { status: 403 });
        }
        await prisma.assessmentModelComponent.delete({
            where: {
                id: compId,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting component:", error);
        return NextResponse.json({ error: "Failed to remove component" }, { status: 500 });
    }
}
