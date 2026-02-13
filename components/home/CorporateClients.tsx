'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CORPORATE_CLIENTS } from '../../lib/constants/home';

export function CorporateClients() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Trusted by Leading Companies
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our alumni work at top companies across industries
          </p>
        </motion.div>

        {/* Marquee Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative overflow-hidden"
        >
          {/* Infinite Scroll Marquee */}
          <div className="flex animate-marquee">
            {/* First set of logos */}
            <div className="flex space-x-8 px-4">
              {CORPORATE_CLIENTS.map((client, index) => (
                <motion.div
                  key={`${client}-first`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 flex-shrink-0 min-w-[120px]"
                >
                  <div className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {client}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Second set of logos (duplicate for seamless loop) */}
            <div className="flex space-x-8 px-4">
              {CORPORATE_CLIENTS.map((client, index) => (
                <motion.div
                  key={`${client}-second`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 flex-shrink-0 min-w-[120px]"
                >
                  <div className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {client}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
          width: fit-content;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
