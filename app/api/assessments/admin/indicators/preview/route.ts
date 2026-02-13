import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { selectRelevantIndicators } from "@/lib/assessment/indicator-selection";
import { ProficiencyLevel } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { competencyIds, targetLevel } = body;

        if (!competencyIds || !Array.isArray(competencyIds) || !targetLevel) {
            return NextResponse.json({ error: "Missing required fields: competencyIds (array), targetLevel" }, { status: 400 });
        }

        const previewData = [];

        for (const compId of competencyIds) {
            const indicators = await selectRelevantIndicators(compId, targetLevel as ProficiencyLevel);
            previewData.push({
                competencyId: compId,
                indicators
            });
        }

        return NextResponse.json(previewData);
    } catch (error) {
        console.error("Preview indicators error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
