import { NextRequest } from 'next/server';
import { getReportRecommendations } from '@/lib/recommendations/report-recommendations';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const scenario = searchParams.get('scenario') || undefined;

    const recommendations = getReportRecommendations({
        scenario,
    });

    return Response.json({ recommendations });
}
