import Link from 'next/link';
import { ClipboardCheck, BarChart, Target, Award } from 'lucide-react';

export const metadata = {
    title: 'Skill Assessment Services | Sudaksha - Identify & Bridge Skill Gaps',
    description: 'Comprehensive skill assessment services to evaluate workforce capabilities and identify training needs.',
};

export default function SkillAssessmentPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Skill Assessment Services</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Identify skill gaps and measure workforce capabilities
                        </p>
                        <Link href="/contact" className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Assessment Process</h2>
                    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { icon: <ClipboardCheck className="w-8 h-8" />, title: 'Technical Testing', desc: 'Evaluate technical competencies' },
                            { icon: <BarChart className="w-8 h-8" />, title: 'Analysis & Reporting', desc: 'Detailed skill gap analysis' },
                            { icon: <Target className="w-8 h-8" />, title: 'Training Recommendations', desc: 'Customized learning paths' },
                            { icon: <Award className="w-8 h-8" />, title: 'Progress Tracking', desc: 'Monitor skill development' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Request a Skill Assessment</h2>
                    <Link href="/contact" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Contact Us
                    </Link>
                </div>
            </section>
        </div>
    );
}
