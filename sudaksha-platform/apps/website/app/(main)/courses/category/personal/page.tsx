import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Development Courses - Sudaksha | Self-Improvement & Growth',
  description: 'Personal development programs focusing on time management, goal setting, confidence building, and continuous learning.',
  keywords: 'personal development, self-improvement, time management, goal setting, confidence building',
};

export default function PersonalDevelopmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personal Development
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Invest in yourself with our personal development programs designed to unlock your full potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Time Management</h3>
            <p className="text-gray-600 mb-4">Learn effective time management techniques to boost productivity and work-life balance.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 weeks</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Goal Setting & Achievement</h3>
            <p className="text-gray-600 mb-4">Master the art of setting and achieving meaningful personal and professional goals.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 weeks</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Confidence Building</h3>
            <p className="text-gray-600 mb-4">Build self-confidence and overcome limiting beliefs to achieve your dreams.</p>
            <div className="text-blue-600 font-semibold">Duration: 8 weeks</div>
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
