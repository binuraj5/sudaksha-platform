import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses for Mid-Level Professionals (3-7 years) - Sudaksha | Leadership & Advanced Skills',
  description: 'Specialized programs for mid-level professionals. Develop leadership skills, technical expertise, and strategic thinking.',
  keywords: 'mid-level courses, leadership training, technical leadership, 3-7 years experience, career advancement',
};

export default function MidLevelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Courses for Mid-Level Professionals (3-7 years)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transition to leadership roles and master advanced technologies with our specialized mid-level programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Leadership</h3>
            <p className="text-gray-600 mb-4">Develop team leadership, architecture design, and project management skills.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cloud Architecture</h3>
            <p className="text-gray-600 mb-4">Master enterprise cloud architecture and migration strategies.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI/ML Engineering</h3>
            <p className="text-gray-600 mb-4">Build and deploy production-grade machine learning systems.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 months</div>
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
