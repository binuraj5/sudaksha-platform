'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Target, Settings, ClipboardCheck, UserCheck, Activity, BarChart, ArrowRight } from 'lucide-react';
import { PROCESS_STEPS } from '../../lib/constants/home';

export function ProcessTimeline() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target': return Target;
      case 'Settings': return Settings;
      case 'ClipboardCheck': return ClipboardCheck;
      case 'UserCheck': return UserCheck;
      case 'Activity': return Activity;
      case 'BarChart': return BarChart;
      default: return Target;
    }
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Precision-Curation Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Six-Sigma methodology applied to training for measurable outcomes
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 hidden lg:block"></div>

          <div className="space-y-8">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = getIcon(step.icon);
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex flex-col lg:flex-row items-center gap-6 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Step Number & Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                    className="relative z-10"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -inset-2 bg-blue-100 rounded-2xl -z-10 animate-pulse"></div>
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                    className={`flex-1 text-center lg:text-${isEven ? 'left' : 'right'}`}
                  >
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 max-w-md">{step.description}</p>
                  </motion.div>

                  {/* Arrow for desktop */}
                  {index < PROCESS_STEPS.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                      className="hidden lg:block"
                    >
                      <ArrowRight className="w-6 h-6 text-blue-400" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-12"
        >
          <a
            href="/why-sudaksha/our-approach"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            Learn More About Our Process
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
