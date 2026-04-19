import { Building2, MapPin, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getPublishedBatches() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/public/offlinebatches?limit=6&isPublic=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.batches || [];
  } catch {
    return [];
  }
}

export async function OurWorkPreview() {
  const batches = await getPublishedBatches();

  if (!batches || batches.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Impact in Action</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover how leading organizations partner with us to upskill their teams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch: any) => (
            <Link
              key={batch.id}
              href={`/our-work/${batch.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 h-full flex flex-col">
                {/* Client Logo/Name */}
                <div className="mb-4">
                  {batch.clientLogoUrl && (
                    <img
                      src={batch.clientLogoUrl}
                      alt={batch.clientName}
                      className="h-12 object-contain"
                    />
                  )}
                  {!batch.clientLogoUrl && batch.showClientName && (
                    <h3 className="text-lg font-semibold text-gray-900">{batch.clientName}</h3>
                  )}
                </div>

                {/* Program Title */}
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {batch.programTitle}
                </h4>

                {/* Program Description */}
                {batch.programDescription && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {batch.programDescription}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                  {batch.clientIndustry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>{batch.clientIndustry}</span>
                    </div>
                  )}
                  {batch.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{batch.city}</span>
                    </div>
                  )}
                  {batch.participantCount && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{batch.participantCount} Participants</span>
                    </div>
                  )}
                  {batch.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{new Date(batch.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {/* Outcome Metrics */}
                {(batch.completionRate || batch.satisfactionScore) && (
                  <div className="border-t pt-4 flex gap-4 text-sm">
                    {batch.completionRate && (
                      <div>
                        <div className="font-bold text-blue-600">{batch.completionRate}%</div>
                        <div className="text-gray-600">Completion</div>
                      </div>
                    )}
                    {batch.satisfactionScore && (
                      <div>
                        <div className="font-bold text-blue-600">{Number(batch.satisfactionScore).toFixed(1)}/5</div>
                        <div className="text-gray-600">Satisfaction</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/our-work">View All Success Stories</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
