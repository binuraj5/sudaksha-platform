'use client';

import { Users, Award, Clock, Target, Handshake, Building, Globe, TrendingUp } from 'lucide-react';

export default function TrainingPartnerships() {
  const programs = [
    {
      title: 'Short-Term Programs',
      duration: '1-15 Days',
      description: 'Intensive skill development programs focused on specific technologies and immediate job readiness',
      features: [
        'Hands-on training with real-world projects',
        'Industry-relevant curriculum',
        'Certification preparation',
        'Job placement assistance'
      ],
      icon: <Clock className="w-6 h-6 text-blue-600" />
    },
    {
      title: 'Mid-Term Programs',
      duration: '1-3 Months',
      description: 'Comprehensive skill development with deeper technology expertise and project experience',
      features: [
        'Advanced technical training',
        'Multiple project implementations',
        'Soft skills development',
        'Career advancement coaching'
      ],
      icon: <Award className="w-6 h-6 text-green-600" />
    },
    {
      title: 'Long-Term Programs',
      duration: '3+ Months',
      description: 'Extensive capability building with enterprise-level projects and leadership development',
      features: [
        'Enterprise architecture training',
        'Large-scale project experience',
        'Team leadership skills',
        'Strategic thinking development'
      ],
      icon: <Building className="w-6 h-6 text-purple-600" />
    }
  ];

  const partnershipAreas = [
    {
      title: 'Government Training',
      description: 'Partnering with government agencies to build digital capabilities and public sector expertise',
      icon: <Users className="w-8 h-8 text-blue-600" />
    },
    {
      title: 'Corporate Training',
      description: 'Working with enterprises to enhance workforce capabilities and digital transformation',
      icon: <Building className="w-8 h-8 text-green-600" />
    },
    {
      title: 'Capability Building',
      description: 'Developing institutional capabilities through comprehensive training programs',
      icon: <Award className="w-8 h-8 text-purple-600" />
    },
    {
      title: 'Institutional Training',
      description: 'Building sustainable training ecosystems within educational institutions',
      icon: <Target className="w-8 h-8 text-orange-600" />
    }
  ];

  const impactStats = [
    { metric: '15,000+', label: 'Professionals Trained', trend: 'up' },
    { metric: '25+', label: 'Partner Organizations', trend: 'up' },
    { metric: '50+', label: 'Training Programs Delivered', trend: 'up' },
    { metric: '12', label: 'Countries Reached', trend: 'up' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Training Programs & Strategic Partnerships
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12">
            Flexible training programs designed to meet diverse learning needs and strategic partnerships 
            to build world-class digital capability across Africa, MENA, and emerging markets
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.metric}</div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              {stat.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />}
            </div>
          ))}
        </div>

        {/* Training Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {programs.map((program, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 mr-4">
                  {program.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                  <div className="text-sm font-semibold text-blue-600 mb-3">{program.duration}</div>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{program.description}</p>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {program.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Africa Rising Section */}
        <div className="bg-white rounded-2xl p-8 mb-16 shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Africa Rising: Building the Next Generation of Tech Talent</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering African talent to lead the digital transformation revolution through world-class training, 
              mentorship, and real-world project experience. We're committed to building local capability 
              that drives sustainable economic growth across the continent.
            </p>
          </div>
        </div>

        {/* Partnership Areas */}
        <div className="bg-white rounded-2xl p-8 mb-16 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Sudaksha is Looking for Partners</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnershipAreas.map((area, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {area.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{area.title}</h4>
                <p className="text-sm text-gray-600">{area.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Partner with Us to Transform Africa's Digital Future
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join us in our mission to build world-class digital capability across Africa and emerging markets. 
              Together, we can create sustainable impact through innovative training programs and strategic partnerships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <Handshake className="w-5 h-5 mr-2 inline" />
                Become a Training Partner
              </button>
              <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500">
                <Target className="w-5 h-5 mr-2 inline" />
                Explore Partnership Opportunities
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
