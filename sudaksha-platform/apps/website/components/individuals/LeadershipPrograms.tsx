'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Award, TrendingUp, Clock, DollarSign, CheckCircle, ArrowRight, Users, Target, Zap } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

interface LeadershipProgram {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  targetRole: string;
  salaryRange: string;
  description: string;
  whoItsFor: string[];
  curriculum: {
    month: string;
    topics: string[];
    deliverables: string[];
  }[];
  learningOutcomes: string[];
  careerImpact: {
    before: string;
    after: string;
    salaryJump: string;
  };
  fee: string;
  schedule: string;
  duration: string;
  nextBatches: string[];
  prerequisites: string[];
  successStory: {
    name: string;
    background: string;
    timeline: string;
    quote: string;
  };
  optionalAddOns: {
    title: string;
    fee: string;
    duration: string;
  }[];
}

interface LeadershipProgramsProps {
  data: {
    headline: string;
    subheadline: string;
    description: string;
    programs: LeadershipProgram[];
  };
}

export default function LeadershipPrograms({ data }: LeadershipProgramsProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
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

  const toggleProgram = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Architect-Level Skills': return 'bg-purple-500';
      case 'Leadership Excellence': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-sudaksha-purple-50 to-white">
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
          <p className="text-lg text-sudaksha-navy-700 max-w-3xl mx-auto mb-6">
            {data.subheadline}
          </p>
          <p className="text-sudaksha-navy-600 max-w-2xl mx-auto">
            {data.description}
          </p>
        </motion.div>

        {/* Programs Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {data.programs.map((program) => (
            <motion.div
              key={program.id}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Program Header */}
              <div
                className="p-8 cursor-pointer"
                onClick={() => toggleProgram(program.id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left Content */}
                  <div className="flex-1">
                    {/* Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getBadgeColor(program.badge)}`}>
                        {program.badge}
                      </span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-semibold text-sudaksha-purple-600">{program.targetRole}</span>
                        <span className="font-semibold text-sudaksha-green-600">{program.salaryRange}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-3">
                      {program.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-sudaksha-blue-600 font-medium mb-4">
                      {program.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sudaksha-navy-700 mb-6">
                      {program.description}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-sudaksha-orange-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.whoItsFor.length}+ Years Experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-sudaksha-blue-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-sudaksha-purple-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.targetRole}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-sudaksha-green-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.fee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Toggle Button */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-sudaksha-purple-100 rounded-full flex items-center justify-center">
                      {expandedProgram === program.id ? (
                        <ChevronUp className="w-6 h-6 text-sudaksha-purple-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-sudaksha-purple-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedProgram === program.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-sudaksha-navy-100"
                >
                  <div className="p-8 space-y-8">
                    {/* Who This Is For */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Who This Is For</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {program.whoItsFor.map((criterion, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-sudaksha-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sudaksha-navy-700">{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Curriculum */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Curriculum Overview</h4>
                      <div className="space-y-4">
                        {program.curriculum.map((month, index) => (
                          <div key={index} className="bg-gradient-to-r from-sudaksha-purple-50 to-sudaksha-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-sudaksha-navy-800">{month.month}</h5>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-sudaksha-navy-600">Topics:</span>
                                <ul className="space-y-1 mt-1">
                                  {month.topics.map((topic, topicIndex) => (
                                    <li key={topicIndex} className="flex items-center space-x-2 text-sm text-sudaksha-navy-700">
                                      <Zap className="w-3 h-3 text-sudaksha-orange-500" />
                                      <span>{topic}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-sudaksha-navy-600">Deliverables:</span>
                                <ul className="space-y-1 mt-1">
                                  {month.deliverables.map((deliverable, deliverableIndex) => (
                                    <li key={deliverableIndex} className="flex items-center space-x-2 text-sm text-sudaksha-navy-700">
                                      <Award className="w-3 h-3 text-sudaksha-purple-500" />
                                      <span>{deliverable}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Learning Outcomes</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {program.learningOutcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Target className="w-5 h-5 text-sudaksha-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sudaksha-navy-700">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Career Impact */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Career Impact</h4>
                      <div className="bg-gradient-to-r from-sudaksha-green-50 to-sudaksha-blue-50 rounded-lg p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <span className="text-sm font-medium text-sudaksha-navy-600">Before:</span>
                            <p className="text-sudaksha-navy-800 font-semibold">{program.careerImpact.before}</p>
                          </div>
                          <div className="text-center">
                            <TrendingUp className="w-8 h-8 text-sudaksha-green-500 mx-auto mb-2" />
                            <span className="text-lg font-bold text-sudaksha-green-600">{program.careerImpact.salaryJump}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-sudaksha-navy-600">After:</span>
                            <p className="text-sudaksha-navy-800 font-semibold">{program.careerImpact.after}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Program Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Program Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sudaksha-navy-600">Duration:</span>
                            <span className="font-semibold text-sudaksha-navy-800">{program.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sudaksha-navy-600">Schedule:</span>
                            <span className="font-semibold text-sudaksha-navy-800">{program.schedule}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sudaksha-navy-600">Fee:</span>
                            <span className="font-semibold text-sudaksha-navy-800">{program.fee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sudaksha-navy-600">Target Role:</span>
                            <span className="font-semibold text-sudaksha-purple-600">{program.targetRole}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Next Batches</h4>
                        <div className="space-y-2">
                          {program.nextBatches.map((batch, index) => (
                            <div key={index} className="px-3 py-2 bg-sudaksha-purple-100 text-sudaksha-purple-700 rounded text-sm">
                              {batch}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Optional Add-Ons */}
                    {program.optionalAddOns.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Optional Add-Ons</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {program.optionalAddOns.map((addOn, index) => (
                            <div key={index} className="bg-sudaksha-orange-50 rounded-lg p-4">
                              <h5 className="font-semibold text-sudaksha-navy-800 mb-1">{addOn.title}</h5>
                              <div className="text-sm text-sudaksha-navy-600">
                                <span>{addOn.fee}</span> • <span>{addOn.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Story */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Success Story</h4>
                      <div className="bg-sudaksha-blue-50 rounded-lg p-6">
                        <div className="mb-3">
                          <h5 className="font-semibold text-sudaksha-navy-800">{program.successStory.name}</h5>
                          <p className="text-sm text-sudaksha-navy-600">{program.successStory.background}</p>
                          <p className="text-sm text-sudaksha-navy-600">{program.successStory.timeline}</p>
                        </div>
                        <blockquote className="text-sudaksha-navy-700 italic border-l-4 border-sudaksha-blue-500 pl-4">
                          "{program.successStory.quote}"
                        </blockquote>
                      </div>
                    </div>

                    {/* Prerequisites */}
                    <div>
                      <h4 className="text-lg font-bold text-sudaksha-navy-900 mb-3">Prerequisites</h4>
                      <div className="flex flex-wrap gap-2">
                        {program.prerequisites.map((prereq, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-sudaksha-navy-100 text-sudaksha-navy-700 rounded-full text-sm"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <CTAButton
                        variant="custom"
                        className="px-8 py-3 bg-gradient-to-r from-sudaksha-purple-600 to-sudaksha-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                        ctx={{ page: 'Individuals', pageUrl: '/individuals', section: 'Leadership Programs', ctaLabel: 'Enroll Now', audienceType: 'individual', intent: 'career_counseling', prefill: { program: program.title } }}
                      >
                        Enroll Now
                      </CTAButton>
                      <CTAButton
                        variant="custom"
                        className="px-8 py-3 bg-white text-sudaksha-purple-600 font-semibold rounded-lg border-2 border-sudaksha-purple-200 hover:border-sudaksha-purple-300 hover:bg-sudaksha-purple-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        ctx={{ page: 'Individuals', pageUrl: '/individuals', section: 'Leadership Programs', ctaLabel: 'Download Brochure', audienceType: 'individual', intent: 'download_brochure', prefill: { program: program.title } }}
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-sudaksha-purple-100 to-sudaksha-blue-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-4">
              Ready to Lead?
            </h3>
            <p className="text-sudaksha-navy-700 mb-6 max-w-2xl mx-auto">
              Take the next step in your career journey. Our leadership programs are designed to help you transition from senior developer to architect and leadership roles.
            </p>
            <CTAButton
              variant="custom"
              className="px-8 py-3 bg-gradient-to-r from-sudaksha-purple-600 to-sudaksha-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-block transform hover:scale-105 active:scale-95"
              ctx={{ page: 'Individuals', pageUrl: '/individuals', section: 'Leadership Programs Footer', ctaLabel: 'Schedule Leadership Consultation', audienceType: 'individual', intent: 'talk_to_expert' }}
            >
              Schedule Leadership Consultation
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </CTAButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
