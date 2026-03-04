import { NextRequest, NextResponse } from "next/server";
import { getAssessments } from "@/lib/assessment-actions";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const filters = {
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 10,
        search: searchParams.get("search") || undefined,
        status: searchParams.get("status") || undefined,
        department: searchParams.get("department") || undefined,
        type: searchParams.get("type") || undefined,
    };

    const result = await getAssessments(filters);

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
}
