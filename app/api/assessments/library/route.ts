import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { resolveCreatedByUserId } from "@/lib/resolve-created-by";

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
        const search = searchParams.get("search");
        const category = searchParams.get("category");

        const userId = session.user.id;
        const tenantId = session.user.tenantId ?? undefined;

        // Build where: user can see GLOBAL + ORG + their own PRIVATE
        const andClauses: Record<string, unknown>[] = [
            {
                OR: [
                    { visibility: "GLOBAL", publishedToGlobal: true },
                    ...(tenantId ? [{ visibility: "ORGANIZATION" as const, tenantId }] : []),
                    { visibility: "PRIVATE" as const, createdBy: userId }
                ]
            }
        ];
        if (competencyId) andClauses.push({ competencyId });
        if (componentType) andClauses.push({ componentType });
        if (targetLevel) andClauses.push({ targetLevel });
        if (visibility) andClauses.push({ visibility });
        if (category) andClauses.push({ competency: { category } });
        if (search?.trim()) {
            const term = search.trim();
            andClauses.push({
                OR: [
                    { name: { contains: term, mode: "insensitive" } },
                    { description: { contains: term, mode: "insensitive" } }
                ]
            });
        }
        const where = andClauses.length > 1 ? { AND: andClauses } : andClauses[0];

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

        let resolvedCompetencyId = competencyId;
        let resolvedTargetLevel = targetLevel;
        let resolvedComponentType = componentType;

        if (sourceComponentId && !questionsToSave) {
            const component = await prisma.assessmentModelComponent.findFirst({
                where: { id: sourceComponentId },
                include: { questions: true, competency: true }
            });
            if (!component) {
                return NextResponse.json({ error: "Source component not found" }, { status: 404 });
            }
            questionsToSave = component.questions.map((q) => ({
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options ?? [],
                correctAnswer: q.correctAnswer ? String(q.correctAnswer) : null,
                points: q.points ?? 1,
                timeLimit: q.timeLimit ?? null,
                linkedIndicators: q.linkedIndicators ?? [],
                explanation: q.explanation ?? null
            }));
            if (!resolvedCompetencyId && component.competencyId) resolvedCompetencyId = component.competencyId;
            if (!resolvedTargetLevel && component.targetLevel) resolvedTargetLevel = String(component.targetLevel);
            if (!resolvedComponentType && component.componentType) resolvedComponentType = component.componentType;
        }

        if (!name || !resolvedComponentType || !resolvedCompetencyId || !resolvedTargetLevel) {
            return NextResponse.json(
                { error: "Missing required fields: name, componentType, competencyId, targetLevel" },
                { status: 400 }
            );
        }

        if (!Array.isArray(questionsToSave)) {
            return NextResponse.json({ error: "questions must be an array" }, { status: 400 });
        }

        const createdBy = await resolveCreatedByUserId(session);

        const libraryComponent = await prisma.componentLibrary.create({
            data: {
                tenantId: (session.user as { tenantId?: string }).tenantId ?? null,
                createdBy,
                name,
                description: description ?? null,
                componentType: resolvedComponentType,
                competencyId: resolvedCompetencyId,
                targetLevel: resolvedTargetLevel,
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
        const msg = error instanceof Error ? error.message : String(error);
        const isPrisma = error && typeof error === "object" && "code" in error;
        const details = isPrisma && typeof (error as { meta?: unknown }).meta === "object"
            ? (error as { meta?: { target?: string[] } }).meta?.target
            : undefined;
        return NextResponse.json(
            {
                error: "Failed to save to library",
                details: process.env.NODE_ENV === "development" ? msg : undefined,
                ...(details && { hint: details })
            },
            { status: 500 }
        );
    }
}
