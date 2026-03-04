'use client';

import { Quote, Users, TrendingUp, Award } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  photo?: string;
  video?: string;
  quote: string;
  impactStats: {
    label: string;
    value: string;
  }[];
}

export default function CorporateTestimonials() {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Rajesh Sharma',
      title: 'VP of Engineering',
      company: 'FinTech Unicorn (₹2000 Cr valuation)',
      quote: 'Sudaksha didn\'t just train our team—they transformed how we approach microservices. The custom curriculum was built around our actual codebase, and the trainers had solved the exact problems we were facing.',
      impactStats: [
        { label: '50 engineers trained', value: '50' },
        { label: '3x deployment frequency', value: '3x' },
        { label: '70% fewer incidents', value: '70%' }
      ]
    },
    {
      id: '2',
      name: 'Priya Nair',
      title: 'Head of Product',
      company: 'Global E-commerce Platform',
      quote: 'The ROI calculator showed us exactly what we needed to see. After the training, our deployment speed increased by 40% and code quality improved by 65%. The business case was undeniable.',
      impactStats: [
        { label: '40% faster deployment', value: '40%' },
        { label: '65% code quality', value: '65%' },
        { label: '2 months early certification', value: '2mo' }
      ]
    },
    {
      id: '3',
      name: 'Amit Kumar',
      title: 'CTO',
      company: 'Healthcare SaaS Provider',
      quote: 'We needed HIPAA-compliant development, and Sudaksha delivered exactly that. Their trainers understood healthcare regulations and security requirements better than our previous vendors.',
      impactStats: [
        { label: 'Zero security vulnerabilities', value: '0' },
        { label: '50% faster development', value: '50%' },
        { label: 'HIPAA certification 2 months early', value: '2mo' }
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            What Corporate Leaders Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from real companies achieving real results
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-blue-600 mb-2">{testimonial.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{testimonial.title}</p>
                <p className="text-gray-700 text-sm">{testimonial.company}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-start mb-4">
                  <Quote className="w-8 h-8 text-orange-500 mr-4 flex-shrink-0" />
                  <p className="text-gray-700 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {testimonial.impactStats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">
                        {stat.value}
                      </div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
