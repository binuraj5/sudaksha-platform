'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Users, TrendingUp, Award, Clock, Target } from 'lucide-react';

interface CareerSwitchersHeroProps {
  data: {
    headline: string;
    subheadline: string;
    valuePropositions: Array<{
      id: number;
      text: string;
      icon: string;
    }>;
    primaryCTA: {
      text: string;
      href: string;
    };
    secondaryCTA: {
      text: string;
      href: string;
    };
    trustBanner: string;
    successMetrics: Array<{
      value: string;
      label: string;
      icon: string;
    }>;
  };
}

export default function CareerSwitchersHero({ data }: CareerSwitchersHeroProps) {
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

  const slideInLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const slideInRightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
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
    };
    return icons[iconName] || <Users className="w-6 h-6" />;
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-hero-gradient bg-size-200 animate-gradient-shift" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Eyebrow */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-6"
          >
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              FOR CAREER SWITCHERS - COMPLETE TRANSFORMATION
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-sudaksha-navy-900 mb-6 text-center"
          >
            {data.headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-sudaksha-navy-700 mb-12 text-center max-w-4xl mx-auto leading-relaxed"
          >
            {data.subheadline}
          </motion.p>

          {/* Value Propositions */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {data.valuePropositions.map((proposition, index) => (
              <motion.div
                key={proposition.id}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    {getIcon(proposition.icon)}
                  </div>
                  <span className="text-purple-700 font-semibold">Complete Journey</span>
                </div>
                <p className="text-sudaksha-navy-700 leading-relaxed">{proposition.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Success Metrics */}
          <motion.div
            variants={slideInLeftVariants}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 mb-12 text-white"
          >
            <div className="grid md:grid-cols-4 gap-8">
              {data.successMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      {getIcon(metric.icon)}
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{metric.value}</div>
                  <div className="text-purple-100 text-sm">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Banner */}
          <motion.div
            variants={slideInRightVariants}
            className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100 mb-12"
          >
            <div className="text-center">
              <p className="text-lg font-semibold text-sudaksha-navy-800 mb-2">
                {data.trustBanner}
              </p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              href={data.primaryCTA.href}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center"
            >
              <span className="flex items-center justify-center">
                {data.primaryCTA.text}
                <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            </motion.a>
            <motion.a
              href={data.secondaryCTA.href}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-purple-700 font-bold rounded-lg shadow-lg border-2 border-purple-200 hover:bg-purple-50 transition-all duration-300 text-center"
            >
              {data.secondaryCTA.text}
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
