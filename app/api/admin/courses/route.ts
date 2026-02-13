import { NextRequest, NextResponse } from 'next/server';
import { createCourse, getCourses, updateCourse, deleteCourse } from '@/lib/actions/courses';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filters from query params
    const filters: any = {};

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }

    if (searchParams.get('minPrice')) {
      filters.minPrice = Number(searchParams.get('minPrice'));
    }

    if (searchParams.get('maxPrice')) {
      filters.maxPrice = Number(searchParams.get('maxPrice'));
    }

    // Handle array parameters
    const arrayParams = ['category', 'categories', 'domain', 'industryFocus', 'industry', 'industries', 'careerLevel', 'targetLevel', 'targetLevels', 'levels', 'courseType', 'deliveryMode', 'status', 'specialFeatures'];
    arrayParams.forEach(param => {
      const values = searchParams.getAll(param);
      if (values.length > 0) {
        filters[param] = values;
      }
    });

    const result = await getCourses(filters);

    if (!result.success || !result.courses) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      courses: result.courses,
      pagination: {
        page: 1,
        pageSize: 12,
        total: result.courses.length,
        totalPages: Math.ceil(result.courses.length / 12),
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  } catch (error) {
    console.error('Admin courses API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCourse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      courseId: result.courseId
    });
  } catch (error) {
    console.error('Admin create course API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
