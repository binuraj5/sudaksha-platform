// Backend Filter Logic for Courses API
// This file demonstrates how to build dynamic PostgreSQL queries with Prisma
// based on the frontend filter state

import { PrismaClient } from '@prisma/client';
import { CourseFilters } from './src/types/course';

const prisma = new PrismaClient();

export async function getFilteredCourses(filters: CourseFilters) {
  // Build the WHERE clause dynamically based on active filters
  const where: any = {
    status: 'PUBLISHED', // Only show published courses
  };

  // Domain/Category Type Filter
  if (filters.categoryType) {
    where.categoryType = filters.categoryType;
  }

  // Industry Filter (multiple selections)
  if (filters.industries.length > 0) {
    where.industry = {
      in: filters.industries
    };
  }

  // Target Level Filter (multiple selections)
  if (filters.targetLevels.length > 0) {
    where.targetLevel = {
      in: filters.targetLevels
    };
  }

  // Course Type Filter (for professional courses)
  if (filters.courseTypes.length > 0) {
    where.courseType = {
      in: filters.courseTypes
    };
  }

  // Delivery Mode Filter
  if (filters.deliveryModes.length > 0) {
    where.deliveryMode = {
      in: filters.deliveryModes
    };
  }

  // Price Range Filter
  if (filters.price.min > 0 || filters.price.max < 100000) {
    where.price = {};
    if (filters.price.min > 0) {
      where.price.gte = filters.price.min;
    }
    if (filters.price.max < 100000) {
      where.price.lte = filters.price.max;
    }
  }

  // Rating Filter
  if (filters.rating > 0) {
    where.rating = {
      gte: filters.rating
    };
  }

  // Special Features Filters
  if (filters.isPopular) {
    where.isPopular = true;
  }
  if (filters.isNew) {
    where.isNew = true;
  }
  if (filters.hasPlacementSupport) {
    where.hasPlacementSupport = true;
  }
  if (filters.hasEMI) {
    where.hasEMI = true;
  }
  if (filters.hasCorporateTraining) {
    where.hasCorporateTraining = true;
  }

  // Execute the query with pagination
  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      trainer: true,
      modules: true,
      batches: true,
      reviews: true
    }
  });

  return courses;
}

// Alternative: Finishing School Query
export async function getFilteredFinishingSchoolPrograms(filters: CourseFilters) {
  const where: any = {};

  // Category Type Filter (IT vs Non-IT)
  if (filters.categoryType) {
    where.categoryType = filters.categoryType;
  }

  // Industry Filter
  if (filters.industries.length > 0) {
    where.industry = {
      in: filters.industries
    };
  }

  // Price Range Filter (if applicable)
  if (filters.price.min > 0 || filters.price.max < 50000) {
    where.price = {};
    if (filters.price.min > 0) {
      where.price.gte = filters.price.min;
    }
    if (filters.price.max < 50000) {
      where.price.lte = filters.price.max;
    }
  }

  const programs = await prisma.finishingSchool.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  return programs;
}

// API Route Example (Next.js App Router)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters into filter object
    const filters: CourseFilters = {
      categories: searchParams.getAll('categories') as any,
      courseTypes: searchParams.getAll('courseTypes') as any,
      technologies: searchParams.getAll('technologies'),
      targetLevels: searchParams.getAll('targetLevels') as any,
      industries: searchParams.getAll('industries'),
      deliveryModes: searchParams.getAll('deliveryModes') as any,
      categoryType: searchParams.get('categoryType') as any,
      duration: {
        min: parseInt(searchParams.get('minDuration') || '0'),
        max: parseInt(searchParams.get('maxDuration') || '500')
      },
      price: {
        min: parseInt(searchParams.get('minPrice') || '0'),
        max: parseInt(searchParams.get('maxPrice') || '100000')
      },
      rating: parseInt(searchParams.get('minRating') || '0'),
      isPopular: searchParams.get('isPopular') === 'true',
      isNew: searchParams.get('isNew') === 'true',
      isFinishingSchool: searchParams.get('isFinishingSchool') === 'true',
      hasPlacementSupport: searchParams.get('hasPlacementSupport') === 'true',
      hasEMI: searchParams.get('hasEMI') === 'true',
      hasCorporateTraining: searchParams.get('hasCorporateTraining') === 'true'
    };

    // Check if this is a finishing school request
    const isFinishingSchool = searchParams.get('programType') === 'finishing-school';

    const results = isFinishingSchool
      ? await getFilteredFinishingSchoolPrograms(filters)
      : await getFilteredCourses(filters);

    return Response.json({
      success: true,
      data: results,
      filters: filters
    });

  } catch (error) {
    console.error('Filter query error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch filtered results' },
      { status: 500 }
    );
  }
}
