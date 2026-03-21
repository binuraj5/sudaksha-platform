'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  Brain, Heart, Users, Target, Rocket, Shield,
  ArrowRight, TrendingUp, Award, CheckCircle, Globe,
  BookOpen, Lightbulb, Handshake
} from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const stats = [
  { value: '50,000+', label: 'Students Placed' },
  { value: '30,000+', label: 'Professionals Trained' },
  { value: '3,400+',  label: 'Empanelled Trainers' },
  { value: '12',      label: 'Industries Served' },
  { value: '10+',     label: 'Countries' },
];

const values = [
  {
    icon: Heart,
    title: 'Human-Centric Design',
    description:
      'We believe training should empower, not overwhelm. Every programme, every interaction, is designed to encourage growth and build lasting confidence.',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    icon: Brain,
    title: 'Scientific Rigour',
    description:
      'Every curriculum we build and every competency we map is backed by pedagogical best practices, industry benchmarks, and real hiring data.',
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Handshake,
    title: 'Industry Partnerships',
    description:
      'Our trainers are active industry practitioners. What we teach today is what companies are hiring for tomorrow — no lag, no theory for theory\'s sake.',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Outcome Accountability',
    description:
      'We measure ourselves by your results. Placement rate, salary growth, and career progression are not aspirations — they are our KPIs.',
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: Globe,
    title: 'Inclusive Access',
    description:
      'Quality career transformation should not be gated by geography or background. We offer flexible formats, scholarships, and pay-after-placement options.',
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Lightbulb,
    title: 'Continuous Innovation',
    description:
      'Technology and job roles evolve fast. Our curriculum review cycle ensures students are always trained on what is relevant — not what was relevant five years ago.',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

// TODO: replace with correct milestones from the team
// const milestones = [
//   { year: '2012', event: '...' },
// ];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-sm font-semibold tracking-widest uppercase"
            >
              Our Mission
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold leading-tight tracking-tight"
            >
              Bridging the <br />
              <span className="text-blue-200">Skills Gap.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
            >
              Sudaksha was built on a simple observation: the industry needs talent, and academia
              produces graduates — but they often don't speak the same language. We're here to translate.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Talk to Us <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center px-8 py-4 border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Explore Programmes
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10" style={{ backgroundColor: '#ffbc1f' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={stagger}
          className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 text-center"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <p className="text-4xl font-bold text-gray-900">{s.value}</p>
              <p className="text-gray-700 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* The Sudaksha Story */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="space-y-8"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900 tracking-tight">
              The Sudaksha Story
            </motion.h2>
            <motion.div variants={stagger} className="space-y-5 text-lg text-gray-600 leading-relaxed">
              <motion.p variants={fadeUp}>
                Founded as a "Finishing School" methodology for fresh IT graduates, Sudaksha started with
                one goal: to make sure that students who have the potential don't miss out on opportunities
                simply because they weren't taught how to apply their skills in real work environments.
              </motion.p>
              <motion.p variants={fadeUp}>
                Over a decade later, Sudaksha has grown into a full-stack career development platform —
                serving freshers, mid-career professionals, corporate teams, and institutions across India.
                We run structured training programmes, competency assessments, and placement support, all
                connected through the SudAssess platform.
              </motion.p>
              <motion.p variants={fadeUp}>
                Today, Sudaksha is used by some of the most innovative companies to benchmark their teams,
                identify future leaders, and build career paths based on scientific evaluation rather than
                gut feel.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline — commented out pending correct milestones from the team */}
      {/* <section className="py-20 px-6 bg-gray-50"> ... </section> */}

      {/* Values */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900">
              What We Stand For
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-500 mt-3 max-w-2xl mx-auto">
              Six principles that guide every decision we make — from curriculum design to how we support our learners after placement.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className={`${v.bg} rounded-2xl p-8 space-y-4 border border-gray-100`}
              >
                <div className={`w-12 h-12 ${v.iconBg} rounded-xl flex items-center justify-center`}>
                  <v.icon className={`w-6 h-6 ${v.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{v.title}</h3>
                <p className="text-gray-600 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900">Who We Serve</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-500 mt-3 max-w-xl mx-auto">
              One platform, three distinct tracks — each designed for where you are in your career journey.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Users,
                title: 'Freshers & Students',
                desc: 'Job-ready programmes, mock interviews, and placement support for those stepping into their first role.',
                href: '/for-individuals',
              },
              {
                icon: Rocket,
                title: 'Corporates',
                desc: 'Custom L&D programmes, competency benchmarking, and team capability assessments for growing organisations.',
                href: '/for-corporates',
              },
              {
                icon: BookOpen,
                title: 'Institutions',
                desc: 'Assessment infrastructure and finishing school integration for colleges looking to improve placement outcomes.',
                href: '/for-institutions',
              },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp}>
                <Link
                  href={item.href}
                  className="group block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all h-full"
                >
                  <item.icon className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                  <span className="inline-flex items-center text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-2xl mx-auto space-y-6"
        >
          <motion.h2 variants={fadeUp} className="text-4xl font-bold">
            Ready to close your skills gap?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-blue-100 text-lg">
            Whether you're a fresher, a working professional, or an organisation — we have a programme built for you.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse Courses <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
