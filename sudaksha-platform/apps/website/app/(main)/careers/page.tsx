import Link from 'next/link';
import { Briefcase, Users, Globe, TrendingUp } from 'lucide-react';

export const metadata = {
    title: 'Careers at Sudaksha | Join Our Mission to Transform Skills',
    description: 'Explore career opportunities at Sudaksha and join our team in transforming skill development across Africa and MENA.',
};

export default function CareersPage() {
    const openPositions = [
        {
            id: 1,
            title: 'Senior Training Specialist - IT',
            department: 'Training',
            location: 'Hyderabad, India',
            type: 'Full-time',
            description: 'Lead and deliver cutting-edge IT training programs for corporate and individual learners.',
        },
        {
            id: 2,
            title: 'Business Development Manager - Africa',
            department: 'Sales',
            location: 'Remote (Africa)',
            type: 'Full-time',
            description: 'Drive business growth and partnerships across African markets.',
        },
        {
            id: 3,
            title: 'Curriculum Designer',
            department: 'Content',
            location: 'Hybrid',
            type: 'Full-time',
            description: 'Design innovative curriculum for skill development programs across various domains.',
        },
    ];

    const benefits = [
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Career Growth',
            description: 'Continuous learning opportunities and clear career progression paths.',
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: 'Global Impact',
            description: 'Work on projects that transform lives across Africa, MENA, and beyond.',
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Collaborative Culture',
            description: 'Join a diverse, talented team passionate about making a difference.',
        },
        {
            icon: <Briefcase className="w-8 h-8" />,
            title: 'Competitive Benefits',
            description: 'Attractive compensation, health benefits, and work-life balance.',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Join Our Mission</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Help us transform skill development and create opportunities across emerging markets
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Join Us */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                            Why Work at Sudaksha?
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
                                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                    <p className="text-gray-600">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                            Open Positions
                        </h2>
                        <div className="space-y-6">
                            {openPositions.map((position) => (
                                <div
                                    key={position.id}
                                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {position.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {position.department}
                                                </span>
                                                <span>📍 {position.location}</span>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                                                    {position.type}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/careers/${position.id}`}
                                            className="mt-4 md:mt-0 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                                        >
                                            Apply Now
                                        </Link>
                                    </div>
                                    <p className="text-gray-700">{position.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* No Suitable Position */}
                        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Don't See a Perfect Fit?
                            </h3>
                            <p className="text-gray-700 mb-6">
                                We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Send Your Resume
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
