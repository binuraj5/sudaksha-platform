'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Users, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DemoBookingModal } from '@/src/components/common/DemoBookingModal';
import { useCTACapture } from '@/hooks/useCTACapture';

const trialOptions = [
  {
    icon: Calendar,
    title: 'ATTEND FREE DEMO CLASS',
    description: 'What: 90-minute live class on Web Development Basics',
    details: [
      'When: Every Saturday & Sunday, 10 AM & 3 PM',
      'Format: Live online (Zoom)',
      'What You\'ll Experience: How we teach (methodology), Trainer quality, Batch size and interaction, Q&A session',
    ],
    action: 'Book Free Demo',
    href: '#demo',
  },
  {
    icon: Users,
    title: 'TALK TO CURRENT STUDENTS',
    description: 'What: 30-min video call with current students',
    details: [
      'Why: Get unfiltered feedback',
      'What to Ask Them: Is it worth it? How\'s the training? Any regrets? Would you recommend?',
    ],
    action: 'Connect with Students',
    href: '#students',
  },
  {
    icon: Shield,
    title: 'TALK TO PLACED ALUMNI',
    description: 'What: 20-min call with alumni working in companies',
    details: [
      'Why: Understand post-placement reality',
      'What to Ask: Did training prepare you? Was placement support helpful? Worth the investment? Career growth after Sudaksha?',
    ],
    action: 'Talk to Alumni',
    href: '#alumni',
  },
];

export function RiskFreeTrial() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [demoOpen, setDemoOpen] = useState(false);
  const { capture } = useCTACapture();
  const router = useRouter();

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Still Not Convinced?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Try Before You Commit
          </p>
          <p className="text-lg text-gray-500">
            3 Risk-Free Ways to Experience Sudaksha
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {trialOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <option.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {option.description}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {option.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-sm text-gray-600">
                    • {detail}
                  </p>
                ))}
              </div>

              <button
                onClick={() => {
                  capture({ sourcePage: '/why-sudaksha', ctaLabel: option.action, intent: option.href === '#demo' ? 'book_demo' : 'view_success_stories' });
                  if (option.href === '#demo') {
                    setDemoOpen(true);
                  } else {
                    router.push('/success-stories');
                  }
                }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center block"
              >
                {option.action}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-2xl mx-auto">
            <h4 className="font-semibold text-yellow-800 mb-2">Money-Back Promise:</h4>
            <p className="text-yellow-700">
              "Attend first 2 weeks. Not satisfied? Full refund (minus ₹2,000 processing fee). No questions asked."
            </p>
          </div>
        </motion.div>
      </div>

      <DemoBookingModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} sourcePage="/why-sudaksha" />
    </div>
  );
}





