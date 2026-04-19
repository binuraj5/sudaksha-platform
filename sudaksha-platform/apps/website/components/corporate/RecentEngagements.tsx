import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Building, Users, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export async function RecentEngagements() {
  const recentBatches = await prisma.offlineBatch.findMany({
    where: {
      isPublic: true,
      status: 'PUBLISHED',
    },
    orderBy: { startDate: 'desc' },
    take: 4,
    select: {
      id: true,
      slug: true,
      programTitle: true,
      clientName: true,
      clientIndustry: true,
      showClientName: true,
      participantCount: true,
      coverImageUrl: true,
      startDate: true,
      deliveryMode: true
    }
  });

  if (recentBatches.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 mb-4 px-3 py-1">Recent Enterprise Engagements</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600">
            A snapshot of our latest successfully delivered capacity building programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recentBatches.map((batch) => {
            const displayClient = batch.showClientName ? batch.clientName : 'Confidential Client';
            return (
              <Link href={`/our-work/${batch.slug}`} key={batch.id} className="group flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden">
                <div className="md:w-2/5 h-48 md:h-auto bg-gray-100 relative overflow-hidden flex-shrink-0">
                  {batch.coverImageUrl ? (
                    <img src={batch.coverImageUrl} alt={batch.programTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
                      <Building className="w-10 h-10 text-indigo-200" />
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800 backdrop-blur-sm border-none shadow-sm">{batch.clientIndustry}</Badge>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col justify-center flex-grow">
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">
                    {displayClient}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {batch.programTitle}
                  </h3>
                  
                  <div className="mt-auto grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400"/> {batch.participantCount} Trained</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400"/> {new Date(batch.startDate).getFullYear()}</span>
                  </div>

                  <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                    View Case Study <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-12 text-center border-t border-gray-100 pt-10">
          <Link href="/our-work" className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
            Explore Full Portfolio <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
