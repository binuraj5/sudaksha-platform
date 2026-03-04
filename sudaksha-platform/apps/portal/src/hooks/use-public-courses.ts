import { useState, useEffect } from 'react';
import { Course, CoursesResponse, SortOption, CourseFilters } from '@/types/course';

interface UseCoursesParams {
  page?: number;
  pageSize?: number;
  sort?: SortOption;
  search?: string;
  filters?: Partial<CourseFilters>;
}

export const useCourses = (params: UseCoursesParams = {}) => {
  const [data, setData] = useState<CoursesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    page = 1,
    pageSize = 12,
    sort = 'relevance',
    search = '',
    filters = {}
  } = params;

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      queryParams.append('sort', sort);
      
      if (search) {
        queryParams.append('search', search);
      }

      // Add filters
      if (filters.categories?.length) {
        filters.categories.forEach(cat => queryParams.append('categories', cat));
      }
      if (filters.technologies?.length) {
        filters.technologies.forEach(tech => queryParams.append('technologies', tech));
      }
      if (filters.levels?.length) {
        filters.levels.forEach(level => queryParams.append('levels', level));
      }
      if (filters.industries?.length) {
        filters.industries.forEach(industry => queryParams.append('industries', industry));
      }
      if (filters.deliveryModes?.length) {
        filters.deliveryModes.forEach(mode => queryParams.append('deliveryModes', mode));
      }
      if (filters.duration) {
        queryParams.append('minDuration', filters.duration.min.toString());
        queryParams.append('maxDuration', filters.duration.max.toString());
      }
      if (filters.price) {
        queryParams.append('minPrice', filters.price.min.toString());
        queryParams.append('maxPrice', filters.price.max.toString());
      }
      if (filters.rating) {
        queryParams.append('minRating', filters.rating.toString());
      }
      if (filters.isPopular) {
        queryParams.append('isPopular', 'true');
      }
      if (filters.isNew) {
        queryParams.append('isNew', 'true');
      }
      if (filters.isFinishingSchool) {
        queryParams.append('isFinishingSchool', 'true');
      }
      if (filters.hasPlacementSupport) {
        queryParams.append('hasPlacementSupport', 'true');
      }
      if (filters.hasEMI) {
        queryParams.append('hasEMI', 'true');
      }
      if (filters.hasCorporateTraining) {
        queryParams.append('hasCorporateTraining', 'true');
      }

      const response = await fetch(`/api/courses?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const coursesData: CoursesResponse = await response.json();
      setData(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, pageSize, sort, search, JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    refetch: fetchCourses
  };
};
