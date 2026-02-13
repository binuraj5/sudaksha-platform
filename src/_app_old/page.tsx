export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Sudaksha
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Professional IT Training Platform - Empowering careers through quality education and industry-relevant skills
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Explore Courses
            </button>
            <button className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Book Demo
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Corporates</h2>
            <p className="text-gray-600 mb-4">Custom training solutions for your team</p>
            <a href="/for-corporates" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn More →
            </a>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Individuals</h2>
            <p className="text-gray-600 mb-4">Advance your career with our courses</p>
            <a href="/for-individuals" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn More →
            </a>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Institutions</h2>
            <p className="text-gray-600 mb-4">Partner with us for educational excellence</p>
            <a href="/for-institutions" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn More →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
