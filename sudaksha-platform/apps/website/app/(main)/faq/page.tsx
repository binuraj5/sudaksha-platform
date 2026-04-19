'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    featured: boolean;
}

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [loading, setLoading] = useState(true);
    const [faqs, setFaqs] = useState<Array<{ category: string; questions: FAQ[] }>>([]);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const res = await fetch('/api/admin/faqs');
            const data = await res.json();
            
            if (data.success && data.faqs) {
                // Group FAQs by category
                const grouped: { [key: string]: FAQ[] } = {};
                data.faqs.forEach((faq: FAQ) => {
                    if (!grouped[faq.category]) {
                        grouped[faq.category] = [];
                    }
                    grouped[faq.category].push(faq);
                });

                // Convert to array and sort by category name
                const categorized = Object.entries(grouped).map(([category, questions]) => ({
                    category,
                    questions: questions.sort((a, b) => a.order - b.order),
                })).sort((a, b) => a.category.localeCompare(b.category));

                setFaqs(categorized);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFAQs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
            faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter(category => category.questions.length > 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading FAQs...</p>
                </div>
            </div>
        );
    }

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
