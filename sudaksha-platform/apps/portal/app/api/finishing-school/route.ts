import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const sort = searchParams.get('sort') || 'relevance';
    const search = searchParams.get('search') || '';

    // Get filter parameters
    const isIT = searchParams.get('isIT') === 'true';
    const industries = searchParams.getAll('industries');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '100000');
    const minRating = parseInt(searchParams.get('minRating') || '0');

    // Mock finishing school data
    const allPrograms = [
      {
        id: 'fs1',
        slug: 'software-engineering-foundation',
        name: 'Software Engineering Foundation',
        description: 'Comprehensive foundation program for aspiring software engineers',
        shortDescription: 'Build strong fundamentals in software engineering',
        duration: 180,
        price: 29999,
        rating: 4.6,
        status: 'PUBLISHED',
        isIT: true,
        industry: 'GENERIC',
        skillTags: ['Programming', 'Data Structures', 'Algorithms', 'System Design'],
        learningObjectives: ['Master programming fundamentals', 'Understand data structures', 'Learn algorithm design'],
        imageUrl: '/images/finishing-school/se-foundation.jpg',
        language: 'English',
        certification: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'fs2',
        slug: 'business-analysis-foundation',
        name: 'Business Analysis Foundation',
        description: 'Essential skills for business analysts and consultants',
        shortDescription: 'Master business analysis and requirements gathering',
        duration: 120,
        price: 24999,
        rating: 4.4,
        status: 'PUBLISHED',
        isIT: false,
        industry: 'CONSULTING',
        skillTags: ['Requirements Analysis', 'Process Modeling', 'Stakeholder Management'],
        learningObjectives: ['Gather and analyze requirements', 'Create process models', 'Manage stakeholders'],
        imageUrl: '/images/finishing-school/ba-foundation.jpg',
        language: 'English',
        certification: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'fs3',
        slug: 'data-analytics-foundation',
        name: 'Data Analytics Foundation',
        description: 'Foundation program for data analytics and business intelligence',
        shortDescription: 'Learn data analysis and visualization techniques',
        duration: 90,
        price: 19999,
        rating: 4.5,
        status: 'PUBLISHED',
        isIT: true,
        industry: 'GENERIC',
        skillTags: ['Excel', 'SQL', 'Data Visualization', 'Statistics'],
        learningObjectives: ['Master Excel for data analysis', 'Learn SQL queries', 'Create compelling visualizations'],
        imageUrl: '/images/finishing-school/da-foundation.jpg',
        language: 'English',
        certification: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    // Apply filters
    let filteredPrograms = allPrograms.filter(program => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!program.name.toLowerCase().includes(searchLower) &&
            !program.description.toLowerCase().includes(searchLower) &&
            !program.skillTags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // IT/Non-IT filter
      if (searchParams.has('isIT') && program.isIT !== isIT) {
        return false;
      }

      // Industry filter
      if (industries.length > 0 && !industries.includes(program.industry)) {
        return false;
      }

      // Price filter
      if (program.price < minPrice || program.price > maxPrice) {
        return false;
      }

      // Rating filter
      if (program.rating < minRating) {
        return false;
      }

      return true;
    });

    // Apply sorting
    switch (sort) {
      case 'price-low':
        filteredPrograms.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredPrograms.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredPrograms.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredPrograms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default: // relevance
        // Keep original order
        break;
    }

    // Pagination
    const total = filteredPrograms.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const programs = filteredPrograms.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      programs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching finishing school programs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch finishing school programs' },
      { status: 500 }
    );
  }
}
