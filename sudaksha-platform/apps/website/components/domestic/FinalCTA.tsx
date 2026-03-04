'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  MessageCircle, ArrowRight, CheckCircle, Users, Target,
  Clock, DollarSign, Award, Zap, Shield, Phone, Mail,
  Calendar, MapPin, Briefcase, Star, ThumbsUp, ChevronDown
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface ContactOption {
  title: string;
  description: string;
  icon: any;
  action: string;
  href: string;
}

interface FinalCTAProps {
  faqData: {
    headline: string;
    categories: string[];
    faqs: FAQ[];
  };
  contactData: {
    headline: string;
    subheadline: string;
    options: ContactOption[];
  };
}

export default function FinalCTA({ faqData, contactData }: FinalCTAProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const filteredFAQs = activeCategory === 'all' 
    ? faqData.faqs 
    : faqData.faqs.filter(faq => faq.category === activeCategory);

  return (
    <section id="final-cta" className="py-20 bg-gradient-to-br from-sudaksha-navy-900 via-sudaksha-navy-800 to-sudaksha-blue-900 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mb-20">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {faqData.headline}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-sudaksha-blue-200 max-w-3xl mx-auto mb-8">
              Find answers to common questions about our Domestic B2B Training Solutions.
            </motion.p>
            <motion.div variants={itemVariants} className="w-24 h-1 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-blue-400 mx-auto rounded-full" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-12">
            {faqData.categories.map((category, index) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm text-sudaksha-blue-200 border border-white/20 hover:bg-white/20'
                }`}
              >
                {category === 'all' ? 'All Questions' : category}
              </motion.button>
            ))}
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div key={index} variants={cardVariants} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-sudaksha-orange-400" />
                    <h3 className="text-white font-semibold">{faq.question}</h3>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-sudaksha-blue-300 transition-transform duration-300 ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>
                
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-sudaksha-blue-200 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {contactData.headline}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-sudaksha-blue-200 max-w-3xl mx-auto mb-8">
              {contactData.subheadline}
            </motion.p>
            <motion.div variants={itemVariants} className="w-24 h-1 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-blue-400 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {contactData.options.map((option, index) => {
              const IconComponent = option.icon;
              
              return (
                <motion.div key={option.title} variants={cardVariants} className="group">
                  <div className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4">{option.title}</h3>
                    <p className="text-sudaksha-blue-200 mb-6">{option.description}</p>
                    
                    <motion.a
                      href={option.href}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300 group"
                    >
                      {option.action}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="mt-16">
            <div className="bg-gradient-to-r from-sudaksha-blue-800/50 to-sudaksha-orange-800/50 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <p className="text-sudaksha-blue-200 text-sm">Companies Trained</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">50,000+</div>
                  <p className="text-sudaksha-blue-200 text-sm">Professionals Certified</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">95%</div>
                  <p className="text-sudaksha-blue-200 text-sm">Client Satisfaction</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">15+</div>
                  <p className="text-sudaksha-blue-200 text-sm">Years Experience</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
