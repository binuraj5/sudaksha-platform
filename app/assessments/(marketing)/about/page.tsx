import React from "react";
import { Brain, Heart, Users, Target, Rocket, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
    return (
        <div className="pt-24 pb-20">
            <section className="py-24 bg-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
                    <Badge className="bg-white/20 text-white border-none font-black italic px-4 py-1.5 uppercase tracking-widest">Our Mission</Badge>
                    <h1 className="text-6xl lg:text-8xl font-black tracking-tighter italic leading-tight">
                        Bridging the <br /> <span className="text-indigo-200">Skills Gap</span>.
                    </h1>
                    <p className="text-xl text-indigo-100 font-medium max-w-2xl mx-auto italic">
                        SudAssess was born from a simple observation: the industry needs talent, and academia produces graduates, but they often don't speak the same language. We're here to translate.
                    </p>
                </div>
            </section>

            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto space-y-24">
                    <div className="space-y-12">
                        <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">The Sudaksha Story</h2>
                        <div className="space-y-6 text-lg text-gray-500 font-medium leading-relaxed italic">
                            <p>
                                Founded as an offshoot of Sudaksha's "Finishing School" methodology, SudAssess leverages over a decade of experience in corporate training and placement. We realized that to truly transform careers, we needed a revolutionary way to measure competency.
                            </p>
                            <p>
                                Today, SudAssess is a standalone platform used by some of the most innovative companies to benchmark their teams, identify future leaders, and build transparent career paths based on scientific evaluation rather than intuition.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-10 rounded-[3rem] bg-slate-50 border-2 border-slate-100 space-y-6">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                                <Heart className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black italic text-gray-900 tracking-tight lowercase font-serif">Human-Centric Design</h3>
                            <p className="text-slate-500 font-medium italic">We believe assessments should empower, not intimidate. Our UI and feedback loops are designed to encourage growth.</p>
                        </div>
                        <div className="p-10 rounded-[3rem] bg-indigo-50 border-2 border-indigo-100 space-y-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                <Brain className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black italic text-gray-900 tracking-tight lowercase">Scientific Rigor</h3>
                            <p className="text-slate-500 font-medium italic">Every question generated and every indicator mapped is backed by pedagogical best practices and industry standards.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
