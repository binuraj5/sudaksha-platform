import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; surveyId: string }> }
) {
    const session = await getApiSession();
    const { clientId, surveyId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const survey = await prisma.survey.findUnique({
            where: { id: surveyId },
            include: {
                questions: { orderBy: { order: 'asc' } }
            }
        });

        if (!survey || survey.tenantId !== clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(survey);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; surveyId: string }> }
) {
    const session = await getApiSession();
    const { clientId, surveyId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await req.json();

        // Simplified update for now, mainly for status or settings
        const survey = await prisma.survey.update({
            where: { id: surveyId },
            data: body
        });

        return NextResponse.json(survey);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
