'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    question: 'Which program is best for freshers?',
    answer: 'Depends on interest. Most popular: Java Full Stack (enterprise), MERN Stack (startups), Data Science (analytics). Take assessment to find your fit.',
  },
  {
    question: 'Do you provide placement guarantee?',
    answer: 'We guarantee placement support (not placement itself, as no one can legally). 85% of students get placed within 6 months.',
  },
  {
    question: 'Can I pay after getting a job?',
    answer: 'Yes! Pay After Placement option available for select programs. Learn more',
  },
  {
    question: 'I\'m 35 years old. Can I switch to tech?',
    answer: 'Yes! We\'ve helped 800+ career switchers aged 25-42. Read their stories',
  },
  {
    question: 'How long does it take to become job-ready?',
    answer: '3-6 months for intensive programs, 6-8 months for weekend batches.',
  },
  {
    question: 'What\'s the difference between online and offline classes?',
    answer: 'Online: Flexible timing, same curriculum. Offline: Bangalore campus, networking. Both have same placement support.',
  },
  {
    question: 'Do you provide job referrals?',
    answer: 'Yes! We have partnerships with 200+ companies and provide direct referrals. Many students get interviews before completing the course.',
  },
  {
    question: 'What if I miss classes?',
    answer: 'Recorded sessions available. Weekend batches for working professionals. Doubt-clearing sessions every week.',
  },
  {
    question: 'Can I get a demo class before joining?',
    answer: 'Absolutely! Free demo classes every Saturday & Sunday. Experience our teaching methodology.',
  },
  {
    question: 'What documents do I need for enrollment?',
    answer: 'ID proof, educational certificates. No experience required for most programs. Detailed list provided after admission.',
  },
];

export function QuickFAQ() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0, 1])); // First two items open by default

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Quick answers to common questions about our programs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-medium text-gray-900 pr-4">
                  Q: {faq.question}
                </span>
                {openItems.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {openItems.has(index) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-4"
                >
                  <p className="text-gray-600 leading-relaxed">
                    A: {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-12"
        >
          <Link
            href="/faq"
            className="inline-flex items-center px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            View All 100+ FAQs
          </Link>
        </motion.div>
      </div>
    </div>
  );
}





