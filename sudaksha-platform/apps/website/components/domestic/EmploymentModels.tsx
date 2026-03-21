'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Users, Briefcase, TrendingUp, Target, Clock, DollarSign, 
  CheckCircle, ArrowRight, Zap, Shield, Award, BarChart3,
  Calendar, UserCheck, Building2, Rocket
} from 'lucide-react';

// Temporary type definitions
interface EmploymentModel {
  title: string;
  bestFor: string[];
  phases: {
    title: string;
    duration: string;
    activities: string[];
  }[];
  investmentModel: {
    description: string;
    details: string[];
  };
  successMetrics: {
    label: string;
    value: string;
  }[];
  caseStudyPreview: {
    title: string;
    results: string[];
  };
  cta: {
    text: string;
    href: string;
  };
}

interface EmploymentModelsProps {
  thdData: EmploymentModel;
  htdData: EmploymentModel;
}

export default function EmploymentModels({ thdData, htdData }: EmploymentModelsProps) {
  const [activeModel, setActiveModel] = useState<'thd' | 'htd' | null>(null);

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

  return (
    <section id="employment-models" className="py-20 bg-gradient-to-br from-white via-sudaksha-blue-50 to-sudaksha-orange-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-hero-gradient bg-size-200 animate-gradient-shift" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-sudaksha-navy-900 mb-6"
          >
            Beyond Training: Employment Integration Models
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-sudaksha-navy-700 max-w-3xl mx-auto mb-8"
          >
            Don't just train your talent—acquire and deploy them with our innovative employment models that bridge the gap between learning and productivity.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 mx-auto rounded-full"
          />
        </motion.div>

        {/* Models Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* THD Model */}
          <motion.div
            variants={cardVariants}
            className="group"
            onMouseEnter={() => setActiveModel('thd')}
            onMouseLeave={() => setActiveModel(null)}
          >
            <div className="h-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-2 border-sudaksha-blue-200">
              {/* Model Header */}
              <div className="bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 p-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-white/20 transform rotate-45 scale-150" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-white/90 text-sm font-medium">Model</div>
                      <div className="text-white text-2xl font-bold">THD</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {thdData.title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    Train → Hire → Deploy
                  </p>
                </div>
              </div>

              {/* Model Content */}
              <div className="p-6">
                {/* Best For */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                    Best For:
                  </h4>
                  <div className="space-y-2">
                    {thdData.bestFor.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-sudaksha-navy-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phases */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-sudaksha-orange-600" />
                    Process Phases:
                  </h4>
                  <div className="space-y-3">
                    {thdData.phases.slice(0, activeModel === 'thd' ? undefined : 2).map((phase, index) => (
                      <div key={index} className="bg-sudaksha-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sudaksha-navy-800 text-sm">{phase.title}</h5>
                          <span className="text-xs text-sudaksha-navy-600 bg-sudaksha-blue-200 px-2 py-1 rounded">
                            {phase.duration}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {phase.activities.slice(0, 2).map((activity, activityIndex) => (
                            <li key={activityIndex} className="text-xs text-sudaksha-navy-600 flex items-center space-x-1">
                              <div className="w-1 h-1 bg-sudaksha-blue-500 rounded-full" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  {thdData.phases.length > 2 && activeModel !== 'thd' && (
                    <p className="text-sudaksha-blue-600 text-sm font-medium">
                      +{thdData.phases.length - 2} more phases
                    </p>
                  )}
                </div>

                {/* Investment Model */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-sudaksha-green-600" />
                    Investment Model:
                  </h4>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-sudaksha-navy-700 mb-2">{thdData.investmentModel.description}</p>
                    <ul className="space-y-1">
                      {thdData.investmentModel.details.map((detail, index) => (
                        <li key={index} className="text-xs text-sudaksha-navy-600 flex items-center space-x-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-sudaksha-orange-600" />
                    Success Metrics:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {thdData.successMetrics.slice(0, 4).map((metric, index) => (
                      <div key={index} className="bg-sudaksha-orange-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-sudaksha-orange-600">{metric.value}</div>
                        <div className="text-xs text-sudaksha-navy-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Case Study Preview */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-sudaksha-purple-600" />
                    Case Study Preview:
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h5 className="font-medium text-sudaksha-navy-800 text-sm mb-2">{thdData.caseStudyPreview.title}</h5>
                    <ul className="space-y-1">
                      {thdData.caseStudyPreview.results.map((result, index) => (
                        <li key={index} className="text-xs text-sudaksha-navy-600 flex items-center space-x-1">
                          <CheckCircle className="w-2 h-2 text-purple-500" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <motion.a
                  href={thdData.cta.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-300 group-hover:shadow-lg"
                >
                  <span className="flex items-center justify-center">
                    {thdData.cta.text}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* HTD Model */}
          <motion.div
            variants={cardVariants}
            className="group"
            onMouseEnter={() => setActiveModel('htd')}
            onMouseLeave={() => setActiveModel(null)}
          >
            <div className="h-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-2 border-sudaksha-orange-200">
              {/* Model Header */}
              <div className="bg-gradient-to-r from-sudaksha-orange-600 to-sudaksha-orange-700 p-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-white/20 transform rotate-45 scale-150" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-white/90 text-sm font-medium">Model</div>
                      <div className="text-white text-2xl font-bold">HTD</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {htdData.title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    Hire → Train → Deploy
                  </p>
                </div>
              </div>

              {/* Model Content */}
              <div className="p-6">
                {/* Best For */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-sudaksha-orange-600" />
                    Best For:
                  </h4>
                  <div className="space-y-2">
                    {htdData.bestFor.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-sudaksha-navy-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phases */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                    Process Phases:
                  </h4>
                  <div className="space-y-3">
                    {htdData.phases.slice(0, activeModel === 'htd' ? undefined : 2).map((phase, index) => (
                      <div key={index} className="bg-sudaksha-orange-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sudaksha-navy-800 text-sm">{phase.title}</h5>
                          <span className="text-xs text-sudaksha-navy-600 bg-sudaksha-orange-200 px-2 py-1 rounded">
                            {phase.duration}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {phase.activities.slice(0, 2).map((activity, activityIndex) => (
                            <li key={activityIndex} className="text-xs text-sudaksha-navy-600 flex items-center space-x-1">
                              <div className="w-1 h-1 bg-sudaksha-orange-500 rounded-full" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  {htdData.phases.length > 2 && activeModel !== 'htd' && (
                    <p className="text-sudaksha-orange-600 text-sm font-medium">
                      +{htdData.phases.length - 2} more phases
                    </p>
                  )}
                </div>

                {/* Investment Model */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-sudaksha-green-600" />
                    Investment Model:
                  </h4>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-sudaksha-navy-700 mb-2">{htdData.investmentModel.description}</p>
                    <ul className="space-y-1">
                      {htdData.investmentModel.details.map((detail, index) => (
                        <li key={index} className="text-xs text-sudaksha-navy-600 flex items-center space-x-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                    Success Metrics:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {htdData.successMetrics.slice(0, 4).map((metric, index) => (
                      <div key={index} className="bg-sudaksha-blue-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-sudaksha-blue-600">{metric.value}</div>
                        <div className="text-xs text-sudaksha-navy-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Case Study Preview */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-sudaksha-purple-600" />
                    Case Study Preview:
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h5 className="font-medium text-sudaksha-navy-800 text-sm mb-2">{htdData.caseStudyPreview.title}</h5>
                    <ul className="space-y-1">
                      {htdData.caseStudyPreview.results.map((result, index) => (
                        <li key={index} className="text-xs text-sudaksha-navy-600 flex items-center space-x-1">
                          <CheckCircle className="w-2 h-2 text-purple-500" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <motion.a
                  href={htdData.cta.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full bg-gradient-to-r from-sudaksha-orange-600 to-sudaksha-orange-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-300 group-hover:shadow-lg"
                >
                  <span className="flex items-center justify-center">
                    {htdData.cta.text}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-sudaksha-navy-200">
            <div className="bg-gradient-to-r from-sudaksha-navy-800 to-sudaksha-navy-900 p-4">
              <h3 className="text-xl font-bold text-white text-center">THD vs HTD: Quick Comparison</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-semibold text-sudaksha-navy-800">Aspect</div>
                  <div className="font-semibold text-sudaksha-blue-600 text-center">THD</div>
                  <div className="font-semibold text-sudaksha-orange-600 text-center">HTD</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-sudaksha-navy-100 pt-4">
                  <div className="text-sm text-sudaksha-navy-700">Timeline</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">16-17 weeks</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">1-2 weeks</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-sudaksha-navy-100 pt-4">
                  <div className="text-sm text-sudaksha-navy-700">Payment</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">Post-deployment</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">Monthly billing</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-sudaksha-navy-100 pt-4">
                  <div className="text-sm text-sudaksha-navy-700">Risk</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">Low (guaranteed)</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">Low (trial period)</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-sudaksha-navy-100 pt-4">
                  <div className="text-sm text-sudaksha-navy-700">Customization</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">100%</div>
                  <div className="text-sm text-sudaksha-navy-600 text-center">High</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-sudaksha-blue-50 to-sudaksha-orange-50 rounded-2xl p-8 max-w-4xl mx-auto border border-sudaksha-navy-200">
            <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-4">
              Not Sure Which Model Fits Your Needs?
            </h3>
            <p className="text-sudaksha-navy-700 mb-6">
              Our experts can help you analyze your requirements and recommend the optimal employment model for your organization.
            </p>
            <motion.a
              href="#final-cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group"
            >
              Schedule Consultation
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
