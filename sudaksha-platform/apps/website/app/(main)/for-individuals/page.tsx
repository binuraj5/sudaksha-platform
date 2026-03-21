'use client';

import { useState } from 'react';
import { GraduationCap, Briefcase, RefreshCw, Target, Code2, Users, Building, UserCheck, Heart, CreditCard, Award, Search, BookOpen, TrendingUp, Play, Star, Clock, DollarSign, Shield, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CounselorModal } from '@/src/components/common/CounselorModal';
import { VideoModal } from '@/src/components/common/VideoModal';
import { useCTACapture } from '@/hooks/useCTACapture';

export default function ForIndividualsOverview() {
  const router = useRouter();
  const { capture } = useCTACapture();
  const [counselorOpen, setCounselorOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({ name: '', story: '', role: '', company: '' });

  const pathways = [
    {
      id: 'freshers',
      icon: <GraduationCap className="w-12 h-12 text-blue-600" />,
      title: "I'm a Fresh Graduate",
      description: "You have a degree but no job. Employers say 'no experience.' We'll make you project-ready from day one.",
      whoFor: [
        "Recent graduates (B.E/B.Tech/BCA/B.Sc/MCA)",
        "0-1 year experience or unemployed",
        "Want to enter IT/tech sector",
        "Need end-to-end career launch support"
      ],
      whatYouGet: [
        "280-360 hour intensive programs",
        "Real project experience",
        "Placement guarantee (85%+ success rate)",
        "Soft skills & interview preparation",
        "Starting salary: ₹4-8 LPA"
      ],
      popularPrograms: [
        "Java Full Stack Plus (320 hrs)",
        "Python Full Stack (280 hrs)",
        "Data Science & Analytics (360 hrs)",
        "MERN Stack (300 hrs)"
      ],
      successMetric: "3,500+ freshers placed in last 3 years",
      cta: "Explore Finishing School",
      ctaLink: "/for-individuals/freshers",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      id: 'professionals',
      icon: <Briefcase className="w-12 h-12 text-green-600" />,
      title: "I'm a Working Professional",
      description: "Break the ceiling. Transition from support to development, manual to automation, or climb to architect/leadership roles.",
      whoFor: [
        "1-15 years of experience",
        "Stuck in current role or slow growth",
        "Want to upskill or switch tracks",
        "Weekend/evening learning preferred"
      ],
      careerStages: [
        {
          level: "Junior/Mid (1-5 years)",
          programs: ["Transition programs", "Tech stack upgrades", "Salary jump: 40-80%"]
        },
        {
          level: "Senior (5-12 years)",
          programs: ["Solution architecture", "MLOps & AI Engineering", "Tech leadership", "Salary jump: 30-60%"]
        },
        {
          level: "Executive (12+ years)",
          programs: ["AI for business leaders", "Tech decision making", "Digital strategy"]
        }
      ],
      successMetric: "4,200+ professionals upskilled | Average 45% salary increase",
      cta: "Find Your Track",
      ctaLink: "/for-individuals/professionals",
      bgColor: "from-green-50 to-green-100"
    },
    {
      id: 'career-switchers',
      icon: <RefreshCw className="w-12 h-12 text-purple-600" />,
      title: "I Want to Switch to Tech",
      description: "From sales, operations, HR, or any non-tech field—make a complete career pivot into high-paying tech roles. We've helped 800+ people do it.",
      whoFor: [
        "Non-tech professionals (any domain)",
        "Age no barrier (we've trained 25-40 year-olds)",
        "Want complete career change",
        "Need structured 'zero to hero' path"
      ],
      whatsDifferent: [
        "Diagnostic assessment to find right path",
        "Foundation program (logic, problem-solving, basics)",
        "Specialization track (development, data, testing, product)",
        "Extended support (8-12 months)"
      ],
      popularTransitions: [
        "Sales → Technical Sales/Pre-Sales",
        "Operations → QA/Testing",
        "HR → HR Tech/People Analytics",
        "Finance → Financial Data Analyst"
      ],
      successMetric: "800+ career switchers | 72% placed | Avg salary ₹5-9 LPA",
      cta: "Start Career Switch Journey",
      ctaLink: "/for-individuals/career-switchers",
      bgColor: "from-purple-50 to-purple-100"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Careers Transformed", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "85%", label: "Placement Rate", icon: <Target className="w-6 h-6" /> },
    { number: "₹6.5 LPA", label: "Average Starting Salary", icon: <DollarSign className="w-6 h-6" /> },
    { number: "3-6 Months", label: "to Job-Ready", icon: <Clock className="w-6 h-6" /> }
  ];

  const differentiators = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "OUTCOME-FOCUSED, NOT CERTIFICATE-FOCUSED",
      description: "We measure success by job placements, not course completions. 85% placement rate (vs industry avg 40-50%)"
    },
    {
      icon: <Code2 className="w-8 h-8 text-green-600" />,
      title: "PROJECT-BASED LEARNING",
      description: "Build 5-8 real projects (not toy examples). GitHub portfolio creation with industry-standard code quality"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "PRACTITIONER TRAINERS",
      description: "Working professionals, not career trainers. 5-15 years industry experience. Understand what employers actually want"
    },
    {
      icon: <Building className="w-8 h-8 text-orange-600" />,
      title: "CLOSED-LOOP WITH CORPORATES",
      description: "Direct feedback from 200+ hiring partners. Curriculum updated based on actual job requirements"
    },
    {
      icon: <UserCheck className="w-8 h-8 text-red-600" />,
      title: "SMALL BATCH SIZES",
      description: "Maximum 25 students per batch. Personal attention guaranteed with doubt-clearing sessions"
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      title: "COMPREHENSIVE SUPPORT",
      description: "Resume building & LinkedIn optimization. Mock interviews (unlimited). 6-month post-placement support"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-indigo-600" />,
      title: "FLEXIBLE PAYMENT OPTIONS",
      description: "EMI starting ₹4,500/month. Pay After Placement options. Income Share Agreements. Scholarships available"
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      title: "PROVEN TRACK RECORD",
      description: "50,000+ successful placements. 4.8/5 rating from 3,500+ reviews. 92% would recommend to friends"
    }
  ];

  const successStories = [
    {
      name: "Priya Sharma",
      program: "Java Full Stack Plus",
      before: "B.Tech (CSE), 2023 graduate, no job for 8 months",
      after: "Software Developer @ Infosys, ₹7.2 LPA",
      timeline: "Joined March 2024, Placed August 2024",
      quote: "After my B.Tech, I couldn't get a single job. Companies wanted 'experience,' but how do you get experience without a job? Sudaksha's finishing school gave me that experience.",
      keyStats: ["Resume sent to 150+ companies before: 0 interviews", "Resume sent to 25 companies after: 12 interviews, 3 offers", "Projects in portfolio: 6", "Confidence level: From 3/10 to 9/10"],
      image: "/images/success/priya.jpg"
    },
    {
      name: "Rajesh Kumar",
      program: "Manual to Automation Testing",
      before: "4 years as Manual Tester, stuck at ₹4.5 LPA",
      after: "Automation Test Lead @ Tech Startup, ₹9 LPA",
      timeline: "Joined Jan 2024 (Weekend batch), Switched job July 2024",
      quote: "I was a manual tester for 4 years, earning ₹4.5 LPA with no growth path. Everyone said 'learn automation,' but where and how?",
      keyStats: ["Salary jump: ₹4.5 LPA → ₹9 LPA (100% increase)", "New skills: Selenium, RestAssured, Jenkins, Docker, Java", "Job applications: 8 (targeted), Offers: 3", "Timeline: 5 months learning, 2 months job search"],
      image: "/images/success/rajesh.jpg"
    },
    {
      name: "Meera Desai",
      program: "Career Switcher → Data Analytics",
      before: "5 years in HR, wanted to switch to tech",
      after: "People Analytics Specialist @ E-commerce Company, ₹8 LPA",
      timeline: "Joined May 2023, Placed March 2024 (10 months)",
      quote: "At 30, with 5 years in HR, switching seemed impossible. But I was unfulfilled. Sudaksha's counselor said I could use my HR knowledge in People Analytics.",
      keyStats: ["Age: 30 (proof age is no barrier)", "Starting point: Zero technical knowledge", "Timeline: 10 months (includes foundation)", "Salary: ₹8 LPA (more than HR role)"],
      image: "/images/success/meera.jpg"
    }
  ];

  const learningFormats = [
    {
      title: "INTENSIVE BOOTCAMP (Full-Time)",
      schedule: "Mon-Fri, 9 AM - 5 PM",
      duration: "3-4 months",
      bestFor: "Freshers, unemployed, full-time commitment",
      benefit: "Fast-track to employment"
    },
    {
      title: "WEEKEND BATCH",
      schedule: "Sat-Sun, 9 AM - 6 PM",
      duration: "6-8 months",
      bestFor: "Working professionals",
      benefit: "No career interruption"
    },
    {
      title: "WEEKDAY EVENING",
      schedule: "Mon-Fri, 7 PM - 10 PM",
      duration: "6-8 months",
      bestFor: "Working professionals (9-6 jobs)",
      benefit: "Learn after work"
    },
    {
      title: "SELF-PACED + MENTORSHIP",
      schedule: "Your own schedule",
      duration: "Flexible (recommended 6-8 months)",
      bestFor: "Flexible schedules, self-disciplined learners",
      benefit: "Learn anytime, mentor support included"
    },
    {
      title: "HYBRID (Online + Offline)",
      schedule: "Mix of online sessions + monthly in-person",
      duration: "6-8 months",
      bestFor: "Those wanting both flexibility and in-person connection",
      benefit: "Best of both worlds"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-blue-100 mb-4">TRANSFORM YOUR CAREER</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              From Fresher to 6 LPA+. From Support to Developer. From Non-Tech to Tech.
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12">
              Whether you're a fresh graduate, working professional, or career switcher—we have proven pathways to launch, switch, or accelerate your tech career. Not just training. Complete career transformation with placement support.
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={() => { capture({ sourcePage: '/for-individuals', ctaLabel: 'Find Your Program', intent: 'browse_courses' }); router.push('/courses'); }}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Target className="w-5 h-5 mr-2 inline" />
              Find Your Program
            </button>
            <button 
              onClick={() => { capture({ sourcePage: '/for-individuals', ctaLabel: 'Talk to Career Counselor', intent: 'counseling' }); setCounselorOpen(true); }}
              className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500"
            >
              <Users className="w-5 h-5 mr-2 inline" />
              Talk to Career Counselor
            </button>
          </div>

          {/* Trust Banner */}
          <div className="text-center text-blue-100">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span>3,500+ Reviews</span>
              <span>•</span>
              <span>4.8/5 Rating</span>
              <span>•</span>
              <span>Featured in Times of India, Economic Times</span>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Path */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Which Journey is Yours?</h2>
          </div>

          <div className="space-y-8">
            {pathways.map((pathway) => (
              <div key={pathway.id} className={`bg-gradient-to-r ${pathway.bgColor} rounded-2xl p-8 border border-gray-200`}>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {pathway.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{pathway.title}</h3>
                    <p className="text-lg text-gray-700 mb-6">{pathway.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Who This is For:</h4>
                        <ul className="space-y-2">
                          {pathway.whoFor.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {pathway.whatYouGet && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">What You Get:</h4>
                          <ul className="space-y-2">
                            {pathway.whatYouGet.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-green-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {pathway.careerStages && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Career Stages:</h4>
                          {pathway.careerStages.map((stage, index) => (
                            <div key={index} className="mb-3">
                              <div className="font-medium text-gray-900">{stage.level}</div>
                              <ul className="space-y-1 ml-4">
                                {stage.programs.map((program, progIndex) => (
                                  <li key={progIndex} className="text-sm text-gray-600">• {program}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {pathway.whatsDifferent && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">What's Different:</h4>
                          <ul className="space-y-2">
                            {pathway.whatsDifferent.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {pathway.popularPrograms && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Popular Programs:</h4>
                        <div className="flex flex-wrap gap-2">
                          {pathway.popularPrograms.map((program, index) => (
                            <span key={index} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {pathway.popularTransitions && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Popular Transitions:</h4>
                        <div className="flex flex-wrap gap-2">
                          {pathway.popularTransitions.map((transition, index) => (
                            <span key={index} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                              {transition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-blue-600">
                        {pathway.successMetric}
                      </div>
                      <button 
                        onClick={() => { capture({ sourcePage: '/for-individuals', ctaLabel: pathway.cta, intent: 'browse_courses' }); router.push(pathway.ctaLink); }}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        {pathway.cta}
                        <ChevronRight className="w-5 h-5 ml-2 inline" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Sudaksha */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Not Another Online Course. A Complete Career Transformation System.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentiators.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-center">{item.title}</h3>
                <p className="text-sm text-gray-700 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">From Where They Were to Where They Are</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="bg-gray-200 rounded-lg h-48 mb-6 flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{story.name}</h3>
                <div className="text-sm text-gray-600 mb-4">{story.program}</div>
                
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Before:</div>
                  <div className="text-sm text-gray-700">{story.before}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-semibold text-green-600 mb-2">After:</div>
                  <div className="text-sm text-gray-700">{story.after}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-semibold text-blue-600 mb-2">Timeline:</div>
                  <div className="text-sm text-gray-700">{story.timeline}</div>
                </div>
                
                <blockquote className="text-sm text-gray-700 italic mb-4">
                  "{story.quote}"
                </blockquote>
                
                <button 
                  onClick={() => {
                    setSelectedVideo({ name: story.name, story: story.quote, role: story.after.split(' @ ')[0] || '', company: story.after.split(' @ ')[1] || '' });
                    setVideoModalOpen(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Watch Full Video
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Formats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Learn Your Way: Flexible Formats for Every Lifestyle</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningFormats.map((format, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">{format.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{format.schedule}</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-600" />
                    <span>{format.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    <span>{format.bestFor}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
                    <span>{format.benefit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 50,000+ successful professionals who transformed their careers with Sudaksha. Your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => { capture({ sourcePage: '/for-individuals', ctaLabel: 'Find Your Program (Footer)', intent: 'browse_courses' }); router.push('/courses'); }}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Target className="w-5 h-5 mr-2 inline" />
              Find Your Program
            </button>
            <button 
              onClick={() => { capture({ sourcePage: '/for-individuals', ctaLabel: 'Talk to Career Counselor (Footer)', intent: 'counseling' }); setCounselorOpen(true); }}
              className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors duration-200 border border-blue-500"
            >
              <Users className="w-5 h-5 mr-2 inline" />
              Talk to Career Counselor
            </button>
          </div>
        </div>
      </section>

      <CounselorModal isOpen={counselorOpen} onClose={() => setCounselorOpen(false)} sourcePage="/for-individuals" />
      <VideoModal 
        isOpen={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)} 
        sourcePage="/for-individuals"
        studentName={selectedVideo.name}
        story={selectedVideo.story}
        role={selectedVideo.role}
        company={selectedVideo.company}
      />
    </div>
  );
}
