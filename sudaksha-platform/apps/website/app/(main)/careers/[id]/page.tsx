import { Briefcase, ArrowLeft, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/careers" className="inline-flex items-center text-blue-600 hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Careers
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 border-b border-gray-100 pb-8">
            <div>
               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Job Role #{id}</h1>
               <div className="flex flex-wrap gap-4 text-gray-600">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Location: Remote / India</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Type: Full-Time</span>
               </div>
            </div>
            <div className="mt-6 md:mt-0">
               <Link href="/contact" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
                 Apply Now
               </Link>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 space-y-6">
            <div>
               <h2 className="text-xl font-bold text-gray-900">About the Role</h2>
               <p>We are looking for passionate individuals to join our mission of transforming education across India. In this role, you will be instrumental in scaling our impact and delivering top-tier experiences to our learners and corporate partners.</p>
            </div>
            <div>
               <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
               <ul className="list-disc pl-5 space-y-2">
                 <li>Demonstrated track record of success in related functions.</li>
                 <li>Strong communication and interpersonal skills.</li>
                 <li>Ability to thrive in a fast-paced, high-growth environment.</li>
               </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
