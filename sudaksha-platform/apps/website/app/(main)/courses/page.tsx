'use client';

import { useState, Suspense, useEffect } from 'react';
import { Search, Grid, List, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

import { CourseCard } from '@/components/courses/course-card';
import { NewFilters } from '@/components/courses/new-filters';
import { useInfiniteCourses } from '@/hooks/use-courses';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Course } from '@/types/course';

const popularTags = [
  'Web Development', 'Data Science', 'Machine Learning', 'Cloud Computing',
  'Mobile Development', 'DevOps', 'UI/UX Design', 'Blockchain'
];

const fallbackCourses: Course[] = [
  {
    id: "fb-1", name: "Java Full Stack Development", slug: "java-built-stack-development", category: "Software Development",
    durationHours: 320, duration: 320, price: 45000, status: "PUBLISHED",
    description: "Master front-end and back-end development using Java Spring Boot and React.",
    learningObjectives: ["React", "Spring Boot", "Microservices"],
    curriculum: [{ title: "Basics", description: "Intro" }], domain: "IT", industryFocus: "Technology",
    careerLevel: "Beginner", audienceLevel: "Beginner", courseType: "Technology", deliveryMode: "Live Online",
    specialFeatures: ["Most Popular", "Placement Support"], rating: 4.8, isPopular: true, isNew: false, isFinishingSchool: false, hasPlacementSupport: true, hasEMI: false, hasCorporateTraining: false
  },
  {
    id: "fb-2", name: "MERN Stack Web Development", slug: "mern-stack-web-development", category: "Software Development",
    durationHours: 240, duration: 240, price: 40000, status: "PUBLISHED",
    description: "Learn MongoDB, Express.js, React, and Node.js to build scalable web applications.",
    learningObjectives: ["MongoDB", "Express", "React", "Node.js"],
    curriculum: [{ title: "Basics", description: "Intro" }], domain: "IT", industryFocus: "Technology",
    careerLevel: "Beginner", audienceLevel: "Beginner", courseType: "Technology", deliveryMode: "Live Online",
    specialFeatures: ["Placement Support"], rating: 4.7, isPopular: false, isNew: false, isFinishingSchool: false, hasPlacementSupport: true, hasEMI: false, hasCorporateTraining: false
  },
  {
    id: "fb-3", name: "Data Analytics Professional", slug: "data-analytics-professional", category: "Data Science",
    durationHours: 200, duration: 200, price: 42000, status: "PUBLISHED",
    description: "Master Python, SQL, Tableau, and Excel to become a data-driven decision maker.",
    learningObjectives: ["Python", "SQL", "Tableau"],
    curriculum: [{ title: "Basics", description: "Intro" }], domain: "IT", industryFocus: "Technology",
    careerLevel: "Beginner", audienceLevel: "Beginner", courseType: "Technology", deliveryMode: "Live Online",
    specialFeatures: ["Most Popular"], rating: 4.9, isPopular: true, isNew: false, isFinishingSchool: false, hasPlacementSupport: false, hasEMI: false, hasCorporateTraining: false
  },
  {
    id: "fb-4", name: "AWS Solutions Architect", slug: "aws-solutions-architect", category: "Cloud Computing",
    durationHours: 160, duration: 160, price: 35000, status: "PUBLISHED",
    description: "Prepare for the AWS Certified Solutions Architect - Associate exam.",
    learningObjectives: ["AWS services", "Architecture patterns", "Security"],
    curriculum: [{ title: "Basics", description: "Intro" }], domain: "IT", industryFocus: "Technology",
    careerLevel: "Intermediate", audienceLevel: "Intermediate", courseType: "Technology", deliveryMode: "Live Online",
    specialFeatures: [], rating: 4.6, isPopular: false, isNew: false, isFinishingSchool: false, hasPlacementSupport: false, hasEMI: false, hasCorporateTraining: false
  },
  {
    id: "fb-5", name: "Manual & Automation Testing", slug: "manual-and-automation-testing", category: "Software Testing",
    durationHours: 180, duration: 180, price: 38000, status: "PUBLISHED",
    description: "Learn QA methodologies, Selenium, API testing, and CI/CD integration.",
    learningObjectives: ["Selenium", "TestNG", "Postman"],
    curriculum: [{ title: "Basics", description: "Intro" }], domain: "IT", industryFocus: "Technology",
    careerLevel: "Beginner", audienceLevel: "Beginner", courseType: "Technology", deliveryMode: "Live Online",
    specialFeatures: ["Placement Support"], rating: 4.7, isPopular: false, isNew: false, isFinishingSchool: false, hasPlacementSupport: true, hasEMI: false, hasCorporateTraining: false
  },
  {
    id: "fb-6", name: "Business Analysis Foundation", slug: "business-analysis-foundation", category: "Business",
    durationHours: 120, duration: 120, price: 30000, status: "PUBLISHED",
    description: "Learn requirements gathering, agile methodologies, and stakeholder management.",
    learningObjectives: ["Agile", "UML", "Jira"],
    curriculum: [{ title: "Basics", description: "Intro" }], domain: "Non-IT", industryFocus: "Technology",
    careerLevel: "Beginner", audienceLevel: "Beginner", courseType: "Functional", deliveryMode: "Live Online",
    specialFeatures: ["EMI Available"], rating: 4.5, isPopular: false, isNew: false, isFinishingSchool: false, hasPlacementSupport: false, hasEMI: true, hasCorporateTraining: false
  }
] as any;

function CoursesPageContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // New filter state
  const [filters, setFilters] = useState({
    domain: 'All' as 'IT' | 'Non-IT' | 'All',
    industries: [] as string[],
    levels: [] as string[],
    types: [] as string[],
    modes: [] as ('Live Online' | 'Offline' | 'Hybrid')[],
    features: [] as string[],
    priceRange: [0, 50000] as [number, number], // kept for type compat, not shown in UI
    sort: 'popular' as 'popular' | 'newest' | 'rating'
  });

  // Master Data State
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
  const [availableCourseTypes, setAvailableCourseTypes] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [industriesRes, courseTypesRes, levelsRes] = await Promise.all([
          fetch('/api/admin/master-data?type=industry').then(r => r.json()),
          fetch('/api/admin/master-data?type=courseType').then(r => r.json()),
          fetch('/api/admin/master-data?type=level').then(r => r.json())
        ]);

        if (industriesRes.success) setAvailableIndustries(industriesRes.data.map((i: any) => i.name));
        if (courseTypesRes.success) setAvailableCourseTypes(courseTypesRes.data.map((i: any) => i.name));
        if (levelsRes.success) setAvailableLevels(levelsRes.data.map((i: any) => i.name));
      } catch (error) {
        console.error('Failed to fetch master data filters', error);
      }
    };
    fetchMasterData();
  }, []);

  // Debounce search
  const debouncedSearch = searchTerm.length > 2 ? searchTerm : '';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteCourses({
    page: 1,
    search: debouncedSearch,
    categories: [],
    courseTypes: filters.types as any,
    technologies: [],
    targetLevels: filters.levels as any,
    industries: filters.industries,
    deliveryModes: filters.modes as any,
    duration: { min: 0, max: 1000 },
    price: { min: filters.priceRange[0], max: filters.priceRange[1] },
    rating: 0,
    sort: (filters.sort === 'popular' ? 'popularity' : filters.sort) as any,
    domain: filters.domain === 'All' ? undefined : [filters.domain] as any,
  });

  const fetchedCourses = data?.pages.flatMap(page => page.courses) || [];
  const hasActiveFilters = debouncedSearch !== '' || filters.domain !== 'All' || filters.industries.length > 0 || filters.levels.length > 0 || filters.types.length > 0 || filters.modes.length > 0;
  const courses = fetchedCourses.length > 0 ? fetchedCourses : (!isLoading && !hasActiveFilters ? fallbackCourses : []);

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      domain: 'All',
      industries: [],
      levels: [],
      types: [],
      modes: [],
      features: [],
      priceRange: [0, 50000],
      sort: 'popular'
    });
  };

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
            <h1 className="text-4xl font-bold mb-4">
              Discover Your Next Learning Journey
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Explore our comprehensive catalog of courses designed to accelerate your career
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for courses, topics, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Popular Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 lg:flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showMobileFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Filters */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
              <NewFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                className="lg:sticky lg:top-6"
                availableIndustries={availableIndustries}
                availableCourseTypes={availableCourseTypes}
                availableLevels={availableLevels}
              />
            </div>
          </div>

          {/* Course List */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {courses.length} Courses Found
                  </h2>
                  <p className="text-sm text-gray-600">
                    Showing filtered results
                  </p>
                </div>

                <div className="flex items-center gap-4">
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
                  <div className={`${viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                    }`}>
                    {courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        viewMode={viewMode}
                        onEnroll={handleEnroll}
                      />
                    ))}
                  </div>

                  {/* Infinite Scroll Trigger */}
                  <div ref={loadMoreRef.loadMoreRef} className="py-8 text-center">
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading more courses...</span>
                      </div>
                    )}
                    {!hasNextPage && courses.length > 0 && (
                      <p className="text-gray-500 text-sm">You've reached the end of the course catalog</p>
                    )}
                  </div>
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
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    }>
      <CoursesPageContent />
    </Suspense>
  );
}
