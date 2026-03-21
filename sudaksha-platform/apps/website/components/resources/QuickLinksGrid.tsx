'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  MapPin,
  Target,
  MessageSquare,
  DollarSign,
  BookOpen,
  Download,
  Calculator,
  User
} from 'lucide-react';
import Link from 'next/link';
import { SkillAssessmentModal } from './SkillAssessmentModal';
import { ROICalculator } from './ROICalculator';
import { EMICalculator } from './EMICalculator';
import { useState } from 'react';

const resourceCategories = [
  {
    id: 'guidance',
    icon: MapPin,
    title: 'CAREER GUIDANCE',
    resources: [
      { name: 'Full Stack Developer Roadmap', href: '#' },
      { name: 'Data Science Career Path', href: '#' },
      { name: 'DevOps Engineer Journey', href: '#' },
      { name: 'Career Switcher\'s Guide', href: '#' },
      { name: 'Tech vs Non-Tech Roles', href: '#' },
    ],
  },
  {
    id: 'assessment',
    icon: Target,
    title: 'SKILL ASSESSMENTS',
    description: 'Free Tools',
    tools: [
      { name: 'Coding Aptitude Test (15 min)', href: '#' },
      { name: 'Logical Reasoning Test (10 min)', href: '#' },
      { name: 'Technical Skills Assessment', href: '#' },
      { name: 'Career Fit Analyzer', href: '#' },
    ],
    benefits: ['Instant results', 'Personalized recommendations', 'Skill gap analysis'],
    cta: 'Take Assessment',
    interactive: true,
  },
  {
    id: 'interview',
    icon: MessageSquare,
    title: 'INTERVIEW PREPARATION',
    resources: [
      { name: 'Top 100 Java Interview Questions', href: '#' },
      { name: 'System Design Basics', href: '#' },
      { name: 'HR Interview Questions', href: '#' },
      { name: 'Behavioral Interview Guide', href: '#' },
      { name: 'Salary Negotiation Tips', href: '#' },
      { name: 'Mock Interview Booking', href: '#' },
    ],
    premium: ['Video explanations', 'Company-specific prep', '1-on-1 mock interviews'],
  },
  {
    id: 'salary',
    icon: DollarSign,
    title: 'SALARY GUIDE',
    data: {
      title: '2025-26 IT Salary Report',
      byRole: [
        'Full Stack Developer: ₹4-12 LPA',
        'Data Scientist: ₹6-15 LPA',
        'DevOps Engineer: ₹5-14 LPA',
        'QA Engineer: ₹3-8 LPA',
      ],
      byExperience: [
        'Fresher (0-2y): ₹4-8 LPA',
        'Mid (3-5y): ₹8-15 LPA',
        'Senior (5-10y): ₹15-30 LPA',
      ],
      byCity: [
        'Bangalore: +20% vs national avg',
        'Hyderabad: +15%',
        'Pune: +10%',
        'NCR: +12%',
      ],
    },
    cta: 'Download Full Report',
  },
  {
    id: 'learning',
    icon: BookOpen,
    title: 'LEARNING RESOURCES',
    freeContent: [
      { name: 'Blog: Latest Tech Trends', href: '#' },
      { name: 'YouTube: Tutorial Videos', href: '#' },
      { name: 'Podcast: Career Stories', href: '#' },
      { name: 'Newsletter: Weekly Tips', href: '#' },
    ],
    workshops: [
      'Introduction to Web Development',
      'Git & GitHub for Beginners',
      'Resume Building Masterclass',
    ],
    nextWorkshop: 'Saturday, April 26, 2026',
    cta: 'Register Free',
  },
  {
    id: 'downloads',
    icon: Download,
    title: 'DOWNABLES',
    popular: [
      'Program Brochures (all tracks)',
      'Course Curriculum (detailed)',
      'Success Stories eBook',
      'Placement Report 2023',
      'Fee Structure & EMI Guide',
      'Corporate Training Catalog',
    ],
    format: 'PDF',
    note: 'No signup required for most',
  },
  {
    id: 'tools',
    icon: Calculator,
    title: 'TOOLS & CALCULATORS',
    calculators: [
      {
        name: 'ROI Calculator',
        description: 'Input: Current salary, Program fee. Output: Payback period, 5-year gain',
        cta: 'Calculate ROI',
        component: 'roi',
      },
      {
        name: 'EMI Calculator',
        description: 'Input: Loan amount, tenure. Output: Monthly payment',
        cta: 'Calculate EMI',
        component: 'emi',
      },
      {
        name: 'Career Comparison Tool',
        description: 'Compare: Developer vs Data Scientist vs DevOps. Output: Salary, growth, difficulty, demand',
        cta: 'Compare Careers',
        href: '#',
      },
    ],
  },
  {
    id: 'portal',
    icon: User,
    title: 'STUDENT PORTAL',
    description: 'For Enrolled Students',
    features: [
      'Access course materials',
      'Submit assignments',
      'Book doubt-clearing sessions',
      'Track attendance',
      'Download certificates',
    ],
    cta: 'Login to Portal',
    alternative: {
      text: 'Not enrolled yet?',
      link: 'Explore Programs',
      href: '/courses',
    },
  },
];

export function QuickLinksGrid() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

  const handleModalOpen = (modalType: string) => {
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleCalculatorOpen = (calculatorType: string) => {
    setActiveCalculator(calculatorType);
  };

  const handleCalculatorClose = () => {
    setActiveCalculator(null);
  };

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {resourceCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-200"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <category.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
              </div>

              {/* Career Guidance */}
              {category.id === 'guidance' && (
                <div id="roadmaps" className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">Resources:</p>
                  {category.resources?.map((resource) => (
                    <Link
                      key={resource.name}
                      href={resource.href}
                      className="block text-blue-600 hover:text-blue-700 text-sm hover:underline"
                    >
                      • {resource.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Skill Assessments */}
              {category.id === 'assessment' && (
                <div id="assessment" className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Free Tools:</p>
                    {category.tools?.map((tool) => (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className="block text-blue-600 hover:text-blue-700 text-sm hover:underline"
                      >
                        • {tool.name}
                      </Link>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">What You Get:</p>
                    {category.benefits?.map((benefit) => (
                      <p key={benefit} className="text-sm text-gray-700">• {benefit}</p>
                    ))}
                  </div>
                  <button
                    onClick={() => handleModalOpen('assessment')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    {category.cta}
                  </button>
                </div>
              )}

              {/* Interview Preparation */}
              {category.id === 'interview' && (
                <div id="interview" className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Resources:</p>
                    {category.resources?.map((resource) => (
                      <Link
                        key={resource.name}
                        href={resource.href}
                        className="block text-blue-600 hover:text-blue-700 text-sm hover:underline"
                      >
                        • {resource.name}
                      </Link>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Premium:</p>
                    {category.premium?.map((item) => (
                      <p key={item} className="text-sm text-gray-700">• {item}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary Guide */}
              {category.id === 'salary' && category.data && (
                <div id="salary" className="space-y-4">
                  <h4 className="font-semibold text-gray-900">{category.data.title}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-800 mb-2">By Role:</p>
                      {category.data.byRole.map((item) => (
                        <p key={item} className="text-gray-600">{item}</p>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-2">By Experience:</p>
                      {category.data.byExperience.map((item) => (
                        <p key={item} className="text-gray-600">{item}</p>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-2">By City:</p>
                      {category.data.byCity.map((item) => (
                        <p key={item} className="text-gray-600">{item}</p>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    {category.cta}
                  </button>
                </div>
              )}

              {/* Learning Resources */}
              {category.id === 'learning' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Free Content:</p>
                    {category.freeContent?.map((content) => (
                      <Link
                        key={content.name}
                        href={content.href}
                        className="block text-blue-600 hover:text-blue-700 text-sm hover:underline"
                      >
                        • {content.name}
                      </Link>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Free Workshops:</p>
                    {category.workshops?.map((workshop) => (
                      <p key={workshop} className="text-sm text-gray-700">• {workshop}</p>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Next Workshop:</strong> {category.nextWorkshop}
                  </p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    {category.cta}
                  </button>
                </div>
              )}

              {/* Downloads */}
              {category.id === 'downloads' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">Popular Downloads:</p>
                  {category.popular?.map((item) => (
                    <p key={item} className="text-sm text-gray-700">• {item}</p>
                  ))}
                  <p className="text-sm text-gray-600">
                    <strong>Format:</strong> {category.format}
                  </p>
                  <p className="text-xs text-green-600">{category.note}</p>
                </div>
              )}

              {/* Tools & Calculators */}
              {category.id === 'tools' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">Interactive Tools:</p>
                  {category.calculators?.map((calc) => (
                    <div key={calc.name} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 text-sm">{calc.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{calc.description}</p>
                      {calc.component ? (
                        <button
                          onClick={() => handleCalculatorOpen(calc.component)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        >
                          {calc.cta} →
                        </button>
                      ) : (
                        <Link
                          href={calc.href || '#'}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline inline-block"
                        >
                          {calc.cta} →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Student Portal */}
              {category.id === 'portal' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{category.description}</p>
                  {category.features?.map((feature) => (
                    <p key={feature} className="text-sm text-gray-700">• {feature}</p>
                  ))}
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    {category.cta}
                  </button>
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">{category.alternative?.text}</p>
                    <Link
                      href={category.alternative?.href || '#'}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                    >
                      {category.alternative?.link} →
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modals */}
      {activeModal === 'assessment' && (
        <SkillAssessmentModal onClose={handleModalClose} />
      )}

      {/* Calculators */}
      {activeCalculator === 'roi' && (
        <ROICalculator onClose={handleCalculatorClose} />
      )}

      {activeCalculator === 'emi' && (
        <EMICalculator onClose={handleCalculatorClose} />
      )}
    </div>
  );
}





