import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { AssessmentModelSchema } from "@/lib/validations/assessment-model";

// GET: List all models
export async function GET(req: Request) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "CLIENT_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        // const visibility = searchParams.get("visibility");

        const where: any = {};

        // Filter logic for Client Admins (scope by clientId; schema has no visibility)
        if (session.user.role === "CLIENT_ADMIN") {
            where.clientId = (session.user as { clientId?: string }).clientId;
        }

        if (search) {
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ]
                }
            ];
        }

        const models = await prisma.assessmentModel.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { components: true }
                },
                components: {
                    orderBy: { order: "asc" },
                    take: 4
                }
            }
        });

        return NextResponse.json(models);
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new model
export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN" && session.user.role !== "CLIENT_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = AssessmentModelSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { targetIndustries, experienceLevel, visibility, ...data } = validation.data;

        // Ensure Client Admins can only create models linked to their client
        let clientId = data.clientId;
        if (session.user.role === "CLIENT_ADMIN") {
            clientId = (session.user as { clientId?: string }).clientId ?? null;
        }

        // Verify code uniqueness (schema uses code, not slug)
        const code = (data as { code?: string }).code ?? (data as { slug?: string }).slug;
        const existing = code ? await prisma.assessmentModel.findUnique({
            where: { code: typeof code === "string" ? code : "" }
        }) : null;

        if (existing) {
            return NextResponse.json({ error: "Model with this code already exists" }, { status: 409 });
        }

        // Build data object conditionally to handle optional clientId
        const createData: any = {
            name: data.name,
            code: code ?? `model-${Date.now()}`,
            description: data.description ?? null,
            createdBy: session.user.id,
            status: "DRAFT",
            isTemplate: false,
        };
        
        // Only add clientId if it exists (for CLIENT_ADMIN role)
        if (clientId) {
            createData.clientId = clientId;
        }

        const model = await prisma.assessmentModel.create({
            data: createData
        });

        return NextResponse.json(model, { status: 201 });
    } catch (error) {
        console.error("Error creating model:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
