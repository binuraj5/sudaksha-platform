import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/assessments/admin/global-publish-requests/[id]/review
 * Approve or reject a global publish request (Super Admin only).
 * Body: { decision: "APPROVED" | "REJECTED", reviewComments?: string }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();

    if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { decision, reviewComments } = body as { decision?: string; reviewComments?: string };

    if (!decision || !["APPROVED", "REJECTED"].includes(decision)) {
        return NextResponse.json({ error: "decision must be APPROVED or REJECTED" }, { status: 400 });
    }

    try {
        const request = await prisma.globalPublishRequest.findUnique({
            where: { id }
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (request.status !== "PENDING") {
            return NextResponse.json({ error: "Request already reviewed" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.globalPublishRequest.update({
                where: { id },
                data: {
                    status: decision,
                    reviewedBy: session!.user!.id,
                    reviewedAt: new Date(),
                    reviewComments: reviewComments ?? null
                }
            });

            if (decision === "APPROVED" && request.entityType === "MODEL") {
                await tx.assessmentModel.update({
                    where: { id: request.entityId },
                    data: {
                        visibility: "GLOBAL",
                        publishedToGlobal: true,
                        globalPublishStatus: "APPROVED",
                        globalPublishApprovedBy: session!.user!.id,
                        globalPublishApprovedAt: new Date(),
                        status: "PUBLISHED",
                        publishedAt: new Date()
                    }
                });
            }

            if (decision === "REJECTED" && request.entityType === "MODEL") {
                await tx.assessmentModel.update({
                    where: { id: request.entityId },
                    data: { globalPublishStatus: "REJECTED" }
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: `Request ${decision.toLowerCase()} successfully`
        });
    } catch (error) {
        console.error("[GLOBAL_PUBLISH_REVIEW]", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
