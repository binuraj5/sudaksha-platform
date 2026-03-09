import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { saveCheckpoint, getResumeState } from "@/lib/assessment/session-checkpoint";

/**
 * GET /api/assessments/runner/[id]/resume
 * Returns resume state: canResume, resumeFromSection, completedSections, savedResponses.
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

        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: { id: true }
        });
        if (!member) {
            return NextResponse.json({ canResume: false, resumeFromSection: 0, completedSections: [], savedResponses: {} });
        }

        const ma = await prisma.memberAssessment.findFirst({
            where: { id: assessmentId, memberId: member.id },
            select: { assessmentModelId: true }
        });
        if (!ma) {
            return NextResponse.json({ canResume: false, resumeFromSection: 0, completedSections: [], savedResponses: {} });
        }

        const user = await prisma.user.findFirst({
            where: { email: { equals: session.user.email ?? "", mode: "insensitive" } },
            select: { id: true }
        });
        if (!user) {
            return NextResponse.json({ canResume: false, resumeFromSection: 0, completedSections: [], savedResponses: {} });
        }

        const uam = await prisma.userAssessmentModel.findFirst({
            where: { userId: user.id, modelId: ma.assessmentModelId },
            orderBy: { createdAt: "desc" },
            select: { id: true }
        });
        if (!uam) {
            return NextResponse.json({ canResume: false, resumeFromSection: 0, completedSections: [], savedResponses: {} });
        }

        const state = await getResumeState(uam.id);
        if (!state) {
            return NextResponse.json({ canResume: false, resumeFromSection: 0, completedSections: [], savedResponses: {} });
        }

        const resumeSection = state.inProgressSection ?? state.failedSection ?? state.nextPendingSection;
        let savedResponses: Record<string, unknown> = {};
        if (resumeSection) {
            const responses = await prisma.componentQuestionResponse.findMany({
                where: { userComponentId: resumeSection.id },
                select: { questionId: true, responseData: true }
            });
            savedResponses = Object.fromEntries(responses.map(r => [r.questionId, r.responseData]));
        }

        return NextResponse.json({
            canResume: state.canResume,
            resumeFromSection: state.completedSections.length,
            completedSections: state.completedSections.map(s => s.id),
            savedResponses,
        });

    } catch (error) {
        console.error("Resume GET error:", error);
        return NextResponse.json({ error: "Failed to get resume state" }, { status: 500 });
    }
}

/**
 * POST /api/assessments/runner/[id]/resume
 * Resumes an incomplete assessment from the correct section.
 * For ADAPTIVE_AI/VOICE/VIDEO failed sections: resets and clears responses.
 * For MCQ/SITUATIONAL failed sections: resets status.
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

        // Resolve member -> user -> UAM
        const member = await prisma.member.findFirst({
            where: { email: session.user.email ?? "" },
            select: { id: true }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const ma = await prisma.memberAssessment.findFirst({
            where: { id: assessmentId, memberId: member.id },
            select: { assessmentModelId: true }
        });

        if (!ma) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        const user = await prisma.user.findFirst({
            where: { email: { equals: session.user.email ?? "", mode: "insensitive" } },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User record not found" }, { status: 404 });
        }

        const uam = await prisma.userAssessmentModel.findFirst({
            where: { userId: user.id, modelId: ma.assessmentModelId },
            orderBy: { createdAt: "desc" },
            select: { id: true }
        });

        if (!uam) {
            return NextResponse.json({ error: "No assessment session found" }, { status: 404 });
        }

        // Find the failed or in-progress section
        const sections: any[] = await (prisma as any).userAssessmentComponent.findMany({
            where: { userAssessmentModelId: uam.id },
            orderBy: { createdAt: "asc" },
            include: { component: { select: { name: true, componentType: true, order: true } } }
        });

        const targetSection =
            sections.find(s => s.status === "ACTIVE") ??
            sections.find(s => s.status === "DRAFT" && (s as any).sectionError);

        if (!targetSection) {
            // Nothing to resume — find next pending
            const nextPending = sections.find(s => s.status === "DRAFT");
            const sectionIdx = nextPending
                ? sections.findIndex(s => s.id === nextPending.id)
                : sections.length;

            return NextResponse.json({
                canResume: false,
                redirectSectionIndex: sectionIdx,
                message: "No failed or in-progress section. Starting from next pending section.",
            });
        }

        const aiTypes = ["ADAPTIVE_AI", "VOICE", "VIDEO"];
        const componentType = targetSection.component.componentType;

        // For AI-based sections: clear responses and reset
        if (aiTypes.includes(componentType)) {
            await prisma.componentQuestionResponse.deleteMany({
                where: { userComponentId: targetSection.id }
            });
            await (prisma as any).userAssessmentComponent.update({
                where: { id: targetSection.id },
                data: {
                    status: "DRAFT",
                    sectionError: null,
                    startedAt: null,
                    completedAt: null,
                }
            });
        } else {
            // MCQ/SITUATIONAL: just reset status, keep responses (allow review)
            await (prisma as any).userAssessmentComponent.update({
                where: { id: targetSection.id },
                data: {
                    status: "DRAFT",
                    sectionError: null,
                }
            });
        }

        await saveCheckpoint(uam.id).catch(() => { });

        const resumeSectionIndex = sections.findIndex(s => s.id === targetSection.id);

        return NextResponse.json({
            canResume: true,
            resumeSectionIndex,
            componentId: targetSection.componentId,
            componentType,
            redirectTo: `/assessments/take/${assessmentId}?section=${resumeSectionIndex}`,
        });

    } catch (error) {
        console.error("Resume error:", error);
        return NextResponse.json({ error: "Failed to resume assessment" }, { status: 500 });
    }
}
