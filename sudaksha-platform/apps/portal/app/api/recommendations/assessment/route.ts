/**
 * GET /api/recommendations/assessment?roleLevel=JUNIOR&targetAudience=STUDENTS
 * Enhancement #5: Returns contextual assessment creation recommendations.
 */
import { NextRequest } from 'next/server';
import { getAssessmentRecommendations } from '@/lib/recommendations/assessment-recommendations';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const roleLevel = searchParams.get('roleLevel') || undefined;
  const targetAudience = (searchParams.get('targetAudience') as 'STUDENTS' | 'EMPLOYEES' | 'ALL') || undefined;
  const recommendations = getAssessmentRecommendations({
    roleLevel,
    targetAudience,
    roleCategory: searchParams.get('roleCategory') || undefined
  });
  return Response.json({ recommendations });
}
