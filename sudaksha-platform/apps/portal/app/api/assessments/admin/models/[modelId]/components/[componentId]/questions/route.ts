import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canEditModelComponents } from "@/lib/assessments/model-edit-permission";

/**
 * GET /api/assessments/admin/models/[modelId]/components/[componentId]/questions
 * List all questions for a specific component
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        const userTenantId = user.tenantId || user.clientId;
        const isSuperAdmin = user.role === "SUPER_ADMIN" || user.userType === "SUPER_ADMIN";

        const { modelId } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, tenantId: true, clientId: true }
        });

        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }

        if (!isSuperAdmin) {
            const isSameTenant = (model.tenantId === userTenantId) || (model.clientId === userTenantId);
            if (!isSameTenant) {
                return NextResponse.json({ error: "Outside organization hierarchy" }, { status: 403 });
            }
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
    { params }: { params: Promise<{ modelId: string; componentId: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { modelId } = await params;
        const model = await prisma.assessmentModel.findUnique({
            where: { id: modelId },
            select: { id: true, status: true, tenantId: true, clientId: true }
        });
        if (!model) {
            return NextResponse.json({ error: "Model not found" }, { status: 404 });
        }
        const editCheck = await canEditModelComponents(model, session);
        if (!editCheck.allowed) {
            return NextResponse.json({ error: editCheck.reason }, { status: 403 });
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
