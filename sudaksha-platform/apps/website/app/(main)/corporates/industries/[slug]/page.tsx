import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Flame, Building2, ChevronRight, Zap } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

export const metadata: Metadata = {
  title: 'Industry-Specific Corporate Training | Sudaksha',
  description: 'Custom corporate training solutions tailored for your industry.',
};

// Map of our 12 detailed industries
const INDUSTRY_DETAILS: Record<string, {
  name: string;
  tagline: string;
  theme: string;
}> = {
  'fintech': { name: 'FinTech', tagline: 'Build secure, compliant financial systems your regulators trust', theme: 'from-blue-600 to-cyan-500' },
  'ecommerce': { name: 'E-Commerce', tagline: 'Scale high-transaction platforms that convert, retain and delight', theme: 'from-purple-600 to-pink-500' },
  'healthcare': { name: 'Healthcare', tagline: 'HIPAA-compliant systems that clinicians and patients trust', theme: 'from-emerald-600 to-teal-500' },
  'pharma': { name: 'Pharma', tagline: 'GMP-compliant training for every phase from discovery to market', theme: 'from-cyan-600 to-blue-500' },
  'logistics': { name: 'Logistics & Supply Chain', tagline: 'Real-time visibility and optimised operations for modern supply chains', theme: 'from-orange-600 to-amber-500' },
  'edtech': { name: 'EdTech', tagline: 'Scalable learning platforms with pedagogically sound architecture', theme: 'from-indigo-600 to-blue-500' },
  'government': { name: 'Government', tagline: 'Digital India compliant systems for better citizen service delivery', theme: 'from-blue-800 to-blue-600' },
  'defence': { name: 'Defence', tagline: 'Mission-critical security systems built to military-grade standards', theme: 'from-slate-700 to-slate-600' },
  'aviation': { name: 'Aviation', tagline: 'Safety-critical systems trained to DGCA, EASA and DO-178C standards', theme: 'from-sky-600 to-blue-500' },
  'travel': { name: 'Travel & Hospitality', tagline: 'GDS-integrated platforms delivering seamless guest experiences', theme: 'from-rose-600 to-orange-500' },
  'retail': { name: 'Retail & FMCG', tagline: 'Omnichannel retail operations powered by data-driven insights', theme: 'from-pink-600 to-rose-500' },
  'real-estate': { name: 'Real Estate', tagline: 'RERA-compliant PropTech platforms from listing to closing', theme: 'from-amber-600 to-orange-500' }
};

export default function IndustryDeepDivePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Fallbacks if a random slug is entered
  const details = INDUSTRY_DETAILS[slug] || {
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    tagline: 'Customized workforce training for your sector',
    theme: 'from-sudaksha-blue-600 to-sudaksha-blue-400'
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 relative overflow-hidden">
      {/* Subtle background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <Link 
          href="/corporates#industry-training"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium mb-12"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Industries
        </Link>
        
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-4 h-4" />
            Industry Training Vertical
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">{details.name}</span>{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${details.theme}`}>
              Training Solutions
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">
            {details.tagline}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Domain Specificity Card */}
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Domain-First Curriculum</h3>
            <p className="text-gray-600 leading-relaxed">
              We design curriculums tailored specifically to the {details.name} sector. Your team won't just learn generic coding — they'll learn how to build for your exact business domain.
            </p>
          </div>

          {/* Deep Specialization Card */}
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 border border-orange-100">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Targeted Upskilling</h3>
            <p className="text-gray-600 leading-relaxed">
              From behavioural nuances like regulatory communication to deep specialist technology like HL7 or PCI-DSS, we cover the full spectrum of {details.name} training needs.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 rounded-2xl bg-white border border-gray-200 shadow-xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-orange-50 opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 text-gray-900">Ready to configure your {details.name} program?</h3>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
              Speak to our industry architects to build a customized training roadmap aligned perfectly with your technical and business goals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton 
                variant="primary"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all w-full sm:w-auto hover:shadow-lg"
                ctx={{ page: 'Corporate Industry', pageUrl: `/corporates/industries/${details.name}`, section: 'Industry Details Hero', ctaLabel: 'Discuss with an Architect', audienceType: 'corporate', intent: 'get_proposal' }}
              >
                Discuss with an Architect <ChevronRight className="w-5 h-5 ml-2" />
              </CTAButton>
              <Link
                href="/corporates/domestic/htd"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all w-full sm:w-auto"
              >
                Explore HTD Model
              </Link>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
