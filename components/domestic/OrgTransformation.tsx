'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Users, Target, Zap, Shield, ArrowRight, CheckCircle, Clock,
  TrendingUp, Award, Building2, Brain, Heart, Rocket
} from 'lucide-react';

// Temporary type definitions
interface TransformationPillar {
  title: string;
  whatItIs: string;
  whenYouNeedIt: string[];
  approach: string[];
  typicalDuration: string;
  keyOutcomes: string[];
  cta: {
    text: string;
    href: string;
  };
}

interface OrgTransformationProps {
  headline: string;
  pillars: TransformationPillar[];
}

export default function OrgTransformation({ headline, pillars }: OrgTransformationProps) {
  const [activePillar, setActivePillar] = useState<number | null>(null);

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

  const pillarVariants = {
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

  const getPillarIcon = (title: string) => {
    const icons: { [key: string]: any } = {
      'CHANGE MANAGEMENT': Users,
      'CULTURE TRANSFORMATION': Heart,
      'LEADERSHIP EVOLUTION': Brain,
      'PERFORMANCE SYSTEMS': Target,
    };
    return icons[title] || Shield;
  };

  const getPillarColor = (index: number) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-purple-600 to-purple-700',
      'from-green-600 to-green-700',
      'from-orange-600 to-orange-700',
    ];
    return colors[index % colors.length];
  };

  const getPillarLightColor = (index: number) => {
    const colors = [
      'from-blue-50 to-blue-100',
      'from-purple-50 to-purple-100',
      'from-green-50 to-green-100',
      'from-orange-50 to-orange-100',
    ];
    return colors[index % colors.length];
  };

  const getPillarDarkColor = (index: number) => {
    const colors = [
      'from-blue-800 to-blue-900',
      'from-purple-800 to-purple-900',
      'from-green-800 to-green-900',
      'from-orange-800 to-orange-900',
    ];
    return colors[index % colors.length];
  };

  return (
    <section id="org-transformation" className="py-20 bg-gradient-to-br from-sudaksha-navy-900 via-sudaksha-navy-800 to-sudaksha-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-radial from-sudaksha-orange-500/20 to-transparent" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -40, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 left-20 w-32 h-32 bg-sudaksha-blue-500/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 40, 0], rotate: [0, -180, -360] }}
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
            {headline}
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-sudaksha-blue-200 max-w-3xl mx-auto mb-8"
          >
            We don't just train individuals—we transform entire organizations through systemic interventions that create lasting cultural and performance change.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-blue-400 mx-auto rounded-full"
          />
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {pillars.map((pillar, index) => {
            const IconComponent = getPillarIcon(pillar.title);
            const isActive = activePillar === index;
            
            return (
              <motion.div
                key={pillar.title}
                variants={pillarVariants}
                className="group"
                onMouseEnter={() => setActivePillar(index)}
                onMouseLeave={() => setActivePillar(null)}
              >
                <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-sudaksha-navy-100">
                  {/* Pillar Header */}
                  <div className={`bg-gradient-to-r ${getPillarColor(index)} p-6 relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-white/20 transform rotate-45 scale-150" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-white/90 text-sm font-medium">Pillar</div>
                          <div className="text-white text-2xl font-bold">{index + 1}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>

                  {/* Pillar Content */}
                  <div className="p-6">
                    {/* What It Is */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                        What It Is:
                      </h4>
                      <p className="text-sudaksha-navy-700 leading-relaxed">
                        {pillar.whatItIs}
                      </p>
                    </div>

                    {/* When You Need It */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-sudaksha-orange-600" />
                        When You Need It:
                      </h4>
                      <div className="space-y-2">
                        {pillar.whenYouNeedIt.map((need, needIndex) => (
                          <div key={needIndex} className="flex items-start space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-sm text-sudaksha-navy-700">{need}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Approach */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-sudaksha-purple-600" />
                        Our Approach:
                      </h4>
                      <div className="space-y-2">
                        {pillar.approach.slice(0, isActive ? undefined : 3).map((approachItem, approachIndex) => (
                          <div key={approachIndex} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-sudaksha-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-sudaksha-navy-700">{approachItem}</span>
                          </div>
                        ))}
                      </div>
                      
                      {pillar.approach.length > 3 && !isActive && (
                        <p className="text-sudaksha-purple-600 text-sm font-medium mt-2">
                          +{pillar.approach.length - 3} more approaches
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                        Typical Duration:
                      </h4>
                      <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${getPillarColor(index)} rounded-lg`}>
                        <span className="text-white font-medium">{pillar.typicalDuration}</span>
                      </div>
                    </div>

                    {/* Key Outcomes */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-sudaksha-orange-600" />
                        Key Outcomes:
                      </h4>
                      <div className="space-y-2">
                        {pillar.keyOutcomes.slice(0, isActive ? undefined : 2).map((outcome, outcomeIndex) => (
                          <div key={outcomeIndex} className="bg-sudaksha-navy-50 rounded-lg p-3 border border-sudaksha-navy-100">
                            <p className="text-sm text-sudaksha-navy-700">{outcome}</p>
                          </div>
                        ))}
                      </div>
                      
                      {pillar.keyOutcomes.length > 2 && !isActive && (
                        <p className="text-sudaksha-orange-600 text-sm font-medium mt-2">
                          +{pillar.keyOutcomes.length - 2} more outcomes
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <motion.a
                      href={pillar.cta.href}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`block w-full bg-gradient-to-r ${getPillarColor(index)} text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-300 group-hover:shadow-lg`}
                    >
                      <span className="flex items-center justify-center">
                        {pillar.cta.text}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Integration Visual */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-sudaksha-blue-800/50 to-sudaksha-orange-800/50 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              How the 4 Pillars Work Together
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {pillars.map((pillar, index) => {
                const IconComponent = getPillarIcon(pillar.title);
                return (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${getPillarColor(index)} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-white font-semibold text-sm">{pillar.title.split(' ')[0]}</h4>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center">
              <p className="text-sudaksha-blue-200 mb-6">
                Our integrated approach ensures that transformation happens at all levels simultaneously, creating synergistic effects that multiply impact and sustainability.
              </p>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
              >
                <Rocket className="w-5 h-5 text-white mr-2" />
                <span className="text-white font-medium">360° Transformation</span>
              </motion.div>
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
          <div className="bg-gradient-to-r from-sudaksha-orange-600/20 to-sudaksha-blue-600/20 rounded-2xl p-8 max-w-4xl mx-auto border border-sudaksha-navy-600 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Organization?
            </h3>
            <p className="text-sudaksha-blue-200 mb-6">
              Let's design a comprehensive transformation roadmap that addresses your unique challenges and accelerates your journey to organizational excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#learning-journeys"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group"
              >
                See Transformation Examples
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <motion.a
                href="#final-cta"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                Start Transformation Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
