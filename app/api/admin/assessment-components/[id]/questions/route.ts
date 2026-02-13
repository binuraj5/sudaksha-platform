import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComponentQuestionSchema } from "@/lib/validations/assessment-component";

// POST: Add question to component
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const validation = ComponentQuestionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const question = await prisma.componentQuestion.create({
            data: {
                componentId: id,
                ...validation.data,
                // Ensure unique order if not provided or handle reordering logic here
            }
        });

        // Update total questions count and component metadata
        await prisma.assessmentModelComponent.update({
            where: { id },
            data: {

            }
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error) {
        console.error("Error adding question:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET: Fetch questions for a component
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const questions = await prisma.componentQuestion.findMany({
            where: { componentId: id },
            orderBy: { order: "asc" }
        });

        return NextResponse.json(questions);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
