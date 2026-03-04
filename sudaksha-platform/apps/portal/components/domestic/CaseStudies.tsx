'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Building2, Users, Target, Award, TrendingUp, Clock,
  CheckCircle, ArrowRight, Zap, Shield, BarChart3,
  Calendar, MapPin, Briefcase, Star, ThumbsUp
} from 'lucide-react';

interface CaseStudy {
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  implementation: {
    duration: string;
    participants: number;
    format: string;
    focus: string[];
  };
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  testimonial: {
    quote: string;
    author: string;
    position: string;
  };
}

interface CaseStudiesProps {
  data: {
    headline: string;
    subheadline: string;
    studies: CaseStudy[];
  };
}

export default function CaseStudies({ data }: CaseStudiesProps) {
  const [activeStudy, setActiveStudy] = useState<number | null>(null);

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

  const getStudyColor = (index: number) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-green-600 to-green-700',
      'from-purple-600 to-purple-700',
    ];
    return colors[index % colors.length];
  };

  return (
    <section id="case-studies" className="py-20 bg-gradient-to-br from-white via-sudaksha-blue-50 to-sudaksha-orange-50 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-16">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-sudaksha-navy-900 mb-6">
            {data.headline}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-sudaksha-navy-700 max-w-3xl mx-auto mb-8">
            {data.subheadline}
          </motion.p>
          <motion.div variants={itemVariants} className="w-24 h-1 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {data.studies.map((study, index) => {
            const isActive = activeStudy === index;
            
            return (
              <motion.div key={study.title} variants={cardVariants} className="group" onMouseEnter={() => setActiveStudy(index)} onMouseLeave={() => setActiveStudy(null)}>
                <div className={`h-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-2 ${isActive ? 'border-sudaksha-blue-400' : 'border-sudaksha-navy-200'}`}>
                  <div className={`bg-gradient-to-r ${getStudyColor(index)} p-6 relative overflow-hidden`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-white/90 text-sm font-medium">{study.industry}</div>
                          <div className="text-white text-lg font-bold">{study.company}</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{study.title}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-sudaksha-red-600" />
                        Challenge:
                      </h4>
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-sm text-sudaksha-navy-700">{study.challenge}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-sudaksha-green-600" />
                        Solution:
                      </h4>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-sudaksha-navy-700">{study.solution}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                        Implementation:
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-sudaksha-navy-600">Duration:</span>
                          <span className="font-medium text-sudaksha-navy-800">{study.implementation.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-sudaksha-navy-600">Participants:</span>
                          <span className="font-medium text-sudaksha-navy-800">{study.implementation.participants}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-sudaksha-navy-600">Format:</span>
                          <span className="font-medium text-sudaksha-navy-800">{study.implementation.format}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-sudaksha-orange-600" />
                        Results:
                      </h4>
                      <div className="space-y-2">
                        {study.results.slice(0, isActive ? undefined : 2).map((result, resultIndex) => (
                          <div key={resultIndex} className="bg-sudaksha-orange-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-sudaksha-navy-800">{result.metric}</span>
                              <span className="text-sm font-bold text-sudaksha-orange-600">{result.value}</span>
                            </div>
                            <p className="text-xs text-sudaksha-navy-600">{result.description}</p>
                          </div>
                        ))}
                      </div>
                      {study.results.length > 2 && !isActive && (
                        <p className="text-sudaksha-orange-600 text-sm font-medium">+{study.results.length - 2} more results</p>
                      )}
                    </div>

                    {isActive && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-500" />
                          Testimonial:
                        </h4>
                        <div className="bg-gradient-to-r from-sudaksha-blue-50 to-sudaksha-orange-50 rounded-lg p-4 border border-sudaksha-navy-200">
                          <p className="text-sm text-sudaksha-navy-700 italic mb-3">"{study.testimonial.quote}"</p>
                          <div className="text-right">
                            <p className="text-xs font-medium text-sudaksha-navy-800">{study.testimonial.author}</p>
                            <p className="text-xs text-sudaksha-navy-600">{study.testimonial.position}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <motion.a href="#final-cta" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`block w-full bg-gradient-to-r ${getStudyColor(index)} text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-300 group-hover:shadow-lg`}>
                      <span className="flex items-center justify-center">
                        View Full Case Study
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mt-16">
          <div className="bg-gradient-to-r from-sudaksha-blue-50 to-sudaksha-orange-50 rounded-2xl p-8 max-w-4xl mx-auto border border-sudaksha-navy-200">
            <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-4">Want to Be Our Next Success Story?</h3>
            <p className="text-sudaksha-navy-700 mb-6">Join the growing list of organizations that have transformed their teams with Sudaksha's innovative training solutions.</p>
            <motion.a href="#final-cta" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group">
              Start Your Success Story
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
