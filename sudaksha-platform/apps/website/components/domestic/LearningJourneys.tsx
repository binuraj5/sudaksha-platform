'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Code, Users, Target, ArrowRight, CheckCircle, Clock,
  Award, BookOpen, Zap, TrendingUp, Calendar, Brain,
  Heart, MessageSquare, GitBranch, Database, Cloud
} from 'lucide-react';

// Temporary type definitions
interface LearningMonth {
  month: string;
  technicalFocus: {
    topic: string;
    skills: string[];
    projects: string[];
  };
  behavioralFocus: {
    topic: string;
    skills: string[];
    activities: string[];
  };
  integration: {
    description: string;
    deliverables: string[];
  };
}

interface LearningJourney {
  headline: string;
  scenario: string;
  months: LearningMonth[];
  result: string;
  cta: {
    text: string;
    href: string;
  };
}

interface LearningJourneysProps {
  data: LearningJourney;
}

export default function LearningJourneys({ data }: LearningJourneysProps) {
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

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

  const monthVariants = {
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

  const getMonthColor = (index: number) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-purple-600 to-purple-700',
      'from-green-600 to-green-700',
      'from-orange-600 to-orange-700',
      'from-red-600 to-red-700',
      'from-indigo-600 to-indigo-700',
    ];
    return colors[index % colors.length];
  };

  const getMonthLightColor = (index: number) => {
    const colors = [
      'from-blue-50 to-blue-100',
      'from-purple-50 to-purple-100',
      'from-green-50 to-green-100',
      'from-orange-50 to-orange-100',
      'from-red-50 to-red-100',
      'from-indigo-50 to-indigo-100',
    ];
    return colors[index % colors.length];
  };

  return (
    <section id="learning-journeys" className="py-8 bg-gradient-to-br from-white via-sudaksha-blue-50 to-sudaksha-orange-50 relative overflow-hidden">
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
          className="text-center mb-6"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-sudaksha-navy-900 mb-6"
          >
            {data.headline}
          </motion.h2>
          
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto mb-4"
          >
            <div className="bg-gradient-to-r from-sudaksha-blue-100 to-sudaksha-orange-100 rounded-2xl p-6 border border-sudaksha-navy-200">
              <h3 className="text-xl font-bold text-sudaksha-navy-800 mb-3 flex items-center justify-center">
                <Target className="w-6 h-6 mr-2 text-sudaksha-blue-600" />
                {data.scenario}
              </h3>
              <p className="text-sudaksha-navy-700">
                See how we integrate technical excellence with behavioral transformation to create well-rounded professionals.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 mx-auto rounded-full"
          />
        </motion.div>

        {/* Journey Timeline */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full bg-gradient-to-b from-sudaksha-blue-600 to-sudaksha-orange-500 rounded-full" />
              
              {/* Months */}
              <div className="space-y-4">
                {data.months.map((month, index) => {
                  const isLeft = index % 2 === 0;
                  const isActive = activeMonth === index;
                  
                  return (
                    <motion.div
                      key={month.month}
                      variants={monthVariants}
                      className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
                      onMouseEnter={() => setActiveMonth(index)}
                      onMouseLeave={() => setActiveMonth(null)}
                    >
                      {/* Month Circle */}
                      <div className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r ${getMonthColor(index)} rounded-full flex items-center justify-center shadow-2xl z-20 cursor-pointer hover:scale-110 transition-transform duration-300`}>
                        <div className="text-center">
                          <div className="text-white font-bold text-sm">M{index + 1}</div>
                          <div className="text-white/90 text-xs">{month.month}</div>
                        </div>
                      </div>
                      
                      {/* Month Content */}
                      <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left ml-auto'}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`bg-gradient-to-br ${getMonthLightColor(index)} rounded-2xl p-3 shadow-xl border border-white/50 backdrop-blur-sm`}
                        >
                          {/* Month Header */}
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-base font-bold text-sudaksha-navy-900 ${isLeft ? 'text-right' : ''}`}>
                              Month {index + 1}: {month.month}
                            </h3>
                            <div className={`flex space-x-2 ${isLeft ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-6 h-6 bg-gradient-to-r ${getMonthColor(index)} rounded-lg flex items-center justify-center`}>
                                <Code className="w-3 h-3 text-white" />
                              </div>
                              <div className="w-6 h-6 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 rounded-lg flex items-center justify-center">
                                <Users className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Technical Focus */}
                          <div className="mb-3">
                            <h4 className="font-semibold text-sudaksha-blue-700 mb-1 flex items-center">
                              <Code className="w-3 h-3 mr-2" />
                              Technical Focus:
                            </h4>
                            <div className="bg-white rounded-lg p-2 mb-2">
                              <h5 className="font-medium text-sudaksha-navy-800 mb-1">{month.technicalFocus.topic}</h5>
                              <div className="space-y-1">
                                <div>
                                  <p className="text-xs font-medium text-sudaksha-navy-700 mb-1">Skills:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {month.technicalFocus.skills.slice(0, isActive ? undefined : 2).map((skill, skillIndex) => (
                                      <span key={skillIndex} className="text-xs bg-sudaksha-blue-100 text-sudaksha-blue-700 px-2 py-1 rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                  {month.technicalFocus.skills.length > 2 && !isActive && (
                                    <span className="text-xs text-sudaksha-blue-600">+{month.technicalFocus.skills.length - 2} more</span>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="text-xs font-medium text-sudaksha-navy-700 mb-1">Projects:</p>
                                  <ul className="space-y-1">
                                    {month.technicalFocus.projects.slice(0, isActive ? undefined : 1).map((project, projectIndex) => (
                                      <li key={projectIndex} className="text-xs text-sudaksha-navy-600 flex items-center">
                                        <CheckCircle className="w-2 h-2 text-green-500 mr-1" />
                                        {project}
                                      </li>
                                    ))}
                                  </ul>
                                  {month.technicalFocus.projects.length > 1 && !isActive && (
                                    <span className="text-xs text-sudaksha-blue-600">+{month.technicalFocus.projects.length - 1} more</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Behavioral Focus */}
                          <div className="mb-3">
                            <h4 className="font-semibold text-sudaksha-orange-700 mb-1 flex items-center">
                              <Users className="w-3 h-3 mr-2" />
                              Behavioral Focus:
                            </h4>
                            <div className="bg-white rounded-lg p-2 mb-2">
                              <h5 className="font-medium text-sudaksha-navy-800 mb-1">{month.behavioralFocus.topic}</h5>
                              <div className="space-y-1">
                                <div>
                                  <p className="text-xs font-medium text-sudaksha-navy-700 mb-1">Skills:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {month.behavioralFocus.skills.slice(0, isActive ? undefined : 2).map((skill, skillIndex) => (
                                      <span key={skillIndex} className="text-xs bg-sudaksha-orange-100 text-sudaksha-orange-700 px-2 py-1 rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                  {month.behavioralFocus.skills.length > 2 && !isActive && (
                                    <span className="text-xs text-sudaksha-orange-600">+{month.behavioralFocus.skills.length - 2} more</span>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="text-xs font-medium text-sudaksha-navy-700 mb-1">Activities:</p>
                                  <ul className="space-y-1">
                                    {month.behavioralFocus.activities.slice(0, isActive ? undefined : 1).map((activity, activityIndex) => (
                                      <li key={activityIndex} className="text-xs text-sudaksha-navy-600 flex items-center">
                                        <Zap className="w-2 h-2 text-orange-500 mr-1" />
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                  {month.behavioralFocus.activities.length > 1 && !isActive && (
                                    <span className="text-xs text-sudaksha-orange-600">+{month.behavioralFocus.activities.length - 1} more</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Integration */}
                          <div>
                            <h4 className="font-semibold text-sudaksha-green-700 mb-1 flex items-center">
                              <GitBranch className="w-3 h-3 mr-2" />
                              Integration:
                            </h4>
                            <div className="bg-gradient-to-r from-sudaksha-green-50 to-sudaksha-blue-50 rounded-lg p-2">
                              <p className="text-xs text-sudaksha-navy-700 mb-2">{month.integration.description}</p>
                              <div className="space-y-1">
                                {month.integration.deliverables.slice(0, isActive ? undefined : 1).map((deliverable, deliverableIndex) => (
                                  <div key={deliverableIndex} className="flex items-center space-x-2">
                                    <Award className="w-3 h-3 text-green-600 flex-shrink-0" />
                                    <span className="text-xs text-sudaksha-navy-600">{deliverable}</span>
                                  </div>
                                ))}
                              </div>
                              {month.integration.deliverables.length > 1 && !isActive && (
                                <span className="text-xs text-sudaksha-green-600">+{month.integration.deliverables.length - 1} more deliverables</span>
                              )}
                            </div>
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
          <div className="lg:hidden space-y-3">
            {data.months.map((month, index) => {
              const isActive = activeMonth === index;
              
              return (
                <motion.div
                  key={month.month}
                  variants={monthVariants}
                  className={`bg-gradient-to-br ${getMonthLightColor(index)} rounded-2xl p-3 shadow-xl border border-white/50`}
                  onMouseEnter={() => setActiveMonth(index)}
                  onMouseLeave={() => setActiveMonth(null)}
                >
                  {/* Month Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-10 h-10 bg-gradient-to-r ${getMonthColor(index)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">M{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-sudaksha-navy-900">{month.month}</h3>
                        <p className="text-xs text-sudaksha-navy-600">Month {index + 1}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className={`w-6 h-6 bg-gradient-to-r ${getMonthColor(index)} rounded-lg flex items-center justify-center`}>
                        <Code className="w-3 h-3 text-white" />
                      </div>
                      <div className="w-6 h-6 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 rounded-lg flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Technical Focus */}
                  <div className="mb-2">
                    <h4 className="font-semibold text-sudaksha-blue-700 mb-1 flex items-center">
                      <Code className="w-3 h-3 mr-2" />
                      Technical:
                    </h4>
                    <div className="bg-white rounded-lg p-2">
                      <h5 className="font-medium text-sudaksha-navy-800 mb-1">{month.technicalFocus.topic}</h5>
                      <div className="flex flex-wrap gap-1">
                        {month.technicalFocus.skills.slice(0, 3).map((skill, skillIndex) => (
                          <span key={skillIndex} className="text-xs bg-sudaksha-blue-100 text-sudaksha-blue-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Behavioral Focus */}
                  <div className="mb-2">
                    <h4 className="font-semibold text-sudaksha-orange-700 mb-1 flex items-center">
                      <Users className="w-3 h-3 mr-2" />
                      Behavioral:
                    </h4>
                    <div className="bg-white rounded-lg p-2">
                      <h5 className="font-medium text-sudaksha-navy-800 mb-1">{month.behavioralFocus.topic}</h5>
                      <div className="flex flex-wrap gap-1">
                        {month.behavioralFocus.skills.slice(0, 3).map((skill, skillIndex) => (
                          <span key={skillIndex} className="text-xs bg-sudaksha-orange-100 text-sudaksha-orange-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Integration */}
                  <div>
                    <h4 className="font-semibold text-sudaksha-green-700 mb-1 flex items-center">
                      <GitBranch className="w-3 h-3 mr-2" />
                      Integration:
                    </h4>
                    <div className="bg-gradient-to-r from-sudaksha-green-50 to-sudaksha-blue-50 rounded-lg p-2">
                      <p className="text-xs text-sudaksha-navy-700 mb-1">{month.integration.description}</p>
                      <div className="space-y-1">
                        {month.integration.deliverables.slice(0, 2).map((deliverable, deliverableIndex) => (
                          <div key={deliverableIndex} className="flex items-center space-x-2">
                            <Award className="w-3 h-3 text-green-600 flex-shrink-0" />
                            <span className="text-xs text-sudaksha-navy-600">{deliverable}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Result Summary */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-6 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-sudaksha-navy-800 to-sudaksha-navy-900 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-3 text-center">
              Program Outcome
            </h3>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
              <p className="text-base text-sudaksha-blue-200 leading-relaxed text-center">
                {data.result}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1 text-sm">Technical Excellence</h4>
                <p className="text-sudaksha-blue-200 text-xs">Industry-ready skills</p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1 text-sm">Behavioral Skills</h4>
                <p className="text-sudaksha-blue-200 text-xs">Professional collaboration</p>
              </div>
              
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-r from-sudaksha-green-600 to-sudaksha-green-700 rounded-full flex items-center justify-center mx-auto mb-1">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1 text-sm">Integration</h4>
                <p className="text-sudaksha-blue-200 text-xs">Real-world application</p>
              </div>
            </div>
            
            <motion.a
              href={data.cta.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="block w-full bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 text-white font-semibold py-2 px-6 rounded-lg text-center transition-all duration-300 group"
            >
              <span className="flex items-center justify-center">
                {data.cta.text}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
