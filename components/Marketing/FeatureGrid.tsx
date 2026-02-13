"use client";

import React from "react";
import {
    Target,
    Brain,
    BarChart3,
    Users,
    Briefcase,
    TrendingUp,
    ShieldCheck,
    Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const FeatureGrid = () => {
    const features = [
        {
            title: "Role-Based Assessments",
            description: "Scientifically designed evaluations mapped directly to professional job roles and levels.",
            icon: Target,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            title: "AI Question Generation",
            description: "Leverage GPT-4o to generate high-quality pedagogical questions based on your unique competency framework.",
            icon: Brain,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "Real-Time Analytics",
            description: "Deep insights into team performance, skills gaps, and organizational readiness with live dashboards.",
            icon: BarChart3,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Multi-Tenant Architecture",
            description: "Scale easily with dedicated environments for departments, institutions, or corporate clients.",
            icon: Users,
            color: "text-pink-600",
            bg: "bg-pink-50"
        },
        {
            title: "Career Planning Portal",
            description: "Empower employees with personalized growth paths and competency-based career trajectories.",
            icon: Briefcase,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Skills Gap Analysis",
            description: "Identify exactly where your team needs upskilling and create data-driven training plans.",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] italic">Why SudAssess?</h2>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic max-w-2xl mx-auto">
                        Powerful Tools for <span className="text-indigo-600 not-italic">Scientific</span> Evaluation.
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        We've built the most comprehensive assessment infrastructure to help you hire, train, and retain top talent.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
                        <Card
                            className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 group rounded-[2.5rem] bg-white ring-1 ring-slate-100 overflow-hidden"
                        >
                            <CardContent className="p-10 space-y-6">
                                <div className={`w-16 h-16 ${feature.bg} rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-black italic text-slate-900 tracking-tight leading-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed italic text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                                <div className="pt-4 flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                                    Learn More <Zap className="w-3 h-3 fill-current" />
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
