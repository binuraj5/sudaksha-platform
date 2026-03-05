import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const survey = await prisma.survey.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!survey) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        return NextResponse.json(survey);
    } catch (error) {
        console.error("Error fetching survey:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
