'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MessageCircle, Calendar, Download, Phone } from 'lucide-react';
import Link from 'next/link';

const ctaActions = [
  {
    icon: MessageCircle,
    title: '💬 Chat With Us',
    description: 'Get instant answers',
    action: 'Start Chat',
    href: '#chat',
    primary: true,
  },
  {
    icon: Calendar,
    title: '📅 Book a Call',
    description: 'Talk to career counselor',
    action: 'Schedule Call',
    href: '#contact',
    primary: false,
  },
  {
    icon: Download,
    title: '📧 Get Brochure',
    description: 'All programs, pricing, details',
    action: 'Email Me',
    href: '#brochure',
    primary: false,
  },
];

export function CTASection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Still Have Questions? Let's Talk.
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
          >
            {ctaActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-blue-100 mb-4">
                  {action.description}
                </p>
                <Link
                  href={action.href}
                  className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    action.primary
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  {action.action}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-blue-100 mb-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>📍 Visit Us: Bangalore | Hyderabad | Pune</span>
              </div>
              <div>
                ⏰ Mon-Sat: 9 AM - 8 PM
              </div>
            </div>

            <div className="text-sm text-blue-200">
              Your information is safe. We never spam or share your details.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}





