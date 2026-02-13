import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/library
 * Browse component library (filter by competencyId, componentType, targetLevel, visibility)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const competencyId = searchParams.get("competencyId");
        const componentType = searchParams.get("componentType");
        const targetLevel = searchParams.get("targetLevel");
        const visibility = searchParams.get("visibility");

        const userId = session.user.id;
        const tenantId = session.user.tenantId ?? undefined;

        // Build where: user can see GLOBAL + ORG + their own PRIVATE
        const where: Record<string, unknown> = {
            OR: [
                { visibility: "GLOBAL", publishedToGlobal: true },
                ...(tenantId ? [{ visibility: "ORGANIZATION" as const, tenantId }] : []),
                { visibility: "PRIVATE" as const, createdBy: userId }
            ]
        };

        if (competencyId) (where as Record<string, unknown>).competencyId = competencyId;
        if (componentType) (where as Record<string, unknown>).componentType = componentType;
        if (targetLevel) (where as Record<string, unknown>).targetLevel = targetLevel;
        if (visibility) (where as Record<string, unknown>).visibility = visibility;

        const components = await prisma.componentLibrary.findMany({
            where,
            include: {
                competency: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }]
        });

        return NextResponse.json({ components });
    } catch (error) {
        console.error("Library fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 });
    }
}

/**
 * POST /api/assessments/library
 * Save a component to the library (from existing component with questions)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            name,
            description,
            componentType,
            competencyId,
            targetLevel,
            visibility,
            questions,
            sourceComponentId // Optional: copy from existing component
        } = body;

        let questionsToSave = questions;

        if (sourceComponentId && !questionsToSave) {
            const component = await prisma.assessmentModelComponent.findFirst({
                where: { id: sourceComponentId },
                include: { questions: true }
            });
            if (!component) {
                return NextResponse.json({ error: "Source component not found" }, { status: 404 });
            }
            questionsToSave = component.questions.map((q) => ({
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: q.points,
                timeLimit: q.timeLimit,
                linkedIndicators: q.linkedIndicators,
                explanation: q.explanation
            }));
        }

        if (!name || !componentType || !competencyId || !targetLevel) {
            return NextResponse.json(
                { error: "Missing required fields: name, componentType, competencyId, targetLevel" },
                { status: 400 }
            );
        }

        if (!Array.isArray(questionsToSave)) {
            return NextResponse.json({ error: "questions must be an array" }, { status: 400 });
        }

        const libraryComponent = await prisma.componentLibrary.create({
            data: {
                tenantId: session.user.tenantId ?? null,
                createdBy: session.user.id,
                name,
                description: description ?? null,
                componentType,
                competencyId,
                targetLevel,
                visibility: visibility || "PRIVATE",
                questions: questionsToSave,
                metadata: {}
            }
        });

        return NextResponse.json({
            success: true,
            component: libraryComponent
        });
    } catch (error) {
        console.error("Library save error:", error);
        return NextResponse.json({ error: "Failed to save to library" }, { status: 500 });
    }
}
