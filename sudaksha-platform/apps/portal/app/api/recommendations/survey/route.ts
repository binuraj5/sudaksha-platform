import { NextRequest } from 'next/server';
import { getSurveyRecommendations } from '@/lib/recommendations/survey-recommendations';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const purpose = searchParams.get('purpose') || undefined;
    const targetAudience = searchParams.get('targetAudience') || undefined;

    const recommendations = getSurveyRecommendations({
        purpose,
        targetAudience,
    });

    return Response.json({ recommendations });
}
