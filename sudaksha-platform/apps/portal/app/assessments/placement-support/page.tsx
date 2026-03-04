import Link from 'next/link';
import { Briefcase, Users, FileText, Target, CheckCircle, TrendingUp } from 'lucide-react';

export const metadata = {
    title: 'Placement Support | Sudaksha - Launch Your Career with Confidence',
    description: 'Get comprehensive placement support including resume building, interview preparation, and job referrals from Sudaksha.',
};

export default function PlacementSupportPage() {
    const services = [
        {
            icon: <FileText className="w-12 h-12" />,
            title: 'Resume Building',
            description: 'Create ATS-friendly resumes that get noticed by recruiters',
            features: [
                'Professional resume templates',
                'Industry-specific customization',
                'Keyword optimization',
                'LinkedIn profile optimization',
            ],
        },
        {
            icon: <Users className="w-12 h-12" />,
            title: 'Interview Preparation',
            description: 'Master technical and behavioral interviews with expert guidance',
            features: [
                'Mock interviews with industry experts',
                'Common interview questions practice',
                'Technical assessment preparation',
                'Salary negotiation tips',
            ],
        },
        {
            icon: <Briefcase className="w-12 h-12" />,
            title: 'Job Referrals',
            description: 'Access exclusive job opportunities from our corporate partners',
            features: [
                'Direct referrals to hiring companies',
                'Job matching based on skills',
                'Regular job alerts',
                'Career fair participation',
            ],
        },
        {
            icon: <Target className="w-12 h-12" />,
            title: 'Career Counseling',
            description: 'Get personalized guidance for your career journey',
            features: [
                'One-on-one counseling sessions',
                'Career path planning',
                'Skill gap analysis',
                'Industry insights and trends',
            ],
        },
    ];

    const process = [
        {
            step: 1,
            title: 'Skills Assessment',
            description: 'We evaluate your current skills and identify areas for improvement',
        },
        {
            step: 2,
            title: 'Profile Enhancement',
            description: 'Build a compelling resume and online professional presence',
        },
        {
            step: 3,
            title: 'Interview Training',
            description: 'Practice with mock interviews and get expert feedback',
        },
        {
            step: 4,
            title: 'Job Matching',
            description: 'Get matched with suitable opportunities from our network',
        },
        {
            step: 5,
            title: 'Application Support',
            description: 'Receive guidance throughout the application and interview process',
        },
        {
            step: 6,
            title: 'Offer Negotiation',
            description: 'Get support in evaluating and negotiating job offers',
        },
    ];

    const stats = [
        { value: '85%', label: 'Placement Rate' },
        { value: '500+', label: 'Hiring Partners' },
        { value: '2000+', label: 'Students Placed' },
        { value: '40%', label: 'Avg. Salary Increase' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Placement Support Services</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Launch your career with comprehensive support from resume to job offer
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Our Placement Services
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                <div className="text-blue-600 mb-4">{service.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                <p className="text-gray-600 mb-6">{service.description}</p>
                                <ul className="space-y-2">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Placement Process
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-6">
                            {process.map((item, index) => (
                                <div key={index} className="flex gap-6 items-start">
                                    <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                                        {item.step}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-700">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories Preview */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Success Stories
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Student Name</h4>
                                        <p className="text-sm text-gray-600">Software Developer at TechCo</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    "Sudaksha's placement support was invaluable. From resume building to interview prep,
                                    they helped me land my dream job within weeks of completing the course."
                                </p>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="font-semibold">50% salary increase</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link
                            href="/success-stories"
                            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Read More Success Stories
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Ready to Launch Your Career?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Enroll in our courses and get access to comprehensive placement support
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/courses"
                            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Browse Courses
                        </Link>
                        <Link
                            href="/contact"
                            className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
                        >
                            Schedule Consultation
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
