'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Users, TrendingUp, Building, Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const floatingStats = [
    { value: '10,000+', label: 'Students Trained', icon: Users },
    { value: '85%+', label: 'Placement Rate', icon: TrendingUp },
    { value: '200+', label: 'Corporate Partners', icon: Building },
    { value: '12', label: 'Industry Verticals', icon: Target }
  ];

  return (
    <div className="relative min-h-[60vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          {/* Left Side - Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Eyebrow Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-lg font-semibold"
            >
              India's Leading Talent Transformation Platform
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Bridging Academic Output
              <span className="block text-blue-500">and Industry Demand</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-gray-700 leading-relaxed"
            >
              Not just training. Strategic capability building for digital workforce.
            </motion.p>

            {/* Value Proposition Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-800 font-semibold">Outcome-Driven Training with Measurable Results</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-800 font-semibold">Industry-Specific Solutions Across 12+ Verticals</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-800 font-semibold">85%+ Placement Rate with 6 LPA+ Starting Salaries</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-800 font-semibold">Closed-Loop Feedback from 200+ Corporate Partners</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/courses" className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                Explore Programs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/consult" className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center">
                Book Free Consultation
              </Link>
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center space-x-2 text-gray-600"
            >
              <Building className="w-5 h-5" />
              <span className="font-medium">India's 1st IT Finishing School with Long Lasting Outcomes</span>
            </motion.div>
          </motion.div>

          {/* Right Side - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Hero Image/Illustration */}
            <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 min-h-[350px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Transform Your Career</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm">
                  Join thousands of professionals who have transformed their careers with Sudaksha
                </p>
              </div>
            </div>

            {/* Floating Stats Overlay */}
            <div className="absolute top-4 left-4 right-4 grid grid-cols-2 gap-3">
              {floatingStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20"
                >
                  <div className="flex items-center space-x-2">
                    <stat.icon className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-base font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
