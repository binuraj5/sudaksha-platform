import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

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
        const { userComponentId, questionId, responseData, maxPoints } = body;

        if (!userComponentId || !questionId || responseData === undefined) {
            return NextResponse.json(
                { error: "userComponentId, questionId, and responseData are required" },
                { status: 400 }
            );
        }

        const points = maxPoints ?? 1;

        const existing = await prisma.componentQuestionResponse.findFirst({
            where: { userComponentId, questionId }
        });

        if (existing) {
            await prisma.componentQuestionResponse.update({
                where: { id: existing.id },
                data: { responseData, updatedAt: new Date() }
            });
            return NextResponse.json({ ok: true, updated: true });
        }

        await prisma.componentQuestionResponse.create({
            data: {
                userComponentId,
                questionId,
                responseData,
                maxPoints: points
            }
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Runner response error:", error);
        return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
    }
}
