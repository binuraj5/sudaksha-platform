'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Clock, Users, TrendingUp, Award, ChevronDown, ChevronUp, Star, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

interface Program {
  id: string;
  title: string;
  duration: string;
  hours: number;
  placementRate: number;
  avgSalary: string;
  fee: string;
  emi: string;
  level: string;
  badges: string[];
  description: string;
  whatYouBecome: string;
  curriculum: {
    phase: string;
    duration: string;
    topics: string[];
    project: string;
  }[];
  tools: string[];
  outcomes: string[];
  careerPaths: {
    role: string;
    salary: string;
  }[];
  batches: string[];
  prerequisites: string[];
  successStories: {
    name: string;
    background: string;
    placement: string;
    quote: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

interface ProgramShowcaseProps {
  data: {
    headline: string;
    subheadline: string;
    filterOptions: string[];
    programs: Program[];
  };
}

export default function ProgramShowcase({ data }: ProgramShowcaseProps) {
  const [selectedFilter, setSelectedFilter] = useState('All Programs');
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<{ [key: string]: string }>({});

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

  const toggleProgram = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  const toggleSection = (programId: string, section: string) => {
    setExpandedSection(prev => ({
      ...prev,
      [programId]: prev[programId] === section ? '' : section
    }));
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Most Popular': return 'bg-orange-500';
      case 'High Demand': return 'bg-blue-500';
      case 'Trending': return 'bg-purple-500';
      case 'High Growth': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-sudaksha-blue-50 to-white">
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

        {/* Filter Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {data.filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedFilter === filter
                  ? 'bg-sudaksha-blue-600 text-white shadow-lg'
                  : 'bg-white text-sudaksha-navy-700 border border-sudaksha-navy-200 hover:border-sudaksha-blue-300'
              }`}
            >
              {filter}
            </button>
          ))}
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
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {program.badges.map((badge) => (
                        <span
                          key={badge}
                          className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getBadgeColor(badge)}`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    {/* Title and Basic Info */}
                    <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-2">
                      {program.title}
                    </h3>
                    
                    <p className="text-sudaksha-navy-700 mb-4">
                      {program.description}
                    </p>

                    <p className="text-sudaksha-blue-600 font-medium mb-4">
                      {program.whatYouBecome}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-sudaksha-orange-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-sudaksha-blue-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.placementRate}% Placement</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-sudaksha-green-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.avgSalary}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-sudaksha-purple-500" />
                        <span className="text-sm text-sudaksha-navy-700">{program.fee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Toggle Button */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-sudaksha-blue-100 rounded-full flex items-center justify-center">
                      {expandedProgram === program.id ? (
                        <ChevronUp className="w-6 h-6 text-sudaksha-blue-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-sudaksha-blue-600" />
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
                    {/* Curriculum */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Curriculum Overview</h4>
                      <div className="space-y-4">
                        {program.curriculum.map((phase, index) => (
                          <div key={index} className="bg-sudaksha-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-sudaksha-navy-800">{phase.phase}</h5>
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

                    {/* Tools & Technologies */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Tools & Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {program.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-3 py-1 bg-sudaksha-orange-100 text-sudaksha-orange-700 rounded-full text-sm"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Learning Outcomes</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {program.outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-sudaksha-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sudaksha-navy-700">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Career Paths */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Career Paths</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {program.careerPaths.map((path, index) => (
                          <div key={index} className="bg-gradient-to-r from-sudaksha-blue-50 to-sudaksha-orange-50 rounded-lg p-4">
                            <div className="font-semibold text-sudaksha-navy-800">{path.role}</div>
                            <div className="text-sudaksha-blue-600 font-medium">{path.salary}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Batch Schedule */}
                    <div>
                      <h4 className="text-xl font-bold text-sudaksha-navy-900 mb-4">Next Batches</h4>
                      <div className="flex flex-wrap gap-2">
                        {program.batches.map((batch) => (
                          <span
                            key={batch}
                            className="px-4 py-2 bg-sudaksha-green-100 text-sudaksha-green-700 rounded-lg text-sm font-medium"
                          >
                            {batch}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <CTAButton 
                        variant="primary"
                        className="px-8 py-3 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                        ctx={{ page: 'Individuals', pageUrl: '/individuals', section: 'Program Showcase', ctaLabel: 'Enroll Now', audienceType: 'individual', intent: 'career_counseling', prefill: { program: program.title } }}
                      >
                        Enroll Now
                      </CTAButton>
                      <CTAButton 
                        variant="outline"
                        className="px-8 py-3 bg-white text-sudaksha-blue-600 font-semibold rounded-lg border-2 border-sudaksha-blue-200 hover:border-sudaksha-blue-300 hover:bg-sudaksha-blue-50 transition-all duration-300"
                        ctx={{ page: 'Individuals', pageUrl: '/individuals', section: 'Program Showcase', ctaLabel: 'Download Brochure', audienceType: 'individual', intent: 'download_brochure', prefill: { program: program.title } }}
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
      </div>
    </section>
  );
}
