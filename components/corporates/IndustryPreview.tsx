'use client';

import { CreditCard, ShoppingCart, Heart, Pill, Truck, GraduationCap, Building, Shield, Plane, Hotel, ShoppingBag, Home, Zap } from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  icon: any;
  challenge: string;
  slug: string;
}

export default function IndustryPreview() {
  const industries: Industry[] = [
    {
      id: 'fintech',
      name: 'FINTECH',
      icon: CreditCard,
      challenge: 'Build secure, compliant payment systems',
      slug: '/for-corporates/industries/fintech'
    },
    {
      id: 'ecommerce',
      name: 'E-COMMERCE',
      icon: ShoppingCart,
      challenge: 'Scale high-transaction platforms',
      slug: '/for-corporates/industries/ecommerce'
    },
    {
      id: 'healthcare',
      name: 'HEALTHCARE',
      icon: Heart,
      challenge: 'HIPAA-compliant systems development',
      slug: '/for-corporates/industries/healthcare'
    },
    {
      id: 'pharma',
      name: 'PHARMA',
      icon: Pill,
      challenge: 'Regulatory compliance & validation',
      slug: '/for-corporates/industries/pharma'
    },
    {
      id: 'logistics',
      name: 'LOGISTICS & SUPPLY CHAIN',
      icon: Truck,
      challenge: 'Real-time tracking & optimization',
      slug: '/for-corporates/industries/logistics'
    },
    {
      id: 'edtech',
      name: 'EDTECH',
      icon: GraduationCap,
      challenge: 'Scalable learning platforms',
      slug: '/for-corporates/industries/edtech'
    },
    {
      id: 'government',
      name: 'GOVERNMENT',
      icon: Building,
      challenge: 'E-governance & public services',
      slug: '/for-corporates/industries/government'
    },
    {
      id: 'defence',
      name: 'DEFENCE',
      icon: Shield,
      challenge: 'Secure mission-critical systems',
      slug: '/for-corporates/industries/defence'
    },
    {
      id: 'aviation',
      name: 'AVIATION',
      icon: Plane,
      challenge: 'Safety-critical software systems',
      slug: '/for-corporates/industries/aviation'
    },
    {
      id: 'travel',
      name: 'TRAVEL & HOSPITALITY',
      icon: Hotel,
      challenge: 'Integrated booking & management',
      slug: '/for-corporates/industries/travel'
    },
    {
      id: 'retail',
      name: 'RETAIL & FMCG',
      icon: ShoppingBag,
      challenge: 'Omnichannel retail solutions',
      slug: '/for-corporates/industries/retail'
    },
    {
      id: 'realestate',
      name: 'REAL ESTATE',
      icon: Home,
      challenge: 'Property management platforms',
      slug: '/for-corporates/industries/real-estate'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Industry-Specific Training Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We speak your industry's language and understand your compliance requirements
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <div
                key={industry.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {industry.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {industry.challenge}
                </p>
                <a
                  href={industry.slug}
                  className="inline-flex items-center text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors duration-200"
                >
                  Explore {industry.name.split(' ')[0]} Solutions
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Don't See Your Industry?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              We work with companies across all sectors. Let us create a custom solution for your specific industry challenges.
            </p>
            <button className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Discuss Your Industry
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
