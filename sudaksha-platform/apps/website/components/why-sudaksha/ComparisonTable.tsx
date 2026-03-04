'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const comparisonData = [
  {
    aspect: 'Approach',
    traditional: 'Certificate-focused',
    platforms: 'Course completion',
    sudaksha: 'Outcome-driven, Job-ready',
  },
  {
    aspect: 'Trainers',
    traditional: 'Career educators',
    platforms: 'Pre-recorded videos',
    sudaksha: 'Working practitioners (5-15 years exp)',
  },
  {
    aspect: 'Batch Size',
    traditional: '50-100 students',
    platforms: 'Unlimited',
    sudaksha: 'Max 25 (personal attention)',
  },
  {
    aspect: 'Projects',
    traditional: 'Academic (calculator, library system)',
    platforms: 'Optional assignments',
    sudaksha: '5-8 real, industry-standard projects',
  },
  {
    aspect: 'Curriculum',
    traditional: 'Fixed, outdated',
    platforms: 'Generic industry content',
    sudaksha: 'Custom-curated from 200+ corporate needs',
  },
  {
    aspect: 'Placement',
    traditional: 'Job board access',
    platforms: 'Resume review',
    sudaksha: 'End-to-end: prep, mock interviews, referrals',
  },
  {
    aspect: 'Support',
    traditional: 'End at course completion',
    platforms: 'Community forum',
    sudaksha: '6 months post-placement support',
  },
  {
    aspect: 'Success Metric',
    traditional: 'Attendance, exam pass',
    platforms: 'Course completion %',
    sudaksha: 'Placement rate, salary, job satisfaction',
  },
  {
    aspect: 'Cost',
    traditional: '₹30K-80K',
    platforms: '₹5K-50K',
    sudaksha: '₹40K-60K (pay after placement option)',
  },
];

export function ComparisonTable() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Makes Sudaksha Different?
          </h2>
          <p className="text-xl text-gray-600">
            Interactive Comparison Table
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <div className="min-w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Aspect
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Traditional Institutes
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Online Platforms
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900 border-b border-blue-200 bg-blue-50">
                    Sudaksha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonData.map((row, index) => (
                  <motion.tr
                    key={row.aspect}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.aspect}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.traditional}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.platforms}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-900 bg-blue-50">
                      {row.sudaksha}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-12"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-blue-900">
              "Others teach courses. We transform careers."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}





