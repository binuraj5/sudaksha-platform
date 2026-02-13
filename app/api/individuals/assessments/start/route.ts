import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { canTakeAssessment } from "@/lib/b2c/free-tier";

/**
 * M15 B2C: Start self-selected assessment
 * POST: Create MemberAssessment from AssessmentModel, enforce free tier
 */
export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        if (role !== "INDIVIDUAL") {
            return NextResponse.json({ error: "Forbidden: Individual users only" }, { status: 403 });
        }

        const body = await req.json();
        const { modelId } = body;

        if (!modelId) {
            return NextResponse.json({ error: "modelId is required" }, { status: 400 });
        }

        const member = await prisma.member.findFirst({
            where: { email: (session.user as { email?: string }).email ?? "", type: "INDIVIDUAL" },
            select: { id: true },
        });

        if (!member) {
            return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
        }

        // M15: Free tier limit
        const { allowed, reason } = await canTakeAssessment(member.id);
        if (!allowed) {
            return NextResponse.json({ error: reason || "Assessment limit reached" }, { status: 403 });
        }

        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId, isActive: true },
            include: {
                components: { orderBy: { order: "asc" } },
            },
        });

        if (!model) {
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
        }

        // Check if already has in-progress for same model
        const existing = await prisma.memberAssessment.findFirst({
            where: {
                memberId: member.id,
                assessmentModelId: modelId,
                status: { in: ["DRAFT", "ACTIVE"] },
            },
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                memberAssessmentId: existing.id,
                message: "Continue existing assessment",
            });
        }

        const memberAssessment = await prisma.memberAssessment.create({
            data: {
                memberId: member.id,
                assessmentModelId: modelId,
                assignmentType: "SELF_SELECTED",
                status: "DRAFT", // Will transition to ACTIVE on start
            },
        });

        return NextResponse.json({
            success: true,
            memberAssessmentId: memberAssessment.id,
        });
    } catch (error) {
        console.error("[INDIVIDUALS_ASSESSMENTS_START]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
