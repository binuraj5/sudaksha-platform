'use client';

import { useState, Suspense, useEffect } from 'react';
import { Search, Grid, List, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CourseCard } from '@/components/courses/course-card';
import { useCourses } from '@/hooks/use-courses';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Course } from '@/types/course';

interface DynamicCategoryPageProps {
  title: string;
  description: string;
  categoryPrimary?: 'IT' | 'NON_IT' | 'FUNCTIONAL' | 'PERSONAL_DEVELOPMENT';
  technologyDomain?: string;
}

function DynamicCategoryPageContent({
  title,
  description,
  categoryPrimary,
  technologyDomain,
}: DynamicCategoryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Debounce search
  const debouncedSearch = searchTerm.length > 2 ? searchTerm : '';

  // Build filter object
  const filters: any = {
    page: currentPage,
    search: debouncedSearch,
    categories: [],
    courseTypes: [],
    technologies: [],
    targetLevels: [],
    industries: [],
    deliveryModes: [],
    duration: { min: 0, max: 1000 },
    price: { min: 0, max: 50000 },
    rating: 0,
    sort: sortBy === 'popular' ? 'popularity' : sortBy,
  };

  // Add locked category or domain to filter
  if (categoryPrimary) {
    filters.domain = categoryPrimary === 'NON_IT' ? 'Non-IT' : categoryPrimary;
  } else if (technologyDomain) {
    filters.technologies = [technologyDomain];
  }

  const { data, isLoading, error } = useCourses(filters);

  const courses = data?.courses || [];
  const pagination = data?.pagination || {
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleEnroll = (course: Course) => {
    console.log('Enrolling in course:', course.id);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{description}</p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Found
              </h2>
              {searchTerm && (
                <p className="text-sm text-gray-600">
                  Showing results for "{searchTerm}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Sort: {sortBy === 'popular' ? 'Popular' : sortBy === 'newest' ? 'Newest' : 'Rating'}
                  {showSortMenu ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {(['popular', 'newest', 'rating'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt);
                          setShowSortMenu(false);
                          setCurrentPage(1);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                          sortBy === opt ? 'bg-blue-50 text-blue-600 font-semibold' : ''
                        }`}
                      >
                        {opt === 'popular' ? 'Most Popular' : opt === 'newest' ? 'Newest' : 'Highest Rated'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && courses.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {/* Course Grid/List */}
        <ErrorBoundary>
          {courses.length > 0 && (
            <>
              <div
                className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }`}
              >
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    viewMode={viewMode}
                    onEnroll={handleEnroll}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="py-8 flex items-center justify-between border-t border-gray-100 mt-6">
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Page <span className="font-semibold text-gray-900">{pagination.page}</span> of{' '}
                      <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage((p) => p + 1);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </ErrorBoundary>

        {/* Empty State */}
        {!isLoading && courses.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'No courses available in this category yet. Check back soon!'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DynamicCategoryPage(props: DynamicCategoryPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      }
    >
      <DynamicCategoryPageContent {...props} />
    </Suspense>
  );
}
