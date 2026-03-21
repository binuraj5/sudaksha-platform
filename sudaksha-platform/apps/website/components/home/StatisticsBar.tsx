'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Users, Award, UserCheck, Building } from 'lucide-react';

const statistics = [
  {
    icon: Calendar,
    value: '18+',
    label: 'Years of Excellence'
  },
  {
    icon: Users,
    value: '50K',
    label: 'Students Trained'
  },
  {
    icon: Award,
    value: '30K',
    label: 'Professionals Trained'
  },
  {
    icon: UserCheck,
    value: '3K',
    label: 'Expert Trainers'
  },
  {
    icon: Building,
    value: '200+',
    label: 'Corporate Partners'
  }
];

export function StatisticsBar() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-8 bg-blue-600" ref={ref}>
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-1 rounded-full font-bold text-sm">
            🏆 India's First IT Finishing School
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {statistics.map((stat, index) => (
            <div key={stat.label} className="text-center text-white">
              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-blue-900" />
                </div>
              </div>
              
              {/* Value */}
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              
              {/* Label */}
              <div className="text-xs font-medium text-white">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
