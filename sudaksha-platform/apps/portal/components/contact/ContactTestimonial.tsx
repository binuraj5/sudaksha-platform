'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star } from 'lucide-react';

export function ContactTestimonial() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              "Response Time was Incredible"
            </h3>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              "I had doubts at 11 PM. Sent a WhatsApp message thinking I'd get a reply next day. Got response in 3 minutes from their support team. That level of care convinced me to enroll."
            </p>

            <div className="text-center">
              <p className="font-semibold text-gray-900">Amit Singh</p>
              <p className="text-gray-600">Java Full Stack Student</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}





