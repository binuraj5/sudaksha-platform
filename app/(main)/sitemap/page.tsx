import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const metadata = {
    title: 'Sitemap | Sudaksha - Navigate Our Website',
    description: 'Complete sitemap of Sudaksha website with all pages and sections.',
};

export default function SitemapPage() {
    const sections = [
        {
            title: 'Main Pages',
            links: [
                { name: 'Home', href: '/' },
                { name: 'About Us', href: '/about' },
                { name: 'Why Sudaksha', href: '/why-sudaksha' },
                { name: 'Contact', href: '/contact' },
            ],
        },
        {
            title: 'For Individuals',
            links: [
                { name: 'All Courses', href: '/courses' },
                { name: 'Career Paths', href: '/career-paths' },
                { name: 'Certifications', href: '/certification' },
                { name: 'Placement Support', href: '/placement-support' },
                { name: 'For Individuals Overview', href: '/individuals' },
            ],
        },
        {
            title: 'For Corporates',
            links: [
                { name: 'Corporate Overview', href: '/corporates' },
                { name: 'Domestic Training', href: '/corporates/domestic' },
                { name: 'International Training', href: '/corporates/international' },
                { name: 'Corporate Training Programs', href: '/corporate-training' },
                { name: 'Skill Assessment', href: '/skill-assessment' },
                { name: 'Custom Programs', href: '/custom-programs' },
                { name: 'Enterprise Solutions', href: '/enterprise-solutions' },
            ],
        },
        {
            title: 'For Institutions',
            links: [
                { name: 'Institutional Partnerships', href: '/institutions' },
            ],
        },
        {
            title: 'Course Categories',
            links: [
                { name: 'IT Courses', href: '/courses/category/it' },
                { name: 'Non-IT Courses', href: '/courses/category/non-it' },
                { name: 'Functional Courses', href: '/courses/category/functional' },
                { name: 'Personal Development', href: '/courses/category/personal' },
            ],
        },
        {
            title: 'Course Domains',
            links: [
                { name: 'Software Development', href: '/courses/domain/software-development' },
                { name: 'Data Analytics', href: '/courses/domain/data-analytics' },
                { name: 'Cloud & DevOps', href: '/courses/domain/cloud-devops' },
                { name: 'AI & Machine Learning', href: '/courses/domain/ai-ml' },
                { name: 'Cybersecurity', href: '/courses/domain/cybersecurity' },
            ],
        },
        {
            title: 'Course Levels',
            links: [
                { name: 'Freshers', href: '/courses/level/freshers' },
                { name: 'Junior Level', href: '/courses/level/junior' },
                { name: 'Mid Level', href: '/courses/level/mid' },
                { name: 'Senior Level', href: '/courses/level/senior' },
                { name: 'Career Switch', href: '/courses/level/career-switch' },
            ],
        },
        {
            title: 'Resources & Events',
            links: [
                { name: 'Blog', href: '/blog' },
                { name: 'Resources', href: '/resources' },
                { name: 'Webinars', href: '/webinars' },
                { name: 'Event Calendar', href: '/calendar' },
                { name: 'Success Stories', href: '/success-stories' },
                { name: 'FAQ', href: '/faq' },
            ],
        },
        {
            title: 'Company',
            links: [
                { name: 'Careers', href: '/careers' },
                { name: 'Book a Demo', href: '/demo' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms of Service', href: '/terms-of-service' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">Sitemap</h1>
                        <p className="text-blue-100">Navigate through all sections of our website</p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sections.map((section, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                        {section.title}
                                    </h2>
                                    <nav className="space-y-2">
                                        {section.links.map((link, linkIndex) => (
                                            <Link
                                                key={linkIndex}
                                                href={link.href}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline transition-colors group"
                                            >
                                                <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span>{link.name}</span>
                                            </Link>
                                        ))}
                                    </nav>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h3>
                            <p className="text-gray-700 mb-6">
                                Use our search feature or contact our support team for assistance
                            </p>
                            <Link
                                href="/contact"
                                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
