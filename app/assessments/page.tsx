import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function AssessmentsRootPage() {
    const session = await getServerSession(authOptions) as Session | null;
    const user = session?.user as any;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">SudAssess</span>
                    </div>
                    <div>
                        {session ? (
                            <Link
                                href="/assessments/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/assessments/login"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative bg-white pt-20 pb-16 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                                The Future of <span className="text-indigo-600">Talent Intelligence</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10">
                                Empowering organizations, institutions, and individuals with AI-driven assessments and actionable insights to bridge the skill gap.
                            </p>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50" />
                </section>

                {/* Selection Cards */}
                <section className="py-16 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Corporate Card */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl transition-all group flex flex-col h-full">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Corporate</h3>
                                <p className="text-slate-600 mb-8 flex-grow">
                                    Transform your talent management. Identify skill gaps, streamline recruitment, and build high-performing teams with custom assessments.
                                </p>
                                <ul className="space-y-3 mb-8 text-sm text-slate-500">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Competency Mapping</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Employee Benchmarking</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Recruitment Analytics</li>
                                </ul>
                                <Link
                                    href="/assessments/register?type=corporate"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full"
                                >
                                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Institutions Card */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl transition-all group flex flex-col h-full">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <GraduationCap className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Institutions</h3>
                                <p className="text-slate-600 mb-8 flex-grow">
                                    Bridge the gap between education and employability. Provide students with industry-standard certifications and career readiness paths.
                                </p>
                                <ul className="space-y-3 mb-8 text-sm text-slate-500">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Industry Certifications</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Student Placement Track</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Skill Assessment Portal</li>
                                </ul>
                                <Link
                                    href="/assessments/register?type=institution"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full"
                                >
                                    Register Portal <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Individuals Card */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl transition-all group flex flex-col h-full">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <Users className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Individuals</h3>
                                <p className="text-slate-600 mb-8 flex-grow">
                                    Take control of your professional growth. Discover your strengths, benchmark your skills, and unlock new career opportunities.
                                </p>
                                <ul className="space-y-3 mb-8 text-sm text-slate-500">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Personalized Reports</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Skill Mapping & Path</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Resume Enhancements</li>
                                </ul>
                                <Link
                                    href="/assessments/register?type=individual"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors w-full"
                                >
                                    Start Assessing <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold">S</div>
                        <span className="text-xl font-bold text-slate-900">SudAssess</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Sudaksha. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-600">
                        <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link>
                        <Link href="/contact" className="hover:text-indigo-600">Contact Us</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
