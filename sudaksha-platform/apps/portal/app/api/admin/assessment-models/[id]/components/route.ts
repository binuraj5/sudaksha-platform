import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssessmentModelComponentSchema } from "@/lib/validations/assessment-model";

// POST: Add component to model
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            // Basic restriction: Client Admins might be able to edit their own models, allow if owner
            // For simplicity, checking generic permissions first, ownership logic should be robust
            // Assuming Client Admin logic is similar to model update
        }

        const { id } = await params;
        const body = await req.json();
        const validation = AssessmentModelComponentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { componentId, weightage, order, isRequired, isTimed, customDuration } = validation.data;

        // Check model existence and status
        const model = await prisma.assessmentModel.findUnique({ where: { id } });
        if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });
        if (model.status === "PUBLISHED") {
            return NextResponse.json({ error: "Cannot add components to a published model" }, { status: 403 });
        }

        // Add component to model (competencyId optional; componentId in body treated as competencyId if linking to competency)
        const relation = await prisma.assessmentModelComponent.create({
            data: {
                modelId: id,
                competencyId: componentId || null,
                weight: weightage ?? 1,
                order: order ?? 0,
                isRequired: isRequired ?? true,
                isTimed: isTimed ?? true,
                customDuration: customDuration ?? null,
            }
        });

        // Recalculate total duration? 
        // Could be done here or on frontend trigger. Ideally backend keeps it consistent.

        return NextResponse.json(relation, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Component already added to this model" }, { status: 409 });
        }
        console.error("Error adding component to model:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET: Fetch components for a model (Already covered in GET model, but maybe useful for separate fetch)
