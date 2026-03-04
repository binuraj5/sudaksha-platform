'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { COMPARISON_DATA } from '../../lib/constants/home';

export function DifferenceComparison() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Sudaksha is Different
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Moving beyond traditional training into strategic capability building
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="p-4 text-center">
              <h3 className="text-base font-semibold text-gray-700">Traditional Training</h3>
            </div>
            <div className="p-4 text-center border-x border-gray-200">
              <h3 className="text-base font-semibold text-gray-700">Online Platforms</h3>
            </div>
            <div className="p-4 text-center bg-blue-50">
              <h3 className="text-base font-semibold text-blue-600">Sudaksha Approach</h3>
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                Our Advantage
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {COMPARISON_DATA.map((row, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="grid grid-cols-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 flex items-center">
                <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{row.traditional}</span>
              </div>
              <div className="p-3 flex items-center border-x border-gray-200">
                <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-sm">{row.online}</span>
              </div>
              <div className="p-3 flex items-center bg-blue-50">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-900 font-medium text-sm">{row.sudaksha}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="/why-sudaksha"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            See How We Work
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
