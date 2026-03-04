'use client';

import { useState } from 'react';
import { Users, Target, Zap } from 'lucide-react';
import { TrainingModel } from '../../types/corporate';

export default function TrainingModels() {
  const [activeTab, setActiveTab] = useState<'custom' | 'thd' | 'dht'>('custom');

  const trainingModels: Record<string, TrainingModel> = {
    custom: {
      id: 'custom',
      title: 'CUSTOM CORPORATE TRAINING',
      subtitle: 'For existing teams needing upskilling',
      description: 'A fully customized training program designed around your specific business challenges, tech stack, and objectives.',
      process: [
        'Discovery: We spend 2-3 days understanding your environment',
        'Design: Custom curriculum built by our architects',
        'Delivery: Practitioner SMEs train your team',
        'Validation: Pre/post assessments measure improvement',
        'Support: 90-day post-training mentorship'
      ],
      useCases: [
        'Tech stack migration (e.g., Monolith → Microservices)',
        'Cloud transformation (On-premise → AWS/Azure)',
        'New technology adoption (AI/ML integration)',
        'Performance optimization initiatives',
        'Security compliance training'
      ],
      pricingModel: 'Per-seat or per-program pricing',
      duration: 'Typically 4-12 weeks',
      cta: 'Design Your Program',
      icon: 'Users'
    },
    thd: {
      id: 'thd',
      title: 'TRAIN-HIRE-DEPLOY (THD)',
      subtitle: 'For companies needing new talent with specific skills',
      description: 'We source raw talent, train them to your exact specifications, and deploy them only when they meet your benchmarks. Zero hiring risk.',
      process: [
        'Requirement Analysis: Define your day-one requirements',
        'Talent Sourcing: We recruit candidates matching your criteria',
        'Intensive Training: 12-16 weeks of immersive training',
        'Rigorous Assessment: Only qualified candidates proceed',
        'Deployment: Job-ready professionals join your team',
        'Guarantee: 90-day performance guarantee'
      ],
      useCases: [
        'New project launches',
        'Rapid team expansion',
        'Specialized skill requirements',
        'Quality-critical roles',
        'Cost-effective scaling'
      ],
      pricingModel: 'Pay only for successfully deployed candidates',
      duration: '3-4 months from start to deployment',
      cta: 'Explore THD Model',
      icon: 'Target'
    },
    dht: {
      id: 'dht',
      title: 'DEPLOY-HIRE-TRAIN (DHT)',
      subtitle: 'For companies needing immediate resources with parallel upskilling',
      description: 'We deploy pre-vetted talent into your environment immediately, while conducting parallel training to ensure they grow with your project\'s complexity.',
      process: [
        'Rapid Matching: Deploy from our ready talent pool',
        'Immediate Start: Resources join within 1-2 weeks',
        'Parallel Training: Ongoing upskilling specific to your project',
        'Progressive Responsibility: Capability grows with project needs',
        'Full Integration: Transition to permanent employees'
      ],
      useCases: [
        'Urgent project deadlines',
        'Seasonal scaling needs',
        'Pilot projects before full hiring',
        'Fill gaps during recruitment',
        'Test-before-hire approach'
      ],
      pricingModel: 'Monthly resource cost + training fee',
      duration: 'Resources available in 1-2 weeks',
      cta: 'Get Immediate Resources',
      icon: 'Zap'
    }
  };

  const currentModel = trainingModels[activeTab];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return Users;
      case 'Target': return Target;
      case 'Zap': return Zap;
      default: return Users;
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Three Ways We Transform Your Workforce
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the model that best fits your business needs and timeline
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12 gap-4">
          {Object.values(trainingModels).map((model) => {
            const Icon = getIcon(model.icon);
            return (
              <button
                key={model.id}
                onClick={() => setActiveTab(model.id as 'custom' | 'thd' | 'dht')}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === model.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {model.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Model Info */}
            <div>
              <div className="flex items-center mb-6">
                {(() => {
                  const Icon = getIcon(currentModel.icon);
                  return <Icon className="w-12 h-12 text-blue-600 mr-4" />;
                })()}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentModel.title}
                  </h3>
                  <p className="text-gray-600">{currentModel.subtitle}</p>
                </div>
              </div>

              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {currentModel.description}
              </p>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">The Process:</h4>
                <ol className="space-y-3">
                  {currentModel.process.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6 text-sm font-bold mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Pricing Model</p>
                  <p className="font-semibold text-gray-900">{currentModel.pricingModel}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Timeline</p>
                  <p className="font-semibold text-gray-900">{currentModel.duration}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Use Cases & CTA */}
            <div>
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Typical Use Cases:</h4>
                <ul className="space-y-2">
                  {currentModel.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white">
                <h4 className="text-xl font-bold mb-4">
                  Ready to get started?
                </h4>
                <p className="mb-6 opacity-90">
                  Let us help you choose the right model for your specific needs and show you exactly how we can transform your workforce.
                </p>
                <button className="w-full lg:w-auto inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  {currentModel.cta}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Accordion (for smaller screens) */}
        <div className="lg:hidden mt-8 space-y-4">
          {Object.values(trainingModels).map((model) => {
            const Icon = getIcon(model.icon);
            return (
              <div
                key={model.id}
                className={`bg-white rounded-lg border-2 transition-all duration-200 ${
                  activeTab === model.id ? 'border-blue-600' : 'border-gray-200'
                }`}
              >
                <button
                  onClick={() => setActiveTab(model.id as 'custom' | 'thd' | 'dht')}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{model.title}</h4>
                      <p className="text-sm text-gray-600">{model.subtitle}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    activeTab === model.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {activeTab === model.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
