import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Building, MapPin, ArrowRight, Quote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Work | Sudaksha Corporate Training',
  description: 'Explore our track record of transforming enterprise teams through outcome-driven managed training programs.',
};

// Prevent prerendering since this page queries the database
export const revalidate = 0;

export default async function OurWorkPage() {
  const batches = await prisma.offlineBatch.findMany({
    where: {
      isPublic: true,
      status: 'PUBLISHED'
    },
    orderBy: { startDate: 'desc' },
    select: {
      id: true,
      slug: true,
      programTitle: true,
      programDescription: true,
      skillsCovered: true,
      clientName: true,
      clientCompanyDescription: true,
      clientIndustry: true,
      showClientName: true,
      participantCount: true,
      startDate: true,
      deliveryMode: true,
      city: true,
      country: true,
      participantTestimonial: true,
      testimonialAuthor: true,
      coverImageUrl: true,
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-indigo-100 text-indigo-800 mb-4 hover:bg-indigo-100 border-none">Corporate Portfolio</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Impact That Speaks <span className="text-indigo-600 block">Volumes</span>
          </h1>
          <p className="text-xl text-gray-600">
            A registry of our successfully delivered capability-building engagements for leading enterprises globally.
          </p>
        </div>

        {/* Grid List */}
        {batches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Portfolio Updating</h3>
            <p className="text-gray-500">We're currently logging our latest corporate engagements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {batches.map((batch) => {
              const displayClient = batch.showClientName 
                ? batch.clientName 
                : (batch.clientCompanyDescription || 'Confidential Client');
              return (
                <Link href={`/our-work/${batch.slug}`} key={batch.id} className="group flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  
                  {/* Hero Cover Image */}
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    {batch.coverImageUrl ? (
                      <img src={batch.coverImageUrl} alt={batch.programTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
                        <Building className="w-12 h-12 text-indigo-200" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm border-none shadow-sm">{batch.clientIndustry}</Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">
                        {displayClient}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                        {batch.programTitle}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                        {batch.programDescription}
                      </p>
                    </div>

                    {/* Metadata Items */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="w-4 h-4 text-gray-400" />
                        {batch.participantCount} Learners
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {new Date(batch.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 font-medium col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {batch.deliveryMode === 'ONSITE' && batch.city ? `${batch.city}, ${batch.country}` : 
                         batch.deliveryMode === 'HYBRID' ? 'Hybrid (Remote + On-site)' : 'Remote Delivery'}
                      </div>
                    </div>

                    {/* Quick Quote (If Available) */}
                    {batch.participantTestimonial && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm italic text-gray-600 border border-gray-100 relative">
                        <Quote className="absolute top-2 left-2 w-3 h-3 text-indigo-200" />
                        <span className="ml-4 line-clamp-2">"{batch.participantTestimonial}"</span>
                      </div>
                    )}

                    <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                      Read Case Study <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
