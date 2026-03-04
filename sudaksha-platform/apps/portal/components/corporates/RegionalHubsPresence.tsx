'use client';

import { useState } from 'react';
import { MapPin, Users, Target, ArrowRight, Globe, Building, Briefcase, CheckCircle, Star, TrendingUp } from 'lucide-react';

export default function RegionalHubsPresence() {
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  const hubs = [
    {
      id: 'east-africa',
      name: 'East Africa Hub',
      headquarters: 'Kigali, Rwanda',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'Established',
      countriesServed: ['Rwanda', 'Tanzania', 'Ethiopia', 'Kenya', 'Uganda', 'Djibouti'],
      whyHub: 'Rwanda: Africa\'s Singapore (business-friendly, tech-focused)',
      keyProjects: [
        'Rwanda Digital Talent Program (1,000 developers)',
        'Tanzania E-Government Academy',
        'Ethiopia Banking Sector Transformation',
        'Djibouti Smart Port Initiative'
      ],
      localTeam: '15 permanent staff + 40 associate trainers',
      cta: { text: 'Explore East Africa', href: '/for-corporates/international/east-africa' }
    },
    {
      id: 'west-africa',
      name: 'West Africa Hub',
      headquarters: 'Accra, Ghana',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      status: 'Established',
      countriesServed: ['Ghana', 'Nigeria', 'Senegal', 'Côte d\'Ivoire', 'Liberia'],
      whyHub: 'Ghana: Stable democracy, growing tech ecosystem',
      keyProjects: [
        'Ghana Government Digital Services Training',
        'Nigeria Fintech Capability Building',
        'Senegal Smart Cities Program',
        'Regional Cybersecurity Academy'
      ],
      localTeam: '12 permanent staff + 35 associate trainers',
      cta: { text: 'Explore West Africa', href: '/for-corporates/international/west-africa' }
    },
    {
      id: 'north-africa-mena',
      name: 'North Africa & MENA Hub',
      headquarters: 'Dubai, UAE',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      status: 'Established',
      countriesServed: ['Sudan', 'Egypt', 'Morocco', 'UAE', 'Saudi Arabia', 'Qatar'],
      whyHub: 'Dubai: Regional business center',
      keyProjects: [
        'Sudan Banking Modernization',
        'Egypt Smart Government Initiative',
        'Saudi Vision 2030 Tech Training',
        'UAE Digital Transformation Programs'
      ],
      localTeam: '8 permanent staff + 25 associate trainers',
      cta: { text: 'Explore MENA', href: '/for-corporates/international/north-africa' }
    },
    {
      id: 'central-africa',
      name: 'Central Africa Hub',
      headquarters: 'Partnership Model',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      status: 'Emerging',
      countriesServed: ['DRC', 'Cameroon', 'Angola', 'Gabon'],
      whyHub: 'Francophone markets with resource-rich economies',
      keyProjects: [
        'DRC Mining Sector Digital Training',
        'Cameroon E-Government Capacity Building'
      ],
      localTeam: 'Partnership-based delivery model',
      cta: { text: 'Learn More', href: '/for-corporates/international/central-africa' }
    }
  ];

  const totalStats = [
    { label: 'Regional Hubs', value: '4', icon: MapPin },
    { label: 'Countries Served', value: '20+', icon: Globe },
    { label: 'Local Team Members', value: '135+', icon: Users },
    { label: 'Active Projects', value: '25+', icon: Target }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Boots on the Ground: Our Regional Hub Strategy
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Strategic presence across Africa and MENA with established hubs serving as 
            centers of excellence for talent development and project delivery.
          </p>
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {totalStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Interactive Map Placeholder */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-8">Our Regional Presence</h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              {hubs.map((hub) => (
                <div key={hub.id} className="relative">
                  <button
                    onClick={() => setSelectedHub(selectedHub === hub.id ? null : hub.id)}
                    className={`w-full text-left p-6 rounded-lg border-2 transition-all duration-300 ${
                      selectedHub === hub.id
                        ? `${hub.borderColor} bg-white shadow-lg`
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${hub.color} mr-2`}></div>
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${hub.bgColor} ${hub.borderColor} border`}>
                            {hub.status}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{hub.name}</h4>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {hub.headquarters}
                        </div>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-r ${hub.color} rounded-lg flex items-center justify-center text-white`}>
                        <Building className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <strong>Countries:</strong> {hub.countriesServed.length} served
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Team:</strong> {hub.localTeam}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Projects:</strong> {hub.keyProjects.length} active
                      </div>
                    </div>

                    {selectedHub === hub.id ? (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-blue-600 font-medium">
                          Click to collapse details
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500 font-medium">
                          Click to expand details
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {selectedHub === hub.id && (
                    <div className={`mt-4 ${hub.bgColor} rounded-lg p-6 ${hub.borderColor} border`}>
                      <div className="space-y-4">
                        {/* Why This Hub */}
                        <div>
                          <h5 className="font-bold text-gray-900 mb-2">Why This Hub:</h5>
                          <p className="text-sm text-gray-700">{hub.whyHub}</p>
                        </div>

                        {/* Countries Served */}
                        <div>
                          <h5 className="font-bold text-gray-900 mb-2">Countries Served:</h5>
                          <div className="flex flex-wrap gap-2">
                            {hub.countriesServed.map((country, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-white rounded-full border border-gray-300">
                                {country}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key Projects */}
                        <div>
                          <h5 className="font-bold text-gray-900 mb-2">Key Projects:</h5>
                          <ul className="space-y-1">
                            {hub.keyProjects.map((project, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{project}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* CTA */}
                        <button className={`w-full py-2 px-4 bg-gradient-to-r ${hub.color} text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200`}>
                          {hub.cta.text}
                          <ArrowRight className="w-4 h-4 ml-2 inline" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hub Comparison Table */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-8">Hub Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Hub</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Countries</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Team Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Focus Areas</th>
                </tr>
              </thead>
              <tbody>
                {hubs.map((hub) => (
                  <tr key={hub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{hub.name}</div>
                      <div className="text-sm text-gray-600">{hub.headquarters}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${hub.bgColor} ${hub.borderColor} border`}>
                        {hub.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{hub.countriesServed.length} countries</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{hub.localTeam}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        {hub.keyProjects.slice(0, 2).map((project, index) => (
                          <div key={index}>• {project.split(' (')[0]}</div>
                        ))}
                        {hub.keyProjects.length > 2 && (
                          <div className="text-blue-600">+{hub.keyProjects.length - 2} more</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Join Our Growing Regional Network
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Partner with us to expand digital capability across Africa and MENA. 
              Whether you're a government, enterprise, or institution, we have a hub ready to serve you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Partner With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
