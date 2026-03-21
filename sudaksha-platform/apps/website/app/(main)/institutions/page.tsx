'use client';

import { motion, LayoutGroup, useAnimation, useInView } from 'framer-motion';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  BookOpen, Users, TrendingUp, Award, Target,
  Briefcase, MessageSquare, Server, Code, ArrowRight,
  CheckCircle, AlertCircle, BarChart3, Zap, Shield,
  GraduationCap, Building2, UserCheck, Star, ChevronRight,
  Calendar, FileText
} from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

// Custom debounce hook
const useDebounce = <T,>(value: T, delay: number): [T] => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue];
};

// Custom hooks for optimized animations
const useDebouncedInView = (ref: React.RefObject<Element | null>, amount = 0.1, delay = 100) => {
  const inView = useInView(ref, { amount, once: true });
  const [debouncedInView] = useDebounce(inView, delay);
  return debouncedInView;
};


// Optimized animation variants with simplified transitions
const createAnimationVariants = () => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  },

  item: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  },

  fadeInUp: {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.99
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  },

  slideInLeft: {
    hidden: {
      opacity: 0,
      x: -30,
      scale: 0.97
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
  },

  slideInRight: {
    hidden: {
      opacity: 0,
      x: 30,
      scale: 0.97
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
  },

  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.92,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
  },

  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
});

export default function InstitutionsPage() {
  const animationVariants = useMemo(() => createAnimationVariants(), []);

  // Optimized container variants
  const containerVariants = animationVariants.container;
  const itemVariants = animationVariants.item;
  const fadeInUp = animationVariants.fadeInUp;
  const slideInLeft = animationVariants.slideInLeft;
  const slideInRight = animationVariants.slideInRight;
  const scaleIn = animationVariants.scaleIn;

  // Performance-optimized motion wrapper with batched animations
  const MotionWrapper = useCallback(({
    children,
    variants,
    delay = 50,
    className,
    ...props
  }: {
    children: React.ReactNode;
    variants?: any;
    delay?: number;
    className?: string;
    [key: string]: any;
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const inView = useDebouncedInView(ref, 0.15, delay);

    useEffect(() => {
      if (inView) {
        controls.start('visible');
      }
    }, [controls, inView]);

    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={controls}
        variants={variants || itemVariants}
        {...props}
      >
        {children}
      </motion.div>
    );
  }, []);

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-indigo-900/5"></div>
          <div className="relative container mx-auto px-4">
            <MotionWrapper
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              <motion.div
                variants={slideInLeft}
                className="space-y-4 lg:space-y-6"
              >
                <motion.div
                  variants={scaleIn}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4 lg:mb-6 hover:bg-blue-200 transition-colors cursor-default"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  HIGHER EDUCATION PARTNERSHIPS
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight"
                >
                  Transform Your College from Degree-Awarding to Career-Launching
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8 leading-relaxed"
                >
                  The harsh reality: 60%+ engineering graduates are unemployable. But it doesn't have to be this way. Partner with Sudaksha to bridge gap between academic curriculum and industry requirements. Turn your students into job-ready professionals, boost placement rates, and build your institution's reputation.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8"
                >
                  {[
                    { icon: TrendingUp, text: "85%+ Placement Rate", desc: "Our partner colleges achieve 85%+ placements vs 40-50% national average" },
                    { icon: BookOpen, text: "Industry-Ready Curriculum", desc: "Modern tech stacks, real projects, professional skills" },
                    { icon: BarChart3, text: "Placement Probability Index", desc: "Data-driven system to identify at-risk students early" },
                    { icon: Building2, text: "Direct Corporate Pipeline", desc: "Access to 200+ hiring partners actively recruiting" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-start space-x-2 lg:space-x-3 p-3 lg:p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                      <div className="flex-shrink-0 w-8 lg:w-10 h-8 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">{item.text}</h4>
                        <p className="text-xs lg:text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-3 lg:gap-4"
                >
                  <CTAButton
                    variant="custom"
                    className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base shadow-lg hover:shadow-xl"
                    ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Hero', ctaLabel: 'Schedule Campus Assessment', audienceType: 'institution', intent: 'campus_assessment' }}
                  >
                    Schedule Campus Assessment
                    <ArrowRight className="ml-2 w-4 lg:w-5 h-4 lg:h-5" />
                  </CTAButton>
                  <CTAButton
                    variant="custom"
                    className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors text-sm lg:text-base shadow-lg hover:shadow-xl"
                    ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Hero', ctaLabel: 'Download Partnership Brochure', audienceType: 'institution', intent: 'download_brochure' }}
                  >
                    Download Partnership Brochure
                    <ArrowRight className="ml-2 w-4 lg:w-5 h-4 lg:h-5" />
                  </CTAButton>
                </motion.div>
              </motion.div>

              <motion.div
                variants={slideInRight}
                className="relative"
              >
                <motion.div
                  className="grid grid-cols-2 gap-3 lg:gap-4 bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl p-4 lg:p-6 border border-gray-100"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)" }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-center p-4 lg:p-6 bg-red-50 rounded-lg"
                    whileHover={{ scale: 1.05, backgroundColor: "rgb(254 226 226)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-6 lg:w-8 h-6 lg:h-8 text-red-500 mx-auto mb-2 lg:mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Before</h4>
                    <ul className="text-xs lg:text-sm text-gray-600 space-y-0.5 lg:space-y-1">
                      <li>• Students graduating with low placement rate</li>
                      <li>• Outdated skills and curriculum</li>
                      <li>• Poor industry connections</li>
                      <li>• Declining college reputation</li>
                    </ul>
                  </motion.div>
                  <motion.div
                    className="text-center p-4 lg:p-6 bg-green-50 rounded-lg"
                    whileHover={{ scale: 1.05, backgroundColor: "rgb(236 253 245)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="w-6 lg:w-8 h-6 lg:h-8 text-green-500 mx-auto mb-2 lg:mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1 lg:mb-2 text-base lg:text-lg">After</h4>
                    <ul className="text-sm lg:text-base text-gray-600 space-y-0.5 lg:space-y-1">
                      <li>• Students with multiple job offers</li>
                      <li>• Modern, industry-relevant skills</li>
                      <li>• Strong corporate partnerships</li>
                      <li>• 85%+ placement rates</li>
                    </ul>
                  </motion.div>
                </motion.div>
              </motion.div>
            </MotionWrapper>
          </div>
        </section>

        {/* Trust Banner */}
        <section className="py-6 lg:py-8 bg-blue-600">
          <div className="container mx-auto px-4">
            <MotionWrapper
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 text-center"
            >
              {[
                { value: "45+", label: "Partner Institutions", desc: "Colleges transformed" },
                { value: "12,000+", label: "Students Placed", desc: "Across all colleges" },
                { value: "78%", label: "Average Placement Rate Improvement", desc: "From baseline" },
                { value: "200+", label: "Corporate Partners", desc: "Hiring actively" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                >
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs lg:text-sm text-blue-100">{stat.label}</div>
                  <div className="text-xs text-blue-200">{stat.desc}</div>
                </motion.div>
              ))}
            </MotionWrapper>
          </div>
        </section>

        {/* The Employability Crisis */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <MotionWrapper
              variants={containerVariants}
              className="text-center mb-8 lg:mb-12"
            >
              <motion.h2
                variants={itemVariants}
                className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 lg:mb-4"
              >
                The Problem is Real. And Growing.
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Indian engineering education faces an employability crisis that affects students, colleges, and the industry
              </motion.p>
            </MotionWrapper>

            <MotionWrapper
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-12 lg:mb-16"
            >
              {[
                { value: "60%", label: "Engineering Graduates Unemployable", source: "NASSCOM, Aspiring Minds Study" },
                { value: "45%", label: "Average Placement Rate in Indian Colleges", source: "Most colleges struggle to place even half their students" },
                { value: "₹3.5 LPA", label: "Average Starting Salary", source: "Below industry expectations, student debt burden" },
                { value: "30%+", label: "Of Colleges Face Declining Enrollments", source: "Poor placements → Poor reputation → Fewer admissions" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center p-6 lg:p-8 bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100"
                >
                  <div className="text-3xl lg:text-4xl xl:text-6xl font-bold text-red-600 mb-4 lg:mb-6">{stat.value}</div>
                  <div className="text-base lg:text-xl font-semibold text-gray-900 mb-2">{stat.label}</div>
                  <div className="text-xs lg:text-sm text-gray-500 italic">{stat.source}</div>
                </motion.div>
              ))}
            </MotionWrapper>
          </div>
        </section>

        {/* The Root Causes */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <MotionWrapper
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="mb-12 lg:mb-16"
            >
              <motion.h3
                variants={itemVariants}
                className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-6 lg:mb-8 text-center"
              >
                The Root Causes
              </motion.h3>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              >
                {[
                  {
                    icon: BookOpen,
                    title: "OUTDATED CURRICULUM",
                    points: [
                      "Colleges teach Java 6, students need Spring Boot",
                      "Theory-heavy, practice-light",
                      "3-year gap between curriculum design and implementation",
                      "No alignment with current job market"
                    ]
                  },
                  {
                    icon: Server,
                    title: "INADEQUATE INFRASTRUCTURE",
                    points: [
                      "Old labs with outdated hardware",
                      "No cloud infrastructure access",
                      "Limited software licenses",
                      "No modern development tools"
                    ]
                  },
                  {
                    icon: UserCheck,
                    title: "THEORY-FOCUSED FACULTY",
                    points: [
                      "Professors with no industry experience",
                      "Focus on marks, not employability",
                      "Limited knowledge of modern tech",
                      "No continuous upskilling"
                    ]
                  },
                  {
                    icon: Code,
                    title: "NO REAL-WORLD PROJECTS",
                    points: [
                      "Academic projects (library system, calculator)",
                      "No exposure to industry-standard code",
                      "No team collaboration experience",
                      "No GitHub portfolios"
                    ]
                  },
                  {
                    icon: MessageSquare,
                    title: "WEAK SOFT SKILLS",
                    points: [
                      "Poor communication",
                      "No interview preparation",
                      "Lack of professional etiquette",
                      "No aptitude training"
                    ]
                  },
                  {
                    icon: Briefcase,
                    title: "PLACEMENT GAPS",
                    points: [
                      "Limited corporate connections",
                      "No company-specific preparation",
                      "Weak resume building",
                      "Poor interview success rate"
                    ]
                  }
                ].map((cause, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 lg:p-8 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <cause.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-lg lg:text-xl font-bold text-gray-900">{cause.title}</h4>
                    </div>
                    <ul className="space-y-2 text-gray-700">
                      {cause.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            </MotionWrapper>

            {/* The Impact on Institutions */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-12 lg:mb-16"
            >
              <motion.h3
                variants={itemVariants}
                className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-6 lg:mb-8 text-center"
              >
                THE IMPACT ON INSTITUTIONS
              </motion.h3>

              <motion.div
                variants={fadeInUp}
                className="max-w-4xl mx-auto bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
              >
                <div className="mb-8">
                  <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Vicious Cycle Diagram</h4>
                  <div className="bg-red-50 rounded-lg p-4 lg:p-6 border border-red-100">
                    <p className="text-gray-700 font-medium text-center">
                      Poor Placements → Low College Rankings → Reduced Admissions →<br />
                      Lower Fee Collection → Reduced Investment → Outdated Infrastructure →<br />
                      Poor Placements (cycle repeats)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div>
                    <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Real Consequences</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>AICTE/UGC scrutiny on placement data</span>
                      </li>
                      <li className="flex items-start text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Difficulty attracting quality faculty</span>
                      </li>
                      <li className="flex items-start text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Student protests and negative reviews</span>
                      </li>
                      <li className="flex items-start text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Loss to competitor institutions</span>
                      </li>
                      <li className="flex items-start text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Risk of closure (Tier-3 colleges)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 lg:p-6 border border-blue-100">
                    <h4 className="text-lg lg:text-xl font-bold text-blue-900 mb-4">Bottom Line</h4>
                    <p className="text-blue-800 font-medium italic">
                      "Colleges can't ignore employability anymore. It's not just about education—it's about career outcomes. And that's where we come in."
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* The Sudaksha Solution */}
            <section className="py-12 lg:py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="container mx-auto px-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-center mb-12 lg:mb-16"
                >
                  <motion.h2
                    variants={itemVariants}
                    className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6"
                  >
                    Not Just Training. Complete Institutional Transformation.
                  </motion.h2>
                  <motion.p
                    variants={itemVariants}
                    className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto italic"
                  >
                    "We don't believe in one-time interventions. We believe in systemic change. We partner with colleges for 3-5 years to fundamentally transform their approach to employability—from curriculum to faculty to infrastructure to placements."
                  </motion.p>
                </motion.div>

                {/* 6 Comprehensive Pillars */}
                <MotionWrapper
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  className="mb-12 lg:mb-16"
                >
                  <motion.h3
                    variants={itemVariants}
                    className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-6 lg:mb-8 text-center"
                  >
                    OUR COMPREHENSIVE APPROACH: 6 PILLARS
                  </motion.h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Pillar 1: Finishing School */}
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 h-full"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900">PILLAR 1: FINISHING SCHOOL PROGRAM</h4>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">What It Is:</h5>
                        <p className="text-gray-700 leading-relaxed">
                          Intensive, industry-focused training integrated into final year that transforms students from graduates to job-ready professionals.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Structure:</h5>

                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <h6 className="font-semibold text-blue-900 mb-2">Step 1: Gap Analysis (Week 1-2)</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Review current syllabus across all semesters</li>
                              <li>• Compare with current job requirements (200+ companies)</li>
                              <li>• Identify gaps in Technology, Skills, Pedagogy, Assessment</li>
                            </ul>
                            <p className="text-sm text-blue-800 mt-2"><strong>Deliverable:</strong> Gap Analysis Report with severity ratings</p>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <h6 className="font-semibold text-green-900 mb-2">Step 2: Curriculum Redesign (Week 3-4)</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Semester-wise curriculum update recommendations</li>
                              <li>• Lab exercise modernization</li>
                              <li>• Project ideas aligned with industry</li>
                              <li>• Tool and technology recommendations</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <CTAButton
                          variant="custom"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                          ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Finishing School', ctaLabel: 'Explore Finishing School', audienceType: 'institution', intent: 'start_process' }}
                        >
                          Explore Finishing School
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </CTAButton>
                      </div>
                    </motion.div>

                    {/* Pillar 2: Curriculum Mapping */}
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 h-full"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <BookOpen className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900">PILLAR 2: CURRICULUM MAPPING & MODERNIZATION</h4>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">What It Is:</h5>
                        <p className="text-gray-700 leading-relaxed">
                          Comprehensive audit of existing curriculum and mapping to current industry requirements, with actionable recommendations for modernization.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Process:</h5>

                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <h6 className="font-semibold text-blue-900 mb-2">Step 1: Gap Analysis (Week 1-2)</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Review current syllabus across all semesters</li>
                              <li>• Compare with current job requirements (200+ companies)</li>
                              <li>• Identify gaps in Technology, Skills, Pedagogy, Assessment</li>
                            </ul>
                            <p className="text-sm text-blue-800 mt-2"><strong>Deliverable:</strong> Gap Analysis Report with severity ratings</p>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <h6 className="font-semibold text-green-900 mb-2">Step 2: Curriculum Redesign (Week 3-4)</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Semester-wise curriculum update recommendations</li>
                              <li>• Lab exercise modernization</li>
                              <li>• Project ideas aligned with industry</li>
                              <li>• Tool and technology recommendations</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <CTAButton
                          variant="custom"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                          ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Curriculum Mapping', ctaLabel: 'Request Curriculum Audit', audienceType: 'institution', intent: 'campus_assessment' }}
                        >
                          Request Curriculum Audit
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </CTAButton>
                      </div>
                    </motion.div>

                    {/* Pillar 3: PP Index */}
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 h-full"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <BarChart3 className="w-8 h-8 text-purple-600" />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900">PILLAR 3: PLACEMENT PROBABILITY (PP) INDEX</h4>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">What It Is:</h5>
                        <p className="text-gray-700 leading-relaxed">
                          Data-driven predictive system that identifies students at risk of remaining unplaced and provides targeted interventions.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">How It Works:</h5>

                        <div className="space-y-6">
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <h6 className="font-semibold text-purple-900 mb-2">Stage 1: Data Collection (Semester 5)</h6>
                            <p className="text-gray-700 mb-2">Collect multi-dimensional data on every student:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                              <div>
                                <strong>Academic Performance:</strong>
                                <ul className="mt-1 space-y-1">
                                  <li>• CGPA, semester-wise trends</li>
                                  <li>• Subject-wise performance</li>
                                  <li>• Practical vs theory gap</li>
                                  <li>• Project quality</li>
                                </ul>
                              </div>
                              <div>
                                <strong>Technical Skills Assessment:</strong>
                                <ul className="mt-1 space-y-1">
                                  <li>• Coding assessment (HackerRank/LeetCode style)</li>
                                  <li>• System design basics</li>
                                  <li>• Problem-solving ability</li>
                                  <li>• Technology knowledge</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <CTAButton
                          variant="custom"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
                          ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'PP Index', ctaLabel: 'Implement PP Index', audienceType: 'institution', intent: 'start_process' }}
                        >
                          Implement PP Index
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </CTAButton>
                      </div>
                    </motion.div>

                    {/* Pillar 4: Faculty Development */}
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 h-full"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <Users className="w-8 h-8 text-orange-600" />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900">PILLAR 4: FACULTY DEVELOPMENT</h4>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">What It Is:</h5>
                        <p className="text-gray-700 leading-relaxed">
                          Comprehensive training program for college faculty to update their technical knowledge, teaching methodologies, and industry connections.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Multi-Track Program:</h5>

                        <div className="space-y-4">
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                            <h6 className="font-semibold text-orange-900 mb-2">Track 1: Technology Training (40-80 hours per faculty)</h6>
                            <p className="text-gray-700 mb-2">Update faculty with modern technologies:</p>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Choose track: Java Full Stack / Python / Data Science / Cloud / AI-ML</li>
                              <li>• Same intensive training we give students (adapted for faculty)</li>
                              <li>• Hands-on labs, projects, certifications</li>
                              <li>• Assessment and certification</li>
                            </ul>
                          </div>

                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                            <h6 className="font-semibold text-yellow-900 mb-2">Track 2: Industry Immersion (2-4 weeks)</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Placement in our corporate partners</li>
                              <li>• Work alongside industry professionals</li>
                              <li>• Understand real software development lifecycle</li>
                              <li>• Build industry connections</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <CTAButton
                          variant="custom"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg"
                          ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Faculty Development', ctaLabel: 'Request Faculty Development', audienceType: 'institution', intent: 'get_proposal' }}
                        >
                          Request Faculty Development
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </CTAButton>
                      </div>
                    </motion.div>

                    {/* Pillar 5: Lab Infrastructure */}
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 h-full"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <Server className="w-8 h-8 text-teal-600" />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900">PILLAR 5: LAB INFRASTRUCTURE PARTNERSHIP</h4>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">What It Is:</h5>
                        <p className="text-gray-700 leading-relaxed">
                          Partnership to modernize college labs with industry-standard infrastructure, tools, and cloud access.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Modernization Options:</h5>

                        <div className="space-y-4">
                          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                            <h6 className="font-semibold text-teal-900 mb-2">Option A: Cloud-Based Labs (Recommended)</h6>
                            <p className="text-gray-700 mb-2">No hardware needed:</p>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Cloud lab access for every student</li>
                              <li>• Pre-configured environments (Java, Python, Data Science, etc.)</li>
                              <li>• IDEs, tools, databases pre-installed</li>
                              <li>• Scalable (can handle 500+ students)</li>
                              <li>• Access from anywhere (home, college, library)</li>
                            </ul>
                            <p className="text-sm text-teal-800 mt-2"><strong>Cost:</strong> ₹500-800 per student per year</p>
                          </div>

                          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
                            <h6 className="font-semibold text-cyan-900 mb-2">Option B: Physical Lab Modernization</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Audit existing labs</li>
                              <li>• Recommend hardware upgrades (if needed)</li>
                              <li>• Install modern OS and software</li>
                              <li>• Setup local servers and development environments</li>
                            </ul>
                            <p className="text-sm text-cyan-800 mt-2"><strong>Cost:</strong> ₹8-15 L one-time (for 60-seat lab)</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <CTAButton
                          variant="custom"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg"
                          ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Lab Infrastructure', ctaLabel: 'Modernize Labs', audienceType: 'institution', intent: 'get_proposal' }}
                        >
                          Modernize Labs
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </CTAButton>
                      </div>
                    </motion.div>

                    {/* Pillar 6: Corporate Pipeline */}
                    <motion.div
                      variants={fadeInUp}
                      className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 h-full"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <Building2 className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900">PILLAR 6: DIRECT-TO-CORPORATE PIPELINE</h4>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">What It Is:</h5>
                        <p className="text-gray-700 leading-relaxed">
                          Direct connection between your students and our 200+ corporate hiring partners, with facilitated placements.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Our Corporate Network:</h5>

                        <div className="space-y-4">
                          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                            <h6 className="font-semibold text-indigo-900 mb-2">IT Services (High Volume Recruiters)</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• TCS, Infosys, Wipro, Cognizant, HCL, Tech Mahindra</li>
                              <li>• Accenture, Capgemini, LTI, Mphasis</li>
                              <li>• Hiring: 5,000+ freshers annually</li>
                            </ul>
                          </div>

                          <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
                            <h6 className="font-semibold text-violet-900 mb-2">Product Companies & Startups</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• Amazon, Microsoft, Oracle, SAP, Adobe</li>
                              <li>• Razorpay, CRED, Swiggy, Zomato, Meesho</li>
                              <li>• Flipkart, PayTM, OYO, Byju's</li>
                              <li>• Hiring: Selective, high-quality candidates</li>
                            </ul>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <h6 className="font-semibold text-purple-900 mb-2">By Domain</h6>
                            <ul className="space-y-1 text-gray-700">
                              <li>• FinTech: 40+ companies</li>
                              <li>• E-commerce: 35+ companies</li>
                              <li>• HealthTech: 20+ companies</li>
                              <li>• EdTech: 25+ companies</li>
                              <li>• Enterprise Software: 50+ companies</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <CTAButton
                          variant="custom"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg"
                          ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Corporate Pipeline', ctaLabel: 'Access Corporate Network', audienceType: 'institution', intent: 'start_process' }}
                        >
                          Access Corporate Network
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </CTAButton>
                      </div>
                    </motion.div>
                  </div>
                </MotionWrapper>
              </div>
            </section>

            {/* Partnership Models */}
            <section className="py-12 lg:py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <MotionWrapper
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  className="text-center mb-12 lg:mb-16"
                >
                  <motion.h2
                    variants={itemVariants}
                    className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6"
                  >
                    Flexible Models to Fit Your Institution's Needs
                  </motion.h2>
                  <motion.p
                    variants={itemVariants}
                    className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
                  >
                    Choose from multiple partnership models designed to match your institution's size, budget, and transformation goals.
                  </motion.p>
                </MotionWrapper>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12 mb-12 lg:mb-16">
                  {/* Model 1: Co-Branded Finishing School */}
                  <motion.div
                    variants={fadeInUp}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Co-Branded Finishing School</h3>
                        <p className="text-blue-600 font-medium">Best for: Comprehensive transformation</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Includes:</span>
                        <span className="font-semibold text-gray-900">Full finishing school + faculty training + infrastructure</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold text-gray-900">₹2,000-3,000/student</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">3-year partnership</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Placement Impact:</span>
                        <span className="font-semibold text-green-600">+35-50%</span>
                      </div>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full justify-center"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Co-Branded Finishing School', ctaLabel: 'Learn More about Co-Branded Finishing School', audienceType: 'institution', intent: 'get_proposal' }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </motion.div>

                  {/* Model 2: Curriculum Integration */}
                  <motion.div
                    variants={fadeInUp}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Curriculum Integration</h3>
                        <p className="text-green-600 font-medium">Best for: Systemic curriculum change</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Includes:</span>
                        <span className="font-semibold text-gray-900">Curriculum audit + modernization + faculty training</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold text-gray-900">₹8-15 L total</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">3-5 year partnership</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Placement Impact:</span>
                        <span className="font-semibold text-green-600">+20-30%</span>
                      </div>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors w-full justify-center"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Curriculum Integration', ctaLabel: 'Learn More about Curriculum Integration', audienceType: 'institution', intent: 'get_proposal' }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </motion.div>

                  {/* Model 3: Faculty Development Only */}
                  <motion.div
                    variants={fadeInUp}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Faculty Development</h3>
                        <p className="text-orange-600 font-medium">Best for: Quality improvement focus</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Includes:</span>
                        <span className="font-semibold text-gray-900">Technology training + industry immersion + pedagogy</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold text-gray-900">₹20-30 L for 20 faculty</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">1-year renewable</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Placement Impact:</span>
                        <span className="font-semibold text-green-600">+15-25%</span>
                      </div>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors w-full justify-center"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Faculty Development Model', ctaLabel: 'Learn More about Faculty Development', audienceType: 'institution', intent: 'get_proposal' }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </motion.div>

                  {/* Model 4: Lab Infrastructure Partnership */}
                  <motion.div
                    variants={fadeInUp}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mr-4">
                        <Server className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Lab Infrastructure</h3>
                        <p className="text-teal-600 font-medium">Best for: Modern labs & tools</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Includes:</span>
                        <span className="font-semibold text-gray-900">Cloud labs + software licenses + training</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold text-gray-900">₹5-15 L one-time</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">1-year setup + maintenance</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Placement Impact:</span>
                        <span className="font-semibold text-green-600">+10-20%</span>
                      </div>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors w-full justify-center"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Lab Infrastructure Model', ctaLabel: 'Learn More about Lab Infrastructure', audienceType: 'institution', intent: 'get_proposal' }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </motion.div>

                  {/* Model 5: Placement Services Only */}
                  <motion.div
                    variants={fadeInUp}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                        <Briefcase className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Placement Services</h3>
                        <p className="text-purple-600 font-medium">Best for: Quick placement wins</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Includes:</span>
                        <span className="font-semibold text-gray-900">Corporate connect + interview prep + placement drives</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold text-gray-900">₹30-50K per placement</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">Annual partnership</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Placement Impact:</span>
                        <span className="font-semibold text-green-600">Direct results</span>
                      </div>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors w-full justify-center"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Placement Services', ctaLabel: 'Learn More about Placement Services', audienceType: 'institution', intent: 'get_proposal' }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </motion.div>

                  {/* Model 6: Build-Operate-Transfer (BOT) */}
                  <motion.div
                    variants={fadeInUp}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">BOT Model</h3>
                        <p className="text-indigo-600 font-medium">Best for: Zero-risk transformation</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Includes:</span>
                        <span className="font-semibold text-gray-900">Full operation + training + handover</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Investment:</span>
                        <span className="font-semibold text-gray-900">Revenue-share model</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-900">5-year partnership</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Placement Impact:</span>
                        <span className="font-semibold text-green-600">+35-50%</span>
                      </div>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors w-full justify-center"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'BOT Model', ctaLabel: 'Learn More about BOT Model', audienceType: 'institution', intent: 'get_proposal' }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </motion.div>
                </div>

                {/* Comparison Table */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100"
                >
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 text-center">Partnership Model Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Model</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Investment</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Duration</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Best For</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Placement Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 text-gray-900">
                          <td className="py-3 px-4 font-medium">Co-Branded Finishing School</td>
                          <td className="py-3 px-4">₹2,000-3,000/student</td>
                          <td className="py-3 px-4">3 years</td>
                          <td className="py-3 px-4">Complete transformation</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">High (+35-50%)</td>
                        </tr>
                        <tr className="border-b border-gray-100 text-gray-900">
                          <td className="py-3 px-4 font-medium">Curriculum Integration</td>
                          <td className="py-3 px-4">₹8-15 L total</td>
                          <td className="py-3 px-4">3-5 years</td>
                          <td className="py-3 px-4">Systemic change</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">Medium (+20-30%)</td>
                        </tr>
                        <tr className="border-b border-gray-100 text-gray-900">
                          <td className="py-3 px-4 font-medium">Faculty Development</td>
                          <td className="py-3 px-4">₹20-30 L</td>
                          <td className="py-3 px-4">1 year</td>
                          <td className="py-3 px-4">Quality improvement</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">Medium (+15-25%)</td>
                        </tr>
                        <tr className="border-b border-gray-100 text-gray-900">
                          <td className="py-3 px-4 font-medium">Lab Infrastructure</td>
                          <td className="py-3 px-4">₹5-15 L</td>
                          <td className="py-3 px-4">1 year + maintenance</td>
                          <td className="py-3 px-4">Modern labs & tools</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">Medium (+10-20%)</td>
                        </tr>
                        <tr className="border-b border-gray-100 text-gray-900">
                          <td className="py-3 px-4 font-medium">Placement Services</td>
                          <td className="py-3 px-4">₹30-50K/placement</td>
                          <td className="py-3 px-4">Annual</td>
                          <td className="py-3 px-4">Quick wins</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">Direct</td>
                        </tr>
                        <tr className="text-gray-900">
                          <td className="py-3 px-4 font-medium">BOT Model</td>
                          <td className="py-3 px-4">Revenue-share</td>
                          <td className="py-3 px-4">5 years</td>
                          <td className="py-3 px-4">Zero-risk transformation</td>
                          <td className="py-3 px-4 text-green-600 font-semibold">High (+35-50%)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            </section>

            {false && /* Technology Tracks for Career Success — hidden */ (
            <section className="py-12 lg:py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <MotionWrapper
                  variants={animationVariants.container}
                  className="text-center mb-12 lg:mb-16"
                >
                  <MotionWrapper
                    variants={itemVariants}
                    className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6"
                  >
                    Technology Tracks for Career Success
                  </MotionWrapper>
                  <MotionWrapper
                    variants={itemVariants}
                    className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
                  >
                    Choose from industry-leading technology tracks designed to match your students' interests and market demand.
                  </MotionWrapper>
                </MotionWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
                  {/* Software Development Track */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={100}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <Code className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Software Development</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Full-stack development with modern frameworks and cloud technologies.</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>React, Node.js, Python</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>REST APIs & Microservices</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Database Design & Cloud Deployment</span>
                      </div>
                    </div>

                    <motion.a
                      href="/courses/domain/software-development"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* Data Science Track */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={150}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Data Science & Analytics</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Machine learning, AI, and advanced analytics for data-driven careers.</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Python, R, SQL</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Machine Learning & AI</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Big Data & Visualization</span>
                      </div>
                    </div>

                    <motion.a
                      href="/courses/domain/data-analytics"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* Cloud & DevOps Track */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={200}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                        <Server className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Cloud & DevOps</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Cloud infrastructure, DevOps practices, and modern deployment strategies.</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>AWS, Azure, GCP</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Docker, Kubernetes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>CI/CD & Automation</span>
                      </div>
                    </div>

                    <motion.a
                      href="/courses/domain/cloud-devops"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* Cyber Security Track */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={250}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Cyber Security</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Ethical hacking, security analysis, and cybersecurity best practices.</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Ethical Hacking & Penetration Testing</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Network Security & Forensics</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Security Tools & Compliance</span>
                      </div>
                    </div>

                    <motion.a
                      href="/courses/domain/cybersecurity"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* AI & Machine Learning Track */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={300}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                        <Zap className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">AI & Machine Learning</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Deep learning, neural networks, and AI applications for modern careers.</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>TensorFlow, PyTorch</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Computer Vision & NLP</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>MLOps & Model Deployment</span>
                      </div>
                    </div>

                    <motion.a
                      href="/courses/domain/ai-ml"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* Custom Tracks */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={350}
                    className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                        <Star className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Custom Tracks</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Tailored programs for your institution's specific needs and industry focus.</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Institution-Specific Curriculum</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Local Industry Integration</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span>Flexible Program Design</span>
                      </div>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm transform hover:scale-105 active:scale-95"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Custom Tracks', ctaLabel: 'Learn More', audienceType: 'institution', intent: 'talk_to_expert' }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </MotionWrapper>
                </div>

                {/* Track Selection CTA */}
                <MotionWrapper
                  variants={fadeInUp}
                  delay={400}
                  className="text-center"
                >
                  <motion.a
                    href="/courses"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    Explore All Technology Tracks
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.a>
                </MotionWrapper>
              </div>
            </section>
            )}

            {/* Success Stories */}
            <section className="py-12 lg:py-16">
              <div className="container mx-auto px-4">
                <MotionWrapper
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  className="text-center mb-12 lg:mb-16"
                >
                  <motion.h2
                    variants={itemVariants}
                    className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6"
                  >
                    Real Colleges, Real Transformation
                  </motion.h2>
                  <motion.p
                    variants={itemVariants}
                    className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
                  >
                    See how institutions like yours achieved remarkable placement improvements through our comprehensive partnership approach.
                  </motion.p>
                </MotionWrapper>

                {/* Case Study 1: Tier-3 College */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 mb-8 lg:mb-12"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-1">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">ABC Institute of Technology</h3>
                        <p className="text-gray-600 text-sm">Tier-3 Private College, Karnataka</p>
                        <p className="text-blue-600 font-medium text-sm mt-2">3-Year Partnership</p>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-2">BEFORE</h4>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-red-600">41%</p>
                            <p className="text-sm text-red-700">Placement Rate</p>
                            <p className="text-sm text-red-700">₹3.2 LPA Avg Salary</p>
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">AFTER</h4>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-green-600">85%</p>
                            <p className="text-sm text-green-700">Placement Rate</p>
                            <p className="text-sm text-green-700">₹6.2 LPA Avg Salary</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Achievements</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• +44% placement rate improvement</li>
                            <li>• +94% salary increase</li>
                            <li>• Top salary: ₹15 LPA (Amazon)</li>
                            <li>• 18 product company placements</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Institutional Impact</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Ranked in top 150 Karnataka colleges</li>
                            <li>• +38% admission applications</li>
                            <li>• 88% faculty retention</li>
                            <li>• Sustainable placement model</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 italic">
                          "Three years ago, we were struggling. Students were frustrated, parents were disappointed, and we were losing enrollments. Partnering with Sudaksha was the best decision we made."
                        </p>
                        <p className="text-blue-900 font-medium mt-2">— Dr. Ramesh Kumar, Principal</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Case Study 2: Government Polytechnic */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100 mb-8 lg:mb-12"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-1">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Government Polytechnic</h3>
                        <p className="text-gray-600 text-sm">Madhya Pradesh Government</p>
                        <p className="text-green-600 font-medium text-sm mt-2">5-Year BOT Partnership</p>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-2">BEFORE</h4>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-red-600">18%</p>
                            <p className="text-sm text-red-700">Placement Rate</p>
                            <p className="text-sm text-red-700">₹1.4 LPA Avg Salary</p>
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">AFTER</h4>
                          <div className="space-y-1">
                            <p className="text-2xl font-bold text-green-600">73%</p>
                            <p className="text-sm text-green-700">Placement Rate</p>
                            <p className="text-sm text-green-700">₹3.8 LPA Avg Salary</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Key Achievements</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• +55% placement rate improvement</li>
                            <li>• +171% salary increase</li>
                            <li>• 500+ rural students placed</li>
                            <li>• Self-sustaining model achieved</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Social Impact</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• First-generation IT professionals</li>
                            <li>• Rural employment opportunities</li>
                            <li>• Replicable government model</li>
                            <li>• Zero upfront cost for students</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-green-800 italic">
                          "This partnership proved that government institutions can achieve excellence with the right private sector partnership. We didn't need to compromise our values."
                        </p>
                        <p className="text-green-900 font-medium mt-2">— Shri Anil Sharma, IAS, Director</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Implementation Roadmap */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl p-6 lg:p-8 mb-8 lg:mb-12"
                >
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 text-center">Your Journey to Transformation</h3>
                  <p className="text-gray-600 text-center mb-8">Typical 3-Year Partnership Timeline</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">YEAR 1: Foundation</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Campus assessment & PP Index</li>
                        <li>• Finishing school pilot</li>
                        <li>• Faculty training</li>
                        <li>• First placement drives</li>
                      </ul>
                      <p className="text-blue-600 font-medium mt-3">+15-25% placement improvement</p>
                    </motion.div>

                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">YEAR 2: Scaling</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Full curriculum integration</li>
                        <li>• Advanced student segments</li>
                        <li>• Corporate network expansion</li>
                        <li>• Process refinement</li>
                      </ul>
                      <p className="text-green-600 font-medium mt-3">+25-35% placement improvement</p>
                    </motion.div>

                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">YEAR 3: Excellence</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Self-sustaining processes</li>
                        <li>• Alumni network activated</li>
                        <li>• Industry advisory board</li>
                        <li>• Peak performance achieved</li>
                      </ul>
                      <p className="text-purple-600 font-medium mt-3">+35-50% placement improvement</p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* View All Case Studies Link */}
                <motion.div
                  variants={fadeInUp}
                  className="text-center mb-8 lg:mb-12"
                >
                  <motion.a
                    href="/success-stories"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    View All Success Stories
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </motion.a>
                </motion.div>
              </div>
            </section>

            {/* Resources Section */}
            {false && /* Resources for Institution Success — hidden */ (
            <section className="py-12 lg:py-16 bg-white">
              <div className="container mx-auto px-4">
                <MotionWrapper
                  variants={animationVariants.container}
                  className="text-center mb-12 lg:mb-16"
                >
                  <MotionWrapper
                    variants={itemVariants}
                    className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6"
                  >
                    Resources for Institution Success
                  </MotionWrapper>
                  <MotionWrapper
                    variants={itemVariants}
                    className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto"
                  >
                    Access research, tools, and insights to drive employability transformation at your institution.
                  </MotionWrapper>
                </MotionWrapper>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
                  {/* Industry Reports */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={100}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl lg:rounded-2xl p-6 lg:p-8 border border-blue-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Industry Reports</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Latest research on employability trends, skill gaps, and industry requirements.</p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>NASSCOM Employability Reports</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Skill Gap Analysis Studies</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Industry Hiring Trends</span>
                      </li>
                    </ul>

                    <motion.a
                      href="/resources"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Reports
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* Placement Data Analysis */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={150}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl lg:rounded-2xl p-6 lg:p-8 border border-green-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Placement Analytics</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Data-driven insights and benchmarks for placement performance improvement.</p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>College Placement Rankings</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Salary Trend Analysis</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Industry-wise Placement Data</span>
                      </li>
                    </ul>

                    <motion.a
                      href="/resources"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      View Analytics
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* Best Practices Guide */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={200}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl lg:rounded-2xl p-6 lg:p-8 border border-purple-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Best Practices</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Proven strategies and frameworks for successful employability programs.</p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Program Implementation Guides</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Faculty Training Frameworks</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Industry Partnership Models</span>
                      </li>
                    </ul>

                    <motion.a
                      href="/resources"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      View Guides
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.a>
                  </MotionWrapper>

                  {/* Sample Curriculum */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={250}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl lg:rounded-2xl p-6 lg:p-8 border border-orange-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                        <GraduationCap className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Sample Curriculum</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Ready-to-implement course modules and learning paths for employability.</p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Finishing School Modules</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Industry Project Templates</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Assessment Frameworks</span>
                      </li>
                    </ul>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm transform hover:scale-105 active:scale-95"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Content Licensing', ctaLabel: 'View Samples', audienceType: 'institution', intent: 'get_proposal' }}
                    >
                      View Samples
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </MotionWrapper>

                  {/* ROI Calculator */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={300}
                    className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl lg:rounded-2xl p-6 lg:p-8 border border-red-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                        <TrendingUp className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">ROI Calculator</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Interactive tool to calculate potential ROI from employability investments.</p>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Cost-Benefit Analysis</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Payback Period Calculator</span>
                      </li>
                      <li className="flex items-start text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Long-term ROI Projections</span>
                      </li>
                    </ul>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm transform hover:scale-105 active:scale-95"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'ROI Calculator', ctaLabel: 'Calculate ROI', audienceType: 'institution', intent: 'roi_analysis' }}
                    >
                      Calculate ROI
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </MotionWrapper>

                  {/* Quick Links */}
                  <MotionWrapper
                    variants={fadeInUp}
                    delay={350}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl lg:rounded-2xl p-6 lg:p-8 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                        <Star className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Quick Access</h3>
                    </div>

                    <p className="text-gray-600 mb-4">Frequently accessed resources and tools for busy administrators.</p>

                    <div className="space-y-3 mb-6">
                      <motion.a
                        href="/resources"
                        whileHover={{ x: 5 }}
                        className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        → Employability Crisis Report
                      </motion.a>
                      <motion.a
                        href="/institutions"
                        whileHover={{ x: 5 }}
                        className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        → Our Comprehensive Approach
                      </motion.a>
                      <motion.a
                        href="/institutions"
                        whileHover={{ x: 5 }}
                        className="block text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        → Success Metrics Dashboard
                      </motion.a>
                    </div>

                    <CTAButton
                      variant="custom"
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-sm transform hover:scale-105 active:scale-95"
                      ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Quick Access', ctaLabel: 'Contact Support', audienceType: 'institution', intent: 'talk_to_expert' }}
                    >
                      Contact Support
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CTAButton>
                  </MotionWrapper>
                </div>

                {/* Resources CTA */}
                <MotionWrapper
                  variants={fadeInUp}
                  delay={400}
                  className="text-center"
                >
                  <motion.a
                    href="/resources"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-lg hover:from-gray-900 hover:to-black transition-all shadow-lg"
                  >
                    Explore All Resources
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.a>
                </MotionWrapper>
              </div>
            </section>
            )}

            {/* Final CTA Section */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center text-white"
            >
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">Your Students Deserve Better. Your Institution Deserves Better.</h2>
              <p className="text-lg lg:text-xl mb-8 text-blue-100">
                45 colleges transformed. 12,000 students placed. 78% average placement rate improvement. Your college could be next.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <CTAButton
                  variant="custom"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                  ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Footer Action Block', ctaLabel: 'Schedule Free Assessment', audienceType: 'institution', intent: 'campus_assessment' }}
                >
                  Schedule Free Assessment
                  <Calendar className="ml-2 w-5 h-5" />
                </CTAButton>
                <CTAButton
                  variant="custom"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors shadow-lg"
                  ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Footer Action Block', ctaLabel: 'Download Partnership Brochure', audienceType: 'institution', intent: 'download_brochure' }}
                >
                  Download Partnership Brochure
                  <FileText className="ml-2 w-5 h-5" />
                </CTAButton>
                <CTAButton
                  variant="custom"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
                  ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Footer Action Block', ctaLabel: 'Request Custom Proposal', audienceType: 'institution', intent: 'get_proposal' }}
                >
                  Request Custom Proposal
                  <ArrowRight className="ml-2 w-5 h-5" />
                </CTAButton>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CTAButton
                  variant="custom"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md"
                  ctx={{ page: 'Institutions', pageUrl: '/institutions', section: 'Footer Action Block', ctaLabel: 'Get Detailed ROI Analysis', audienceType: 'institution', intent: 'roi_analysis' }}
                >
                  ROI Calculator
                  <BarChart3 className="ml-2 w-4 h-4" />
                </CTAButton>
                <motion.a
                  href="/resources"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors shadow-md"
                >
                  Industry Reports
                  <FileText className="ml-2 w-4 h-4" />
                </motion.a>
              </div>

              <div className="mt-8 pt-8 border-t border-blue-500">
                <p className="text-blue-200 mb-4">Contact our Institutions Team</p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm">
                  <a href="tel:+919121044435" className="text-blue-200 hover:text-white transition-colors">📞 +91 91210 44435</a>
                  <motion.a
                    href="mailto:institutions@sudaksha.com"
                    whileHover={{ scale: 1.05 }}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    📧 institutions@sudaksha.com
                  </motion.a>
                  <span>⏰ Mon-Sat, 9 AM - 6 PM IST</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

    </LayoutGroup>
  );
}



