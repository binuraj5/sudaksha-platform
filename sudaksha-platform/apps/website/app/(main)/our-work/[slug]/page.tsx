import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Calendar, MapPin, CheckCircle2, Building2, TrendingUp, Award, Quote } from 'lucide-react';

// Prevent prerendering since this page queries the database dynamically
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const batch = await prisma.offlineBatch.findUnique({
    where: { slug },
    select: { programTitle: true, clientName: true, showClientName: true }
  });
  if (!batch) return {};
  const client = batch.showClientName ? batch.clientName : 'Enterprise Client';
  return {
    title: `${batch.programTitle} for ${client} | Sudaksha Case Study`,
    description: `Case study on the corporate training engagement: ${batch.programTitle} delivered by Sudaksha.`
  };
}

export default async function OurWorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const batch = await prisma.offlineBatch.findUnique({
    where: { slug }
  });

  if (!batch || (!batch.isPublic && batch.status !== 'PUBLISHED')) {
    return notFound();
  }

  // Anonymization Enforcements
  const displayClient = batch.showClientName ? batch.clientName : 'Confidential Enterprise Client';
  const displayLogo = batch.showClientName ? batch.clientLogoUrl : null;
  // Hard strip internal fields just in case they are logged in hydration
  batch.clientContactName = null;
  batch.clientContactEmail = null;
  batch.clientContactPhone = null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative bg-gray-900 text-white pt-32 pb-20 overflow-hidden">
        {batch.coverImageUrl && (
          <div className="absolute inset-0 z-0">
            <img src={batch.coverImageUrl} alt={batch.programTitle} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/our-work" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolio
          </Link>
          <div className="max-w-3xl">
            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 mb-6 hover:bg-indigo-500/30">
              {batch.clientIndustry} Case Study
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              {batch.programTitle}
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              Delivered for {displayClient}.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Program Overview</h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {batch.programDescription}
              </p>
            </section>

            {batch.outcomes && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Business Outcomes</h2>
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {batch.outcomes}
                  </p>
                </div>
              </section>
            )}

            {batch.skillsCovered && batch.skillsCovered.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Key Competencies Built</h2>
                <div className="flex flex-wrap gap-2 mt-4">
                  {batch.skillsCovered.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-4 py-2 text-sm bg-gray-100 text-gray-800 border-gray-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {batch.participantTestimonial && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Client Feedback</h2>
                <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
                  <Quote className="absolute top-6 left-6 w-12 h-12 text-gray-100 rotate-180" />
                  <blockquote className="relative z-10 text-xl font-medium text-gray-900 italic leading-relaxed mb-6 pl-8">
                    "{batch.participantTestimonial}"
                  </blockquote>
                  <div className="pl-8 flex items-center gap-4 border-t border-gray-50 pt-6">
                    <div>
                      <div className="font-bold text-gray-900">{batch.testimonialAuthor || 'Program Participant'}</div>
                      <div className="text-sm font-medium text-indigo-600">{batch.testimonialDesig || displayClient}</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                Engagement Snapshot
              </h3>
              
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg"><Building2 className="w-5 h-5 text-gray-600" /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Client</div>
                    <div className="font-semibold text-gray-900">{displayClient}</div>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg"><Users className="w-5 h-5 text-gray-600" /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Scale</div>
                    <div className="font-semibold text-gray-900">{batch.participantCount} Participants</div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg"><Calendar className="w-5 h-5 text-gray-600" /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Timeline</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(batch.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      {batch.endDate ? ` - ${new Date(batch.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ' (Ongoing)'}
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg"><MapPin className="w-5 h-5 text-gray-600" /></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Delivery Model</div>
                    <div className="font-semibold text-gray-900">{batch.deliveryMode.replace('_', ' ')}</div>
                    {batch.city && <div className="text-sm text-gray-600">{batch.city}, {batch.country}</div>}
                  </div>
                </li>

                {Number(batch.satisfactionScore) > 0 && (
                  <li className="flex items-start gap-3">
                    <div className="bg-green-50 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Satisfaction Score</div>
                      <div className="font-semibold text-green-700">{Number(batch.satisfactionScore).toFixed(1)} / 5.0</div>
                    </div>
                  </li>
                )}

                {batch.certificationIssued && (
                  <li className="flex items-start gap-3">
                    <div className="bg-amber-50 p-2 rounded-lg"><Award className="w-5 h-5 text-amber-600" /></div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Certification</div>
                      <div className="font-semibold text-gray-900">Successfully Certified</div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
            
            {/* CTA Box */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg text-center">
               <h4 className="text-xl font-bold mb-2">Transform Your Team</h4>
               <p className="text-indigo-100 text-sm mb-6">Drive similar strategic outcomes for your enterprise.</p>
               <Link href="/corporate-training#contact">
                 <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                   Consult with an Expert
                 </button>
               </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
