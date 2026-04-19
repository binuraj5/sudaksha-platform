'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Building, CheckCircle, Users, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';
import { CounselorModal } from '@/src/components/common/CounselorModal';
import { useCTACapture } from '@/hooks/useCTACapture';

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-4 h-4 text-blue-600" />,
  TrendingUp: <TrendingUp className="w-4 h-4 text-blue-600" />,
  Building: <Building className="w-4 h-4 text-blue-600" />,
  Target: <Target className="w-4 h-4 text-blue-600" />,
};

interface HeroClientProps {
  headline: string;
  subHeadline: string | null;
  badge: string | null;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl?: string | null;
  textTheme: 'LIGHT' | 'DARK';
  stats: Array<{ value: string; label: string; iconName: string }>;
}

export function HeroClient({
  headline,
  subHeadline,
  badge,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  textTheme,
  stats
}: HeroClientProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [counselorOpen, setCounselorOpen] = useState(false);
  const { capture } = useCTACapture();

  const isLight = textTheme === 'LIGHT';
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const subTextColor = isLight ? 'text-gray-700' : 'text-gray-200';
  const badgeBg = isLight ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white backdrop-blur-sm';
  const ctaButtonBg = isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-900';
  const ctaButtonText = isLight ? 'text-white' : 'text-gray-900';
  const secondaryButtonBorder = isLight ? 'border-blue-500 text-blue-600 hover:bg-blue-50' : 'border-white/50 text-white';

  return (
    <div className="relative max-w-screen-xl mx-auto px-4 py-8 lg:py-12 z-10">
      <div className="grid lg:grid-cols-2 gap-6 items-center">
        {/* Left Side - Content */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Eyebrow Text */}
          {badge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${badgeBg}`}
            >
              {badge}
            </motion.div>
          )}

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`text-4xl lg:text-6xl font-bold leading-tight ${textColor}`}
          >
            {headline}
          </motion.h1>

          {/* Description */}
          {subHeadline && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`text-xl leading-relaxed ${subTextColor}`}
            >
              {subHeadline}
            </motion.p>
          )}

          {/* Value Proposition Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <span className={`${textColor} font-semibold`}>Outcome-Driven Training with Measurable Results</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <span className={`${textColor} font-semibold`}>Industry-Specific Solutions Across 12+ Verticals</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <span className={`${textColor} font-semibold`}>85%+ Placement Rate with 6 LPA+ Starting Salaries</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <span className={`${textColor} font-semibold`}>Closed-Loop Feedback from 200+ Corporate Partners</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={primaryCtaUrl}
              onClick={() => capture({ sourcePage: '/', ctaLabel: primaryCtaLabel, intent: 'browse_courses' })}
              className={`px-6 py-3 ${ctaButtonText} rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center ${ctaButtonBg}`}
            >
              {primaryCtaLabel}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            {secondaryCtaLabel && (
              <button
                onClick={() => { setCounselorOpen(true); capture({ sourcePage: '/', ctaLabel: secondaryCtaLabel, intent: 'counseling' }); }}
                className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${secondaryButtonBorder}`}
              >
                {secondaryCtaLabel}
              </button>
            )}
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
            className={`flex items-center space-x-2 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}
          >
            <Building className="w-5 h-5" />
            <span className="font-medium">India's 1st IT Finishing School with Long Lasting Outcomes</span>
          </motion.div>
        </motion.div>

        {/* Right Side - Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          {/* Hero Image/Illustration */}
          <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 min-h-[350px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                <ArrowRight className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Transform Your Career</h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm">
                Join thousands of professionals who have transformed their careers with Sudaksha
              </p>
            </div>
          </div>

          {/* Floating Stats Overlay */}
          <div className="absolute top-4 left-4 right-4 grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20"
              >
                <div className="flex items-center space-x-2">
                  {iconMap[stat.iconName] || <div className="w-4 h-4" />}
                  <div>
                    <div className="text-base font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <CounselorModal isOpen={counselorOpen} onClose={() => setCounselorOpen(false)} sourcePage="/" />
    </div>
  );
}
