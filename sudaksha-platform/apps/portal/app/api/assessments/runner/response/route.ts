import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { saveCheckpoint, saveProjectCheckpoint } from "@/lib/assessment/session-checkpoint";

/**
 * POST /api/assessments/runner/response
 * Body: { userComponentId, questionId, responseData, maxPoints }
 * Creates or updates ComponentQuestionResponse.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userComponentId, questionId, responseData, maxPoints, timeSpent } = body;

        if (!userComponentId || !questionId || responseData === undefined) {
            return NextResponse.json(
                { error: "userComponentId, questionId, and responseData are required" },
                { status: 400 }
            );
        }

        const points = maxPoints ?? 1;

        // SEPL/INT/2026/IMPL-GAPS-01 Step G12 — capture per-response time
        // Patent claim C-09 — response-time monitoring for anomaly detection
        const validTimeSpent = typeof timeSpent === "number" && timeSpent >= 0 && timeSpent < 86400
            ? Math.floor(timeSpent)
            : null;

        const existing = await prisma.componentQuestionResponse.findFirst({
            where: { userComponentId, questionId }
        });

        if (existing) {
            await prisma.componentQuestionResponse.update({
                where: { id: existing.id },
                data: {
                    responseData,
                    updatedAt: new Date(),
                    ...(validTimeSpent != null ? { timeSpent: validTimeSpent } : {}),
                },
            });
            return NextResponse.json({ ok: true, updated: true });
        }

        await prisma.componentQuestionResponse.create({
            data: {
                userComponentId,
                questionId,
                responseData,
                maxPoints: points,
                createdAt: new Date(), // explicit per G12.2
                ...(validTimeSpent != null ? { timeSpent: validTimeSpent } : {}),
            }
        });

        // Fire-and-forget checkpoint — persists session state on every answer so a network
        // drop or browser close never loses progress. Does not block the response.
        prisma.userAssessmentComponent.findUnique({
            where: { id: userComponentId },
            select: { userAssessmentModelId: true, projectUserAssessmentId: true }
        }).then(uc => {
            if (uc?.userAssessmentModelId) {
                saveCheckpoint(uc.userAssessmentModelId).catch(() => { });
            } else if (uc?.projectUserAssessmentId) {
                saveProjectCheckpoint(uc.projectUserAssessmentId).catch(() => { });
            }
        }).catch(() => { });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Runner response error:", error);
        return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
    }
}
