'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall } from 'lucide-react';
import { useCTACapture } from '@/hooks/useCTACapture';
import { CounselorModal } from './CounselorModal';

export default function StickyNavCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { capture } = useCTACapture();

  useEffect(() => {
    const handleScroll = () => {
      // Appear after scrolling past typical hero section (e.g., 600px)
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    capture({
      sourcePage: window.location.pathname,
      ctaLabel: 'Sticky Nav CTA',
      intent: 'counseling',
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed top-16 left-0 right-0 z-30 bg-blue-50 border-b border-blue-100 shadow-sm hidden md:block"
          >
            <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-blue-900">Not sure which program to pick?</span>
                <span className="text-sm text-blue-700">Speak to our expert counselors today.</span>
              </div>
              <button
                onClick={handleClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Book Free Consultation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CounselorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
