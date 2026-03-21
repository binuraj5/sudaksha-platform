import { MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function InterviewPrepPage({ params }: { params: { slug: string } }) {
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title} Interview Prep</h1>
          <p className="text-xl text-gray-600 mb-8 border-l-4 border-blue-600 pl-4">
            Master the most common and challenging questions asked by top tech and non-tech recruiters.
          </p>
          <div className="space-y-4 my-8">
             <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-gray-700 text-sm">Review theoretical core concepts deeply.</p>
             </div>
             <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-gray-700 text-sm">Practice whiteboard problems and system design.</p>
             </div>
             <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-gray-700 text-sm">Refine your behavioral and situational answers using the STAR method.</p>
             </div>
          </div>
          <div className="mt-10">
            <Link href="/contact" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Book a Mock Interview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
