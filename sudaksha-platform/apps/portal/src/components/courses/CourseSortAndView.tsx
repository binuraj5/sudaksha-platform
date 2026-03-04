'use client';

import { useState } from 'react';
import { Grid, List, ChevronDown } from 'lucide-react';
import { SortOption, ViewMode } from '@/types/course';

interface CourseSortAndViewProps {
  sort: SortOption;
  viewMode: ViewMode;
  total: number;
  page: number;
  pageSize: number;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'duration', label: 'Duration' },
  { value: 'newest', label: 'Newest First' }
];

const CourseSortAndView = ({
  sort,
  viewMode,
  total,
  page,
  pageSize,
  onSortChange,
  onViewModeChange
}: CourseSortAndViewProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const currentSortLabel = sortOptions.find(option => option.value === sort)?.label || 'Relevance';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-4 py-3 border-b border-gray-200 gap-4">
      {/* Results Count */}
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}-{endItem}</span> of{' '}
        <span className="font-medium">{total}</span> courses
      </div>

      <div className="flex items-center space-x-4 w-full sm:w-auto">
        {/* Sort Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="w-full sm:w-auto flex items-center justify-between space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="truncate">{currentSortLabel}</span>
            <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none ${
                      sort === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-l-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-r-md transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseSortAndView;
