"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    PlayCircle,
    ArrowRight,
    CheckCircle2,
    Users,
    Zap,
    ShieldCheck,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

export const Hero = () => {
    return (
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50/50">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 -skew-x-12 translate-x-1/4 -z-10 blur-3xl opacity-60" />
            <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-purple-50/50 -skew-x-12 -translate-x-1/4 -z-10 blur-3xl opacity-40" />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest shadow-sm">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        AI-Powered Assessment Engine 2.0
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] italic">
                        Modern <span className="text-indigo-600 font-black not-italic">Assessment</span> Platform for Teams.
                    </h1>

                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Empower your organization with AI-driven competency assessments, scientific skills gap analysis, and personalized career development paths.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Link href="/auth/signup">
                            <Button className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black italic shadow-2xl shadow-indigo-100 gap-3 group">
                                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button variant="ghost" className="h-16 px-8 rounded-2xl text-lg font-black italic gap-3 text-slate-600 hover:bg-white hover:text-indigo-600 group">
                            <PlayCircle className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" /> Watch Demo
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-bold text-slate-400">SOC2 Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            <span className="text-sm font-bold text-slate-400">50+ Pilot Organizations</span>
                        </div>
                        <div className="flex -space-x-3 overflow-hidden">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200" />
                            ))}
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-white text-[10px] font-black text-white italic">
                                +50
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000 transition-all delay-200">
                    <div className="absolute inset-0 bg-indigo-600/10 rounded-[4rem] -rotate-6 group-hover:rotate-0 transition-transform duration-700" />
                    <div className="relative bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
                        <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <div className="p-10 space-y-6 bg-gradient-to-br from-white to-slate-50">
                            {/* Mock Dashboard Content */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black italic text-slate-900 uppercase tracking-widest">Active Assessments</h3>
                                    <p className="text-xs font-bold text-slate-400">Overview of current progress.</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: "Frontend Architecture", progress: 75, color: "bg-indigo-600" },
                                    { name: "Team Leadership", progress: 40, color: "bg-purple-600" },
                                    { name: "Cloud Security", progress: 90, color: "bg-blue-600" }
                                ].map((item, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-black italic text-slate-800">{item.name}</span>
                                            <span className="text-xs font-black text-indigo-600">{item.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-slate-900 space-y-2">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Analysis</p>
                                    <h4 className="text-2xl font-black text-white italic tracking-tight">8.5 / 10</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic pt-2 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Above industry avg.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-center">
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <div key={s} className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 italic">"SudAssess transformed our hiring flow."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
