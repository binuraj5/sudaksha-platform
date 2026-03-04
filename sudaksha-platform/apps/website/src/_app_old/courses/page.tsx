'use client';

import { useState, Suspense } from 'react';
import { Search, Filter, Star, TrendingUp, Clock, Award } from 'lucide-react';
import { useCourses } from '@/hooks/use-courses';
import { useFilters } from '@/hooks/useFilters';
import CourseFilters from '@/components/courses/CourseFilters';
import CourseSearch from '@/components/courses/CourseSearch';
import CourseGrid from '@/components/courses/CourseGrid';
import CourseSortAndView from '@/components/courses/CourseSortAndView';
import ActiveFilters from '@/components/courses/ActiveFilters';
import EnhancedPagination from '@/components/courses/EnhancedPagination';

function CoursesPageContent() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { filters, sort, viewMode, search, updateFilters, updateSort, updateViewMode, updateSearch, clearAllFilters } = useFilters();

  const { data, loading, error } = useCourses({
    page: currentPage,
    pageSize: 12,
    sort,
    search,
    filters
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'categories':
        updateFilters({
          categories: filters.categories.filter(cat => cat !== value)
        });
        break;
      case 'technologies':
        updateFilters({
          technologies: filters.technologies.filter(tech => tech !== value)
        });
        break;
      case 'levels':
        updateFilters({
          levels: filters.levels.filter(level => level !== value)
        });
        break;
      case 'industries':
        updateFilters({
          industries: filters.industries.filter(industry => industry !== value)
        });
        break;
      case 'modes':
        updateFilters({
          modes: filters.modes.filter(mode => mode !== value)
        });
        break;
      case 'duration':
        updateFilters({ duration: { min: 0, max: 500 } });
        break;
      case 'price':
        updateFilters({ price: { min: 0, max: 100000 } });
        break;
      case 'rating':
        updateFilters({ rating: 0 });
        break;
      case 'isPopular':
        updateFilters({ isPopular: false });
        break;
      case 'isNew':
        updateFilters({ isNew: false });
        break;
      case 'isFinishingSchool':
        updateFilters({ isFinishingSchool: false });
        break;
      case 'hasPlacementSupport':
        updateFilters({ hasPlacementSupport: false });
        break;
      case 'hasEMI':
        updateFilters({ hasEMI: false });
        break;
      case 'hasCorporateTraining':
        updateFilters({ hasCorporateTraining: false });
        break;
    }
  };

  const handleQuickFilter = (filterType: string) => {
    switch (filterType) {
      case 'popular':
        updateFilters({ isPopular: !filters.isPopular });
        break;
      case 'new':
        updateFilters({ isNew: !filters.isNew });
        break;
      case 'placement':
        updateFilters({ hasPlacementSupport: !filters.hasPlacementSupport });
        break;
      case 'finishing':
        updateFilters({ isFinishingSchool: !filters.isFinishingSchool });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="px-4 py-12 max-w-screen-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Transform Your Career with Industry-Curated Programs
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <CourseSearch
              value={search}
              onChange={updateSearch}
              placeholder="Search courses by name, technology, or keyword..."
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleQuickFilter('popular')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.isPopular
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-700 text-white hover:bg-blue-600'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Most Popular</span>
            </button>
            <button
              onClick={() => handleQuickFilter('new')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.isNew
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-700 text-white hover:bg-blue-600'
                }`}
            >
              <Star className="w-4 h-4" />
              <span>New</span>
            </button>
            <button
              onClick={() => handleQuickFilter('placement')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.hasPlacementSupport
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-700 text-white hover:bg-blue-600'
                }`}
            >
              <Award className="w-4 h-4" />
              <span>High Placement Rate</span>
            </button>
            <button
              onClick={() => handleQuickFilter('finishing')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.isFinishingSchool
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-700 text-white hover:bg-blue-600'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Finishing School</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <CourseFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearAll={clearAllFilters}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onClearFilter={handleClearFilter}
              onClearAll={clearAllFilters}
            />

            {/* Sort and View Controls */}
            {data && (
              <CourseSortAndView
                sort={sort}
                viewMode={viewMode}
                total={data.total}
                page={data.page}
                pageSize={data.pageSize}
                onSortChange={updateSort}
                onViewModeChange={updateViewMode}
              />
            )}

            {/* Course Grid */}
            <div className="bg-white rounded-lg shadow-sm">
              <CourseGrid
                courses={data?.courses || []}
                loading={loading}
                error={error}
                viewMode={viewMode}
              />
            </div>

            {/* Enhanced Pagination */}
            {data && data.totalPages > 1 && (
              <EnhancedPagination
                currentPage={data.page}
                totalPages={data.totalPages}
                total={data.total}
                pageSize={data.pageSize}
                onPageChange={handlePageChange}
                showLoadMore={true}
                onLoadMore={() => handlePageChange(currentPage + 1)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading courses...</div>}>
      <CoursesPageContent />
    </Suspense>
  );
}
