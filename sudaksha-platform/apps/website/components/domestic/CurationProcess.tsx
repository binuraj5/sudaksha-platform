'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Search, Target, Palette, FileText, Users, PlayCircle, 
  CheckCircle, Clock, ArrowRight, Zap, Shield, Award 
} from 'lucide-react';

// Temporary type definitions
interface CurationStep {
  step: number;
  title: string;
  duration: string;
  activities: string[];
  deliverable: string;
  specialNotes?: string;
}

interface CurationProcess {
  headline: string;
  subheadline: string;
  steps: CurationStep[];
}

interface CurationProcessProps {
  data: CurationProcess;
}

export default function CurationProcess({ data }: CurationProcessProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

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

  const stepVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const getStepIcon = (step: number) => {
    const icons = [Search, Target, Palette, FileText, Users, PlayCircle];
    return icons[step - 1] || Search;
  };

  const getStepColor = (step: number) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-purple-600 to-purple-700',
      'from-green-600 to-green-700',
      'from-orange-600 to-orange-700',
      'from-red-600 to-red-700',
      'from-indigo-600 to-indigo-700',
    ];
    return colors[step - 1] || colors[0];
  };

  const getStepLightColor = (step: number) => {
    const colors = [
      'from-blue-50 to-blue-100',
      'from-purple-50 to-purple-100',
      'from-green-50 to-green-100',
      'from-orange-50 to-orange-100',
      'from-red-50 to-red-100',
      'from-indigo-50 to-indigo-100',
    ];
    return colors[step - 1] || colors[0];
  };

  return (
    <section id="curation-process" className="py-20 bg-gradient-to-br from-sudaksha-navy-900 via-sudaksha-navy-800 to-sudaksha-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-radial from-sudaksha-orange-500/20 to-transparent" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 left-20 w-32 h-32 bg-sudaksha-blue-500/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-sudaksha-orange-500/10 rounded-full blur-xl"
      />

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
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            {data.headline}
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-sudaksha-blue-200 max-w-3xl mx-auto mb-8"
          >
            {data.subheadline}
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-blue-400 mx-auto rounded-full"
          />
        </motion.div>

        {/* Process Flow */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-sudaksha-blue-600 to-sudaksha-orange-500 rounded-full" />
              
              {/* Steps */}
              <div className="space-y-12">
                {data.steps.map((step, index) => {
                  const IconComponent = getStepIcon(step.step);
                  const isLeft = step.step % 2 === 1;
                  
                  return (
                    <motion.div
                      key={step.step}
                      variants={stepVariants}
                      className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
                      onMouseEnter={() => setActiveStep(step.step)}
                      onMouseLeave={() => setActiveStep(null)}
                    >
                      {/* Step Circle */}
                      <div className={`absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r ${getStepColor(step.step)} rounded-full flex items-center justify-center shadow-2xl z-20 cursor-pointer hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Step Content */}
                      <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left ml-auto'}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`bg-gradient-to-br ${getStepLightColor(step.step)} rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm`}
                        >
                          {/* Step Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className={`flex items-center space-x-3 ${isLeft ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              <div className={`w-12 h-12 bg-gradient-to-r ${getStepColor(step.step)} rounded-lg flex items-center justify-center`}>
                                <span className="text-white font-bold text-lg">{step.step}</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-sudaksha-navy-900">
                                  {step.title}
                                </h3>
                                <div className="flex items-center text-sudaksha-navy-600 text-sm">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {step.duration}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Activities */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-sudaksha-navy-800 mb-2">Activities:</h4>
                            <ul className="space-y-1">
                              {step.activities.slice(0, activeStep === step.step ? undefined : 3).map((activity, activityIndex) => (
                                <li key={activityIndex} className="flex items-start space-x-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                  <span className="text-sm text-sudaksha-navy-700">{activity}</span>
                                </li>
                              ))}
                            </ul>
                            
                            {step.activities.length > 3 && activeStep !== step.step && (
                              <p className="text-sudaksha-blue-600 text-sm font-medium mt-2">
                                +{step.activities.length - 3} more activities
                              </p>
                            )}
                          </div>
                          
                          {/* Special Notes */}
                          {step.specialNotes && activeStep === step.step && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Special Note:</strong> {step.specialNotes}
                              </p>
                            </div>
                          )}
                          
                          {/* Deliverable */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4 text-sudaksha-orange-600" />
                              <span className="text-sm font-medium text-sudaksha-navy-800">
                                Deliverable:
                              </span>
                            </div>
                            <span className="text-sm text-sudaksha-navy-700 font-medium">
                              {step.deliverable}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden space-y-6">
            {data.steps.map((step, index) => {
              const IconComponent = getStepIcon(step.step);
              
              return (
                <motion.div
                  key={step.step}
                  variants={stepVariants}
                  className="bg-gradient-to-br from-sudaksha-navy-800 to-sudaksha-navy-900 rounded-2xl p-6 shadow-xl border border-sudaksha-navy-600"
                >
                  {/* Step Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${getStepColor(step.step)} rounded-full flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        Step {step.step}: {step.title}
                      </h3>
                      <div className="flex items-center text-sudaksha-blue-300 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {step.duration}
                      </div>
                    </div>
                  </div>
                  
                  {/* Activities */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sudaksha-blue-200 mb-2">Activities:</h4>
                    <ul className="space-y-1">
                      {step.activities.map((activity, activityIndex) => (
                        <li key={activityIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                          <span className="text-sm text-sudaksha-blue-100">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Special Notes */}
                  {step.specialNotes && (
                    <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                      <p className="text-sm text-yellow-200">
                        <strong>Special Note:</strong> {step.specialNotes}
                      </p>
                    </div>
                  )}
                  
                  {/* Deliverable */}
                  <div className="bg-sudaksha-navy-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-sudaksha-orange-400" />
                        <span className="text-sm font-medium text-sudaksha-blue-200">
                          Deliverable:
                        </span>
                      </div>
                      <span className="text-sm text-sudaksha-blue-100">
                        {step.deliverable}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-sudaksha-orange-600/20 to-sudaksha-blue-600/20 rounded-2xl p-8 max-w-4xl mx-auto border border-sudaksha-navy-600 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Experience Our Six-Sigma Approach?
            </h3>
            <p className="text-sudaksha-blue-200 mb-6">
              Let us diagnose your needs and design a precision-curated training program that delivers measurable business outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#employment-models"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group"
              >
                Explore Employment Models
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <motion.a
                href="#final-cta"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                Schedule Diagnostic Session
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
