"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

export const CTA = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="relative rounded-[4rem] bg-indigo-600 p-12 md:p-24 text-center space-y-10 overflow-hidden shadow-2xl shadow-indigo-200">
                    {/* Background Sparkles/Effects */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-1/4 h-2/3 bg-white/5 skew-x-12 -translate-x-1/4" />
                    <div className="absolute top-10 left-10 text-indigo-400 group-hover:scale-125 transition-transform">
                        <Sparkles className="w-12 h-12 opacity-30" />
                    </div>

                    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-tight">
                            Ready to Transform Your <span className="underline decoration-indigo-400 decoration-8 underline-offset-8">Assessments</span>?
                        </h2>
                        <p className="text-xl text-indigo-100 font-medium">
                            Join 50+ forward-thinking organizations using SudAssess to build high-performing teams with AI and data-driven insights.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Link href="/auth/signup">
                            <Button className="h-18 px-10 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 text-xl font-black italic shadow-2xl gap-4 group">
                                Get Started Free <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="ghost" className="h-18 px-10 rounded-2xl text-xl font-black italic text-white hover:bg-white/10 gap-4">
                                <Mail className="w-6 h-6" /> Contact Sales
                            </Button>
                        </Link>
                    </div>

                    <p className="relative z-10 text-indigo-200 text-sm font-bold uppercase tracking-[0.2em] pt-8">
                        Free 14-day trial • No credit card required • Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    );
};
