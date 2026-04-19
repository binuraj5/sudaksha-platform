import { CourseCard } from './CourseCard';
import Link from 'next/link';

export function CourseListingLayout({ 
  title, 
  description, 
  courses 
}: { 
  title: string, 
  description: string, 
  courses: any[] 
}) {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            {title}
          </h1>
          <p className="text-xl text-gray-600">
            {description}
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">New Portfolio Updating</h3>
            <p className="text-gray-500 max-w-md mx-auto">We are currently integrating our latest curriculum and cohort schedules for this category. Check back shortly.</p>
            <Link href="/courses" className="mt-6 inline-block text-indigo-600 font-semibold hover:underline">
              Browse All Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        )}
      </div>
    </div>
  );
}
