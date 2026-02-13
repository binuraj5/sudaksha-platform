'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Phone, MessageCircle, Calendar } from 'lucide-react';

const actions = [
  {
    icon: Phone,
    text: 'Call Now',
    primary: true,
  },
  {
    icon: MessageCircle,
    text: 'WhatsApp',
    primary: true,
  },
  {
    icon: Calendar,
    text: 'Book Appointment',
    primary: false,
  },
];

export function FinalCTA() {
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
            Don't Wait. Your Career Transformation Starts with a Conversation.
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.text}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  action.primary
                    ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl'
                    : 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg hover:shadow-xl'
                }`}
              >
                {action.text}
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="text-blue-100 mb-4">
              🔒 Your information is safe. We never spam.
            </div>

            <div className="text-blue-200 text-sm">
              Sudaksha Institute of Technology | 📍 Bangalore | Hyderabad | Pune | 📧 hello@sudaksha.com | 📞 +91-XXXXX-XXXXX
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}





