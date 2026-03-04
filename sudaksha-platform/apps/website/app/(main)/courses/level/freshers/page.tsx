import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses for Freshers - Sudaksha | Entry-Level IT Training & Placement Programs',
  description: 'Specially designed courses for fresh graduates and beginners. Start your IT career with our comprehensive training and placement assistance.',
  keywords: 'fresher courses, entry-level training, freshers jobs, campus placement, career start, IT training for freshers',
};

export default function FreshersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Courses for Freshers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kickstart your career with our foundation programs designed specifically for fresh graduates and beginners.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Why Choose Our Fresher Programs?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">85%+</div>
              <div className="text-gray-600">Placement Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">6 LPA+</div>
              <div className="text-gray-600">Average Starting Salary</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Hiring Partners</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete IT Foundation</h3>
            <p className="text-gray-600 mb-4">Comprehensive program covering programming, databases, web development, and soft skills.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 months</div>
            <div className="text-orange-500 font-semibold mt-2">Includes Placement Assistance</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Java Full Stack Development</h3>
            <p className="text-gray-600 mb-4">Learn Java, Spring Boot, React, and MySQL to become a job-ready full stack developer.</p>
            <div className="text-blue-600 font-semibold">Duration: 5 months</div>
            <div className="text-orange-500 font-semibold mt-2">Includes Placement Assistance</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Python & Data Science</h3>
            <p className="text-gray-600 mb-4">Start your data science journey with Python, machine learning basics, and data visualization.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
            <div className="text-orange-500 font-semibold mt-2">Includes Placement Assistance</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-orange-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Software Testing Fundamentals</h3>
            <p className="text-gray-600 mb-4">Learn manual and automated testing with Selenium, JIRA, and industry best practices.</p>
            <div className="text-blue-600 font-semibold">Duration: 3 months</div>
            <div className="text-orange-500 font-semibold mt-2">Includes Placement Assistance</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-red-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Marketing Basics</h3>
            <p className="text-gray-600 mb-4">Master SEO, social media marketing, content creation, and Google Analytics.</p>
            <div className="text-blue-600 font-semibold">Duration: 2 months</div>
            <div className="text-orange-500 font-semibold mt-2">Includes Placement Assistance</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-indigo-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Communication</h3>
            <p className="text-gray-600 mb-4">Develop essential workplace skills including communication, teamwork, and professionalism.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 weeks</div>
            <div className="text-orange-500 font-semibold mt-2">Includes Placement Assistance</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Program Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Industry-Recognized Certification</h3>
                <p className="text-gray-600 text-sm">Get certified upon completion with industry-recognized credentials.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Mock Interviews & Resume Building</h3>
                <p className="text-gray-600 text-sm">Prepare for interviews with mock sessions and professional resume help.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Real Project Experience</h3>
                <p className="text-gray-600 text-sm">Work on real projects to build your portfolio and gain practical experience.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lifetime Placement Support</h3>
                <p className="text-gray-600 text-sm">Get lifetime access to job opportunities and career guidance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/demo" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Start Your Journey - Book a Free Demo
          </a>
        </div>
      </div>
    </div>
  );
}
