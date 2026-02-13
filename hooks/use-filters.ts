'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseFilter } from '../types/course';

const defaultFilters: CourseFilter = {
  search: '',
  category: [],
  domain: [],
  industryFocus: [],
  careerLevel: [],
  courseType: [],
  deliveryMode: [],
  status: ['Active'], // Public catalog shows only active courses by default
  minPrice: undefined,
  maxPrice: undefined,
  specialFeatures: [],
  sort: 'popularity',
  page: 1,
  pageSize: 12,
};

export const useFilters = (initialFilters: Partial<CourseFilter> = {}) => {
  const searchParams = useSearchParams();
  const stableInitialFilters = useMemo(() => initialFilters, [JSON.stringify(initialFilters)]);
  const [filters, setFilters] = useState<CourseFilter>({
    ...defaultFilters,
    ...stableInitialFilters
  });

  // Sync filters with URL (only on mount and when URL actually changes)
  useEffect(() => {
    const urlFilters: Partial<CourseFilter> = {};
    
    // Parse URL parameters
    const search = searchParams.get('search');
    if (search) urlFilters.search = search;
    
    const category = searchParams.get('category');
    if (category) urlFilters.category = category.split(',');
    
    const domain = searchParams.get('domain');
    if (domain) urlFilters.domain = domain.split(',');
    
    const industryFocus = searchParams.get('industry');
    if (industryFocus) urlFilters.industryFocus = industryFocus.split(',');
    
    const careerLevel = searchParams.get('level');
    if (careerLevel) urlFilters.careerLevel = careerLevel.split(',');
    
    const courseType = searchParams.get('type');
    if (courseType) urlFilters.courseType = courseType.split(',');
    
    const deliveryMode = searchParams.get('mode');
    if (deliveryMode) urlFilters.deliveryMode = deliveryMode.split(',');
    
    const status = searchParams.get('status');
    if (status) urlFilters.status = status.split(',');
    
    const minPrice = searchParams.get('minPrice');
    if (minPrice) urlFilters.minPrice = parseInt(minPrice);
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) urlFilters.maxPrice = parseInt(maxPrice);
    
    const specialFeatures = searchParams.get('features');
    if (specialFeatures) urlFilters.specialFeatures = specialFeatures.split(',');
    
    const sort = searchParams.get('sort');
    if (sort) urlFilters.sort = sort as CourseFilter['sort'];
    
    const page = searchParams.get('page');
    if (page) urlFilters.page = parseInt(page);
    
    // Only update if URL filters are different from current filters
    const currentFiltersStr = JSON.stringify(filters);
    const urlFiltersStr = JSON.stringify({ ...defaultFilters, ...stableInitialFilters, ...urlFilters });
    
    if (currentFiltersStr !== urlFiltersStr) {
      setFilters({ ...defaultFilters, ...stableInitialFilters, ...urlFilters });
    }
  }, [searchParams.toString(), stableInitialFilters]); // Use searchParams.toString() to detect actual changes

  // Update URL when filters change (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.category?.length) params.set('category', filters.category.join(','));
      if (filters.domain?.length) params.set('domain', filters.domain.join(','));
      if (filters.industryFocus?.length) params.set('industry', filters.industryFocus.join(','));
      if (filters.careerLevel?.length) params.set('level', filters.careerLevel.join(','));
      if (filters.courseType?.length) params.set('type', filters.courseType.join(','));
      if (filters.deliveryMode?.length) params.set('mode', filters.deliveryMode.join(','));
      if (filters.status?.length) params.set('status', filters.status.join(','));
      if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.specialFeatures?.length) params.set('features', filters.specialFeatures.join(','));
      if (filters.sort !== 'popularity') params.set('sort', filters.sort);
      if (filters.page !== 1) params.set('page', filters.page.toString());
      
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const updateFilter = useCallback((key: keyof CourseFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...defaultFilters, ...stableInitialFilters });
  }, [stableInitialFilters]);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.search ||
      (filters.category && filters.category.length > 0) ||
      (filters.domain && filters.domain.length > 0) ||
      (filters.industryFocus && filters.industryFocus.length > 0) ||
      (filters.careerLevel && filters.careerLevel.length > 0) ||
      (filters.courseType && filters.courseType.length > 0) ||
      (filters.deliveryMode && filters.deliveryMode.length > 0) ||
      (filters.status && filters.status.length > 0) ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      (filters.specialFeatures && filters.specialFeatures.length > 0) ||
      filters.sort !== 'popularity'
    );
  }, [filters]);

  const removeFilter = useCallback((key: keyof CourseFilter, value?: string) => {
    setFilters(prev => {
      if (value && Array.isArray(prev[key])) {
        return {
          ...prev,
          [key]: (prev[key] as string[]).filter(item => item !== value)
        };
      }
      return {
        ...prev,
        [key]: defaultFilters[key]
      };
    });
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    removeFilter,
  };
};

// Debounce hook for search
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
