import { NextRequest, NextResponse } from 'next/server';
import { Course, CoursesResponse, SortOption } from '@/types/course';
import { getCourses } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const sort = searchParams.get('sort') as SortOption || 'relevance';
    const search = searchParams.get('search') || '';

    // Parse filters
    const categories = searchParams.getAll('categories');
    const technologies = searchParams.getAll('technologies');
    const levels = searchParams.getAll('levels');
    const industries = searchParams.getAll('industries');
    const modes = searchParams.getAll('modes');
    const minDuration = parseInt(searchParams.get('minDuration') || '0');
    const maxDuration = parseInt(searchParams.get('maxDuration') || '500');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '100000');
    const minRating = parseInt(searchParams.get('minRating') || '0');
    const isPopular = searchParams.get('isPopular') === 'true';
    const isNew = searchParams.get('isNew') === 'true';
    const isFinishingSchool = searchParams.get('isFinishingSchool') === 'true';
    const hasPlacementSupport = searchParams.get('hasPlacementSupport') === 'true';
    const hasEMI = searchParams.get('hasEMI') === 'true';
    const hasCorporateTraining = searchParams.get('hasCorporateTraining') === 'true';

    // Get courses from database
    const coursesResponse = await getCourses();

    // Handle error response
    if (!coursesResponse.success) {
      return NextResponse.json(
        { error: coursesResponse.error || 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    // Apply filters
    let filteredCourses = coursesResponse.courses.filter((course: any) => {
      // Search filter
      if (search && !course.name.toLowerCase().includes(search.toLowerCase()) &&
        !course.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categories.length > 0 && !categories.includes(course.category)) {
        return false;
      }

      // Technology filter
      if (technologies.length > 0) {
        const hasMatchingTech = technologies.some((tech: string) =>
          course.skillTags?.some((tag: string) =>
            tag.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasMatchingTech) return false;
      }

      // Level filter
      if (levels.length > 0 && !levels.includes(course.audienceLevel)) {
        return false;
      }

      // Duration filter
      if (course.duration < minDuration || course.duration > maxDuration) {
        return false;
      }

      // Price filter
      if (course.price < minPrice || course.price > maxPrice) {
        return false;
      }

      // Rating filter
      if (course.rating < minRating) {
        return false;
      }

      // Boolean filters
      if (isPopular && !course.isPopular) return false;
      if (isNew && !course.isNew) return false;
      if (isFinishingSchool && !course.isFinishingSchool) return false;
      if (hasPlacementSupport && !course.hasPlacementSupport) return false;
      if (hasEMI && !course.hasEMI) return false;
      if (hasCorporateTraining && !course.hasCorporateTraining) return false;

      return true;
    });

    // Sort courses
    filteredCourses.sort((a: any, b: any) => {
      switch (sort) {
        case 'popular':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'duration':
          return a.duration - b.duration;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    // Pagination
    const total = filteredCourses.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    const response: CoursesResponse = {
      courses: paginatedCourses,
      total,
      page,
      pageSize,
      totalPages
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
