import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessments/admin/models/[modelId]/components
 * List all components for a specific assessment model
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string }>}
) {
    try {
        const session = await getApiSession();
        const user = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { modelId } = await params;
        const components = await prisma.assessmentModelComponent.findMany({
            where: { modelId },
            include: {
                competency: {
                    select: {
                        name: true,
                        category: true,
                        indicators: true
                    }
                },
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: { order: "asc" }
        });

        return NextResponse.json(components);
    } catch (error) {
        console.error("Error fetching components:", error);
        return NextResponse.json({ error: "Failed to fetch components" }, { status: 500 });
    }
}

/**
 * POST /api/assessments/admin/models/[modelId]/components
 * Add a new component (competency-based) to the model
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ modelId: string }>}
) {
    try {
        const session = await getApiSession();
        const user = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.userType === "SUPER_ADMIN";
        if (!session?.user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { competencyId, weight, targetLevel, order, isRequired, isTimed, customDuration, componentType } = body;

        if (!competencyId) {
            return NextResponse.json({ error: "Competency ID is required" }, { status: 400 });
        }

        // Get default indicator IDs from the competency if none provided
        let indicatorIds = body.indicatorIds;
        if (!indicatorIds) {
            const competency = await prisma.competency.findUnique({
                where: { id: competencyId },
                include: { indicators: { select: { id: true } } }
            });
            indicatorIds = competency?.indicators.map(i => i.id) || [];
        }

        const { modelId: modelIdPost } = await params;
        const component = await prisma.assessmentModelComponent.create({
            data: {
                modelId: modelIdPost,
                competencyId,
                componentType: componentType ?? "QUESTIONNAIRE",
                weight: weight ?? 1.0,
                targetLevel,
                indicatorIds,
                order: order ?? 0,
                isRequired: isRequired ?? true,
                isTimed: isTimed ?? true,
                customDuration
            },
            include: {
                competency: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(component);
    } catch (error) {
        console.error("Error creating component:", error);
        return NextResponse.json({ error: "Failed to add component" }, { status: 500 });
    }
}
