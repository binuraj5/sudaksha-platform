'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            category: 'General',
            questions: [
                {
                    question: 'What is Sudaksha?',
                    answer: 'Sudaksha is a leading skill development platform offering comprehensive training programs for individuals, institutions, and corporations across India and emerging markets. We specialize in IT, non-IT, functional, and personal development courses.',
                },
                {
                    question: 'Where is Sudaksha located?',
                    answer: 'Our headquarters is located in Hyderabad, India. We offer both in-person and online training options to cater to learners nationwide.',
                },
                {
                    question: 'What makes Sudaksha different from other training providers?',
                    answer: 'Sudaksha focuses on practical, industry-aligned training with a unique emphasis on brain circulation and creating skilled workforces in emerging markets. We offer customized programs, experienced trainers, and strong placement support.',
                },
            ],
        },
        {
            category: 'Courses & Programs',
            questions: [
                {
                    question: 'What types of courses do you offer?',
                    answer: 'We offer courses across four main categories: IT (software development, data analytics, cloud, AI/ML, cybersecurity), Non-IT (project management, business analysis), Functional (domain-specific skills), and Personal Development (soft skills, leadership).',
                },
                {
                    question: 'How long are the courses?',
                    answer: 'Course duration varies based on the program. We offer short-term workshops (1-2 days), intensive bootcamps (4-12 weeks), and comprehensive programs (3-6 months). Check individual course pages for specific durations.',
                },
                {
                    question: 'Are the courses online or in-person?',
                    answer: 'We offer multiple delivery modes: fully online (live instructor-led), in-person (at our centers or your location), and hybrid (combination of both). The available modes are specified on each course page.',
                },
                {
                    question: 'Do you offer certifications?',
                    answer: 'Yes, all our courses include a Sudaksha completion certificate. Many of our programs also prepare you for industry-recognized certifications from providers like AWS, Microsoft, Google, PMI, and others.',
                },
            ],
        },
        {
            category: 'Enrollment & Pricing',
            questions: [
                {
                    question: 'How do I enroll in a course?',
                    answer: 'Browse our course catalog, select your desired course, and click "Enroll Now" or "Contact Us". Our team will guide you through the enrollment process, payment options, and batch schedules.',
                },
                {
                    question: 'What are the payment options?',
                    answer: 'We accept various payment methods including credit/debit cards, bank transfers, and installment plans. Corporate clients can request invoice-based billing. Contact us for specific payment arrangements.',
                },
                {
                    question: 'Do you offer group discounts?',
                    answer: 'Yes! We offer attractive discounts for group enrollments (3+ individuals) and special corporate packages. Contact our sales team for customized pricing.',
                },
                {
                    question: 'What is your refund policy?',
                    answer: 'We offer a refund within 7 days of course commencement if you\'re not satisfied. Please refer to our Terms of Service for complete refund policy details.',
                },
            ],
        },
        {
            category: 'Corporate Training',
            questions: [
                {
                    question: 'Do you offer customized corporate training?',
                    answer: 'Yes, we specialize in customized training programs tailored to your organization\'s specific needs, skill gaps, and business objectives. We can deliver training at your location or our facilities.',
                },
                {
                    question: 'What is the minimum group size for corporate training?',
                    answer: 'We can accommodate groups of any size, from small teams of 5 to large batches of 100+. We\'ll design the program to suit your group size and learning objectives.',
                },
                {
                    question: 'How do you measure training effectiveness?',
                    answer: 'We use pre and post-training assessments, practical projects, feedback surveys, and performance metrics to measure learning outcomes and ROI. We provide detailed reports to corporate clients.',
                },
            ],
        },
        {
            category: 'Placement & Support',
            questions: [
                {
                    question: 'Do you provide placement assistance?',
                    answer: 'Yes, we offer comprehensive placement support including resume building, interview preparation, and job referrals to our corporate partners. Placement success depends on individual performance and market conditions.',
                },
                {
                    question: 'Do you guarantee job placement?',
                    answer: 'While we provide strong placement support and have excellent placement rates, we cannot guarantee job placement as it depends on various factors including market conditions, individual skills, and performance.',
                },
                {
                    question: 'What kind of support is available after course completion?',
                    answer: 'We offer lifetime access to course materials, alumni network access, continued career guidance, and updates on new courses and industry trends.',
                },
            ],
        },
    ];

    const filteredFAQs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
            faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter(category => category.questions.length > 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Find answers to common questions about our courses and services
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {filteredFAQs.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    {category.category}
                                </h2>
                                <div className="space-y-4">
                                    {category.questions.map((faq, faqIndex) => {
                                        const globalIndex = categoryIndex * 100 + faqIndex;
                                        const isOpen = openIndex === globalIndex;

                                        return (
                                            <div
                                                key={faqIndex}
                                                className="bg-white rounded-xl shadow-md overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="text-lg font-semibold text-gray-900 pr-4">
                                                        {faq.question}
                                                    </span>
                                                    {isOpen ? (
                                                        <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                    )}
                                                </button>
                                                {isOpen && (
                                                    <div className="px-6 pb-4">
                                                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {filteredFAQs.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">
                                    No questions found matching "{searchQuery}". Try a different search term.
                                </p>
                            </div>
                        )}

                        {/* Contact Section */}
                        <div className="mt-16 bg-blue-50 rounded-xl p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Still Have Questions?
                            </h3>
                            <p className="text-gray-700 mb-6">
                                Can't find what you're looking for? Our team is here to help!
                            </p>
                            <a
                                href="/contact"
                                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
