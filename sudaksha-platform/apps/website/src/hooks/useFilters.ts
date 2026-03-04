'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseFilters, SortOption, ViewMode, CourseCategory, TargetLevel, BatchMode, CourseType } from '@/types/course';

const defaultFilters: CourseFilters = {
  categories: [],
  courseTypes: [],
  technologies: [],
  targetLevels: [],
  industries: [],
  deliveryModes: [],
  duration: { min: 0, max: 500 },
  price: { min: 0, max: 100000 },
  rating: 0,
  isPopular: false,
  isNew: false,
  isFinishingSchool: false,
  hasPlacementSupport: false,
  hasEMI: false,
  hasCorporateTraining: false
};

function FilterHooksInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CourseFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');

  // Initialize filters from URL
  useEffect(() => {
    const urlFilters: Partial<CourseFilters> = {};

    // Parse categories
    const categories = searchParams.getAll('categories');
    if (categories.length > 0) {
      urlFilters.categories = categories as CourseCategory[];
    }

    // Parse course types
    const courseTypes = searchParams.getAll('courseTypes');
    if (courseTypes.length > 0) {
      urlFilters.courseTypes = courseTypes as CourseType[];
    }

    // Parse technologies
    const technologies = searchParams.getAll('technologies');
    if (technologies.length > 0) {
      urlFilters.technologies = technologies;
    }

    // Parse target levels
    const targetLevels = searchParams.getAll('targetLevels');
    if (targetLevels.length > 0) {
      urlFilters.targetLevels = targetLevels as TargetLevel[];
    }

    // Parse industries
    const industries = searchParams.getAll('industries');
    if (industries.length > 0) {
      urlFilters.industries = industries;
    }
    
    // Parse delivery modes
    const deliveryModes = searchParams.getAll('deliveryModes');
    if (deliveryModes.length > 0) {
      urlFilters.deliveryModes = deliveryModes as BatchMode[];
    }
    
    // Parse duration
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');
    if (minDuration || maxDuration) {
      urlFilters.duration = {
        min: parseInt(minDuration || '0'),
        max: parseInt(maxDuration || '500')
      };
    }
    
    // Parse price
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      urlFilters.price = {
        min: parseInt(minPrice || '0'),
        max: parseInt(maxPrice || '100000')
      };
    }
    
    // Parse rating
    const rating = searchParams.get('minRating');
    if (rating) {
      urlFilters.rating = parseInt(rating);
    }
    
    // Parse boolean filters
    const booleanFilters = [
      'isPopular',
      'isNew',
      'isFinishingSchool',
      'hasPlacementSupport',
      'hasEMI',
      'hasCorporateTraining'
    ] as const;
    
    booleanFilters.forEach(filter => {
      if (searchParams.get(filter) === 'true') {
        urlFilters[filter] = true;
      }
    });
    
    // Parse sort and view mode
    const urlSort = searchParams.get('sort') as SortOption;
    if (urlSort) {
      setSort(urlSort);
    }
    
    const urlViewMode = searchParams.get('view') as ViewMode;
    if (urlViewMode) {
      setViewMode(urlViewMode);
    }
    
    // Parse search
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearch(urlSearch);
    }
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters({ ...defaultFilters, ...urlFilters });
    }
  }, [searchParams]);

  const updateURL = (newFilters: CourseFilters, newSort: SortOption, newViewMode: ViewMode, newSearch: string) => {
    const params = new URLSearchParams();
    
    // Add filters to URL
    if (newFilters.categories.length > 0) {
      newFilters.categories.forEach(cat => params.append('categories', cat));
    }
    if (newFilters.technologies.length > 0) {
      newFilters.technologies.forEach(tech => params.append('technologies', tech));
    }
    if (newFilters.targetLevels.length > 0) {
      newFilters.targetLevels.forEach(level => params.append('targetLevels', level));
    }
    if (newFilters.industries.length > 0) {
      newFilters.industries.forEach(industry => params.append('industries', industry));
    }
    if (newFilters.deliveryModes.length > 0) {
      newFilters.deliveryModes.forEach(mode => params.append('deliveryModes', mode));
    }
    
    if (newFilters.duration.min > 0 || newFilters.duration.max < 500) {
      params.append('minDuration', newFilters.duration.min.toString());
      params.append('maxDuration', newFilters.duration.max.toString());
    }
    
    if (newFilters.price.min > 0 || newFilters.price.max < 100000) {
      params.append('minPrice', newFilters.price.min.toString());
      params.append('maxPrice', newFilters.price.max.toString());
    }
    
    if (newFilters.rating > 0) {
      params.append('minRating', newFilters.rating.toString());
    }
    
    // Add boolean filters
    if (newFilters.isPopular) params.append('isPopular', 'true');
    if (newFilters.isNew) params.append('isNew', 'true');
    if (newFilters.isFinishingSchool) params.append('isFinishingSchool', 'true');
    if (newFilters.hasPlacementSupport) params.append('hasPlacementSupport', 'true');
    if (newFilters.hasEMI) params.append('hasEMI', 'true');
    if (newFilters.hasCorporateTraining) params.append('hasCorporateTraining', 'true');
    
    // Add other params
    if (newSort !== 'relevance') params.append('sort', newSort);
    if (newViewMode !== 'grid') params.append('view', newViewMode);
    if (newSearch) params.append('search', newSearch);
    
    const queryString = params.toString();
    const url = queryString ? `/courses?${queryString}` : '/courses';
    
    router.push(url, { scroll: false });
  };

  const updateFilters = (newFilters: Partial<CourseFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateURL(updatedFilters, sort, viewMode, search);
  };

  const updateSort = (newSort: SortOption) => {
    setSort(newSort);
    updateURL(filters, newSort, viewMode, search);
  };

  const updateViewMode = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    updateURL(filters, sort, newViewMode, search);
  };

  const updateSearch = (newSearch: string) => {
    setSearch(newSearch);
    updateURL(filters, sort, viewMode, newSearch);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    updateURL(defaultFilters, sort, viewMode, search);
  };

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.courseTypes.length > 0 ||
      filters.technologies.length > 0 ||
      filters.targetLevels.length > 0 ||
      filters.industries.length > 0 ||
      filters.deliveryModes.length > 0 ||
      filters.duration.min > 0 ||
      filters.duration.max < 500 ||
      filters.price.min > 0 ||
      filters.price.max < 100000 ||
      filters.rating > 0 ||
      filters.isPopular ||
      filters.isNew ||
      filters.isFinishingSchool ||
      filters.hasPlacementSupport ||
      filters.hasEMI ||
      filters.hasCorporateTraining
    );
  };

  return {
    filters,
    sort,
    viewMode,
    search,
    updateFilters,
    updateSort,
    updateViewMode,
    updateSearch,
    clearAllFilters,
    hasActiveFilters
  };
}

export const useFilters = () => {
  const [filters, setFilters] = useState<CourseFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  useEffect(() => {
    const urlFilters: Partial<CourseFilters> = {};

    // Parse categories
    const categories = searchParams.getAll('categories');
    if (categories.length > 0) {
      urlFilters.categories = categories as CourseCategory[];
    }

    // Parse course types
    const courseTypes = searchParams.getAll('courseTypes');
    if (courseTypes.length > 0) {
      urlFilters.courseTypes = courseTypes as CourseType[];
    }

    // Parse technologies
    const technologies = searchParams.getAll('technologies');
    if (technologies.length > 0) {
      urlFilters.technologies = technologies;
    }

    // Parse target levels
    const targetLevels = searchParams.getAll('targetLevels');
    if (targetLevels.length > 0) {
      urlFilters.targetLevels = targetLevels as TargetLevel[];
    }

    // Parse industries
    const industries = searchParams.getAll('industries');
    if (industries.length > 0) {
      urlFilters.industries = industries;
    }

    // Parse delivery modes
    const deliveryModes = searchParams.getAll('deliveryModes');
    if (deliveryModes.length > 0) {
      urlFilters.deliveryModes = deliveryModes as BatchMode[];
    }
    
    // Parse duration
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');
    if (minDuration || maxDuration) {
      urlFilters.duration = {
        min: parseInt(minDuration || '0'),
        max: parseInt(maxDuration || '500')
      };
    }
    
    // Parse price
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      urlFilters.price = {
        min: parseInt(minPrice || '0'),
        max: parseInt(maxPrice || '100000')
      };
    }
    
    // Parse rating
    const rating = searchParams.get('minRating');
    if (rating) {
      urlFilters.rating = parseInt(rating);
    }
    
    // Parse boolean filters
    const booleanFilters = [
      'isPopular',
      'isNew',
      'isFinishingSchool',
      'hasPlacementSupport',
      'hasEMI',
      'hasCorporateTraining'
    ] as const;
    
    booleanFilters.forEach(filter => {
      if (searchParams.get(filter) === 'true') {
        urlFilters[filter] = true;
      }
    });
    
    // Parse sort and view mode
    const urlSort = searchParams.get('sort') as SortOption;
    if (urlSort) {
      setSort(urlSort);
    }
    
    const urlViewMode = searchParams.get('view') as ViewMode;
    if (urlViewMode) {
      setViewMode(urlViewMode);
    }
    
    // Parse search
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearch(urlSearch);
    }
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters({ ...defaultFilters, ...urlFilters });
    }
  }, [searchParams]);

  const updateURL = (newFilters: CourseFilters, newSort: SortOption, newViewMode: ViewMode, newSearch: string) => {
    const params = new URLSearchParams();
    
    // Add filters to URL
    if (newFilters.categories.length > 0) {
      newFilters.categories.forEach(cat => params.append('categories', cat));
    }
    if (newFilters.technologies.length > 0) {
      newFilters.technologies.forEach(tech => params.append('technologies', tech));
    }
    if (newFilters.targetLevels.length > 0) {
      newFilters.targetLevels.forEach(level => params.append('targetLevels', level));
    }
    if (newFilters.industries.length > 0) {
      newFilters.industries.forEach(industry => params.append('industries', industry));
    }
    if (newFilters.deliveryModes.length > 0) {
      newFilters.deliveryModes.forEach(mode => params.append('deliveryModes', mode));
    }
    
    if (newFilters.duration.min > 0 || newFilters.duration.max < 500) {
      params.append('minDuration', newFilters.duration.min.toString());
      params.append('maxDuration', newFilters.duration.max.toString());
    }
    
    if (newFilters.price.min > 0 || newFilters.price.max < 100000) {
      params.append('minPrice', newFilters.price.min.toString());
      params.append('maxPrice', newFilters.price.max.toString());
    }
    
    if (newFilters.rating > 0) {
      params.append('minRating', newFilters.rating.toString());
    }
    
    // Add boolean filters
    if (newFilters.isPopular) params.append('isPopular', 'true');
    if (newFilters.isNew) params.append('isNew', 'true');
    if (newFilters.isFinishingSchool) params.append('isFinishingSchool', 'true');
    if (newFilters.hasPlacementSupport) params.append('hasPlacementSupport', 'true');
    if (newFilters.hasEMI) params.append('hasEMI', 'true');
    if (newFilters.hasCorporateTraining) params.append('hasCorporateTraining', 'true');
    
    // Add other params
    if (newSort !== 'relevance') params.append('sort', newSort);
    if (newViewMode !== 'grid') params.append('view', newViewMode);
    if (newSearch) params.append('search', newSearch);
    
    const queryString = params.toString();
    const url = queryString ? `/courses?${queryString}` : '/courses';
    
    router.push(url, { scroll: false });
  };

  const updateFilters = (newFilters: Partial<CourseFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateURL(updatedFilters, sort, viewMode, search);
  };

  const updateSort = (newSort: SortOption) => {
    setSort(newSort);
    updateURL(filters, newSort, viewMode, search);
  };

  const updateViewMode = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    updateURL(filters, sort, newViewMode, search);
  };

  const updateSearch = (newSearch: string) => {
    setSearch(newSearch);
    updateURL(filters, sort, viewMode, newSearch);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    updateURL(defaultFilters, sort, viewMode, search);
  };

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.courseTypes.length > 0 ||
      filters.technologies.length > 0 ||
      filters.targetLevels.length > 0 ||
      filters.industries.length > 0 ||
      filters.deliveryModes.length > 0 ||
      filters.duration.min > 0 ||
      filters.duration.max < 500 ||
      filters.price.min > 0 ||
      filters.price.max < 100000 ||
      filters.rating > 0 ||
      filters.isPopular ||
      filters.isNew ||
      filters.isFinishingSchool ||
      filters.hasPlacementSupport ||
      filters.hasEMI ||
      filters.hasCorporateTraining
    );
  };

  return {
    filters,
    sort,
    viewMode,
    search,
    updateFilters,
    updateSort,
    updateViewMode,
    updateSearch,
    clearAllFilters,
    hasActiveFilters
  };
};
