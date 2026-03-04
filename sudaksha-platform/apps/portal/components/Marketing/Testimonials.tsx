"use client";

import React from "react";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Testimonials = () => {
    const reviews = [
        {
            name: "John Doe",
            role: "CTO at TechCorp",
            content: "SudAssess transformed our hiring process. The AI-powered competency mapping and role-based assessments saved us hundreds of manual hours.",
            rating: 5,
            image: "/avatars/john.jpg" // Placeholder for later
        },
        {
            name: "Sarah Williams",
            role: "Head of HR, Global Institue",
            content: "The most comprehensive assessment tools we've ever used. The platform's ability to identify specific skills gaps is a game-changer for our training plans.",
            rating: 5,
            image: "/avatars/sarah.jpg"
        },
        {
            name: "Michael Chen",
            role: "L&D Director, InnovateHub",
            content: "Scientific, data-driven, and incredibly easy to use. SudAssess is now the backbone of our employee career development framework.",
            rating: 5,
            image: "/avatars/michael.jpg"
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] italic">Social Proof</h2>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">
                        Trusted by <span className="text-indigo-600 not-italic">Innovators</span> Everywhere.
                    </h1>
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <div className="flex -space-x-1">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 text-amber-500 fill-current" />)}
                        </div>
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest italic ml-2">4.9/5 from 50+ Pilot Users</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((rev, i) => (
                        <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-slate-50/50 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                            <CardContent className="p-10 space-y-8">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                                    <Quote className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-lg font-bold text-slate-700 italic leading-relaxed">
                                    "{rev.content}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 ring-2 ring-white" />
                                    <div>
                                        <h4 className="font-black text-slate-900 italic tracking-tight">{rev.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{rev.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
