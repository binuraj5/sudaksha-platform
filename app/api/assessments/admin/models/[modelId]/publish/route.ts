import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { bumpVersion } from "@/lib/assessments/model-edit-permission";
import { getRoleCompetencyPermissions } from "@/lib/permissions/role-competency-permissions";

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

        const isCreator = model.createdBy === user.id;
        const isSameTenant = (model.tenantId === userContext.tenantId) || (model.clientId === userContext.tenantId);

        if (visibility === "GLOBAL") {
            if (!permissions.canSubmitForGlobal && !permissions.canEditGlobal) {
                return NextResponse.json({ error: "You don't have permission to submit models for global approval" }, { status: 403 });
            }

            if (!permissions.canEditGlobal) {
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

            const nextVersion = bumpVersion(model.version || "1.0.0");
            await prisma.assessmentModel.update({
                where: { id: modelId },
                data: {
                    visibility: "GLOBAL",
                    publishedToGlobal: true,
                    globalPublishStatus: "APPROVED",
                    globalPublishApprovedBy: session.user.id,
                    globalPublishApprovedAt: new Date(),
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                    version: nextVersion
                }
            });

            return NextResponse.json({
                success: true,
                message: "Model published globally",
                version: nextVersion
            });
        }

        if (visibility === "ORGANIZATION") {
            if (!permissions.canPublishToOrg || !isSameTenant) {
                return NextResponse.json({ error: "You don't have permission to publish to the organization" }, { status: 403 });
            }
        }

        const nextVersion = bumpVersion(model.version || "1.0.0");
        await prisma.assessmentModel.update({
            where: { id: modelId },
            data: {
                visibility,
                status: "PUBLISHED",
                publishedAt: new Date(),
                version: nextVersion
            }
        });

        return NextResponse.json({
            success: true,
            message: `Model published with ${visibility.toLowerCase()} visibility (v${nextVersion})`,
            version: nextVersion
        });
    } catch (error) {
        console.error("Publishing error:", error);
        return NextResponse.json({ error: "Failed to publish model" }, { status: 500 });
    }
}
