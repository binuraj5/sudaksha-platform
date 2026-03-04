'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const responseTimes = [
  { channel: 'Phone', time: 'Immediate' },
  { channel: 'WhatsApp', time: '< 5 minutes (working hours)' },
  { channel: 'Live Chat', time: '< 2 minutes' },
  { channel: 'Email', time: '< 2 hours (working days)' },
  { channel: 'Contact Form', time: '< 2 hours (working days)' },
];

export function ResponseTimeCommitment() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Response Time Commitment
          </h2>
          <p className="text-xl text-gray-600">
            We're committed to fast and reliable communication
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <h3 className="text-2xl font-bold">Our Promise</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Channel</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Response Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {responseTimes.map((item, index) => (
                    <motion.tr
                      key={item.channel}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.channel}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.time}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6"
          >
            <h4 className="font-semibold text-yellow-800 mb-2">After Hours:</h4>
            <p className="text-yellow-700">
              Messages received after 8 PM or on Sunday will be responded to next working morning by 10 AM.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}





