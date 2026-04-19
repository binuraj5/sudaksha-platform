import { prisma } from '@/lib/prisma';

export type CourseFilterArgs = {
  categoryPrimary?: 'IT' | 'NON_IT' | 'FUNCTIONAL' | 'PERSONAL_DEVELOPMENT' | 'INDUSTRY_SPECIFIC' | string;
  technologyDomain?: string;
  limit?: number;
};

/**
 * Centralized data fetching utility for the 9 static catalog domain pages.
 * Queries `categoryPrimary` for the 4 Audience Category routes.
 * Queries `technologyDomain` for the 5 Tech Domain routes.
 *
 * Uses a cross-column OR fallback to handle both pre- and post-migration schemas:
 *   - New schema: categoryPrimary / technologyDomain columns
 *   - Legacy schema: categoryType / category columns
 */
export async function getCoursesByFilter({ categoryPrimary, technologyDomain, limit = 50 }: CourseFilterArgs) {
  // Build OR conditions dynamically — never push empty {} which would match all rows
  const orConditions: any[] = [];

  if (categoryPrimary) {
    orConditions.push({ categoryPrimary });           // new column
    orConditions.push({ categoryType: categoryPrimary }); // legacy fallback
  }

  if (technologyDomain) {
    orConditions.push({ technologyDomain });           // new column
    orConditions.push({ category: technologyDomain }); // legacy fallback
  }

  const courses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      // Only apply OR filter if at least one condition was provided
      ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      shortDescription: true,
      imageUrl: true,
      durationDays: true,
      durationHours: true,
      categoryPrimary: true,
      technologyDomain: true,
      deliveryMode: true,
      rating: true,
      totalReviews: true,
      skillTags: true,
      basePrice: true,
      discountedPrice: true,
      currency: true,
    }
  });

  return courses;
}
