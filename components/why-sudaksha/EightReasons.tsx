'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  RefreshCw,
  Users,
  UserCheck,
  Code,
  Briefcase,
  BarChart,
  DollarSign,
  Infinity
} from 'lucide-react';

const reasons = [
  {
    id: 1,
    icon: RefreshCw,
    title: 'CLOSED-LOOP FEEDBACK SYSTEM',
    problem: 'Curriculum designed once, taught for years, no connection to actual job market.',
    approach: 'Real Corporate Needs (Today) → Curriculum Design (This Week) → Student Training (Next Month) → Placement (Job Ready) → Feedback Loop (What Worked) → Update Curriculum (Continuously)',
    example: 'When our FinTech partners started adopting microservices architecture (March 2024), we updated our Java Full Stack program within 2 weeks to include Spring Cloud, Docker Compose, and service mesh basics. By April batch, students were learning what companies needed that month, not what was relevant 2 years ago.',
    impact: 'Curriculum updated quarterly (vs annually in colleges), 92% of placed students say "training matched job requirements", Companies trust Sudaksha graduates: "They\'re ready from day one"',
  },
  {
    id: 2,
    icon: Users,
    title: 'PRACTITIONER TRAINERS, NOT CAREER EDUCATORS',
    problem: '"Those who do, teach. Those who only teach, don\'t do."',
    approach: 'Every Sudaksha Trainer: Currently working OR worked in industry in last 2 years, Minimum 5 years hands-on experience, Has solved the problems you\'ll face, Shares real-world war stories, not textbook theory',
    example: 'Rajesh Kumar - Java Full Stack Trainer: 12 years experience: Infosys → Flipkart → PayTM, Currently: Lead Engineer at FinTech Startup, Specialization: Microservices, Spring Boot, React, Teaches: Weekends at Sudaksha (passion for mentoring), Impact: 300+ students trained, 85% placed',
    impact: 'Student Feedback: "Rajesh didn\'t just teach Spring Boot. He showed us how PayTM scaled their payment system using Spring Boot microservices. Real code, real challenges, real solutions. That\'s the difference."',
  },
  {
    id: 3,
    icon: UserCheck,
    title: 'SMALL BATCHES = PERSONAL ATTENTION',
    problem: 'Our Commitment: Maximum 25 students per batch. Period.',
    approach: 'Why This Matters: In 50+ student batches: Trainer can\'t know your name, Questions get lost, Weak students fall behind silently, One-size-fits-all pace. In Sudaksha\'s 25-student batches: Trainer knows each student\'s strengths/weaknesses, Every question gets answered, Personalized feedback on code, Pace adjusted based on batch understanding, You\'re not a number',
    example: 'In my previous institute, I was student #47 in a 80-person batch. Trainer never knew my name. At Sudaksha, my trainer Priya knew I struggled with algorithms and gave me extra practice problems. She reviewed my code personally. That attention made all the difference. — Amit Verma, Placed at Cognizant',
    impact: 'The Math: 25 students × 4 hours class = 9.6 minutes per student, 80 students × 4 hours class = 3 minutes per student, 3x more attention at Sudaksha',
  },
  {
    id: 4,
    icon: Code,
    title: 'PROJECT-BASED LEARNING (NOT THEORY)',
    problem: 'The Industry Reality: "Companies don\'t hire based on how much you know. They hire based on what you can build."',
    approach: 'Our Approach: Build, Build, Build. Typical Program Structure: Weeks 1-6: Learn with mini-projects (3 projects), Weeks 7-12: Build medium projects (2 projects), Weeks 13-16: Capstone project (1 major project), Total: 6 projects in portfolio',
    example: 'What Makes Our Projects Different: NOT Academic Projects: ❌ Library Management System, ❌ Student Portal, ❌ Calculator, ❌ Todo List (basic version). Industry-Standard Projects: ✅ E-commerce Platform with Payment Integration, ✅ Real-time Chat Application with WebSockets, ✅ RESTful API with Authentication & Authorization, ✅ Data Analytics Dashboard with Visualizations, ✅ Deployed applications (not just localhost)',
    impact: 'Project Requirements: Production-quality code, GitHub with proper documentation, Deployed to cloud (AWS/Heroku/Netlify), Presentation + demo video. Interview Impact: "I had 5 projects on GitHub from Sudaksha. In every interview, I opened my laptop and showed working applications. Interviewers were impressed. One said, \'Most candidates show academic projects. You\'ve built real products.\' That\'s why I got 3 offers." — Sneha Reddy, Placed at Amazon',
  },
  {
    id: 5,
    icon: Briefcase,
    title: 'COMPREHENSIVE PLACEMENT SUPPORT',
    problem: 'Most Institutes: Share job board links, Send emails: "Apply here", Maybe one mock interview, "Good luck!"',
    approach: 'Sudaksha Placement Support (6-Stage Process): Stage 1: Resume Transformation (Multiple iterations, ATS optimization), Stage 2: LinkedIn Profile Building, Stage 3: GitHub Portfolio Optimization, Stage 4: Interview Preparation (Technical, Behavioral, HR), Stage 5: Mock Interviews (Unlimited), Stage 6: Active Placement (Direct referrals, Scheduled campus drives)',
    example: 'Post-Placement: 6-month check-ins, Issue resolution, Career guidance, Upskilling opportunities',
    impact: 'Success Metric: 85% placed within 6 months, Average: 2.8 months from course completion to placement, Interview-to-offer ratio: 38% (vs industry avg 15-20%)',
  },
  {
    id: 6,
    icon: BarChart,
    title: 'TRANSPARENT, MEASURABLE OUTCOMES',
    problem: 'What We Track (And Share Publicly): Placement Rate, Salary Data, Student Satisfaction, Companies',
    approach: 'Placement Rate: Overall: 85%, By program: 82-89%, By experience: Fresher 85%, Professionals 88%, Timeline: Within 6 months of completion. Salary Data: Average: ₹6.5 LPA, Range: ₹4 LPA - ₹15 LPA, By program: Java Full Stack ₹6.5L, MERN ₹6.8L, Data Science ₹7.2L',
    example: 'Student Satisfaction: Overall rating: 4.8/5, Would recommend: 92%, Teaching quality: 4.9/5, Placement support: 4.7/5. Companies: Total hiring partners: 200+, Students placed in: 150+ companies, Top recruiters: TCS, Infosys, Wipro, Cognizant, Accenture',
    impact: 'We Don\'t Hide: Batch-wise results, Company-wise placement numbers, Salary breakdowns, Student testimonials. Contrast: Most institutes: "100% placement!" (no data), Online platforms: "50,000 students enrolled" (how many got jobs?), Sudaksha: Real numbers, transparent data, verifiable',
  },
  {
    id: 7,
    icon: DollarSign,
    title: 'PAY-AFTER-PLACEMENT OPTIONS',
    problem: 'The Problem: Many deserving students can\'t afford ₹40-60K upfront. Traditional loans require collateral. This shouldn\'t stop talent.',
    approach: 'Our Solution: Multiple Payment Options. Option 1: Standard EMI (Down payment: ₹10K, EMI: ₹5-6K/month × 8 months). Option 2: Pay After Placement (Zero upfront, Pay only after getting job, Condition: Salary > ₹3.5 LPA, Amount: ₹55K vs ₹45K upfront). Option 3: Income Share Agreement (ISA) (Zero upfront, Pay 15% of monthly salary × 24 months, Capped at 1.5x program fee)',
    example: 'Option 4: Scholarships (Merit: 20-30% off, Women in Tech: 15-25% off, Economic need: 30-50% off). Why We Offer This: "We believe talent exists everywhere, but opportunity doesn\'t. If you have the ability and commitment, money shouldn\'t stop you. We bet on you because we\'ve seen 10,000 succeed before you."',
    impact: 'Risk Mitigation: Rigorous aptitude assessment, Performance tracking. Success Story: "I\'m from a small town, family couldn\'t afford ₹45K. ISA option changed my life. Studied hard, got placed at ₹7 LPA. Paid back ₹1.26 L over 2 years. Today I\'m earning ₹12 LPA. Best investment ever." — Vikram Mehta, From Bihar, Now Software Engineer',
  },
  {
    id: 8,
    icon: Infinity,
    title: 'LIFETIME LEARNING ECOSYSTEM',
    problem: 'Your Relationship with Sudaksha Doesn\'t End at Placement',
    approach: 'What You Get After Placement: 6-Month Support (Monthly check-ins, Technical doubts, Issue resolution), Alumni Network (10,000+ Members, Private Slack community, Job referrals), Upskilling Opportunities (50% discount on future programs, Free workshops monthly)',
    example: 'Career Growth Support: Job switch guidance, Resume updates, Interview prep for senior roles. Real Example: "I completed Java Full Stack in 2021. Got placed at TCS. In 2023, I wanted to switch. Used alumni network, got referral to startup. Took Sudaksha\'s Microservices advanced program (50% off). Switched to ₹12 LPA. Now I mentor current students. Sudaksha is family, not just an institute." — Priya Sharma, Alumna',
    impact: 'Mentorship Opportunities: Mentor junior students, Guest lectures, Earn while mentoring',
  },
];

export function EightReasons() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            The Sudaksha Advantage
          </h2>
          <p className="text-xl text-gray-600">
            8 Reasons Why We're Different
          </p>
        </motion.div>

        <div className="space-y-16">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 lg:p-12"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <reason.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  REASON {reason.id}: {reason.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-red-600 mb-2">
                      {reason.id === 1 ? 'The Problem with Most Training:' :
                       reason.id === 2 ? 'Our Trainer Philosophy:' :
                       reason.id === 3 ? 'Our Commitment:' :
                       reason.id === 4 ? 'The Industry Reality:' :
                       reason.id === 5 ? 'Most Institutes:' :
                       reason.id === 6 ? 'What We Track (And Share Publicly):' :
                       reason.id === 7 ? 'The Problem:' :
                       'Your Relationship with Sudaksha Doesn\'t End at Placement'}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">{reason.problem}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">Our Approach:</h4>
                    <p className="text-gray-700 leading-relaxed">{reason.approach}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-green-600 mb-2">
                      {reason.id === 1 ? 'Example:' :
                       reason.id === 2 ? 'Trainer Profile Example:' :
                       reason.id === 3 ? 'Real Example:' :
                       reason.id === 4 ? 'What Makes Our Projects Different:' :
                       reason.id === 5 ? 'Post-Placement:' :
                       reason.id === 6 ? 'We Don\'t Hide:' :
                       reason.id === 7 ? 'Success Story:' :
                       'Real Example:'}
                    </h4>
                    <p className="text-gray-600 leading-relaxed italic">{reason.example}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-purple-600 mb-2">Impact:</h4>
                    <p className="text-gray-700 leading-relaxed">{reason.impact}</p>
                  </div>
                </div>
              </div>

              {reason.id === 6 && (
                <div className="mt-8 text-center">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                    View Our Placement Report 2023
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}





