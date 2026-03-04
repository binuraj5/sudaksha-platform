'use client';

import { useState } from 'react';
import { MapPin, Users, DollarSign, Calendar, Target, TrendingUp, CheckCircle, Star, ArrowRight, Filter } from 'lucide-react';

export default function ProjectsShowcase() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const countries = [
    {
      id: 'rwanda',
      name: 'Rwanda',
      flag: '🇷🇼',
      capital: 'Kigali',
      population: '13.5 million',
      primaryLanguage: 'English, Kinyarwanda',
      projectsDelivered: 4,
      professionalsTrained: 1250,
      investment: '$4.2M',
      timeline: '2022-Present',
      status: 'Ongoing + 1 ACC Established',
      color: 'bg-blue-600',
      projects: [
        {
          title: 'Rwanda Digital Talent Program',
          client: 'Rwanda Development Board + Ministry of ICT',
          sector: 'Government / National Skills Development',
          duration: 'January 2023 - December 2025 (3 years)',
          investment: '$3.2M',
          need: 'Rwanda\'s Vision 2050 aims to become a knowledge-based economy. Critical shortage of software developers, data scientists, and digital specialists.',
          solution: 'Established Rwanda Digital Academy (ACC Model): 6-month intensive finishing school programs, 4 tracks, real project experience.',
          execution: [
            'Cohort 1 (Jan-Jun 2023): 120 students → 94 graduated → 78% placed',
            'Cohort 2 (Jul-Dec 2023): 150 students → 127 graduated → 81% placed',
            'Cohort 3 (Jan-Jun 2024): 180 students → 145 graduated → 84% placed',
            'Cohort 4 (Jul-Dec 2024): 200 students → Ongoing'
          ],
          outcomes: [
            '450+ developers/data scientists trained and certified',
            '360+ placed in jobs (avg salary: $600-800/month vs national avg $200)',
            '85+ with international companies (remote work)',
            '25 local trainers developed (Train-the-Trainer)',
            'Permanent academy established (self-sustaining by Year 3)'
          ],
          impactMetrics: [
            { metric: 'Employment', value: '78%', description: 'Placement rate (target was 70%)' },
            { metric: 'Salary', value: '3-4x', description: 'National average for graduates' },
            { metric: 'Economic', value: '$3.2M', description: 'Annual wages for placed students' },
            { metric: 'Capability', value: '25', description: 'Rwandan trainers can run programs independently' },
            { metric: 'Ecosystem', value: '12', description: 'Tech companies expanded due to talent availability' }
          ],
          testimonials: [
            {
              quote: 'Sudaksha didn\'t just train our people—they built us an academy. Now we have a sustainable pipeline of tech talent that\'s attracting investment to Rwanda.',
              author: 'Paula Ingabire',
              position: 'Minister of ICT and Innovation'
            },
            {
              quote: 'Six months ago, I had a degree but no job. Today, I\'m a full-stack developer earning $750/month at a tech company, supporting my entire family. Sudaksha changed my life.',
              author: 'Yvonne Mukamana',
              position: 'Full Stack Developer, Cohort 2'
            }
          ]
        }
      ]
    },
    {
      id: 'tanzania',
      name: 'Tanzania',
      flag: '🇹🇿',
      capital: 'Dodoma',
      population: '63.6 million',
      primaryLanguage: 'Swahili, English',
      projectsDelivered: 3,
      professionalsTrained: 850,
      investment: '$2.8M',
      timeline: '2022-Present',
      status: 'Ongoing',
      color: 'bg-green-600',
      projects: [
        {
          title: 'Tanzania Software Center',
          client: 'Indian IT Services Company',
          sector: 'Technology Services',
          duration: '2022-Present',
          investment: '$400K',
          need: 'Cost pressure, talent crunch in India, European client time zone needs',
          solution: 'Micro-GCC in Dar es Salaam: 25 engineers, 6-month training, offshore delivery',
          outcomes: ['35% cost savings vs India', '8-hour overlap with Europe', '92% client satisfaction', '$1.8M annual savings']
        }
      ]
    },
    {
      id: 'ethiopia',
      name: 'Ethiopia',
      flag: '🇪🇹',
      capital: 'Addis Ababa',
      population: '120.3 million',
      primaryLanguage: 'Amharic, English',
      projectsDelivered: 2,
      professionalsTrained: 1200,
      investment: '$4.3M',
      timeline: '2021-Present',
      status: 'Ongoing',
      color: 'bg-purple-600',
      projects: [
        {
          title: 'Ethiopia National Digital Academy',
          client: 'Ethiopian Ministry of Innovation & Technology',
          sector: 'Government',
          duration: '5-year BOT starting 2021',
          investment: '$4.3M',
          outcomes: ['3,500+ trained', '78% placement rate', '65 local trainers developed', 'Self-sustaining model achieved']
        }
      ]
    }
  ];

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'government', label: 'Government' },
    { id: 'banking', label: 'Banking & Finance' },
    { id: 'technology', label: 'Technology Services' }
  ];

  const totalStats = {
    projects: '30+',
    countries: '15',
    professionals: '5,000+',
    investment: '$45M+'
  };

  const sectorStats = [
    { sector: 'Government & Public Sector', percentage: 45, projects: 14 },
    { sector: 'Banking & Financial Services', percentage: 32, projects: 10 },
    { sector: 'NGOs & Development', percentage: 13, projects: 4 },
    { sector: 'Telecommunications', percentage: 7, projects: 2 },
    { sector: 'Other', percentage: 3, projects: 1 }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Impact Across Africa & Emerging Markets
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            30+ Projects | 15 Countries | 5,000+ Professionals Trained | $45M+ in Contracts
          </p>
          
          {/* Total Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalStats.projects}</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{totalStats.countries}</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalStats.professionals}</div>
              <div className="text-sm text-gray-600">Professionals Trained</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">{totalStats.investment}</div>
              <div className="text-sm text-gray-600">Investment</div>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Select a Country to View Projects</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {filters.map((filter) => (
                  <option key={filter.id} value={filter.id}>{filter.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Simplified Map Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(selectedCountry === country.id ? null : country.id)}
                className={`relative p-6 rounded-lg border-2 transition-all duration-300 ${
                  selectedCountry === country.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{country.flag}</div>
                  <div className="font-semibold text-gray-900 mb-1">{country.name}</div>
                  <div className="text-sm text-gray-600 mb-3">{country.projectsDelivered} projects</div>
                  <div className={`w-full h-2 rounded-full ${country.color}`}></div>
                </div>
                {selectedCountry === country.id && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Country Details */}
        {selectedCountry && (
          <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
            {countries
              .filter(country => country.id === selectedCountry)
              .map((country) => (
                <div key={country.id}>
                  {/* Country Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <div className="text-4xl mr-4">{country.flag}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{country.name}</h3>
                        <div className="text-sm text-gray-600">
                          Capital: {country.capital} | Population: {country.population} | Language: {country.primaryLanguage}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-green-600">{country.status}</div>
                    </div>
                  </div>

                  {/* Projects */}
                  {country.projects.map((project, projectIndex) => (
                    <div key={projectIndex} className="mb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">{project.title}</h4>
                      
                      {/* Project Overview */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Client</div>
                          <div className="font-semibold">{project.client}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Sector</div>
                          <div className="font-semibold">{project.sector}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Duration</div>
                          <div className="font-semibold">{project.duration}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Investment</div>
                          <div className="font-semibold">{project.investment}</div>
                        </div>
                      </div>

                      {/* Need & Solution */}
                      {'need' in project && 'solution' in project && project.need && project.solution && (
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-semibold text-blue-900 mb-2">Need</h5>
                            <p className="text-sm text-blue-700">{('need' in project) ? project.need : ''}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-semibold text-green-900 mb-2">Solution</h5>
                            <p className="text-sm text-green-700">{('solution' in project) ? project.solution : ''}</p>
                          </div>
                        </div>
                      )}

                      {/* Execution Details */}
                      {'execution' in project && project.execution && project.execution.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-gray-900 mb-3">Execution</h5>
                          <div className="space-y-2">
                            {('execution' in project ? project.execution : []).map((item: string, index: number) => (
                              <div key={index} className="flex items-start text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Outcomes */}
                      {project.outcomes && project.outcomes.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-gray-900 mb-3">Outcomes</h5>
                          <div className="grid md:grid-cols-2 gap-4">
                            {project.outcomes.map((outcome: string, index: number) => (
                              <div key={index} className="flex items-start text-sm">
                                <Star className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{outcome}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Impact Metrics */}
                      {'impactMetrics' in project && project.impactMetrics && project.impactMetrics.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-gray-900 mb-3">Impact Metrics</h5>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {('impactMetrics' in project ? project.impactMetrics : []).map((metric: { metric: string; value: string; description: string }, index: number) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">{metric.value}</div>
                                <div className="font-semibold text-gray-900 mb-1">{metric.metric}</div>
                                <div className="text-xs text-gray-600">{metric.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Testimonials */}
                      {'testimonials' in project && project.testimonials && project.testimonials.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-gray-900 mb-3">Testimonials</h5>
                          <div className="space-y-4">
                            {('testimonials' in project ? project.testimonials : []).map((testimonial: { quote: string; author: string; position: string }, index: number) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <blockquote className="text-gray-700 italic mb-3">"{testimonial.quote}"</blockquote>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                                  <div className="text-sm text-gray-600">{testimonial.position}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* Project Statistics Dashboard */}
        <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-8">Project Statistics Dashboard</h3>
          
          {/* By Sector */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">By Sector</h4>
            <div className="space-y-3">
              {sectorStats.map((stat, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-48 text-sm text-gray-700">{stat.sector}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                    <span className="absolute right-2 top-0 text-xs text-gray-700 leading-6">
                      {stat.percentage}% ({stat.projects} projects)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Want to Bring Sudaksha's Proven Model to Your Country?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join governments, enterprises, and institutions across Africa and emerging markets 
              who are already transforming their digital capabilities with our proven expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Request Country Assessment
              </button>
              <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500">
                Schedule Video Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
