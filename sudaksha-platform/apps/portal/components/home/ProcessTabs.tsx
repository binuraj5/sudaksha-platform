'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Search, BookOpen, Award, Users, TrendingUp } from 'lucide-react';

const processSteps = [
  {
    id: 1,
    title: 'Objective Receipt',
    description: 'Deep-dive into business goals and problems to solve',
    icon: Target,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Skill Gap Analysis',
    description: 'Identify critical gaps between current and required capabilities',
    icon: Search,
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: 'Curriculum Design',
    description: 'Create precision-engineered learning paths with measurable outcomes',
    icon: BookOpen,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    title: 'Quality Assurance',
    description: 'Six-Sigma methodology applied to training for measurable outcomes',
    icon: Award,
    color: 'bg-orange-500'
  },
  {
    id: 5,
    title: 'Delivery & Support',
    description: 'Expert-led training with continuous mentorship and guidance',
    icon: Users,
    color: 'bg-red-500'
  },
  {
    id: 6,
    title: 'Outcome Measurement',
    description: 'Track progress and ensure measurable business impact',
    icon: TrendingUp,
    color: 'bg-indigo-500'
  }
];

export function ProcessTabs() {
  const [activeTab, setActiveTab] = useState(1);

  const getActiveStep = () => {
    return processSteps.find(step => step.id === activeTab);
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Precision-Curation Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Six-Sigma methodology applied to training for measurable outcomes
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {processSteps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === step.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className={`w-16 h-16 ${getActiveStep()?.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                {(() => {
                  const Icon = getActiveStep()?.icon;
                  return Icon ? <Icon className="w-8 h-8 text-white" /> : null;
                })()}
              </div>
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-2">
                  Step {activeTab}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {getActiveStep()?.title}
                </h3>
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {getActiveStep()?.description}
            </p>
          </div>
        </motion.div>

        {/* Quick Overview Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processSteps.map((step) => (
            <motion.div
              key={step.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                activeTab === step.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(step.id)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Step {step.id}</div>
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
