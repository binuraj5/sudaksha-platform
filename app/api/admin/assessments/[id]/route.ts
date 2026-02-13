import { NextRequest, NextResponse } from "next/server";
import { getAssessmentById } from "@/lib/assessment-actions";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const result = await getAssessmentById(params.id);

    if (!result.success || !result.data) {
        return NextResponse.json(
            { error: result.error || "Assessment not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(result.data);
}
