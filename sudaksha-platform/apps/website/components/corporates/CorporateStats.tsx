'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, Award, Zap } from 'lucide-react';

interface StatItem {
  value: string;
  label: string;
  icon: any;
  suffix?: string;
  description: string;
}

export default function CorporateStats() {
  const [counters, setCounters] = useState({ employees: 0, satisfaction: 0, productivity: 0, industries: 0 });

  const stats: StatItem[] = [
    {
      value: '50000',
      label: 'Employees Trained',
      icon: Users,
      description: 'Across 200+ enterprise clients'
    },
    {
      value: '92',
      label: 'Client Satisfaction',
      icon: Award,
      suffix: '%',
      description: 'Would recommend to peers'
    },
    {
      value: '40',
      label: 'Average Productivity Gain',
      icon: TrendingUp,
      suffix: '%',
      description: 'Within 90 days post-training'
    },
    {
      value: '12',
      label: 'Industry Verticals',
      icon: Zap,
      description: 'With specialized expertise'
    }
  ];

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targetValues = {
      employees: 50000,
      satisfaction: 92,
      productivity: 40,
      industries: 12
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounters({
        employees: Math.floor(targetValues.employees * progress),
        satisfaction: Math.floor(targetValues.satisfaction * progress),
        productivity: Math.floor(targetValues.productivity * progress),
        industries: Math.floor(targetValues.industries * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Proven Impact Across Industries
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Numbers that speak for themselves. Real results from real companies.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const currentValue = index === 0 ? counters.employees : 
                               index === 1 ? counters.satisfaction :
                               index === 2 ? counters.productivity : 
                               counters.industries;

            return (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  {currentValue.toLocaleString()}{stat.suffix || ''}
                </div>
                <h3 className="text-xl font-semibold mb-2">{stat.label}</h3>
                <p className="text-white/80">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Join These Success Stories?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Let us show you how we can achieve similar results for your organization.
            </p>
            <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
