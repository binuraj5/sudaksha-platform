import Link from "next/link";
import { Brain, Twitter, Linkedin, Github, Mail } from "lucide-react";

export const Footer = () => {
    const year = new Date().getFullYear();

    const sections = [
        {
            title: "Product",
            links: [
                { name: "Features", href: "/features" },
                { name: "Pricing", href: "/pricing" },
                { name: "Our Work", href: "/our-work" },
                { name: "About", href: "/about" },
                { name: "Documentation", href: "/docs" },
            ]
        },
        {
            title: "Company",
            links: [
                { name: "Blog", href: "/blog" },
                { name: "Careers", href: "/careers" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Service", href: "/terms-of-service" },
            ]
        },
        {
            title: "Support",
            links: [
                { name: "Help Center", href: "/support" },
                { name: "Contact Us", href: "/contact" },
                { name: "API Reference", href: "/api-docs" },
                { name: "Status", href: "/status" },
            ]
        }
    ];

    return (
        <footer className="bg-slate-900 text-white pt-24 pb-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-24">
                    <div className="lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter italic">SudAssess</span>
                        </Link>
                        <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                            Empowering organizations with AI-powered competency assessments and data-driven career development. Built for modern teams.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://twitter.com/sudaksha" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com/company/sudaksha" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://github.com/sudaksha" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="mailto:info@sudaksha.com" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {sections.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 text-xs font-bold">
                        © {year} SudAssess by Sudaksha. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Terms</Link>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                            Status: <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> All systems operational
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
