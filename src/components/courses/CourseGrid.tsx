import { Loader2, AlertCircle } from 'lucide-react';
import CourseCard from './CourseCard';
import { Course } from '../../types/course';

interface CourseGridProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
}

const CourseGrid = ({ courses, loading, error, viewMode }: CourseGridProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading courses</h3>
        <p className="text-gray-600 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
        <p className="text-gray-600 text-center max-w-md mb-4">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Clear Filters
        </button>
      </div>
    );
  }

  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
    : 'space-y-4';

  return (
    <div className={`${gridClasses} w-full`}>
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default CourseGrid;
