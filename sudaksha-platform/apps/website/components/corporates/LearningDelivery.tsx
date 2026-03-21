'use client';

import { MapPin, Monitor, Users, Clock, Video, Briefcase, Layers, Zap } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

export default function LearningDelivery() {
  const deliveryModels = [
    {
      icon: MapPin,
      title: 'ON-SITE TRAINING',
      description: 'Trainers come to your location',
      benefits: [
        'Use your infrastructure and tools',
        'Maximum security and confidentiality',
        'Team cohesion and collaboration'
      ],
      idealFor: 'Large batches, sensitive projects'
    },
    {
      icon: Monitor,
      title: 'VIRTUAL INSTRUCTOR-LED',
      description: 'Live online sessions',
      benefits: [
        'Interactive and engaging',
        'Reduced logistics and costs',
        'Flexible scheduling'
      ],
      idealFor: 'Distributed teams, cost optimization'
    },
    {
      icon: Layers,
      title: 'BLENDED LEARNING',
      description: 'Combination of online and in-person',
      benefits: [
        'Self-paced modules + live workshops',
        'Maximum flexibility',
        'Continuous learning culture'
      ],
      idealFor: 'Long-term transformation programs'
    },
    {
      icon: Users,
      title: 'TRAIN-THE-TRAINER',
      description: 'Certify your internal trainers',
      benefits: [
        'Build sustainable capability',
        'Reduce long-term training costs',
        'Maintain quality standards'
      ],
      idealFor: 'Large enterprises, ongoing needs'
    },
    {
      icon: Zap,
      title: 'CUSTOM BOOTCAMPS',
      description: 'Intensive immersive programs',
      benefits: [
        '2-4 week accelerated training',
        'Full-time commitment',
        'Rapid capability building'
      ],
      idealFor: 'Urgent needs, new project launches'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Flexible Delivery Models for Every Need
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the training format that works best for your team and schedule
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deliveryModels.map((model, index) => {
            const Icon = model.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {model.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {model.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                  <ul className="space-y-1">
                    {model.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-semibold text-blue-900">Ideal for:</span>
                    <span className="text-blue-700 ml-1">{model.idealFor}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Not Sure Which Delivery Model is Right?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Our experts will help you choose the perfect format based on your team size, schedule, and learning objectives.
            </p>
            <CTAButton 
              variant="custom"
              className="inline-flex justify-center items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              ctx={{ page: 'Corporates', pageUrl: '/corporates', section: 'Flexible Delivery Models', ctaLabel: 'Get Delivery Recommendation', audienceType: 'corporate', intent: 'start_process' }}
            >
              Get Delivery Recommendation
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
