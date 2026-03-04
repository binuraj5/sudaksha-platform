'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

const EnhancedPagination = ({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  showLoadMore = false,
  onLoadMore
}: EnhancedPaginationProps) => {
  const [jumpToPage, setJumpToPage] = useState('');

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage('');
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {startItem}-{endItem} of {total} courses
      </div>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getVisiblePages().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <div className="px-3 py-2 text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Jump to Page */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Go to page:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpToPage}
          onChange={(e) => setJumpToPage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
          placeholder={totalPages.toString()}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
        />
        <button
          onClick={handleJumpToPage}
          disabled={!jumpToPage}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Go
        </button>
      </div>

      {/* Load More Button */}
      {showLoadMore && currentPage < totalPages && (
        <button
          onClick={onLoadMore}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Load More Courses
        </button>
      )}
    </div>
  );
};

export default EnhancedPagination;
