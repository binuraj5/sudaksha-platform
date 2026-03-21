'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, TrendingUp, ArrowRight, Clock, DollarSign, Award, CheckCircle } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

interface Transition {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  successRate: string;
  description: string;
  whoItsFor: string[];
  whatYouAchieve: {
    role: string;
    salaryJump: string;
  };
  curriculum: {
    phase: string;
    duration: string;
    topics: string[];
    project: string;
  }[];
  uniqueValue: string[];
  successStory: {
    name: string;
    before: string;
    after: string;
    timeline: string;
    quote: string;
  };
  fee: string;
  schedule: string;
  duration: string;
  nextBatches: string[];
  prerequisites: string[];
  roi: string;
}

interface CareerTransitionsProps {
  data: {
    headline: string;
    subheadline: string;
    stages: {
      title: string;
      description: string;
      transitions: Transition[];
    }[];
  };
}

export default function CareerTransitions({ data }: CareerTransitionsProps) {
  const [expandedTransition, setExpandedTransition] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(data.stages[0]?.title || '');

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
  } as const;

  const toggleTransition = (transitionId: string) => {
    setExpandedTransition(expandedTransition === transitionId ? null : transitionId);
  };

  const toggleStage = (stageTitle: string) => {
    setExpandedStage(expandedStage === stageTitle ? '' : stageTitle);
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Most Popular Transition': return 'bg-orange-500';
      case 'High-Impact Transition': return 'bg-blue-500';
      case 'Future-Proof Your Career': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-sudaksha-navy-900 mb-4">
            {data.headline}
          </h2>
          <p className="text-lg text-sudaksha-navy-700 max-w-3xl mx-auto">
            {data.subheadline}
          </p>
        </motion.div>

        {/* Career Stages */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {data.stages.map((stage, stageIndex) => (
            <motion.div
              key={stage.title}
              variants={itemVariants}
              className="bg-gradient-to-br from-sudaksha-blue-50 to-sudaksha-orange-50 rounded-2xl p-8"
            >
              {/* Stage Header */}
              <div className="mb-8">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStage(stage.title)}
                >
                  <div>
                    <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-2">
                      {stage.title}
                    </h3>
                    <p className="text-sudaksha-navy-700">{stage.description}</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                    {expandedStage === stage.title ? (
                      <ChevronUp className="w-5 h-5 text-sudaksha-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-sudaksha-blue-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Transitions */}
              {expandedStage === stage.title && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {stage.transitions.map((transition) => (
                    <motion.div
                      key={transition.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Transition Header */}
                      <div
                        className="p-6 cursor-pointer hover:bg-sudaksha-blue-50 transition-colors"
                        onClick={() => toggleTransition(transition.id)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Left Content */}
                          <div className="flex-1">
                            {/* Badge */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getBadgeColor(transition.badge)}`}>
                                {transition.badge}
                              </span>
                              <span className="text-sm font-semibold text-sudaksha-green-600">
                                {transition.successRate}
                              </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-2">
                              {transition.title}
                            </h4>

                            {/* Subtitle */}
                            <p className="text-sudaksha-blue-600 font-medium mb-3">
                              {transition.subtitle}
                            </p>

                            {/* Description */}
                            <p className="text-sudaksha-navy-700 mb-4">
                              {transition.description}
                            </p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-sudaksha-orange-500" />
                                <span className="text-sm text-sudaksha-navy-700">{transition.whatYouAchieve.role}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-sudaksha-green-500" />
                                <span className="text-sm text-sudaksha-navy-700">{transition.whatYouAchieve.salaryJump}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-sudaksha-blue-500" />
                                <span className="text-sm text-sudaksha-navy-700">{transition.duration}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-sudaksha-purple-500" />
                                <span className="text-sm text-sudaksha-navy-700">{transition.fee}</span>
                              </div>
                            </div>
                          </div>

                          {/* Toggle Button */}
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-sudaksha-blue-100 rounded-full flex items-center justify-center">
                              {expandedTransition === transition.id ? (
                                <ChevronUp className="w-5 h-5 text-sudaksha-blue-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-sudaksha-blue-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedTransition === transition.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-sudaksha-navy-100"
                        >
                          <div className="p-6 space-y-8">
                            {/* Who This Is For */}
                            <div>
                              <h5 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Who This Is For</h5>
                              <ul className="space-y-2">
                                {transition.whoItsFor.map((item, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <CheckCircle className="w-5 h-5 text-sudaksha-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sudaksha-navy-700">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Curriculum */}
                            <div>
                              <h5 className="text-lg font-bold text-sudaksha-navy-900 mb-4">Detailed Curriculum</h5>
                              <div className="space-y-3">
                                {transition.curriculum.map((phase, index) => (
                                  <div key={index} className="bg-sudaksha-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h6 className="font-semibold text-sudaksha-navy-800">{phase.phase}</h6>
                                      <span className="text-sm text-sudaksha-navy-600">{phase.duration}</span>
                                    </div>
                                    <ul className="space-y-1 mb-2">
                                      {phase.topics.map((topic, topicIndex) => (
                                        <li key={topicIndex} className="flex items-center space-x-2 text-sm text-sudaksha-navy-700">
                                          <CheckCircle className="w-3 h-3 text-sudaksha-green-500" />
                                          <span>{topic}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="text-sm font-medium text-sudaksha-blue-600">
                                      Project: {phase.project}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Unique Value Proposition */}
                            <div>
                              <h5 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Unique Value Proposition</h5>
                              <div className="bg-gradient-to-r from-sudaksha-orange-50 to-sudaksha-blue-50 rounded-lg p-4">
                                <ul className="space-y-2">
                                  {transition.uniqueValue.map((value, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <TrendingUp className="w-5 h-5 text-sudaksha-orange-500 flex-shrink-0 mt-0.5" />
                                      <span className="text-sudaksha-navy-700">{value}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Success Story */}
                            <div>
                              <h5 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Success Story</h5>
                              <div className="bg-sudaksha-green-50 rounded-lg p-4">
                                <div className="mb-3">
                                  <h6 className="font-semibold text-sudaksha-navy-800">{transition.successStory.name}</h6>
                                  <p className="text-sm text-sudaksha-navy-600">{transition.successStory.timeline}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <span className="text-xs text-sudaksha-navy-600 uppercase">Before:</span>
                                    <p className="text-sudaksha-navy-700">{transition.successStory.before}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-sudaksha-navy-600 uppercase">After:</span>
                                    <p className="text-sudaksha-navy-700">{transition.successStory.after}</p>
                                  </div>
                                </div>
                                <blockquote className="text-sudaksha-navy-700 italic">
                                  "{transition.successStory.quote}"
                                </blockquote>
                              </div>
                            </div>

                            {/* Program Details */}
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Program Details</h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sudaksha-navy-600">Duration:</span>
                                    <span className="font-semibold text-sudaksha-navy-800">{transition.duration}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sudaksha-navy-600">Schedule:</span>
                                    <span className="font-semibold text-sudaksha-navy-800">{transition.schedule}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sudaksha-navy-600">Fee:</span>
                                    <span className="font-semibold text-sudaksha-navy-800">{transition.fee}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sudaksha-navy-600">ROI:</span>
                                    <span className="font-semibold text-sudaksha-green-600">{transition.roi}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Next Batches</h5>
                                <div className="space-y-2">
                                  {transition.nextBatches.map((batch, index) => (
                                    <div key={index} className="px-3 py-2 bg-sudaksha-blue-100 text-sudaksha-blue-700 rounded text-sm">
                                      {batch}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                              <CTAButton
                                variant="custom"
                                className="px-8 py-3 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                ctx={{ page: 'Individuals', pageUrl: '/individuals', section: 'Career Transitions', ctaLabel: 'Enroll Now', audienceType: 'individual', intent: 'career_counseling', prefill: { program: transition.title } }}
                              >
                                Enroll Now
                              </CTAButton>
                              <CTAButton
                                variant="custom"
                                className="px-8 py-3 bg-white text-sudaksha-blue-600 font-semibold rounded-lg border-2 border-sudaksha-blue-200 hover:border-sudaksha-blue-300 hover:bg-sudaksha-blue-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                ctx={{ page: 'Individuals', pageUrl: '/individuals', section: 'Career Transitions', ctaLabel: 'Download Brochure', audienceType: 'individual', intent: 'download_brochure', prefill: { program: transition.title } }}
                              >
                                Download Brochure
                              </CTAButton>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
