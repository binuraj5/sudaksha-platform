import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { saveCheckpoint, saveProjectCheckpoint } from "@/lib/assessment/session-checkpoint";

/**
 * POST /api/assessments/runner/[id]/pause
 * Pauses the current assessment, saving a checkpoint.
 * Returns a deep-link URL the user can use to resume later.
 */
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: assessmentId } = await params;

        // Resolve UAM
        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: { id: true }
        });

        if (member) {
            const ma = await prisma.memberAssessment.findFirst({
                where: { id: assessmentId, memberId: member.id },
                select: { assessmentModelId: true }
            });
            if (ma) {
                const user = await prisma.user.findFirst({
                    where: { email: { equals: session.user.email ?? "", mode: "insensitive" } },
                    select: { id: true }
                });
                if (user) {
                    const uam = await prisma.userAssessmentModel.findFirst({
                        where: { userId: user.id, modelId: ma.assessmentModelId },
                        orderBy: { createdAt: "desc" },
                        select: { id: true }
                    });
                    if (uam) {
                        await saveCheckpoint(uam.id).catch(() => { });
                        return NextResponse.json({
                            ok: true,
                            resumeUrl: `/assessments/take/${assessmentId}`,
                            message: "Progress saved. You can resume this assessment anytime from your assessments page.",
                        });
                    }
                }
            }
        }

        // Org / Institutional flow — save project checkpoint before returning
        const pua = await prisma.projectUserAssessment.findFirst({
            where: { id: assessmentId, userId: (session.user as { id: string }).id },
            select: { id: true }
        });
        if (pua) {
            await saveProjectCheckpoint(pua.id).catch(() => { });
            return NextResponse.json({
                ok: true,
                resumeUrl: `/assessments/take/${assessmentId}`,
                message: "Progress saved.",
            });
        }

        return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    } catch (error) {
        console.error("Pause error:", error);
        return NextResponse.json({ error: "Failed to pause assessment" }, { status: 500 });
    }
}
