import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software Development Courses - Sudaksha | Full Stack & Programming Training',
  description: 'Comprehensive software development training covering frontend, backend, databases, and modern programming languages.',
  keywords: 'software development, programming, full stack, web development, mobile development, coding',
};

export default function SoftwareDevelopmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Software Development
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Become a proficient software developer with our comprehensive training programs covering modern technologies and best practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">MERN Stack Development</h3>
            <p className="text-gray-600 mb-4">Master MongoDB, Express, React, and Node.js for full-stack web development.</p>
            <div className="text-blue-600 font-semibold">Duration: 6 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Java Spring Boot</h3>
            <p className="text-gray-600 mb-4">Learn enterprise Java development with Spring Boot and microservices.</p>
            <div className="text-blue-600 font-semibold">Duration: 5 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Python Django</h3>
            <p className="text-gray-600 mb-4">Build robust web applications using Python and Django framework.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">React Native</h3>
            <p className="text-gray-600 mb-4">Develop cross-platform mobile applications using React Native.</p>
            <div className="text-blue-600 font-semibold">Duration: 4 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">.NET Core</h3>
            <p className="text-gray-600 mb-4">Build enterprise applications with .NET Core and C#.</p>
            <div className="text-blue-600 font-semibold">Duration: 5 months</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Angular Development</h3>
            <p className="text-gray-600 mb-4">Master frontend development with Angular and TypeScript.</p>
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
