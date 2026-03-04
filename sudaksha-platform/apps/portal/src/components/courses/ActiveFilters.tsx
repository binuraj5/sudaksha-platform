'use client';

import { X } from 'lucide-react';
import { CourseFilters } from '@/types/course';

interface ActiveFiltersProps {
  filters: CourseFilters;
  onClearFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

const ActiveFilters = ({ filters, onClearFilter, onClearAll }: ActiveFiltersProps) => {
  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.technologies.length > 0 ||
      (filters.levels?.length ?? 0) > 0 ||
      (filters.industries?.length ?? 0) > 0 ||
      (filters.modes?.length ?? 0) > 0 ||
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

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.categories.length;
    count += filters.technologies.length;
    count += filters.levels?.length ?? 0;
    count += filters.industries?.length ?? 0;
    count += filters.modes?.length ?? 0;
    if (filters.duration.min > 0 || filters.duration.max < 500) count++;
    if (filters.price.min > 0 || filters.price.max < 100000) count++;
    if (filters.rating > 0) count++;
    if (filters.isPopular) count++;
    if (filters.isNew) count++;
    if (filters.isFinishingSchool) count++;
    if (filters.hasPlacementSupport) count++;
    if (filters.hasEMI) count++;
    if (filters.hasCorporateTraining) count++;
    return count;
  };

  if (!hasActiveFilters()) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white border-b">
      <span className="text-sm text-gray-600">Active Filters ({getActiveFilterCount()}):</span>

      {/* Category Filters */}
      {filters.categories.map(category => (
        <button
          key={category}
          onClick={() => onClearFilter('categories', category)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
        >
          {category.replace('_', ' ')}
          <X className="w-3 h-3" />
        </button>
      ))}

      {/* Technology Filters */}
      {filters.technologies.map(tech => (
        <button
          key={tech}
          onClick={() => onClearFilter('technologies', tech)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
        >
          {tech}
          <X className="w-3 h-3" />
        </button>
      ))}

      {/* Level Filters */}
      {filters.levels?.map(level => (
        <button
          key={level}
          onClick={() => onClearFilter('levels', level)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
        >
          {level.replace('_', ' ')}
          <X className="w-3 h-3" />
        </button>
      ))}

      {/* Industry Filters */}
      {filters.industries?.map(industry => (
        <button
          key={industry}
          onClick={() => onClearFilter('industries', industry)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors"
        >
          {industry}
          <X className="w-3 h-3" />
        </button>
      ))}

      {/* Mode Filters */}
      {filters.modes?.map(mode => (
        <button
          key={mode}
          onClick={() => onClearFilter('modes', mode)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm hover:bg-pink-200 transition-colors"
        >
          {mode}
          <X className="w-3 h-3" />
        </button>
      ))}

      {/* Duration Filter */}
      {(filters.duration.min > 0 || filters.duration.max < 500) && (
        <button
          onClick={() => onClearFilter('duration')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
        >
          Duration: {filters.duration.min}-{filters.duration.max} hours
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Price Filter */}
      {(filters.price.min > 0 || filters.price.max < 100000) && (
        <button
          onClick={() => onClearFilter('price')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm hover:bg-indigo-200 transition-colors"
        >
          Price: ₹{filters.price.min.toLocaleString()}-₹{filters.price.max.toLocaleString()}
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Rating Filter */}
      {filters.rating > 0 && (
        <button
          onClick={() => onClearFilter('rating')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
        >
          {filters.rating}+ Stars
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Boolean Filters */}
      {filters.isPopular && (
        <button
          onClick={() => onClearFilter('isPopular')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          Popular
          <X className="w-3 h-3" />
        </button>
      )}

      {filters.isNew && (
        <button
          onClick={() => onClearFilter('isNew')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          New
          <X className="w-3 h-3" />
        </button>
      )}

      {filters.isFinishingSchool && (
        <button
          onClick={() => onClearFilter('isFinishingSchool')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          Finishing School
          <X className="w-3 h-3" />
        </button>
      )}

      {filters.hasPlacementSupport && (
        <button
          onClick={() => onClearFilter('hasPlacementSupport')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          Placement Support
          <X className="w-3 h-3" />
        </button>
      )}

      {filters.hasEMI && (
        <button
          onClick={() => onClearFilter('hasEMI')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          EMI Available
          <X className="w-3 h-3" />
        </button>
      )}

      {filters.hasCorporateTraining && (
        <button
          onClick={() => onClearFilter('hasCorporateTraining')}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
        >
          Corporate Training
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Clear All Button */}
      <button
        onClick={onClearAll}
        className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilters;
