'use client';

import { useState, useEffect } from 'react';

export default function DifferenceTable() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const comparisonData = [
    {
      feature: 'Approach',
      traditional: 'Off-the-shelf catalog',
      sudaksha: 'Custom precision-curation'
    },
    {
      feature: 'Curriculum',
      traditional: 'Generic industry content',
      sudaksha: 'Mapped to YOUR tech stack'
    },
    {
      feature: 'Trainers',
      traditional: 'Career educators',
      sudaksha: 'Working practitioners'
    },
    {
      feature: 'Success Metrics',
      traditional: 'Attendance & certificates',
      sudaksha: 'Measurable competency improvement'
    },
    {
      feature: 'Accountability',
      traditional: 'End at completion',
      sudaksha: '90-day post-training support'
    },
    {
      feature: 'Hiring Integration',
      traditional: 'None',
      sudaksha: 'THD & HTD employment models'
    },
    {
      feature: 'Reporting',
      traditional: 'Final summary report',
      sudaksha: 'Daily conduct reports'
    },
    {
      feature: 'Customization',
      traditional: 'Minor tweaks possible',
      sudaksha: '100% custom-built'
    },
    {
      feature: 'Business Alignment',
      traditional: 'Course-focused',
      sudaksha: 'Problem-solving focused'
    }
  ];

  return (
    <section className={`py-20 bg-gray-50 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Why 200+ Companies Choose Sudaksha
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            See the difference between traditional training and our outcome-driven approach
          </p>
        </div>

        {/* Comparison Grid */}
        <div className={`grid md:grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {comparisonData.map((item, index) => (
            <div 
              key={item.feature}
              className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                {item.feature}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-red-600 font-medium">Traditional:</span>
                  <span className="text-gray-700 ml-2">{item.traditional}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-medium">Sudaksha:</span>
                  <span className="text-gray-700 ml-2 font-medium">{item.sudaksha}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className={`mt-12 grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className={`text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">92%</div>
            <p className="text-gray-700">Client Satisfaction Rate</p>
          </div>
          
          <div className={`text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">3x</div>
            <p className="text-gray-700">Faster Skill Application</p>
          </div>
          
          <div className={`text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">40%</div>
            <p className="text-gray-700">Average Productivity Gain</p>
          </div>
        </div>
      </div>
    </section>
  );
}
