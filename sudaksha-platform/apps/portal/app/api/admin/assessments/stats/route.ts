import { NextResponse } from "next/server";
import { getAssessmentStats } from "@/lib/assessment-actions";

export async function GET() {
    const result = await getAssessmentStats();

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
}
