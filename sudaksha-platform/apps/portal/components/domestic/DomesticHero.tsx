'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Code, Users, Award, TrendingUp } from 'lucide-react';

// Temporary type definition to avoid import issues
interface HeroSection {
  eyebrow: string;
  headline: string;
  subheadline: string;
  valuePropositions: any[];
  primaryCTA: any;
  secondaryCTA: any;
  trustBanner: string;
  heroVisual: any;
}

interface DomesticHeroProps {
  data: HeroSection;
}

const iconMap = {
  Code,
  Users,
  Award,
  TrendingUp,
};

export default function DomesticHero({ data }: DomesticHeroProps) {
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
  } as const;

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
  } as const;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sudaksha-blue-50 via-white to-sudaksha-orange-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-hero-gradient bg-size-200 animate-gradient-shift" />
      </div>

      {/* Navigation Breadcrumb */}
      <div className="relative z-10 pt-6 pb-4">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2 text-sm text-sudaksha-navy-600"
          >
            <span>Home</span>
            <span>/</span>
            <span>Corporates</span>
            <span>/</span>
            <span className="text-sudaksha-blue-600 font-medium">Domestic B2B</span>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Eyebrow */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-2 bg-sudaksha-blue-100 text-sudaksha-blue-700 rounded-full text-sm font-semibold"
            >
              {data.eyebrow}
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-sudaksha-navy-900 leading-tight"
            >
              {data.headline}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-sudaksha-navy-700 leading-relaxed"
            >
              {data.subheadline}
            </motion.p>

            {/* Value Propositions */}
            <motion.div
              variants={itemVariants}
              className="space-y-4"
            >
              {data.valuePropositions.map((prop: any, index: number) => {
                const [firstWord, ...rest] = prop.text.split(': ');
                const IconComponent = iconMap[firstWord as keyof typeof iconMap] || CheckCircle;
                
                return (
                  <div
                    key={prop.id}
                    className="flex items-start space-x-3 group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <IconComponent className="w-5 h-5 text-sudaksha-orange-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <span className="font-semibold text-sudaksha-navy-800">{firstWord}:</span>
                      <span className="text-sudaksha-navy-700 ml-1">{rest.join(': ')}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.a
                href={data.primaryCTA.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group"
              >
                {data.primaryCTA.text}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <motion.a
                href={data.secondaryCTA.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-sudaksha-blue-600 font-semibold rounded-lg border-2 border-sudaksha-blue-200 hover:border-sudaksha-blue-300 hover:bg-sudaksha-blue-50 transition-all duration-300"
              >
                {data.secondaryCTA.text}
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            variants={slideInRightVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              {/* Split Image Layout */}
              <div className="absolute inset-0 grid grid-cols-2 gap-1 bg-sudaksha-navy-100">
                {/* Left Side - Technical Team */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sudaksha-blue-600 to-sudaksha-blue-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <Code className="w-16 h-16 mx-auto mb-4 animate-pulse-slow" />
                        <h3 className="text-xl font-bold mb-2">Technical Excellence</h3>
                        <p className="text-sm opacity-90">Cutting-edge IT training</p>
                      </div>
                    </div>
                  </div>
                  {/* Placeholder for actual image */}
                  <img
                    src={data.heroVisual.leftImage}
                    alt="Technical team coding"
                    className="w-full h-full object-cover opacity-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.querySelector('div')!.classList.remove('hidden');
                    }}
                  />
                </div>

                {/* Right Side - Leadership Team */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sudaksha-orange-500 to-sudaksha-orange-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <Users className="w-16 h-16 mx-auto mb-4 animate-pulse-slow" />
                        <h3 className="text-xl font-bold mb-2">Leadership Growth</h3>
                        <p className="text-sm opacity-90">Behavioral transformation</p>
                      </div>
                    </div>
                  </div>
                  {/* Placeholder for actual image */}
                  <img
                    src={data.heroVisual.rightImage}
                    alt="Leadership team in workshop"
                    className="w-full h-full object-cover opacity-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.querySelector('div')!.classList.remove('hidden');
                    }}
                  />
                </div>
              </div>

              {/* Center Overlay */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-xl">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-hero-gradient">
                    {data.heroVisual.centerOverlay}
                  </h3>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-sudaksha-blue-500 rounded-full opacity-20 blur-xl"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-sudaksha-orange-500 rounded-full opacity-20 blur-xl"
              />
            </div>
          </motion.div>
        </div>

        {/* Trust Banner */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="mt-16 pt-8 border-t border-sudaksha-navy-200"
        >
          <div className="text-center">
            <p className="text-lg font-semibold text-sudaksha-navy-800">
              {data.trustBanner}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
