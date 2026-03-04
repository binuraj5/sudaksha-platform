import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { getResumeState } from "@/lib/assessment/session-checkpoint";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/runner/[id]/checkpoint
 * Returns the current session state — completed sections, in-progress, failed, next.
 * Used after finishing a section to show the between-sections checkpoint screen.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: assessmentId } = await params;

        // Resolve UserAssessmentModel ID from either MemberAssessment or ProjectUserAssessment
        let uamId: string | null = null;

        // Try MemberAssessment flow
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
                    uamId = uam?.id ?? null;
                }
            }
        }

        // Try ProjectUserAssessment flow
        if (!uamId) {
            const pua = await prisma.projectUserAssessment.findFirst({
                where: { id: assessmentId, userId: session.user.id ?? "" },
                select: { id: true, metadata: true }
            });
            if (pua) {
                // For project assessments, return the checkpoint from metadata
                const meta = (pua.metadata as any)?.checkpoint ?? null;
                return NextResponse.json({
                    source: "projectUserAssessment",
                    checkpoint: meta,
                    canResume: !!(meta?.sections?.some((s: any) => s.status === "ACTIVE")),
                });
            }
        }

        if (!uamId) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        const state = await getResumeState(uamId);
        return NextResponse.json({ source: "memberAssessment", ...state });

    } catch (error) {
        console.error("Checkpoint GET error:", error);
        return NextResponse.json({ error: "Failed to get checkpoint" }, { status: 500 });
    }
}
