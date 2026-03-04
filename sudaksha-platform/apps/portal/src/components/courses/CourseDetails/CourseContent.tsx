'use client';

import { useState } from 'react';
import { Star, Clock, Users, Award, Calendar, BookOpen, ChevronDown, ChevronUp, CheckCircle, User, Mail, Phone, MapPin, Target, TrendingUp, GraduationCap, MessageSquare, HelpCircle, Sparkles, CreditCard } from 'lucide-react';
import { Course } from '@/types/course';

interface CourseContentProps {
  course: Course;
}

export function CourseContent({ course }: CourseContentProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target, color: 'from-blue-500 to-blue-600' },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { id: 'instructor', label: 'Instructor', icon: User, color: 'from-green-500 to-green-600' },
    { id: 'reviews', label: 'Reviews', icon: Star, color: 'from-yellow-500 to-yellow-600' },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, color: 'from-pink-500 to-pink-600' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <nav className="flex space-x-1 p-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center space-x-3 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                  ? `text-white shadow-lg ${tab.color}`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <div className={`w-5 h-5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                <tab.icon className="w-full h-full" />
              </div>
              <span className="font-semibold">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-90 blur-sm -z-10"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8 animate-fadeIn">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* What You'll Learn */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  What You'll Learn
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningObjectives?.map((objective, index) => (
                  <div key={index} className="flex items-start group transform transition-all duration-300 hover:scale-105">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900">{objective}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Course Description
                </h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {course.description}
                </p>
                <p className="text-gray-700 leading-relaxed text-lg mt-4">
                  This comprehensive course is designed to take you from beginner to professional level.
                  You'll work on real-world projects, learn industry best practices, and build a portfolio
                  that showcases your skills to potential employers.
                </p>
              </div>
            </div>

            {/* Who Should Take This Course */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Who Should Take This Course
                </h3>
              </div>
              <div className="bg-white rounded-xl p-6 border border-green-200">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Aspiring developers looking to start their career</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Professionals wanting to switch to web development</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Students who want to build practical skills</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Anyone interested in modern web technologies</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Career Opportunities */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Career Opportunities
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">FE</span>
                    </div>
                    <h4 className="font-semibold text-blue-900 ml-3">Frontend Developer</h4>
                  </div>
                  <p className="text-blue-700 text-sm">Build user interfaces with React and modern frameworks</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">FS</span>
                    </div>
                    <h4 className="font-semibold text-green-900 ml-3">Full Stack Developer</h4>
                  </div>
                  <p className="text-green-700 text-sm">Work on both frontend and backend technologies</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">BE</span>
                    </div>
                    <h4 className="font-semibold text-purple-900 ml-3">Backend Developer</h4>
                  </div>
                  <p className="text-purple-700 text-sm">Focus on server-side development and APIs</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">DO</span>
                    </div>
                    <h4 className="font-semibold text-orange-900 ml-3">DevOps Engineer</h4>
                  </div>
                  <p className="text-orange-700 text-sm">Manage deployment and infrastructure</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Course Curriculum
                </h3>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Download Full Curriculum
              </button>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Modules and Lessons List */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
                  <h4 className="text-lg font-bold text-purple-900 mb-4">Course Modules</h4>
                  <div className="space-y-3">
                    {course.moduleBreakdown?.modules?.map((module: any, index: number) => (
                      <div key={module.id} className="bg-white rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => toggleModule(module.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow">
                              {index + 1}
                            </div>
                            <div className="ml-3">
                              <div className="font-semibold text-gray-900">{module.title}</div>
                              <div className="text-sm text-gray-600">{module.duration} hours</div>
                            </div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-purple-600 transform transition-transform duration-300 ${expandedModules.includes(module.id) ? 'rotate-180' : ''
                            }`} />
                        </div>

                        {expandedModules.includes(module.id) && (
                          <div className="mt-3 space-y-2">
                            {module.lessons?.map((lesson: any, lessonIndex: number) => (
                              <div key={lesson.id} className="flex items-center p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                <div className="w-6 h-6 bg-purple-400 rounded flex items-center justify-center text-white text-xs font-bold mr-2">
                                  {lessonIndex + 1}
                                </div>
                                <span className="text-sm text-gray-700 flex-1">{lesson.title}</span>
                                <span className="text-xs text-purple-600">{lesson.duration} min</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Module Details */}
              <div className="space-y-4">
                {expandedModules.length > 0 ? (
                  course.moduleBreakdown?.modules?.filter((module: any) => expandedModules.includes(module.id)).map((module: any) => (
                    <div key={module.id} className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {course.moduleBreakdown?.modules?.indexOf(module) + 1}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-xl font-bold text-gray-900">{module.title}</h4>
                          <p className="text-purple-600 font-medium">{module.duration} hours</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-900">Lessons:</h5>
                        {module.lessons?.map((lesson: any, lessonIndex: number) => (
                          <div key={lesson.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow">
                                {lessonIndex + 1}
                              </div>
                              <BookOpen className="w-4 h-4 text-purple-600 ml-3" />
                              <span className="ml-3 text-gray-700 font-medium">{lesson.title}</span>
                            </div>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                              {lesson.duration} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 shadow-lg text-center">
                    <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-purple-900 mb-2">Select a Module</h4>
                    <p className="text-purple-700">Click on any module from the left to view detailed lessons and content.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructor Tab */}
        {activeTab === 'instructor' && course.trainer && (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Meet Your Instructor
              </h3>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>

                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{course.trainer.name}</h4>
                  <p className="text-gray-600 mb-3 text-lg">Senior Full Stack Developer</p>

                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-semibold">{course.trainer.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">{course.trainer.experience} years experience</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 text-lg leading-relaxed">{course.trainer.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.trainer.expertise.map((skill, index) => (
                      <span key={index} className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-green-600" />
                      <span>{course.trainer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-green-600" />
                      <span>+91 91210 44435</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold ml-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Teaching Approach
                </h4>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  I believe in hands-on, project-based learning. My teaching methodology focuses on
                  building real applications, understanding concepts through practice, and developing
                  problem-solving skills that are essential in the industry.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Student Reviews
              </h3>
            </div>

            {/* Rating Summary */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {course.rating}
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.floor(course.rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2 font-medium">Overall Rating</p>
                </div>

                <div className="flex-1 ml-8">
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <span className="text-sm font-semibold text-gray-700 w-8">{rating}★</span>
                        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: rating === 5 ? '70%' : rating === 4 ? '20%' : '10%'
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-12">
                          {rating === 5 ? '70%' : rating === 4 ? '20%' : '10%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {course.reviews?.map((review, index) => (
                <div key={review.id} className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl p-6 border border-yellow-200 shadow-lg transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {review.studentName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-bold text-gray-900 text-lg">{review.studentName}</div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                                }`}
                            />
                          ))}
                          {review.verified && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold ml-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h3>
            </div>

            {[
              {
                question: "What are the prerequisites for this course?",
                answer: "Basic understanding of programming concepts and familiarity with web technologies is recommended.",
                icon: Target
              },
              {
                question: "Will I get a certificate after completion?",
                answer: "Yes, you'll receive a certificate of completion that you can add to your resume and LinkedIn profile.",
                icon: Award
              },
              {
                question: "Is there placement assistance?",
                answer: "Yes, we provide placement support including resume building, interview preparation, and job referrals.",
                icon: Users
              },
              {
                question: "Can I pay in installments?",
                answer: "Yes, we offer EMI options to make the course more affordable. Contact our team for details.",
                icon: CreditCard
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-pink-50 rounded-2xl border border-pink-200 shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
                <button className="w-full px-8 py-6 text-left hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center text-white shadow">
                        <faq.icon className="w-5 h-5" />
                      </div>
                      <span className="ml-4 text-lg font-semibold text-gray-900">{faq.question}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-pink-400" />
                  </div>
                </button>
                <div className="px-8 py-6 bg-gradient-to-br from-white to-pink-50 border-t border-pink-200">
                  <p className="text-gray-700 text-lg leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseContent;
