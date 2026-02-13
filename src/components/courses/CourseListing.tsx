'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import CourseGrid from './CourseGrid';
import { Course, CourseFilters, ViewMode } from '../../types/course';

interface CourseListingProps {
  title?: string;
  subtitle?: string;
  endpoint?: string;
  filters?: CourseFilters;
  showFilters?: boolean;
  showViewToggle?: boolean;
  showCarousel?: boolean;
  itemsPerPage?: number;
  emptyMessage?: string;
  className?: string;
}

const CourseListing = ({
  title = "Featured Courses",
  subtitle = "Discover our most popular programs",
  endpoint = '/api/courses/featured',
  filters,
  showFilters = false,
  showViewToggle = true,
  showCarousel = false,
  itemsPerPage = 9,
  emptyMessage = "No courses found",
  className = ""
}: CourseListingProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Build query string from filters
  const queryString = new URLSearchParams({
    page: currentPage.toString(),
    limit: itemsPerPage.toString(),
    ...(filters && Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && typeof value !== 'object') {
        acc[key] = value.toString();
      } else if (Array.isArray(value)) {
        acc[key] = value.join(',');
      }
      return acc;
    }, {} as Record<string, string>))
  }).toString();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['courses', endpoint, queryString],
    queryFn: async () => {
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    }
  });

  const courses = response?.courses || [];
  const totalPages = response?.totalPages || 1;

  // Carousel logic
  const visibleCourses = showCarousel 
    ? courses.slice(carouselIndex, carouselIndex + 3)
    : courses;

  const nextSlide = () => {
    if (courses.length > 3) {
      setCarouselIndex((prev) => (prev + 1) % (courses.length - 2));
    }
  };

  const prevSlide = () => {
    if (courses.length > 3) {
      setCarouselIndex((prev) => (prev - 1 + courses.length - 2) % (courses.length - 2));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {showFilters && (
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {showViewToggle && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
            )}
          </div>
        </div>

        {/* Carousel Controls */}
        {showCarousel && courses.length > 3 && (
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={prevSlide}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: courses.length - 2 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === carouselIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        )}

        {/* Course Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={showCarousel ? 'grid md:grid-cols-3 gap-8' : ''}
        >
          <CourseGrid
            courses={visibleCourses}
            loading={isLoading}
            error={error ? 'Failed to load courses' : null}
            viewMode={showCarousel ? 'grid' : viewMode}
          />
        </motion.div>

        {/* Pagination */}
        {!showCarousel && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View All Button */}
        {showCarousel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-12"
          >
            <a
              href="/courses"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              View All Courses
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseListing;
