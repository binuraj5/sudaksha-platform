import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 86_400_000;

export async function POST(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { modelId } = await req.json();
    if (!modelId) {
        return NextResponse.json({ error: "modelId is required" }, { status: 400 });
    }

    // Find or create Member for this user (type INDIVIDUAL)
    let member = await prisma.member.findFirst({
        where: {
            email: session.user.email!,
            type: "INDIVIDUAL",
        },
    });

    if (!member) {
        // Create B2C member on first assessment
        member = await prisma.member.create({
            data: {
                name: session.user.name || "B2C User",
                email: session.user.email!,
                password: "B2C_NO_PASSWORD", // Required by schema
                type: "INDIVIDUAL",
                tenantId: session.user.clientId || null, // B2C may not have tenant
            },
        });
    }

    // ── SEPL/INT/2026/IMPL-GAPS-01 Step G14 — retake lockout enforcement ────
    // Patent C-09: enforce minRetakeIntervalDays + maxAttempts on assessment models.
    // Check BEFORE creating any new MemberAssessment record.
    const assessmentModel = await prisma.assessmentModel.findUnique({
        where: { id: modelId },
        select: { id: true, maxAttempts: true, minRetakeIntervalDays: true },
    });
    if (!assessmentModel) {
        return NextResponse.json({ error: "Assessment model not found" }, { status: 404 });
    }

    const lastCompletedAttempt = await prisma.memberAssessment.findFirst({
        where: {
            memberId: member.id,
            assessmentModelId: modelId,
            status: "COMPLETED",
        },
        orderBy: { completedAt: "desc" },
        select: { id: true, completedAt: true },
    });

    if (lastCompletedAttempt) {
        // Max attempts gate
        const totalAttempts = await prisma.memberAssessment.count({
            where: { memberId: member.id, assessmentModelId: modelId },
        });
        if (assessmentModel.maxAttempts && totalAttempts >= assessmentModel.maxAttempts) {
            return NextResponse.json(
                {
                    error: "RETAKE_LIMIT_REACHED",
                    message: `Maximum ${assessmentModel.maxAttempts} attempts reached for this assessment.`,
                    maxAttempts: assessmentModel.maxAttempts,
                    attemptsUsed: totalAttempts,
                },
                { status: 403 }
            );
        }

        // Retake interval gate
        const completedAtMs = lastCompletedAttempt.completedAt?.getTime();
        if (
            completedAtMs &&
            assessmentModel.minRetakeIntervalDays &&
            assessmentModel.minRetakeIntervalDays > 0
        ) {
            const daysSinceLast = Math.floor((Date.now() - completedAtMs) / MS_PER_DAY);
            if (daysSinceLast < assessmentModel.minRetakeIntervalDays) {
                const daysRemaining = assessmentModel.minRetakeIntervalDays - daysSinceLast;
                const retakeAvailableAt = new Date(
                    completedAtMs + assessmentModel.minRetakeIntervalDays * MS_PER_DAY
                );
                return NextResponse.json(
                    {
                        error: "RETAKE_LOCKED",
                        message: `Retake available in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`,
                        daysRemaining,
                        retakeAvailableAt: retakeAvailableAt.toISOString(),
                        minRetakeIntervalDays: assessmentModel.minRetakeIntervalDays,
                    },
                    { status: 403 }
                );
            }
        }
    }
    // ── End G14 lockout check ───────────────────────────────────────────────

    // If there's an in-progress (non-COMPLETED) attempt, return it instead of creating a duplicate.
    const inProgress = await prisma.memberAssessment.findFirst({
        where: {
            memberId: member.id,
            assessmentModelId: modelId,
            status: { in: ["DRAFT", "ACTIVE", "PAUSED"] },
        },
        orderBy: { createdAt: "desc" },
    });

    if (inProgress) {
        return NextResponse.json({
            assessmentId: inProgress.id,
            message: "Assessment already started",
            alreadyExists: true,
        });
    }

    // Create new (first attempt OR lockout cleared retake)
    const assessment = await prisma.memberAssessment.create({
        data: {
            memberId: member.id,
            assessmentModelId: modelId,
            assignmentType: "SELF_SELECTED",
            status: "DRAFT" as any,
        },
    });

    return NextResponse.json(
        {
            assessmentId: assessment.id,
            message: "Assessment started",
        },
        { status: 201 }
    );
}
