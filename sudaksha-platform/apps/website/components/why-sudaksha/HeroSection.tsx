'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DemoBookingModal } from '@/src/components/common/DemoBookingModal';
import { useCTACapture } from '@/hooks/useCTACapture';

export function HeroSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [demoOpen, setDemoOpen] = useState(false);
  const { capture } = useCTACapture();
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 lg:py-24 overflow-hidden">
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
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-lg font-semibold"
          >
            WHY CHOOSE SUDAKSHA
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
          >
            Not Just Another Training Institute.{' '}
            <span className="text-blue-600">A Career Transformation System.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto"
          >
            50,000+ careers transformed. 85% placement rate. ₹6.5 LPA average salary.
            But numbers don't tell the full story. Here's what makes us fundamentally different.
          </motion.p>

          {/* Visual Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-5xl mx-auto mb-8"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Traditional Training */}
                <div className="p-8 bg-gray-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">👨‍🏫</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Traditional Training</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Classroom lectures</p>
                      <p>• Teacher at board</p>
                      <p>• Passive students</p>
                      <p>• Certificate focus</p>
                    </div>
                  </div>
                </div>

                {/* Sudaksha Way */}
                <div className="p-8 bg-blue-50 border-l border-blue-200">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Sudaksha Way</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• Hands-on coding</p>
                      <p>• Mentor guidance</p>
                      <p>• Active learning</p>
                      <p>• Job-ready skills</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <button
              onClick={() => {
                capture({ sourcePage: '/why-sudaksha', ctaLabel: 'Experience a Demo Class', intent: 'book_demo' });
                setDemoOpen(true);
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Experience a Demo Class
            </button>
            <button
              onClick={() => {
                capture({ sourcePage: '/why-sudaksha', ctaLabel: 'Talk to Our Alumni', intent: 'view_success_stories' });
                router.push('/success-stories');
              }}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200 font-semibold text-lg"
            >
              Talk to Our Alumni
            </button>
          </motion.div>
        </motion.div>
      </div>

      <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} sourcePage="/why-sudaksha" />
    </div>
  );
}





