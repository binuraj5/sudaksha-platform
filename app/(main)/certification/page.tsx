import Link from 'next/link';
import { Award, CheckCircle, TrendingUp, Users, Globe } from 'lucide-react';

export const metadata = {
    title: 'Certification Programs | Sudaksha - Industry-Recognized Credentials',
    description: 'Earn industry-recognized certifications in IT, project management, and more. Boost your career with Sudaksha certification programs.',
};

export default function CertificationPage() {
    const certifications = [
        {
            category: 'Cloud & DevOps',
            icon: '☁️',
            certs: [
                { name: 'AWS Certified Solutions Architect', provider: 'Amazon Web Services', level: 'Associate/Professional' },
                { name: 'Microsoft Azure Administrator', provider: 'Microsoft', level: 'Associate' },
                { name: 'Google Cloud Professional', provider: 'Google Cloud', level: 'Professional' },
                { name: 'Certified Kubernetes Administrator (CKA)', provider: 'CNCF', level: 'Professional' },
            ],
        },
        {
            category: 'Project Management',
            icon: '📋',
            certs: [
                { name: 'Project Management Professional (PMP)', provider: 'PMI', level: 'Professional' },
                { name: 'Certified ScrumMaster (CSM)', provider: 'Scrum Alliance', level: 'Associate' },
                { name: 'PRINCE2 Practitioner', provider: 'AXELOS', level: 'Practitioner' },
                { name: 'PMI Agile Certified Practitioner (PMI-ACP)', provider: 'PMI', level: 'Professional' },
            ],
        },
        {
            category: 'Data & Analytics',
            icon: '📊',
            certs: [
                { name: 'Google Data Analytics Professional', provider: 'Google', level: 'Professional' },
                { name: 'Microsoft Certified: Data Analyst Associate', provider: 'Microsoft', level: 'Associate' },
                { name: 'Tableau Desktop Specialist', provider: 'Tableau', level: 'Specialist' },
                { name: 'AWS Certified Data Analytics', provider: 'Amazon Web Services', level: 'Specialty' },
            ],
        },
        {
            category: 'Cybersecurity',
            icon: '🔒',
            certs: [
                { name: 'Certified Ethical Hacker (CEH)', provider: 'EC-Council', level: 'Professional' },
                { name: 'CompTIA Security+', provider: 'CompTIA', level: 'Associate' },
                { name: 'Certified Information Security Manager (CISM)', provider: 'ISACA', level: 'Professional' },
                { name: 'CISSP', provider: 'ISC²', level: 'Professional' },
            ],
        },
        {
            category: 'Software Development',
            icon: '💻',
            certs: [
                { name: 'Oracle Certified Professional: Java SE', provider: 'Oracle', level: 'Professional' },
                { name: 'Microsoft Certified: Azure Developer', provider: 'Microsoft', level: 'Associate' },
                { name: 'AWS Certified Developer', provider: 'Amazon Web Services', level: 'Associate' },
                { name: 'Professional Scrum Developer', provider: 'Scrum.org', level: 'Professional' },
            ],
        },
        {
            category: 'Business Analysis',
            icon: '📈',
            certs: [
                { name: 'Certified Business Analysis Professional (CBAP)', provider: 'IIBA', level: 'Professional' },
                { name: 'PMI Professional in Business Analysis (PMI-PBA)', provider: 'PMI', level: 'Professional' },
                { name: 'Entry Certificate in Business Analysis (ECBA)', provider: 'IIBA', level: 'Entry' },
            ],
        },
    ];

    const benefits = [
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Career Advancement',
            description: 'Stand out in competitive job markets and qualify for higher positions',
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: 'Industry Recognition',
            description: 'Gain credibility with globally recognized certifications',
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Expert Training',
            description: 'Learn from certified instructors with real-world experience',
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: 'Global Opportunities',
            description: 'Open doors to international career opportunities',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Industry-Recognized Certifications</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Boost your career with globally recognized professional certifications
                        </p>
                        <Link
                            href="/courses"
                            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Browse Certification Courses
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Why Get Certified?
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certification Programs */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Available Certifications
                    </h2>
                    <div className="max-w-6xl mx-auto space-y-8">
                        {certifications.map((category, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="text-5xl">{category.icon}</div>
                                    <h3 className="text-3xl font-bold text-gray-900">{category.category}</h3>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {category.certs.map((cert, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-1">{cert.name}</h4>
                                                    <p className="text-sm text-gray-600">{cert.provider}</p>
                                                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        {cert.level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Approach */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                            Our Certification Approach
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Training</h3>
                                <p className="text-gray-600">
                                    Complete curriculum covering all exam objectives with hands-on labs and projects
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Practice Tests</h3>
                                <p className="text-gray-600">
                                    Multiple mock exams and practice questions to ensure you're exam-ready
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Exam Support</h3>
                                <p className="text-gray-600">
                                    Guidance on exam registration, scheduling, and post-certification career support
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Ready to Get Certified?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of professionals who have advanced their careers with our certification programs
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/courses"
                            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            View Certification Courses
                        </Link>
                        <Link
                            href="/contact"
                            className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
                        >
                            Talk to an Advisor
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
