'use client';

import { useState } from 'react';
import { ArrowRight, Users, BookOpen, Target, TrendingUp, Brain, ArrowDownCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

export default function BrainCirculationVision() {
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const phases = [
    {
      id: 1,
      title: "TRAIN",
      subtitle: "Months 1-6",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      activities: [
        "Intensive training programs",
        "Blended delivery (online + in-country)",
        "Transfer of frameworks and methodologies",
        "Certification programs"
      ],
      outcomes: [
        "Skilled professionals certified",
        "Knowledge transfer initiated",
        "Foundational capabilities built"
      ]
    },
    {
      id: 2,
      title: "TRANSFER",
      subtitle: "Months 7-12",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      activities: [
        "Train-the-trainer programs",
        "Documentation and knowledge repositories",
        "Local faculty development",
        "Institutional partnerships"
      ],
      outcomes: [
        "Local trainers certified",
        "Knowledge systems established",
        "Institutional capacity built"
      ]
    },
    {
      id: 3,
      title: "SUSTAIN",
      subtitle: "Year 2+",
      icon: Target,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      activities: [
        "African Capability Centers (ACC) establishment",
        "Local talent pools for regional needs",
        "Continuous upskilling programs",
        "Self-sufficient ecosystems"
      ],
      outcomes: [
        "Self-sustaining operations",
        "Regional talent hubs",
        "Economic impact generated"
      ]
    }
  ];

  const challengePoints = [
    {
      icon: AlertCircle,
      title: "Fly-in consultants, fly out",
      description: "Knowledge doesn't stay"
    },
    {
      icon: AlertCircle,
      title: "No local capability built",
      description: "Dependency continues"
    },
    {
      icon: AlertCircle,
      title: "Expensive and unsustainable",
      description: "Poor ROI"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Building Self-Sustaining Digital Ecosystems
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            From brain drain to brain circulation: Our systematic approach transforms dependency 
            into self-sufficiency through sustainable capability building.
          </p>
        </div>

        {/* The Challenge */}
        <div className="mb-16">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-red-900 mb-6 text-center">The Challenge</h3>
            <p className="text-red-700 text-center mb-8 max-w-3xl mx-auto">
              Traditional international training creates dependency:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {challengePoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <point.icon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-red-900">{point.title}</div>
                    <div className="text-red-700 text-sm">{point.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Sudaksha Approach Header */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">The Sudaksha Approach</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto"></div>
        </div>

        {/* Flow Diagram */}
        <div className="mb-16">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2 hidden md:block"></div>
            
            {/* Phases */}
            <div className="grid md:grid-cols-3 gap-8 relative">
              {phases.map((phase, index) => (
                <div key={phase.id} className="relative">
                  {/* Phase Card */}
                  <div 
                    className={`bg-white rounded-xl p-6 border-2 ${phase.borderColor} cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      activePhase === phase.id ? 'ring-4 ring-blue-100 shadow-xl' : ''
                    }`}
                    onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                  >
                    {/* Phase Number and Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${phase.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        {phase.id}
                      </div>
                      <phase.icon className={`w-8 h-8 bg-gradient-to-r ${phase.color} bg-clip-text text-transparent`} />
                    </div>

                    {/* Title */}
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{phase.title}</h4>
                    <div className="text-sm text-gray-500 mb-4">{phase.subtitle}</div>

                    {/* Activities Preview */}
                    <div className="space-y-2">
                      {phase.activities.slice(0, 2).map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{activity}</span>
                        </div>
                      ))}
                      {phase.activities.length > 2 && (
                        <div className="text-sm text-blue-600 font-medium">
                          +{phase.activities.length - 2} more activities
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse Indicator */}
                    {activePhase === phase.id ? (
                      <ArrowDownCircle className="w-5 h-5 text-blue-600 mt-4 mx-auto" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-gray-400 mt-4 mx-auto" />
                    )}
                  </div>

                  {/* Expanded Details */}
                  {activePhase === phase.id && (
                    <div className={`mt-4 ${phase.bgColor} rounded-xl p-6 border ${phase.borderColor}`}>
                      <h5 className="font-bold text-gray-900 mb-3">Key Activities:</h5>
                      <ul className="space-y-2 mb-4">
                        {phase.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="flex items-start text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{activity}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h5 className="font-bold text-gray-900 mb-3">Expected Outcomes:</h5>
                      <ul className="space-y-2">
                        {phase.outcomes.map((outcome, outcomeIndex) => (
                          <li key={outcomeIndex} className="flex items-start text-sm">
                            <TrendingUp className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Arrow for mobile */}
                  {index < phases.length - 1 && (
                    <div className="md:hidden flex justify-center mt-4">
                      <ArrowDownCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Flow Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center">Transformation Journey</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <div className="font-bold text-lg mb-2">Dependency</div>
              <div className="text-blue-100 text-sm">External expertise required</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <div className="font-bold text-lg mb-2">Partnership</div>
              <div className="text-blue-100 text-sm">Knowledge transfer in progress</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8" />
              </div>
              <div className="font-bold text-lg mb-2">Self-Sufficiency</div>
              <div className="text-blue-100 text-sm">Sustainable local ecosystem</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <CTAButton 
            variant="custom"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            ctx={{ page: 'Corporates', pageUrl: '/corporates', section: 'Brain Circulation', ctaLabel: 'Schedule Strategy Session', audienceType: 'corporate', intent: 'schedule_call' }}
          >
            Schedule Strategy Session
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
