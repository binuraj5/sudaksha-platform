import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Functional Skills Courses - Sudaksha | Communication & Soft Skills Training',
  description: 'Develop essential functional skills including communication, teamwork, problem-solving, and leadership for workplace success.',
  keywords: 'functional skills, soft skills, communication, teamwork, leadership, problem-solving',
};

export default function FunctionalSkillsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Functional Skills
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build essential workplace skills that complement your technical expertise and accelerate your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Communication</h3>
            <p className="text-gray-600 mb-4">Master professional communication, presentation skills, and corporate etiquette.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 weeks</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Leadership</h3>
            <p className="text-gray-600 mb-4">Develop leadership skills and learn to manage teams effectively.</p>
            <div className="text-blue-600 font-semibold">Duration: 8 weeks</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Problem Solving</h3>
            <p className="text-gray-600 mb-4">Enhance analytical thinking and problem-solving capabilities.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 weeks</div>
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
