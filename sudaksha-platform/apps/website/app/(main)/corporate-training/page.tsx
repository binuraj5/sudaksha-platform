import Link from 'next/link';
import { Building2, Users, Award, TrendingUp } from 'lucide-react';
import { RecentEngagements } from '@/components/corporate/RecentEngagements';

export const metadata = {
    title: 'Corporate Training Solutions | Sudaksha - Upskill Your Workforce',
    description: 'Transform your workforce with customized corporate training programs designed to meet your specific business needs.',
};

// Prevent prerendering for this page since it uses dynamic data from the database
export const revalidate = 0;

export default function CorporateTrainingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Corporate Training Solutions</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Upskill your workforce with customized training programs
                        </p>
                        <Link href="/contact" className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                            Request Consultation
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { icon: <Building2 className="w-8 h-8" />, title: 'Customized Programs', desc: 'Training tailored to your business needs' },
                            { icon: <Users className="w-8 h-8" />, title: 'Expert Trainers', desc: 'Industry professionals with real experience' },
                            { icon: <Award className="w-8 h-8" />, title: 'Certifications', desc: 'Industry-recognized credentials' },
                            { icon: <TrendingUp className="w-8 h-8" />, title: 'Measurable ROI', desc: 'Track training effectiveness and impact' },
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

            <RecentEngagements />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Team?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Contact us to discuss your training needs and get a customized solution
                    </p>
                    <Link href="/contact" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Schedule Consultation
                    </Link>
                </div>
            </section>
        </div>
    );
}
