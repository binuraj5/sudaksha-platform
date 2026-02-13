import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/admin/models/[modelId]/components/[componentId]/questions
 * List all questions for a specific component
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { componentId } = await params;
        const questions = await prisma.componentQuestion.findMany({
            where: { componentId },
            orderBy: { order: "asc" }
        });

        return NextResponse.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}

/**
 * POST /api/assessments/admin/models/[modelId]/components/[componentId]/questions
 * Add a new question to the component
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }>}
) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            questionText,
            questionType,
            options,
            correctAnswer,
            points,
            timeLimit,
            linkedIndicators,
            explanation,
            order,
            metadata
        } = body;

        if (!questionText || !questionType) {
            return NextResponse.json({ error: "Text and Type are required" }, { status: 400 });
        }
        const { componentId: compId } = await params;
        const question = await prisma.componentQuestion.create({
            data: {
                componentId: compId,
                questionText,
                questionType,
                options: options || [],
                correctAnswer,
                points: points ?? 1,
                timeLimit,
                linkedIndicators: linkedIndicators || [],
                explanation,
                order: order ?? 0,
                metadata: metadata || {}
            }
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
    }
}
