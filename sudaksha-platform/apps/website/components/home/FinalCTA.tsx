'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { QuoteRequestModal } from '@/src/components/common/QuoteRequestModal';
import { useCTACapture } from '@/hooks/useCTACapture';

export function FinalCTA() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { capture } = useCTACapture();

  return (
    <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career or Team?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join 50,000+ learners who've already taken the leap towards success
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <motion.a
              href="/for-individuals"
              onClick={() => capture({ sourcePage: '/', ctaLabel: 'Explore Programs for Individuals', userType: 'individual' })}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              Explore Programs for Individuals
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.a>

            <motion.button
              onClick={() => { setQuoteOpen(true); capture({ sourcePage: '/', ctaLabel: 'Get Corporate Training Quote', intent: 'corporate_quote', userType: 'corporate' }); }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Get Corporate Training Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-blue-100"
          >
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>Or Call: +91 80468 62777</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>corporate@sudaksha.com</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <QuoteRequestModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} sourcePage="/" />
    </div>
  );
}
