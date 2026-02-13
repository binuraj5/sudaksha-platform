import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { AssessmentComponentSchema } from "@/lib/validations/assessment-component";

// GET: List all components (with filtering)
export async function GET(req: Request) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const category = searchParams.get("category");

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { has: search } }
            ];
        }

        if (category) {
            where.category = category;
        }

        const components = await prisma.assessmentModelComponent.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        });

        return NextResponse.json(components);
    } catch (error) {
        console.error("Error fetching components:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new component
export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = AssessmentComponentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { industries, experienceLevel, ...data } = validation.data;

        // Schema uses id (cuid); no slug. Require modelId for create (AssessmentModelComponent belongs to a model).
        const payload = data as unknown as { modelId?: string; competencyId?: string; weight?: number; order?: number; isRequired?: boolean; isTimed?: boolean; customDuration?: number };
        if (!payload.modelId) {
            return NextResponse.json({ error: "modelId is required" }, { status: 400 });
        }

        const component = await prisma.assessmentModelComponent.create({
            data: {
                modelId: payload.modelId,
                competencyId: payload.competencyId ?? null,
                weight: payload.weight ?? 1,
                order: payload.order ?? 0,
                isRequired: payload.isRequired ?? true,
                isTimed: payload.isTimed ?? true,
                customDuration: payload.customDuration ?? null,
            }
        });

        return NextResponse.json(component, { status: 201 });
    } catch (error) {
        console.error("Error creating component:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
