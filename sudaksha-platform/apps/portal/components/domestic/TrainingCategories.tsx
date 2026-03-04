'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Code, Briefcase, Settings, Users, Award, TrendingUp, 
  UserCheck, DollarSign, ArrowRight, Clock, Target, CheckCircle 
} from 'lucide-react';

// Temporary type definitions
interface TrainingCategory {
  id: string;
  title: string;
  icon: string;
  coverage: string;
  whatWeCover: string[];
  typicalPrograms: {
    title: string;
    duration: string;
    hours?: number;
  }[];
  businessOutcomes: string[];
  cta: {
    text: string;
    href: string;
  };
}

interface TrainingCategoriesProps {
  categories: TrainingCategory[];
}

export default function TrainingCategories({ categories }: TrainingCategoriesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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

  const iconMap = {
    Code,
    Briefcase,
    Settings,
    Users,
    Award,
    TrendingUp,
    UserCheck,
    DollarSign,
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-purple-600 to-purple-700',
      'from-green-600 to-green-700',
      'from-orange-600 to-orange-700',
      'from-red-600 to-red-700',
      'from-indigo-600 to-indigo-700',
      'from-teal-600 to-teal-700',
      'from-pink-600 to-pink-700',
    ];
    return colors[index % colors.length];
  };

  const getCategoryLightColor = (index: number) => {
    const colors = [
      'from-blue-50 to-blue-100',
      'from-purple-50 to-purple-100',
      'from-green-50 to-green-100',
      'from-orange-50 to-orange-100',
      'from-red-50 to-red-100',
      'from-indigo-50 to-indigo-100',
      'from-teal-50 to-teal-100',
      'from-pink-50 to-pink-100',
    ];
    return colors[index % colors.length];
  };

  return (
    <section id="training-categories" className="py-20 bg-gradient-to-br from-white via-sudaksha-blue-50 to-sudaksha-orange-50 relative overflow-hidden w-screen"
         style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-hero-gradient bg-size-200 animate-gradient-shift" />
      </div>

      <div className="relative z-10 w-full">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16 px-4 sm:px-6 lg:px-8 xl:px-12"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-sudaksha-navy-900 mb-6"
          >
            Comprehensive Training Solutions Across All Functions
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-sudaksha-navy-700 max-w-3xl mx-auto mb-8"
          >
            From technical excellence to behavioral transformation, we offer specialized training programs that address every aspect of organizational capability building.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 mx-auto rounded-full"
          />
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-wrap gap-1 w-screen"
          style={{ 
            width: '100vw', 
            maxWidth: '100vw',
            marginLeft: '0',
            marginRight: '0',
            paddingLeft: '0',
            paddingRight: '0'
          }}
        >
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Code;
            const isExpanded = expandedCategory === category.id;
            
            return (
              <motion.div
                key={category.id}
                variants={cardVariants}
                className="group"
                style={{ 
                  flex: '1 1 calc(16.666% - 4px)', 
                  minWidth: '200px',
                  maxWidth: 'calc(25% - 4px)'
                }}
              >
                <div className={`h-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-sudaksha-navy-100`}>
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${getCategoryColor(index)} p-3 relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-white/20 transform rotate-45 scale-150" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      
                      <h3 className="text-sm font-bold text-white mb-1">
                        {category.title}
                      </h3>
                      
                      <p className="text-white/90 text-xs">
                        {category.coverage}
                      </p>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3">
                    {/* What We Cover */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-1 flex items-center text-xs">
                        <Target className="w-3 h-3 mr-1 text-sudaksha-blue-600" />
                        What We Cover
                      </h4>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {category.whatWeCover.slice(0, isExpanded ? undefined : 2).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start space-x-1">
                            <CheckCircle className="w-2 h-2 text-green-500 mt-1 flex-shrink-0" />
                            <p className="text-xs text-sudaksha-navy-700 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                      
                      {category.whatWeCover.length > 2 && (
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className="text-sudaksha-blue-600 text-xs font-medium hover:text-sudaksha-blue-700 transition-colors mt-1"
                        >
                          {isExpanded ? 'Show less' : `+${category.whatWeCover.length - 2} more`}
                        </button>
                      )}
                    </div>

                    {/* Typical Programs */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-1 flex items-center text-xs">
                        <Clock className="w-3 h-3 mr-1 text-sudaksha-orange-600" />
                        Typical Programs
                      </h4>
                      <div className="space-y-1">
                        {category.typicalPrograms.slice(0, 2).map((program, programIndex) => (
                          <div key={programIndex} className="bg-sudaksha-blue-50 rounded-lg p-1">
                            <p className="font-medium text-sudaksha-navy-800 text-xs">{program.title}</p>
                            <p className="text-sudaksha-navy-600 text-xs">{program.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Business Outcomes */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-1 flex items-center text-xs">
                        <Award className="w-3 h-3 mr-1 text-sudaksha-green-600" />
                        Business Outcomes
                      </h4>
                      <div className="space-y-1">
                        {category.businessOutcomes.slice(0, 2).map((outcome, outcomeIndex) => (
                          <div key={outcomeIndex} className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-sudaksha-green-500 rounded-full" />
                            <p className="text-xs text-sudaksha-navy-700">{outcome}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.a
                      href={category.cta.href}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`block w-full bg-gradient-to-r ${getCategoryColor(index)} text-white font-semibold py-1.5 px-2 rounded-lg text-center transition-all duration-300 group-hover:shadow-lg text-xs`}
                    >
                      <span className="flex items-center justify-center">
                        {category.cta.text}
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mt-16"
        >
          <div className={`bg-gradient-to-r ${getCategoryLightColor(0)} rounded-2xl p-8 max-w-4xl mx-auto border border-sudaksha-blue-200`}>
            <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-sudaksha-navy-700 mb-6">
              We specialize in custom-curated programs. Let us design a training solution specifically for your organization's needs.
            </p>
            <motion.a
              href="#curation-process"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group"
            >
              Explore Our Custom Process
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
