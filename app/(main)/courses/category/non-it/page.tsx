import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Non-IT Courses - Sudaksha | Business & Management Training',
  description: 'Professional development courses in business management, marketing, finance, and operations for career growth.',
  keywords: 'business courses, management training, marketing, finance, operations, professional development',
};

export default function NonITCoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Non-IT Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your business acumen and professional skills with our comprehensive non-IT training programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Management</h3>
            <p className="text-gray-600 mb-4">Develop essential management and leadership skills for career advancement.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Marketing</h3>
            <p className="text-gray-600 mb-4">Learn modern marketing strategies and digital tools for business growth.</p>
            <div className="text-blue-600 font-semibold">Duration: 2 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Management</h3>
            <p className="text-gray-600 mb-4">Master financial planning, analysis, and management fundamentals.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/demo" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Book a Free Demo
          </a>
        </div>
      </div>
    </div>
  );
}
