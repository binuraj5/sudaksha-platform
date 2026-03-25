'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Clock, Users, Award, TrendingUp, BookOpen, Target, CheckCircle,
  Star, Calendar, DollarSign, PlayCircle, Download, Share2, Heart,
  CreditCard, Banknote, ChevronDown, ChevronUp, MapPin, Monitor, Layers, Wrench, FileText,
  ArrowLeft
} from 'lucide-react';
import { GlobalCTAForm } from '@/components/common/GlobalCTAForm';
import { CounselorModal } from '@/components/common/CounselorModal';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseViewClientProps {
  course: any;
}

export default function CourseViewClient({ course }: CourseViewClientProps) {
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [counselorOpen, setCounselorOpen] = useState(false);
  const [ctaSource, setCtaSource] = useState('Enroll Now - Detail Page');

  const handleEnrollClick = (source: string) => {
    setCtaSource(source);
    setShowEnrollForm(true);
  };

  const isTechCourse = course.category?.toLowerCase().includes('development') ||
    course.category?.toLowerCase().includes('data') ||
    course.category?.toLowerCase().includes('cloud') ||
    course.category?.toLowerCase().includes('cyber') ||
    course.title?.toLowerCase().includes('java');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Back to Courses */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-navy-900 text-white overflow-hidden pb-16 pt-20 lg:pt-24 lg:pb-24">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg className="absolute left-0 top-0 h-full w-full transform scale-150" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L50 100 L100 0 Z" fill="url(#grad1)" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>Top Rated Program</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm font-medium text-gray-300 mb-8">
              <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-400" /> {course.durationHours || 120} Hours</div>
              <div className="flex items-center gap-1"><Users className="w-4 h-4 text-green-400" /> {course.level || 'Beginner'} Friendly</div>
              <div className="flex items-center gap-1"><Award className="w-4 h-4 text-purple-400" /> Certification Included</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => handleEnrollClick('Hero Enroll Button')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105"
              >
                Enroll Now
              </button>
              <a
                href={`/api/courses/${course.slug}/curriculum-pdf`}
                download
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-lg backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Syllabus
              </a>
            </div>
          </div>

          {/* Hero Image/Video Placeholder */}
          <div className="hidden lg:block w-1/3">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-navy-800 flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 to-transparent opacity-60"></div>
              <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all filter drop-shadow-lg" />
              <span className="absolute bottom-4 text-white font-medium">Watch Intro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-10">

            {/* Adaptive Section: Tools & Environment (for Tech) or Frameworks (for others) */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {isTechCourse ? (
                <>
                  <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-blue-600" /> Tools & technologies
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['VS Code', 'Git', 'Docker', 'React', 'Node.js', 'PostgreSQL'].map((tool, i) => (
                      <div key={i} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="w-10 h-10 bg-white rounded-full shadow-sm mb-2 flex items-center justify-center text-xs font-bold text-gray-400">
                          {tool[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{tool}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-purple-600" /> Frameworks & Models
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Strategic Frameworks', 'Process Maps', 'Compliance Templates', 'Audit Checklists'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Learning Objectives */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-emerald-600" /> What You Will Learn
              </h2>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                {(course.learningObjectives?.length ? course.learningObjectives : [
                  'Master industry-standard best practices',
                  'Build real-world projects from scratch',
                  'Collaborate effectively in teams',
                  'Prepare for professional certifications',
                  'Analyze and solve complex problems'
                ]).map((obj: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-snug">{obj}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum Accordion */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-600" /> Course Curriculum
                </h2>
                <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {course.modules?.length || 8} Modules
                </span>
              </div>

              <div className="space-y-4">
                {(course.modules && course.modules.length > 0 ? course.modules : [
                  { id: 1, title: 'Module 1: Foundation', duration: 10, chapters: [{ title: 'Intro' }, { title: 'Setup' }] },
                  { id: 2, title: 'Module 2: Core Concepts', duration: 20, chapters: [{ title: 'Deep Dive' }, { title: 'Practice' }] },
                  { id: 3, title: 'Module 3: Advanced Topics', duration: 30, chapters: [{ title: 'Optimization' }, { title: 'Scale' }] },
                  { id: 4, title: 'Module 4: Final Project', duration: 40, chapters: [{ title: 'Project Kickoff' }, { title: 'Submission' }] }
                ]).map((module: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-blue-300">
                    <button
                      onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                      className={`w-full flex items-center justify-between p-5 text-left transition-colors ${expandedModule === idx ? 'bg-blue-50/50' : 'bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${expandedModule === idx ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy-900">{module.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{module.chapters?.length || 0} Lessons • {module.duration} Hours</p>
                        </div>
                      </div>
                      {expandedModule === idx ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>

                    <AnimatePresence>
                      {expandedModule === idx && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-gray-50"
                        >
                          <div className="p-5 pt-0 border-t border-gray-100 space-y-2">
                            {module.chapters?.map((chapter: any, cIdx: number) => (
                              <div key={cIdx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 ml-12">
                                <PlayCircle className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-700">{chapter.title}</span>
                                <span className="ml-auto text-xs text-gray-400">
                                  {chapter.duration ? `${chapter.duration}m` : '15m'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all hover:-translate-y-1">
                <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
                  <p className="text-green-600 font-medium text-sm mb-6 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Limited seats — register your interest now
                  </p>

                  <button
                    onClick={() => handleEnrollClick('Sidebar Enroll Button')}
                    className="w-full py-4 bg-navy-600 hover:bg-navy-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-navy-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Enroll Now <CreditCard className="w-5 h-5 opacity-80" />
                  </button>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4" /> Next Batch</span>
                    <span className="font-semibold text-navy-900">Oct 15, 2026</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2"><Monitor className="w-4 h-4" /> Mode</span>
                    <span className="font-semibold text-navy-900 uppercase">{course.mode || 'Live Online'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</span>
                    <span className="font-semibold text-navy-900">Global / Remote</span>
                  </div>
                </div>
              </div>

              {/* Trainer Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-navy-900 mb-4">Course Instructor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                    {course.instructor ? course.instructor[0] : 'I'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{course.instructor || 'Expert Instructor'}</div>
                    <div className="text-xs text-gray-500">Industry Veteran • 15+ Yrs Exp</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {course.instructorBio || 'Learn from the best in the industry with hands-on guidance and mentorship.'}
                </p>
              </div>

              {/* Support Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white text-center">
                <h3 className="font-bold text-lg mb-2">Need Guidance?</h3>
                <p className="text-indigo-100 text-sm mb-4">Talk to our career counselors to find the right path for you.</p>
                <button 
                  onClick={() => setCounselorOpen(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors w-full border border-white/20"
                >
                  Request Call Back
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      <GlobalCTAForm
        isOpen={showEnrollForm}
        onClose={() => setShowEnrollForm(false)}
        ctaSubject={`Course Inquiry: ${course.title}`}
        sourceButton={ctaSource}
        sourcePage="Course Detail Page"
      />
      
      <CounselorModal
        isOpen={counselorOpen}
        onClose={() => setCounselorOpen(false)}
        sourcePage={`/courses/${course.slug || 'unknown'}`}
      />
    </div>
  );
}

