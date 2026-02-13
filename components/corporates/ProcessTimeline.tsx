'use client';

import { Target, Settings, ClipboardCheck, UserCheck, Activity, BarChart3 } from 'lucide-react';

export default function ProcessTimeline() {
  const processSteps = [
    {
      icon: Target,
      title: 'OBJECTIVE RECEIPT',
      duration: '2-3 days',
      description: 'Deep-dive discovery workshops with your leadership',
      deliverable: 'Detailed requirements document and success framework'
    },
    {
      icon: Settings,
      title: 'CURATION & DESIGN',
      duration: '1-2 weeks',
      description: 'Our curriculum architects design custom training plan',
      deliverable: 'Custom curriculum blueprint with module breakdown'
    },
    {
      icon: ClipboardCheck,
      title: 'OUTCOME-BASED ASSESSMENT DESIGN',
      duration: '1 week',
      description: 'Create baseline pre-assessment and evaluation framework',
      deliverable: 'Complete assessment framework with scoring rubrics'
    },
    {
      icon: UserCheck,
      title: 'TRAINER MATCHING',
      duration: '3-5 days',
      description: 'Match from our network of 200+ practitioner SMEs',
      deliverable: 'Confirmed trainer profile and credentials'
    },
    {
      icon: Activity,
      title: 'EXECUTION & DAILY REPORTING',
      duration: 'Program length (typically 4-12 weeks)',
      description: 'Daily live sessions with hands-on labs and real-time tracking',
      deliverable: 'Daily reports + weekly summaries + mid-point review'
    },
    {
      icon: BarChart3,
      title: 'DATA-DRIVEN CLOSURE',
      duration: '1 week',
      description: 'Final job-readiness assessment and comprehensive analysis',
      deliverable: 'Complete training effectiveness report with ROI metrics'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Our Six-Sigma Curation Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Precision, not chance. Data, not guesswork.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-500 to-cyan-500"></div>
            
            <div className="grid grid-cols-6 gap-4">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Step Circle */}
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    
                    {/* Step Content */}
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-blue-600 font-medium mb-2">{step.duration}</p>
                      <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700">
                          <span className="block mb-1">Deliverable:</span>
                          {step.deliverable}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-8">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="w-0.5 h-20 bg-blue-200 mx-auto mt-4"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-2">{step.duration}</p>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700">
                      <span className="block mb-1">Deliverable:</span>
                      {step.deliverable}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience Our Process?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Let us walk you through how we'll transform your team's capabilities.
            </p>
            <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Start Discovery Process
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
