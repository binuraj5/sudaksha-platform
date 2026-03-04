'use client';

import { BarChart3, PieChart, TrendingUp, Users, DollarSign, Target, Globe, Award } from 'lucide-react';

export default function ProjectStatisticsDashboard() {
  const stats = {
    totalProjects: 30,
    totalCountries: 15,
    totalProfessionals: '5,000+',
    totalInvestment: '$45M+',
    completionRate: 87,
    averageProjectDuration: '14 months',
    clientRetention: 92
  };

  const sectorBreakdown = [
    { sector: 'Government & Public Sector', count: 14, percentage: 45, color: 'bg-blue-500' },
    { sector: 'Banking & Financial Services', count: 10, percentage: 32, color: 'bg-green-500' },
    { sector: 'NGOs & Development', count: 4, percentage: 13, color: 'bg-purple-500' },
    { sector: 'Telecommunications', count: 2, percentage: 7, color: 'bg-orange-500' },
    { sector: 'Other', count: 1, percentage: 3, color: 'bg-gray-500' }
  ];

  const trainingFocusBreakdown = [
    { focus: 'Software Development', count: 12, percentage: 42, color: 'bg-blue-600' },
    { focus: 'Data & Analytics', count: 5, percentage: 18, color: 'bg-green-600' },
    { focus: 'Cybersecurity', count: 4, percentage: 15, color: 'bg-red-600' },
    { focus: 'Digital Government', count: 3, percentage: 12, color: 'bg-purple-600' },
    { focus: 'Banking Technology', count: 2, percentage: 8, color: 'bg-orange-600' },
    { focus: 'Other', count: 4, percentage: 15, color: 'bg-gray-600' }
  ];

  const regionalDistribution = [
    { region: 'East Africa', projects: 12, professionals: 2400, investment: '$18M' },
    { region: 'West Africa', projects: 8, professionals: 1200, investment: '$12M' },
    { region: 'North Africa & MENA', projects: 7, professionals: 800, investment: '$10M' },
    { region: 'Central Africa', projects: 2, professionals: 400, investment: '$3M' },
    { region: 'Latin America', projects: 1, professionals: 200, investment: '$2M' }
  ];

  const performanceMetrics = [
    { metric: 'Project Completion Rate', value: '87%', trend: 'up', description: 'Projects completed on time and within budget' },
    { metric: 'Client Satisfaction', value: '92%', trend: 'up', description: 'Client satisfaction score across all projects' },
    { metric: 'Knowledge Transfer Success', value: '78%', trend: 'up', description: 'Local teams trained to operate independently' },
    { metric: 'Economic Impact', value: '$180M', trend: 'up', description: 'Total economic impact across all projects' },
    { metric: 'Talent Retention', value: '85%', trend: 'stable', description: 'Professionals retained post-training' }
  ];

  const timelineData = [
    { year: '2021', projects: 3, professionals: 450 },
    { year: '2022', projects: 5, professionals: 800 },
    { year: '2023', projects: 8, professionals: 1200 },
    { year: '2024', projects: 10, professionals: 1800 },
    { year: '2025 (YTD)', projects: 4, professionals: 750 }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Project Statistics Dashboard
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Comprehensive analytics showing our impact across Africa, MENA, and emerging markets
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200">
            <div className="text-4xl font-bold text-blue-900 mb-2">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200">
            <div className="text-4xl font-bold text-green-900 mb-2">{stats.totalCountries}</div>
            <div className="text-sm text-gray-600">Countries Served</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200">
            <div className="text-4xl font-bold text-purple-900 mb-2">{stats.totalProfessionals}</div>
            <div className="text-sm text-gray-600">Professionals Trained</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center border border-orange-200">
            <div className="text-4xl font-bold text-orange-900 mb-2">{stats.totalInvestment}</div>
            <div className="text-sm text-gray-600">Total Investment</div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Performance Indicators</h3>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">{metric.metric}</span>
                  {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600 ml-2" />}
                  {metric.trend === 'stable' && <div className="w-4 h-4 text-blue-700 ml-2">—</div>}
                </div>
                <div className="text-3xl font-bold text-blue-700 mb-2">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Regional Distribution</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {regionalDistribution.map((region, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-semibold text-lg text-gray-900">{region.region}</div>
                      <div className="text-sm text-gray-600">{region.projects} projects</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">{region.professionals} professionals</div>
                    <div className="text-sm font-semibold text-green-600">{region.investment}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Timeline */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Growth Timeline</h3>
          <div className="flex gap-8 overflow-x-auto">
            {timelineData.map((year, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{year.year}</div>
                  <div className="text-sm text-gray-600 mb-1">{year.projects} projects</div>
                  <div className="text-sm text-gray-600 mb-1">{year.professionals} professionals</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Track Your Impact with Real-Time Analytics
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get detailed insights into project performance, regional distribution, and growth trends. 
              Our comprehensive dashboard helps you make data-driven decisions for maximum impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500">
                <Target className="w-5 h-5 mr-2 inline" />
                Schedule Analytics Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
