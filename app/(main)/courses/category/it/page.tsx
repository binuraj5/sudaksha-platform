import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IT Courses - Sudaksha | Software Development & Technology Training',
  description: 'Comprehensive IT training programs in software development, testing, and technology. Learn programming, web development, mobile apps, and more.',
  keywords: 'IT courses, software development, programming, web development, mobile development, testing',
};

export default function ITCoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IT Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master in-demand IT skills with our comprehensive training programs designed for the modern tech industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Full Stack Development</h3>
            <p className="text-gray-600 mb-4">Learn frontend, backend, and database technologies to become a complete developer.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile App Development</h3>
            <p className="text-gray-600 mb-4">Build native and cross-platform mobile applications for iOS and Android.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Software Testing</h3>
            <p className="text-gray-600 mb-4">Master manual and automated testing techniques with industry tools.</p>
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
