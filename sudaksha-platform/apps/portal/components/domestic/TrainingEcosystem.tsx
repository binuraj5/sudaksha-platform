'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Code, Users, Award, TrendingUp, Target, Zap, Shield, Globe } from 'lucide-react';

// Temporary type definition
interface TrainingEcosystem {
  headline: string;
  innerCircle: {
    title: string;
    items: string[];
  };
  middleCircle: {
    title: string;
    items: string[];
  };
  outerCircle: {
    title: string;
    items: string[];
  };
  bottomText: string;
}

interface TrainingEcosystemProps {
  data: TrainingEcosystem;
}

export default function TrainingEcosystem({ data }: TrainingEcosystemProps) {
  const [activeCircle, setActiveCircle] = useState<'inner' | 'middle' | 'outer' | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  const iconMap = {
    'Technical Skills': Code,
    'Functional Skills': Target,
    'Behavioral Skills': Users,
    'Leadership Skills': Award,
    'Team Dynamics': Zap,
    'Collaboration Tools': Globe,
    'Process Excellence': Shield,
    'Agile Ways of Working': TrendingUp,
    'Culture Transformation': Users,
    'Change Management': Zap,
    'Digital Transformation': Code,
    'Performance Systems': Target,
  };

  return (
    <section className="py-20 bg-gradient-to-br from-sudaksha-navy-900 via-sudaksha-navy-800 to-sudaksha-blue-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sudaksha-blue-500/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-sudaksha-orange-500/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tl from-sudaksha-purple-500/20 via-transparent to-transparent" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 left-20 w-32 h-32 bg-sudaksha-orange-500/10 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 right-20 w-40 h-40 bg-sudaksha-blue-500/10 rounded-full blur-xl"
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
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-blue-400 mx-auto rounded-full"
          />
        </motion.div>

        {/* Desktop Circular Diagram */}
        <div className="hidden lg:block relative">
          <div className="relative w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center">
            {/* Outer Circle - Organizational Capability */}
            <motion.div
              variants={circleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.6 }}
              className="absolute w-[620px] h-[620px] border-4 border-green-400/50 rounded-full"
              onMouseEnter={() => setActiveCircle('outer')}
              onMouseLeave={() => setActiveCircle(null)}
            >
              {/* Title */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <h4 className="text-green-300 font-bold text-sm">ORGANIZATIONAL CAPABILITY</h4>
              </div>
              
              {/* Items arranged in circle */}
              {data.outerCircle.items.map((item, index) => {
                const IconComponent = iconMap[item as keyof typeof iconMap] || Globe;
                const angle = (index * 360) / data.outerCircle.items.length - 90; // Start from top
                const radius = 280; // Distance from center - adjusted for better positioning
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <motion.div
                    key={item}
                    className="absolute bg-green-800/50 backdrop-blur-sm rounded-lg p-2 hover:bg-green-700/50 transition-colors duration-300 cursor-pointer"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      transformOrigin: 'center'
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <IconComponent className="w-4 h-4 text-green-300 mx-auto mb-1" />
                    <p className="text-xs text-green-200 text-center whitespace-nowrap">{item}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Middle Circle - Team Capability */}
            <motion.div
              variants={circleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.4 }}
              className="absolute w-[500px] h-[500px] border-4 border-sudaksha-orange-400/50 rounded-full"
              onMouseEnter={() => setActiveCircle('middle')}
              onMouseLeave={() => setActiveCircle(null)}
            >
              {/* Title */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <h4 className="text-sudaksha-orange-300 font-bold text-sm">TEAM CAPABILITY</h4>
              </div>
              
              {/* Items arranged in circle */}
              {data.middleCircle.items.map((item, index) => {
                const IconComponent = iconMap[item as keyof typeof iconMap] || Users;
                const angle = (index * 360) / data.middleCircle.items.length - 90; // Start from top
                const radius = 220; // Distance from center - adjusted for better positioning
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <motion.div
                    key={item}
                    className="absolute bg-sudaksha-orange-800/50 backdrop-blur-sm rounded-lg p-2 hover:bg-sudaksha-orange-700/50 transition-colors duration-300 cursor-pointer"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      transformOrigin: 'center'
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <IconComponent className="w-4 h-4 text-sudaksha-orange-300 mx-auto mb-1" />
                    <p className="text-xs text-sudaksha-orange-200 text-center whitespace-nowrap">{item}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Inner Circle - Individual Capability */}
            <motion.div
              variants={circleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2 }}
              className="absolute w-80 h-80 border-4 border-sudaksha-blue-400/50 rounded-full"
              onMouseEnter={() => setActiveCircle('inner')}
              onMouseLeave={() => setActiveCircle(null)}
            >
              {/* Title */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <h4 className="text-sudaksha-blue-300 font-bold text-sm">INDIVIDUAL CAPABILITY</h4>
              </div>
              
              {/* Items arranged in circle */}
              {data.innerCircle.items.map((item, index) => {
                const IconComponent = iconMap[item as keyof typeof iconMap] || Code;
                const angle = (index * 360) / data.innerCircle.items.length - 90; // Start from top
                const radius = 140; // Distance from center - adjusted for better positioning
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <motion.div
                    key={item}
                    className="absolute bg-sudaksha-blue-800/50 backdrop-blur-sm rounded-lg p-2 hover:bg-sudaksha-blue-700/50 transition-colors duration-300 cursor-pointer"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      transformOrigin: 'center'
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <IconComponent className="w-4 h-4 text-sudaksha-blue-300 mx-auto mb-1" />
                    <p className="text-xs text-sudaksha-blue-200 text-center whitespace-nowrap">{item}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Center Circle - Your Organization */}
            <motion.div
              variants={circleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="w-48 h-48 bg-gradient-to-br from-sudaksha-orange-500 to-sudaksha-orange-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300"
              onMouseEnter={() => setActiveCircle(null)}
            >
              <div className="text-center p-4">
                <Globe className="w-12 h-12 text-white mx-auto mb-2" />
                <h3 className="text-white font-bold text-lg">Your</h3>
                <h3 className="text-white font-bold text-lg">Organization</h3>
              </div>
            </motion.div>

            {/* Active Circle Detail */}
            {activeCircle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 right-4 w-80 bg-sudaksha-navy-800/95 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-sudaksha-navy-600"
              >
                <h3 className="text-white font-bold text-lg mb-4">
                  {activeCircle === 'inner' && data.innerCircle.title}
                  {activeCircle === 'middle' && data.middleCircle.title}
                  {activeCircle === 'outer' && data.outerCircle.title}
                </h3>
                <ul className="space-y-2">
                  {(activeCircle === 'inner' ? data.innerCircle.items :
                    activeCircle === 'middle' ? data.middleCircle.items :
                    data.outerCircle.items).map((item, index) => (
                    <li key={index} className="text-sudaksha-navy-200 text-sm flex items-center">
                      <div className="w-2 h-2 bg-sudaksha-orange-500 rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-8">
          {/* Individual Capability */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-sudaksha-blue-800 to-sudaksha-blue-900 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Code className="w-6 h-6 mr-2" />
              {data.innerCircle.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {data.innerCircle.items.map((item, index) => {
                const IconComponent = iconMap[item as keyof typeof iconMap] || Code;
                return (
                  <div key={item} className="bg-sudaksha-blue-700/50 rounded-lg p-3">
                    <IconComponent className="w-5 h-5 text-sudaksha-blue-300 mb-2" />
                    <p className="text-sudaksha-blue-200 text-sm">{item}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Team Capability */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-sudaksha-orange-800 to-sudaksha-orange-900 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              {data.middleCircle.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {data.middleCircle.items.map((item, index) => {
                const IconComponent = iconMap[item as keyof typeof iconMap] || Users;
                return (
                  <div key={item} className="bg-sudaksha-orange-700/50 rounded-lg p-3">
                    <IconComponent className="w-5 h-5 text-sudaksha-orange-300 mb-2" />
                    <p className="text-sudaksha-orange-200 text-sm">{item}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Organizational Capability */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-white font-bold text-xl mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2" />
              {data.outerCircle.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {data.outerCircle.items.map((item, index) => {
                const IconComponent = iconMap[item as keyof typeof iconMap] || Globe;
                return (
                  <div key={item} className="bg-green-700/50 rounded-lg p-3">
                    <IconComponent className="w-5 h-5 text-green-300 mb-2" />
                    <p className="text-green-200 text-sm">{item}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom Text */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-xl md:text-2xl font-semibold text-sudaksha-blue-200">
            {data.bottomText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
