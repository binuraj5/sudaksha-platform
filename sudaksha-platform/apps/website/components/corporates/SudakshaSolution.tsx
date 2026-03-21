'use client';

import { useState } from 'react';
import { Target, Users, Eye, Briefcase, Zap } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

export default function SudakshaSolution() {
  const benefits = [
    {
      icon: Target,
      title: 'OUTCOME-DRIVEN DESIGN',
      description: 'Start with business objectives, not course catalogs',
      features: [
        'Define success metrics before training begins',
        'Custom curriculum mapped to your tech stack',
        'Pre-assessment baselines and post-training validation',
        'Measurable competency improvement'
      ]
    },
    {
      icon: Users,
      title: 'PRACTITIONER TRAINERS',
      description: 'Working professionals, not career trainers',
      features: [
        'Recent hands-on experience in modern tech stacks',
        'Deep understanding of production challenges',
        'Real-world examples from actual projects',
        'Code review and architecture guidance'
      ]
    },
    {
      icon: Eye,
      title: 'TRANSPARENCY & ACCOUNTABILITY',
      description: 'Daily conduct reports during training',
      features: [
        'Real-time attendance and engagement tracking',
        'Mid-point assessments and adjustments',
        'Detailed feedback dossiers upon completion',
        '90-day post-training support'
      ]
    },
    {
      icon: Briefcase,
      title: 'EMPLOYMENT INTEGRATION',
      description: 'Train-Hire-Deploy (THD) model for new talent',
      features: [
        'Hire-Train-Deploy (HTD) for rapid scaling',
        'Direct pipeline to trained, job-ready professionals',
        'Reduce hiring risk with pre-trained candidates',
        'Ongoing upskilling as projects evolve'
      ]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            The Sudaksha Corporate Approach: 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Precision-Curated Capability Building
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We don't ask what you want to teach. We ask what business problem you want to solve. 
            Then we architect a training solution that delivers measurable results.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 font-medium mb-4">
                  {benefit.description}
                </p>
                <ul className="space-y-2">
                  {benefit.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Training Approach?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Let us show you how precision-curated training can solve your specific business challenges.
            </p>
            <CTAButton 
              variant="custom"
              className="inline-flex justify-center items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              ctx={{ page: 'Corporates', pageUrl: '/corporates', section: 'Sudaksha Approach', ctaLabel: 'Schedule Discovery Call', audienceType: 'corporate', intent: 'schedule_call' }}
            >
              Schedule Discovery Call
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
