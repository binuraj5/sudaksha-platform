import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses for Career Switchers - Sudaksha | Career Transition & IT Training Programs',
  description: 'Specialized programs for professionals switching careers to IT. Smooth transition with comprehensive training and placement support.',
  keywords: 'career switch, career transition, IT career change, professional transition, career switch programs',
};

export default function CareerSwitchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Courses for Career Switchers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Successfully transition to a new career with our specialized programs designed for career changers.
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Perfect for Professionals From:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-700 font-medium">Non-IT Background</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-700 font-medium">Sales & Marketing</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-700 font-medium">Finance & Accounting</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-700 font-medium">Teaching & Education</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">IT Career Foundation</h3>
            <p className="text-gray-600 mb-4">Complete program covering basics to advanced IT skills with hands-on projects.</p>
            <div className="text-blue-600 font-semibold">Duration: 8 months</div>
            <div className="text-orange-500 font-semibold mt-2">100% Placement Guarantee</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Marketing Career Switch</h3>
            <p className="text-gray-600 mb-4">Transition to digital marketing with comprehensive training and portfolio building.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
            <div className="text-orange-500 font-semibold mt-2">Placement Assistance</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Analytics Transition</h3>
            <p className="text-gray-600 mb-4">Switch to data analytics with our structured program for non-technical backgrounds.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 months</div>
            <div className="text-orange-500 font-semibold mt-2">Placement Assistance</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/demo" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Start Your Career Transition - Book a Free Demo
          </a>
        </div>
      </div>
    </div>
  );
}
