import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseFilter } from '@/lib/schemas/course';

export function useFilters(initialFilters: Partial<CourseFilter> = {}) {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CourseFilter>(() => {
    // ... initial state calculation ...
    // Note: I am not replacing the whole state init block to keep it simple, just header and updateFilter logic if needed
    // But since I need to replace the import at line 3, and the casting at line 34/38...
    // I will replace the import first, then the callback.
    const params: CourseFilter = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category')?.split(',').filter(Boolean) || [],
      domain: searchParams.get('domain')?.split(',').filter(Boolean) || [],
      industry: (searchParams.get('industry') ?? searchParams.get('industryFocus'))?.split(',').filter(Boolean) || [],
      targetLevel: (searchParams.get('targetLevel') ?? searchParams.get('careerLevel'))?.split(',').filter(Boolean) || [],
      courseType: searchParams.get('courseType')?.split(',').filter(Boolean) || [],
      deliveryMode: searchParams.get('deliveryMode')?.split(',').filter(Boolean) || [],
      status: searchParams.get('status')?.split(',').filter(Boolean) || [],
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      specialFeatures: searchParams.get('specialFeatures')?.split(',').filter(Boolean) || [],
      sort: (searchParams.get('sort') as CourseFilter['sort']) || 'popularity',
      ...initialFilters,
    };
    return params;
  });

  const updateFilter = useCallback((key: keyof CourseFilter, value: any) => {
    setFilters((prev: CourseFilter) => {
      const newFilters = { ...prev, [key]: value };

      // Update URL params
      const params = new URLSearchParams(searchParams.toString());
      const paramKey = key as string; // Fix type error

      if (value === undefined || (Array.isArray(value) && value.length === 0)) {
        params.delete(paramKey);
      } else if (Array.isArray(value)) {
        params.set(paramKey, value.join(','));
      } else {
        params.set(paramKey, String(value));
      }

      // Update URL without page reload
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);

      return newFilters;
    });
  }, [searchParams]);

  const clearFilters = useCallback(() => {
    setFilters({
      sort: 'popularity',
      ...initialFilters,
    });

    // Clear URL params
    const params = new URLSearchParams();
    params.set('sort', 'popularity');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [initialFilters]);

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.category && filters.category.length > 0) ||
    (filters.domain && filters.domain.length > 0) ||
    (filters.industry && filters.industry.length > 0) ||
    (filters.targetLevel && filters.targetLevel.length > 0) ||
    (filters.courseType && filters.courseType.length > 0) ||
    (filters.deliveryMode && filters.deliveryMode.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.specialFeatures && filters.specialFeatures.length > 0)
  );

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}
