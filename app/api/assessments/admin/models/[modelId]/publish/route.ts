import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/assessments/admin/models/[modelId]/publish
 * Publish model with visibility: PRIVATE | ORGANIZATION | GLOBAL
 * - GLOBAL: SUPER_ADMIN publishes directly; others create GlobalPublishRequest
 * - PRIVATE/ORGANIZATION: publish immediately
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { modelId } = await params;
        const body = await req.json();
        const { visibility } = body as { visibility?: string };

        if (!visibility || !["PRIVATE", "ORGANIZATION", "GLOBAL"].includes(visibility)) {
            return NextResponse.json(
                { error: "visibility must be PRIVATE, ORGANIZATION, or GLOBAL" },
                { status: 400 }
            );
        }

        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            include: {
                components: {
                    select: { id: true, status: true, completionPercentage: true }
                }
            }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        // Completion check: all components complete or model completionPercentage >= 100
        const allComplete =
            model.completionPercentage >= 100 ||
            (model.components.length > 0 &&
                model.components.every(
                    (c) =>
                        c.completionPercentage >= 100 ||
                        (c.status && c.status === "COMPLETE")
                ));

        if (!allComplete && model.components.length > 0) {
            return NextResponse.json(
                { error: "Cannot publish incomplete model. Build all components first." },
                { status: 400 }
            );
        }

        if (visibility === "GLOBAL") {
            if (session.user.role !== "SUPER_ADMIN") {
                await prisma.globalPublishRequest.create({
                    data: {
                        entityType: "MODEL",
                        entityId: modelId,
                        requestedBy: session.user.id,
                        status: "PENDING"
                    }
                });

                await prisma.assessmentModel.update({
                    where: { id: modelId },
                    data: {
                        globalPublishStatus: "PENDING",
                        globalPublishRequestedBy: session.user.id,
                        globalPublishRequestedAt: new Date()
                    }
                });

                return NextResponse.json({
                    success: true,
                    message: "Global publish request submitted for approval"
                });
            }

            await prisma.assessmentModel.update({
                where: { id: modelId },
                data: {
                    visibility: "GLOBAL",
                    publishedToGlobal: true,
                    globalPublishStatus: "APPROVED",
                    globalPublishApprovedBy: session.user.id,
                    globalPublishApprovedAt: new Date(),
                    status: "PUBLISHED",
                    publishedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                message: "Model published globally"
            });
        }

        await prisma.assessmentModel.update({
            where: { id: modelId },
            data: {
                visibility,
                status: "PUBLISHED",
                publishedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: `Model published with ${visibility.toLowerCase()} visibility`
        });
    } catch (error) {
        console.error("Publishing error:", error);
        return NextResponse.json({ error: "Failed to publish model" }, { status: 500 });
    }
}
