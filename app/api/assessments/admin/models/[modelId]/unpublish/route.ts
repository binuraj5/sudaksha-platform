import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { canUnpublishModel } from "@/lib/assessments/model-edit-permission";

/**
 * POST /api/assessments/admin/models/[modelId]/unpublish
 * Unpublish a model (revert to DRAFT) so components can be edited.
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

        const { modelId } = await params;

        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, status: true, tenantId: true, clientId: true }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        if (model.status !== "PUBLISHED") {
            return NextResponse.json(
                { error: "Model is not published. Nothing to unpublish." },
                { status: 400 }
            );
        }

        const check = await canUnpublishModel(model, session);
        if (!check.allowed) {
            return NextResponse.json(
                { error: check.reason || "You cannot unpublish this model" },
                { status: 403 }
            );
        }

        await prisma.assessmentModel.update({
            where: { id: modelId },
            data: {
                status: "DRAFT",
                publishedAt: null,
                globalPublishStatus: null,
                globalPublishRequestedBy: null,
                globalPublishRequestedAt: null,
                globalPublishApprovedBy: null,
                globalPublishApprovedAt: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Model unpublished. You can now edit components."
        });
    } catch (error) {
        console.error("Unpublish error:", error);
        return NextResponse.json({ error: "Failed to unpublish model" }, { status: 500 });
    }
}
