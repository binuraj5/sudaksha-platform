'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle, X } from 'lucide-react';

const promises = [
  {
    category: 'Quality Training',
    items: [
      '✓ Curriculum updated every quarter',
      '✓ Practitioner trainers only (min 5 years exp)',
      '✓ Max 25 students per batch',
      '✓ 70% hands-on, 30% theory',
    ],
  },
  {
    category: 'Transparency',
    items: [
      '✓ Published placement data',
      '✓ No fake reviews',
      '✓ Honest career counseling',
      '✓ Clear fee structure (no hidden costs)',
    ],
  },
  {
    category: 'Placement Support',
    items: [
      '✓ End-to-end support until placed',
      '✓ No time limit (not just 6 months)',
      '✓ Unlimited mock interviews',
      '✓ Access to 200+ hiring partners',
    ],
  },
  {
    category: 'Continuous Learning',
    items: [
      '✓ Lifetime alumni benefits',
      '✓ 50% off future programs',
      '✓ Monthly free workshops',
      '✓ Career growth support',
    ],
  },
];

const dontPromises = [
  '❌ 100% Placement (No one can legally guarantee a job. We guarantee process and support. 85% is our track record.)',
  '❌ Shortcuts (Learning takes time. We don\'t claim "Learn Full Stack in 30 days." Our intensive is 3-4 months minimum.)',
  '❌ Easy Money (Tech jobs pay well, but require hard work. If you don\'t put in effort, we can\'t help.)',
  '❌ Magic Transformation (We provide tools, training, and support. You provide commitment and effort. Both needed for success.)',
];

export function Guarantee() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Promises to You
          </h2>
          <p className="text-xl text-gray-600">
            What you can expect from Sudaksha
          </p>
        </motion.div>

        {/* What We Promise */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            WE PROMISE:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {promises.map((promise, index) => (
              <motion.div
                key={promise.category}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h4 className="text-lg font-semibold text-blue-600 mb-4">
                  {promise.category}
                </h4>
                <div className="space-y-2">
                  {promise.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What We Don't Promise */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 lg:p-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            WHAT WE DON'T PROMISE:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dontPromises.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-lg p-4 border border-red-200"
              >
                <div className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}





