'use client';

import { Trophy, DollarSign, Heart, Lightbulb, TrendingUp, Users, Target, Globe } from 'lucide-react';

export default function WhySudakshaInternational() {
  const advantages = [
    {
      icon: Trophy,
      title: "PROVEN TRACK RECORD",
      color: "from-green-500 to-emerald-600",
      points: [
        "India built world-class IT services industry from scratch",
        "5 million+ IT professionals trained over 30 years",
        "$250 billion IT export industry",
        "Global technology leadership (Microsoft, Google, IBM CEOs from India)"
      ]
    },
    {
      icon: DollarSign,
      title: "COST-EFFECTIVE EXCELLENCE",
      color: "from-blue-500 to-cyan-600",
      points: [
        "60-70% cost advantage vs Western training providers",
        "Same quality, better outcomes",
        "Scalable delivery models",
        "Sustainable long-term partnerships"
      ]
    },
    {
      icon: Heart,
      title: "CULTURAL ALIGNMENT",
      color: "from-purple-500 to-pink-600",
      points: [
        "Post-colonial solidarity and shared history (especially Africa)",
        "South-South cooperation mindset",
        "No neo-colonial agenda",
        "Technology transfer, not dependency",
        "Capacity building for self-sufficiency"
      ]
    },
    {
      icon: Lightbulb,
      title: "INNOVATIVE MODELS",
      color: "from-orange-500 to-red-600",
      points: [
        "Not just training → Complete capability building",
        "African Capability Centers (ACC)",
        "Build-Operate-Transfer (BOT) models",
        "Micro-GCC setups",
        "Technology sovereignty focus"
      ]
    }
  ];

  const stats = [
    { label: "IT Professionals Trained", value: "5M+", icon: Users },
    { label: "IT Export Revenue", value: "$250B", icon: TrendingUp },
    { label: "Years of Excellence", value: "30+", icon: Target },
    { label: "Countries Served", value: "15+", icon: Globe }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            India's IT Success Story, Now Scaling Globally
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            The India Advantage: Three decades of building world-class technology capability, 
            now available to transform emerging markets through proven methodologies and deep cultural understanding.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* The India Advantage Header */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">The India Advantage</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto"></div>
        </div>

        {/* Advantage Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => (
            <div key={index} className="relative group">
              {/* Card */}
              <div className="h-full bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${advantage.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <advantage.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h4 className="text-xl font-bold text-gray-900 mb-4">{advantage.title}</h4>

                {/* Points */}
                <ul className="space-y-3">
                  {advantage.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600 text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${advantage.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Leverage the India Advantage?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join governments, enterprises, and NGOs across Africa, MENA, and Latin America 
              who are already benefiting from our proven expertise and innovative delivery models.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
                Schedule Strategy Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
