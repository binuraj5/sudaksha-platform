export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access our comprehensive collection of learning materials, guides, and industry insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Blog Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Blog</h2>
            <p className="text-gray-600 mb-4">
              Latest articles on technology trends, career advice, and industry insights
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-gray-700">• Top 10 Skills for 2024</li>
              <li className="text-gray-700">• Career Change Guide</li>
              <li className="text-gray-700">• Tech Industry Trends</li>
            </ul>
            <a href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
              Read More →
            </a>
          </div>

          {/* Webinars Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Webinars</h2>
            <p className="text-gray-600 mb-4">
              Free live sessions with industry experts and trainers
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-gray-700">• AI & Machine Learning</li>
              <li className="text-gray-700">• Cloud Computing Basics</li>
              <li className="text-gray-700">• Career Development</li>
            </ul>
            <a href="/webinars" className="text-blue-600 hover:text-blue-800 font-medium">
              Join Now →
            </a>
          </div>

          {/* Downloads Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Downloads</h2>
            <p className="text-gray-600 mb-4">
              Free guides, course catalogs, and learning materials
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-gray-700">• Course Catalog 2024</li>
              <li className="text-gray-700">• Career Guide PDF</li>
              <li className="text-gray-700">• Skill Assessment Test</li>
            </ul>
            <a href="/downloads" className="text-blue-600 hover:text-blue-800 font-medium">
              Download →
            </a>
          </div>

          {/* Case Studies Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Case Studies</h2>
            <p className="text-gray-600 mb-4">
              Success stories from our students and corporate clients
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-gray-700">• Career Transformation</li>
              <li className="text-gray-700">• Corporate Training Impact</li>
              <li className="text-gray-700">• Placement Success</li>
            </ul>
            <a href="/case-studies" className="text-blue-600 hover:text-blue-800 font-medium">
              View Stories →
            </a>
          </div>

          {/* FAQ Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">FAQ</h2>
            <p className="text-gray-600 mb-4">
              Frequently asked questions about courses and training
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-gray-700">• Course Selection</li>
              <li className="text-gray-700">• Payment Options</li>
              <li className="text-gray-700">• Certification Process</li>
            </ul>
            <a href="/faq" className="text-blue-600 hover:text-blue-800 font-medium">
              Get Answers →
            </a>
          </div>

          {/* Community Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Community</h2>
            <p className="text-gray-600 mb-4">
              Join our learning community and connect with peers
            </p>
            <ul className="space-y-2 mb-4">
              <li className="text-gray-700">• Student Forums</li>
              <li className="text-gray-700">• Alumni Network</li>
              <li className="text-gray-700">• Study Groups</li>
            </ul>
            <a href="/community" className="text-blue-600 hover:text-blue-800 font-medium">
              Join Community →
            </a>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-blue-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-6">
            Subscribe to our newsletter for the latest courses and resources
          </p>
          <div className="flex justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-l-lg text-gray-900 w-64"
            />
            <button className="px-6 py-3 bg-orange-500 rounded-r-lg hover:bg-orange-600">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
