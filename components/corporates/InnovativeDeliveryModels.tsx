'use client';

import { useState } from 'react';
import { Building, Users, Target, ArrowRight, CheckCircle, TrendingUp, Star, Download, Calendar, DollarSign } from 'lucide-react';

export default function InnovativeDeliveryModels() {
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeCaseStudy, setActiveCaseStudy] = useState<string | null>(null);

  const models = [
    {
      id: 'acc',
      title: 'African Capability Centers (ACC)',
      subtitle: 'Permanent training and delivery centers',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Permanent centers serving as talent development hubs, technology delivery centers, and employment generation engines.',
      phases: [
        {
          title: 'Establishment (Year 1)',
          investment: 'Sudaksha + Local Partner + Government',
          activities: ['Physical infrastructure', 'Technology setup', 'Initial team: 5-10 trainers']
        },
        {
          title: 'Scaling (Year 2-3)',
          activities: ['Expand to 20-30 trainers', '500-1,000 students annually', 'Local faculty development']
        },
        {
          title: 'Sustainability (Year 3+)',
          activities: ['Local management transition', 'Revenue-generating entity', 'Regional hub expansion']
        }
      ],
      caseStudy: {
        title: 'Rwanda Digital Academy',
        location: 'Kigali, Rwanda',
        established: 'January 2023',
        investment: '$800K',
        year1Results: ['450 students trained', '78% placement rate', '25 local trainers developed', '$450K revenue'],
        year2Expansion: ['Software development arm', '12 developers', '3 international clients', 'Target: 800 students']
      }
    },
    {
      id: 'micro-gcc',
      title: 'Micro Global Capability Centers (Micro-GCC)',
      subtitle: 'Small-scale offshore delivery arms',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      description: '10-50 person centers serving as offshore delivery arms for international companies with training as foundation.',
      process: [
        { step: 'Partner Identification', duration: 'Month 1-2', activities: ['Identify international company', 'Assess work suitability'] },
        { step: 'Talent Pipeline', duration: 'Month 3-8', activities: ['Recruit local talent', '6-month intensive training'] },
        { step: 'Infrastructure Setup', duration: 'Month 6-8', activities: ['Secure office space', 'IT infrastructure'] },
        { step: 'Pilot Operations', duration: 'Month 9-12', activities: ['Start with 10-15 people', 'Simple work initially'] },
        { step: 'Scale & Transition', duration: 'Year 2+', activities: ['Expand team', 'More complex work'] }
      ],
      caseStudy: {
        title: 'Tanzania Software Center',
        client: 'Indian IT Services Company',
        challenge: 'Cost pressure, talent crunch, European client time zone needs',
        setup: '2022: 25 engineers, 6-month training, $400K investment',
        results: ['35% cost savings vs India', '8-hour overlap with Europe', '92% client satisfaction', '$1.8M annual savings'],
        localImpact: ['50 high-paying jobs', '100+ indirect jobs', '$600K annual wages'],
        expansion: ['Second location Arusha 2024', 'Third location Kampala 2025', '150 people by 2026']
      }
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Beyond Training: Building Sustainable Capability Infrastructure
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Innovative delivery models that create lasting impact through permanent infrastructure, 
            technology transfer, and complete capability building.
          </p>
        </div>

        {/* Model Cards - Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {models.map((model) => (
            <div key={model.id} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
              {/* Model Header */}
              <div className={`${model.bgColor} p-6 border-b border-gray-200`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${model.color} bg-clip-text text-transparent mb-2`}>
                      {model.title}
                    </h3>
                    <div className="text-gray-600 font-medium">{model.subtitle}</div>
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-r ${model.color} rounded-xl flex items-center justify-center text-white`}>
                    <Building className="w-8 h-8" />
                  </div>
                </div>
                <p className="text-gray-700 mt-4">{model.description}</p>
              </div>

              {/* Model Content */}
              <div className="p-6">
                {/* ACC Model */}
                {model.id === 'acc' && model.phases && (
                  <div className="space-y-6">
                    {model.phases.map((phase, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-2">{phase.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{phase.investment}</p>
                        <ul className="space-y-1">
                          {phase.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="flex items-start text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Micro-GCC Model */}
                {model.id === 'micro-gcc' && model.process && (
                  <div className="space-y-4">
                    {model.process.map((step, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{step.step}</h4>
                          <span className="text-sm text-gray-500">{step.duration}</span>
                        </div>
                        <ul className="space-y-1">
                          {step.activities.map((activity, actIndex) => (
                            <li key={actIndex} className="flex items-start text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Case Study Button */}
                <button
                  onClick={() => setActiveCaseStudy(activeCaseStudy === model.id ? null : model.id)}
                  className={`w-full py-3 px-4 bg-gradient-to-r ${model.color} text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200`}
                >
                  {activeCaseStudy === model.id ? 'Hide' : 'View'} Case Study: {model.caseStudy.title}
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>

                {/* Case Study Details */}
                {activeCaseStudy === model.id && (
                  <div className={`${model.bgColor} rounded-lg p-6 mt-4 border border-gray-200`}>
                    <h4 className="font-bold text-gray-900 mb-4">{model.caseStudy.title}</h4>
                    
                    {/* ACC Case Study */}
                    {model.id === 'acc' && model.caseStudy && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Location:</strong> {model.caseStudy.location}</div>
                          <div><strong>Established:</strong> {model.caseStudy.established}</div>
                          <div><strong>Investment:</strong> {model.caseStudy.investment}</div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Year 1 Results:</h5>
                          <ul className="space-y-1">
                            {(model.caseStudy.year1Results || []).map((result, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <Star className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{result}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Year 2 Expansion:</h5>
                          <ul className="space-y-1">
                            {(model.caseStudy.year2Expansion || []).map((result, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <TrendingUp className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{result}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Micro-GCC Case Study */}
                    {model.id === 'micro-gcc' && model.caseStudy && (
                      <div className="space-y-4">
                        <div className="text-sm">
                          <strong>Client:</strong> {model.caseStudy.client}<br/>
                          <strong>Challenge:</strong> {model.caseStudy.challenge}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Setup (2022):</h5>
                          <p className="text-sm text-gray-700">{model.caseStudy.setup}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Results:</h5>
                          <ul className="space-y-1">
                            {(model.caseStudy.results || []).map((result, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <TrendingUp className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{result}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Local Impact:</h5>
                          <ul className="space-y-1">
                            {(model.caseStudy.localImpact || []).map((impact, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <Users className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{impact}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Choose Your Innovation Model
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Whether you need permanent capability centers, offshore delivery arms, 
              or complete academy handover, we have the right model for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500">
                Schedule Model Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
