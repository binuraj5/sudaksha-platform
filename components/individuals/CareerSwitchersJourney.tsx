'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Users, TrendingUp, Award, Clock, Target, BookOpen, Code, 
  Briefcase, ArrowRight, CheckCircle, Star, Zap 
} from 'lucide-react';

interface JourneyPhase {
  phase: string;
  title: string;
  duration: string;
  description: string;
  topics: string[];
  outcomes: string[];
  icon: string;
}

interface CareerSwitchersJourneyProps {
  data: {
    headline: string;
    subheadline: string;
    phases: JourneyPhase[];
    successStories: Array<{
      name: string;
      previousRole: string;
      newRole: string;
      salaryIncrease: string;
      duration: string;
      testimonial: string;
      rating: number;
    }>;
    programFeatures: Array<{
      title: string;
      description: string;
      icon: string;
      included: boolean;
    }>;
    cta: {
      text: string;
      href: string;
    };
  };
}

export default function CareerSwitchersJourney({ data }: CareerSwitchersJourneyProps) {
  const [activePhase, setActivePhase] = useState<number | null>(null);

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

  const phaseVariants = {
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

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      Users: <Users className="w-6 h-6" />,
      TrendingUp: <TrendingUp className="w-6 h-6" />,
      Award: <Award className="w-6 h-6" />,
      Clock: <Clock className="w-6 h-6" />,
      Target: <Target className="w-6 h-6" />,
      BookOpen: <BookOpen className="w-6 h-6" />,
      Code: <Code className="w-6 h-6" />,
      Briefcase: <Briefcase className="w-6 h-6" />,
      Zap: <Zap className="w-6 h-6" />,
    };
    return icons[iconName] || <Users className="w-6 h-6" />;
  };

  const getPhaseColor = (index: number) => {
    const colors = [
      'from-purple-600 to-purple-700',
      'from-blue-600 to-blue-700',
      'from-green-600 to-green-700',
      'from-orange-600 to-orange-700',
      'from-red-600 to-red-700',
    ];
    return colors[index % colors.length];
  };

  const getPhaseLightColor = (index: number) => {
    const colors = [
      'from-purple-50 to-purple-100',
      'from-blue-50 to-blue-100',
      'from-green-50 to-green-100',
      'from-orange-50 to-orange-100',
      'from-red-50 to-red-100',
    ];
    return colors[index % colors.length];
  };

  return (
    <section className="py-16 bg-gradient-to-br from-white via-purple-50 to-blue-50 relative overflow-hidden">
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
            {data.headline}
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-sudaksha-navy-700 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            {data.subheadline}
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"
          />
        </motion.div>

        {/* Journey Phases */}
        <motion.div
          variants={containerVariants}
          className="mb-16"
        >
          <div className="space-y-8">
            {data.phases.map((phase, index) => {
              const isActive = activePhase === index;
              
              return (
                <motion.div
                  key={phase.phase}
                  variants={phaseVariants}
                  className={`bg-gradient-to-br ${getPhaseLightColor(index)} rounded-2xl p-8 shadow-xl border border-white/50`}
                  onMouseEnter={() => setActivePhase(index)}
                  onMouseLeave={() => setActivePhase(null)}
                >
                  <div className="flex items-start gap-6">
                    {/* Phase Icon */}
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${getPhaseColor(index)} rounded-2xl flex items-center justify-center shadow-lg`}>
                      {getIcon(phase.icon)}
                    </div>
                    
                    {/* Phase Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-2">
                            {phase.title}
                          </h3>
                          <p className="text-purple-600 font-semibold mb-2">
                            {phase.phase} • {phase.duration}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <div className={`w-10 h-10 bg-gradient-to-r ${getPhaseColor(index)} rounded-lg flex items-center justify-center`}>
                            <Code className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sudaksha-navy-700 mb-6 leading-relaxed">
                        {phase.description}
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Topics */}
                        <div>
                          <h4 className="font-semibold text-sudaksha-navy-900 mb-3 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                            What You'll Learn
                          </h4>
                          <div className="space-y-2">
                            {phase.topics.slice(0, isActive ? undefined : 4).map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sudaksha-navy-700 text-sm">{topic}</span>
                              </div>
                            ))}
                            {phase.topics.length > 4 && !isActive && (
                              <span className="text-purple-600 text-sm font-medium">
                                +{phase.topics.length - 4} more topics
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Outcomes */}
                        <div>
                          <h4 className="font-semibold text-sudaksha-navy-900 mb-3 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-purple-600" />
                            Learning Outcomes
                          </h4>
                          <div className="space-y-2">
                            {phase.outcomes.slice(0, isActive ? undefined : 3).map((outcome, outcomeIndex) => (
                              <div key={outcomeIndex} className="flex items-start space-x-2">
                                <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sudaksha-navy-700 text-sm">{outcome}</span>
                              </div>
                            ))}
                            {phase.outcomes.length > 3 && !isActive && (
                              <span className="text-purple-600 text-sm font-medium">
                                +{phase.outcomes.length - 3} more outcomes
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          variants={containerVariants}
          className="mb-16"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl md:text-3xl font-bold text-sudaksha-navy-900 mb-8 text-center"
          >
            Success Stories: Real Career Transformations
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.successStories.map((story, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sudaksha-navy-900">{story.name}</h4>
                      <p className="text-sm text-sudaksha-navy-600">
                        {story.previousRole} → {story.newRole}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < story.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-semibold">{story.salaryIncrease}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sudaksha-navy-600 text-sm">{story.duration}</span>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sudaksha-navy-700 text-sm italic leading-relaxed">
                    "{story.testimonial}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Program Features */}
        <motion.div
          variants={containerVariants}
          className="mb-16"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl md:text-3xl font-bold text-sudaksha-navy-900 mb-8 text-center"
          >
            Complete Program Features
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.programFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`bg-white rounded-2xl p-6 shadow-lg border ${
                  feature.included 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${
                    feature.included
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gray-400'
                  }`}>
                    {getIcon(feature.icon)}
                  </div>
                  <h4 className={`font-bold ${
                    feature.included ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {feature.title}
                  </h4>
                </div>
                <p className={`text-sm leading-relaxed ${
                  feature.included ? 'text-sudaksha-navy-700' : 'text-gray-500'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          className="text-center"
        >
          <motion.a
            href={data.cta.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {data.cta.text}
            <ArrowRight className="ml-2 w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}