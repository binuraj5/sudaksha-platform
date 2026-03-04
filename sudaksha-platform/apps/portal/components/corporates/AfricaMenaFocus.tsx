'use client';

import { useState } from 'react';
import { TrendingUp, Users, DollarSign, Target, Globe, Brain, Heart, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function AfricaMenaFocus() {
  const [activeTab, setActiveTab] = useState('demographic');

  const tabs = [
    { id: 'demographic', label: 'Demographic Dividend', icon: Users },
    { id: 'digital', label: 'Digital Transformation', icon: TrendingUp },
    { id: 'skills', label: 'Skills Gap Crisis', icon: AlertCircle },
    { id: 'synergy', label: 'India-Africa Synergy', icon: Heart }
  ];

  const content = {
    demographic: {
      title: "Africa Rising: The Demographic Advantage",
      subtitle: "Youngest continent with massive workforce potential",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      stats: [
        { label: "Median Age", value: "19.7 years", description: "World's youngest population" },
        { label: "Youth Population", value: "60%", description: "Under 25 years old" },
        { label: "Youth by 2030", value: "450M", description: "Largest workforce potential" },
        { label: "Urbanization Rate", value: "43%", description: "Rapid urban growth" }
      ],
      points: [
        "Largest working-age population globally by 2030",
        "Growing middle class with increasing purchasing power",
        "Urban centers driving economic growth",
        "Education levels improving steadily"
      ]
    },
    digital: {
      title: "Digital Transformation Imperative",
      subtitle: "Leapfrog opportunity in mobile-first economies",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      stats: [
        { label: "Digital Economy", value: "$180B", description: "By 2025" },
        { label: "Internet Users", value: "600M", description: "By 2025" },
        { label: "Mobile Penetration", value: "46%", description: "Growing rapidly" },
        { label: "Digital Investment", value: "$25B+", description: "Annual investment" }
      ],
      points: [
        "Mobile-first adoption leapfrogging desktop",
        "Government digital initiatives across continent",
        "Fintech leading digital transformation",
        "Smart city projects in major urban centers"
      ]
    },
    skills: {
      title: "Critical Skills Gap Crisis",
      subtitle: "230 million jobs requiring digital skills by 2030",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      stats: [
        { label: "Digital Jobs by 2030", value: "230M", description: "Jobs requiring digital skills" },
        { label: "Tertiary Education", value: "8%", description: "Enrollment rate" },
        { label: "Developer Shortage", value: "2M+", description: "Across Africa" },
        { label: "Skills Mismatch", value: "65%", description: "Graduates vs industry needs" }
      ],
      points: [
        "Critical shortage of software developers",
        "Urgent need for data scientists and AI specialists",
        "Cybersecurity experts in high demand",
        "Digital government specialists required",
        "Banking technology skills gap widening"
      ]
    },
    synergy: {
      title: "India-Africa Synergy",
      subtitle: "Shared history, complementary strengths",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      stats: [
        { label: "Trade Volume", value: "$100B+", description: "Annual India-Africa trade" },
        { label: "Cost Advantage", value: "60-70%", description: "vs Western providers" },
        { label: "Cultural Alignment", value: "High", description: "Shared values and history" },
        { label: "Success Replication", value: "Proven", description: "IT success model transferable" }
      ],
      points: [
        "Historical ties and cultural affinity",
        "India's IT success story replicable",
        "Cost-effective solutions without quality compromise",
        "No colonial baggage or neo-colonial agenda",
        "South-South cooperation framework",
        "Technology transfer focus, not dependency"
      ]
    }
  };

  const whyAfricaNow = [
    {
      icon: Users,
      title: "Demographic Dividend",
      description: "Youngest continent with 60% population under 25"
    },
    {
      icon: TrendingUp,
      title: "Digital Transformation",
      description: "$180B digital economy by 2025, 600M internet users"
    },
    {
      icon: AlertCircle,
      title: "Skills Gap Crisis",
      description: "230M jobs requiring digital skills by 2030"
    },
    {
      icon: DollarSign,
      title: "Political Will & Investment",
      description: "African Union Digital Strategy, significant FDI"
    },
    {
      icon: Heart,
      title: "India-Africa Synergy",
      description: "Historical ties, cost-effective, no colonial baggage"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Africa Rising: Building the Next Generation of Tech Talent
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Why Africa, Why Now? The continent presents an unprecedented opportunity for 
            digital transformation, talent development, and sustainable economic growth.
          </p>
        </div>

        {/* Why Africa Now Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {whyAfricaNow.map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-shadow duration-300">
              <item.icon className="w-8 h-8 text-blue-600 mb-3" />
              <div className="font-semibold text-gray-900 mb-2">{item.title}</div>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          ))}
        </div>

        {/* Interactive Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className={`${content[activeTab as keyof typeof content].bgColor} rounded-2xl p-8 border border-gray-200`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h3 className={`text-3xl font-bold bg-gradient-to-r ${content[activeTab as keyof typeof content].color} bg-clip-text text-transparent mb-2`}>
                  {content[activeTab as keyof typeof content].title}
                </h3>
                <p className="text-lg text-gray-600">
                  {content[activeTab as keyof typeof content].subtitle}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {content[activeTab as keyof typeof content].stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${content[activeTab as keyof typeof content].color} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <div className="font-semibold text-gray-900 mb-1">{stat.label}</div>
                    <div className="text-sm text-gray-600">{stat.description}</div>
                  </div>
                ))}
              </div>

              {/* Key Points */}
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">Key Insights:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {content[activeTab as keyof typeof content].points.map((point, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Be Part of Africa's Digital Revolution?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join us in building sustainable digital ecosystems across Africa. 
              From talent development to capability centers, we're transforming the continent's digital future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Explore Africa Opportunities
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
