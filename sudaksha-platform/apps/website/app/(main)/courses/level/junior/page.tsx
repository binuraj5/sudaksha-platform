import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses for Junior Professionals (1-3 years) - Sudaksha | Career Growth Training',
  description: 'Advanced training programs for professionals with 1-3 years experience. Accelerate your career growth with specialized skills.',
  keywords: 'junior professional courses, career growth, upskilling, 1-3 years experience, professional development',
};

export default function JuniorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Courses for Junior Professionals (1-3 years)
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accelerate your career growth with advanced programs designed for professionals looking to upgrade their skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Full Stack Development</h3>
            <p className="text-gray-600 mb-4">Master microservices, cloud deployment, and advanced architectural patterns.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">DevOps Engineering</h3>
            <p className="text-gray-600 mb-4">Learn CI/CD, containerization, and infrastructure automation.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Science & ML</h3>
            <p className="text-gray-600 mb-4">Advance your data skills with machine learning and deep learning.</p>
            <div className="text-blue-600 font-semibold">Duration: 5 months</div>
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
