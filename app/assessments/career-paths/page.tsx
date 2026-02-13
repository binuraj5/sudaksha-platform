import Link from 'next/link';
import { GraduationCap, TrendingUp, Users, Target, ArrowRight } from 'lucide-react';

export const metadata = {
    title: 'Career Paths | Sudaksha - Navigate Your Professional Journey',
    description: 'Explore career paths in IT, non-IT, and emerging technologies. Get guidance on skills needed and courses to accelerate your career growth.',
};

export default function CareerPathsPage() {
    const careerPaths = [
        {
            title: 'Software Development',
            description: 'Build applications and systems that power the digital world',
            levels: ['Junior Developer', 'Mid-Level Developer', 'Senior Developer', 'Tech Lead', 'Architect'],
            skills: ['Programming', 'Problem Solving', 'System Design', 'Agile', 'DevOps'],
            avgSalary: '$60k - $180k',
            courses: ['Full Stack Development', 'Software Engineering', 'System Design'],
            icon: '💻',
        },
        {
            title: 'Data Analytics & Science',
            description: 'Turn data into insights that drive business decisions',
            levels: ['Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Data Science Manager'],
            skills: ['SQL', 'Python/R', 'Statistics', 'Machine Learning', 'Data Visualization'],
            avgSalary: '$70k - $160k',
            courses: ['Data Analytics', 'Machine Learning', 'Business Intelligence'],
            icon: '📊',
        },
        {
            title: 'Cloud & DevOps Engineering',
            description: 'Design, build, and maintain scalable cloud infrastructure',
            levels: ['Cloud Engineer', 'DevOps Engineer', 'Senior DevOps', 'Cloud Architect'],
            skills: ['AWS/Azure/GCP', 'Kubernetes', 'CI/CD', 'Infrastructure as Code', 'Monitoring'],
            avgSalary: '$80k - $170k',
            courses: ['AWS Certification', 'Kubernetes', 'DevOps Fundamentals'],
            icon: '☁️',
        },
        {
            title: 'Cybersecurity',
            description: 'Protect systems, networks, and data from digital attacks',
            levels: ['Security Analyst', 'Security Engineer', 'Security Architect', 'CISO'],
            skills: ['Network Security', 'Penetration Testing', 'Risk Assessment', 'Compliance', 'Incident Response'],
            avgSalary: '$75k - $180k',
            courses: ['Ethical Hacking', 'Security Operations', 'Compliance & Governance'],
            icon: '🔒',
        },
        {
            title: 'Project Management',
            description: 'Lead teams and deliver projects on time and within budget',
            levels: ['Project Coordinator', 'Project Manager', 'Senior PM', 'Program Manager', 'PMO Director'],
            skills: ['Planning', 'Stakeholder Management', 'Agile/Scrum', 'Risk Management', 'Budgeting'],
            avgSalary: '$65k - $150k',
            courses: ['PMP Certification', 'Agile Project Management', 'Program Management'],
            icon: '📋',
        },
        {
            title: 'Business Analysis',
            description: 'Bridge the gap between business needs and technology solutions',
            levels: ['Junior BA', 'Business Analyst', 'Senior BA', 'Lead BA', 'Enterprise Architect'],
            skills: ['Requirements Gathering', 'Process Modeling', 'Stakeholder Communication', 'BA Tools', 'Domain Knowledge'],
            avgSalary: '$60k - $140k',
            courses: ['Business Analysis Fundamentals', 'CBAP Certification', 'Agile BA'],
            icon: '📈',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Explore Career Paths</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Find your ideal career path and the skills needed to succeed
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
                                Get Career Guidance
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Your Career Journey
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Explore Paths</h3>
                            <p className="text-gray-600">Discover career options aligned with your interests</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Learn Skills</h3>
                            <p className="text-gray-600">Take courses to build required competencies</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Get Certified</h3>
                            <p className="text-gray-600">Earn recognized certifications</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl font-bold">
                                4
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Land Your Role</h3>
                            <p className="text-gray-600">Get placed with our career support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Career Paths */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                        Popular Career Paths
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {careerPaths.map((path, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="text-5xl">{path.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{path.title}</h3>
                                        <p className="text-gray-600">{path.description}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Career Progression
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {path.levels.map((level, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                                {level}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Key Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {path.skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Average Salary Range</h4>
                                    <p className="text-2xl font-bold text-blue-600">{path.avgSalary}</p>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        Recommended Courses
                                    </h4>
                                    <ul className="space-y-1">
                                        {path.courses.map((course, idx) => (
                                            <li key={idx} className="text-gray-600">• {course}</li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href="/courses"
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    View Related Courses
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Need Personalized Career Guidance?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Our career counselors can help you choose the right path based on your interests, skills, and goals
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Schedule a Consultation
                    </Link>
                </div>
            </section>
        </div>
    );
}
