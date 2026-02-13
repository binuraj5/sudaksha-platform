'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Target, DollarSign, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const quickAccessCards = [
  {
    icon: MapPin,
    title: 'Career Roadmaps',
    description: 'Step-by-step paths for 15+ tech roles',
    link: '#roadmaps',
    cta: 'Explore Roadmaps',
  },
  {
    icon: Target,
    title: 'Skill Assessment',
    description: 'Find your strengths in 10 minutes',
    link: '#assessment',
    cta: 'Take Test',
  },
  {
    icon: DollarSign,
    title: 'Salary Guide 2024',
    description: 'Know what you\'re worth',
    link: '#salary',
    cta: 'View Salaries',
  },
  {
    icon: MessageSquare,
    title: 'Interview Prep',
    description: '1000+ questions, tips, and strategies',
    link: '#interview',
    cta: 'Start Preparing',
  },
];

export function HeroSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 lg:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
          >
            Everything You Need to Make the Right{' '}
            <span className="text-blue-600">Career Decision</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto"
          >
            Free tools, guides, and insights to help you choose, prepare, and succeed in your tech career journey.
          </motion.p>

          {/* Quick Access Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          >
            {quickAccessCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                    <card.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                  <Link
                    href={card.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group-hover:underline"
                  >
                    {card.cta} →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}





