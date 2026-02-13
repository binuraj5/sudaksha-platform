import Link from 'next/link';
import { Quote, TrendingUp, Award, Briefcase } from 'lucide-react';

export const metadata = {
    title: 'Success Stories | Sudaksha - Real Transformations, Real Impact',
    description: 'Read inspiring success stories from learners who transformed their careers with Sudaksha training programs.',
};

export default function SuccessStoriesPage() {
    const stories = [
        {
            name: 'Aisha Mohammed',
            role: 'Data Analyst at TechCorp',
            location: 'Lagos, Nigeria',
            course: 'Data Analytics Professional',
            achievement: '120% salary increase',
            story: 'After completing the Data Analytics course, I landed my dream job at a leading tech company. The practical skills and placement support were invaluable.',
            before: 'Administrative Assistant',
            after: 'Data Analyst',
            image: '👩🏾‍💼',
        },
        {
            name: 'Raj Kumar',
            role: 'Cloud Solutions Architect',
            location: 'Hyderabad, India',
            course: 'AWS Solutions Architect Professional',
            achievement: 'Promoted to Senior Architect',
            story: 'Sudaksha\'s AWS certification program was comprehensive and hands-on. Within 3 months of completing the course, I achieved my AWS certification and got promoted.',
            before: 'System Administrator',
            after: 'Cloud Solutions Architect',
            image: '👨🏽‍💼',
        },
        {
            name: 'Sarah Al-Rashid',
            role: 'Project Manager at Global Finance',
            location: 'Dubai, UAE',
            course: 'PMP Certification Prep',
            achievement: 'Career switch to PM role',
            story: 'I transitioned from development to project management thanks to Sudaksha\'s PMP course. The instructors were excellent and the mock exams prepared me perfectly.',
            before: 'Software Developer',
            after: 'Project Manager',
            image: '👩🏻‍💼',
        },
        {
            name: 'James Ochieng',
            role: 'Full Stack Developer',
            location: 'Nairobi, Kenya',
            course: 'Full Stack Development Bootcamp',
            achievement: 'First tech job',
            story: 'As a fresh graduate, finding a job was challenging. Sudaksha\'s bootcamp gave me practical skills and their placement team helped me land my first tech role.',
            before: 'Fresh Graduate',
            after: 'Full Stack Developer',
            image: '👨🏿‍💻',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Success Stories</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Real transformations, real impact
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto space-y-12">
                        {stories.map((story, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="md:flex">
                                    <div className="md:w-1/3 bg-gradient-to-br from-blue-400 to-blue-600 p-12 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-8xl mb-4">{story.image}</div>
                                            <div className="bg-white rounded-lg px-4 py-2">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="text-left">
                                                        <div className="text-xs text-gray-600">Before</div>
                                                        <div className="font-semibold text-sm text-gray-900">{story.before}</div>
                                                    </div>
                                                    <div className="text-blue-600">→</div>
                                                    <div className="text-left">
                                                        <div className="text-xs text-gray-600">After</div>
                                                        <div className="font-semibold text-sm text-gray-900">{story.after}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:w-2/3 p-8">
                                        <Quote className="w-10 h-10 text-blue-600 mb-4" />
                                        <p className="text-gray-700 text-lg mb-6 italic">"{story.story}"</p>

                                        <div className="border-t pt-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{story.name}</h3>
                                            <p className="text-blue-600 font-semibold mb-1">{story.role}</p>
                                            <p className="text-gray-600 mb-4">📍 {story.location}</p>

                                            <div className="flex flex-wrap gap-4 mb-4">
                                                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                                                    <Award className="w-5 h-5 text-blue-600" />
                                                    <span className="text-sm font-semibold text-gray-900">{story.course}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm font-semibold text-gray-900">{story.achievement}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-blue-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Start Your Success Story</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of professionals who have transformed their careers with Sudaksha
                    </p>
                    <Link
                        href="/courses"
                        className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Explore Courses
                    </Link>
                </div>
            </section>
        </div>
    );
}
