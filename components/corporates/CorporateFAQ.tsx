'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function CorporateFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: 'How is Sudaksha different from other corporate training providers?',
      answer: 'We focus on solving business problems, not delivering generic courses. Our training is 100% custom-built around your tech stack, mapped to your objectives, and delivered by working practitioners. We measure success by competency improvement and business impact, not completion certificates.'
    },
    {
      question: 'What is the typical duration of a corporate training program?',
      answer: 'It varies based on objectives. Quick upskilling programs run 2-4 weeks. Comprehensive transformation initiatives run 8-16 weeks. We\'ll recommend the right duration during our discovery process.'
    },
    {
      question: 'Can you train our team on our proprietary frameworks and internal tools?',
      answer: 'Absolutely. Our trainers spend time understanding your specific environment, frameworks, and tools. We incorporate them into the curriculum so training translates directly to your work environment.'
    },
    {
      question: 'Do you provide trainers for on-site training?',
      answer: 'Yes. We deploy trainers to your location anywhere in India. For international locations, we can arrange fly-in trainers or work with our global partner network.'
    },
    {
      question: 'What\'s included in the 90-day post-training support?',
      answer: 'Email and chat support for technical questions, optional monthly check-in calls, access to updated course materials, invitation to alumni webinars, and one free refresher session if needed.'
    },
    {
      question: 'How do you measure training effectiveness?',
      answer: 'We use pre-assessments to establish baseline, mid-point checks to adjust course, and post-assessments to measure improvement. We also track application of skills in actual work and conduct 30-60-90 day effectiveness reviews with managers.'
    },
    {
      question: 'Can we get a pilot program before committing to large-scale training?',
      answer: 'Yes. We recommend starting with a pilot batch of 15-25 employees. This lets you experience our approach, validate results, and then scale confidently.'
    },
    {
      question: 'What is your trainer-to-student ratio?',
      answer: 'For technical training, we maintain 1:20-25 ratio to ensure interaction and personalization. For hands-on labs, we can provide additional assistant trainers for 1:10-15 ratio.'
    },
    {
      question: 'How do Train-Hire-Deploy and Deploy-Hire-Train models work financially?',
      answer: 'THD: You pay only for successfully deployed candidates (no hire, no fee). DHT: Monthly resource cost plus training fee. Both include our standard guarantees. We\'ll provide detailed pricing during consultation.'
    },
    {
      question: 'Do you provide training for non-technical staff?',
      answer: 'Yes. We offer business analysis, project management, agile practices, communication skills, and other functional training. Our approach remains the same: outcome-driven and customized.'
    },
    {
      question: 'Can training be conducted in languages other than English?',
      answer: 'Yes. We conduct training in Hindi, Tamil, Telugu, Kannada, and other regional languages based on trainer availability and advance notice.'
    },
    {
      question: 'What happens if we\'re not satisfied with the training?',
      answer: 'We conduct a mid-point review during every program. If objectives aren\'t being met, we make immediate corrections. In the rare case of complete dissatisfaction, we\'ll work out a fair resolution including potential refunds or re-training.'
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about our corporate training solutions
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Our corporate training experts are here to help. Schedule a call to discuss your specific needs.
            </p>
            <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Talk to an Expert
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
