import { MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RoadmapPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/resources" className="inline-flex items-center text-blue-600 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title} Roadmap</h1>
          <p className="text-xl text-gray-600 mb-8 pb-8 border-b border-gray-100">
            A comprehensive, step-by-step guide to mastering the skills required to excel in this field. Start your structured learning journey today.
          </p>
          <div className="py-8 text-center text-gray-500">
            <p>Detailed milestone tracking, course prerequisites, and phase-by-phase learning resources are being loaded into this roadmap.</p>
          </div>
          <div className="mt-6 text-center">
            <Link href="/courses" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Explore Related Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
