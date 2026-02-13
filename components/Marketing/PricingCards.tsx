"use client";

import React from "react";
import { Check, Zap, Star, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const PricingCards = () => {
    const plans = [
        {
            name: "Starter",
            price: "$49",
            description: "Perfect for small teams and early pilots.",
            users: "1-10 Users",
            features: [
                "Authentication & User Mgmt",
                "Basic Assessments",
                "Basic Analytics",
                "Standard Support"
            ],
            color: "text-slate-600",
            buttonVariant: "outline" as const
        },
        {
            name: "Growth",
            price: "$199",
            description: "Advanced tools for growing organizations.",
            users: "11-50 Users",
            features: [
                "Everything in Starter",
                "Departments & Teams",
                "Bulk Upload (500+)",
                "AI Question Generation (Add-on)",
                "Priority Support"
            ],
            color: "text-indigo-600",
            buttonVariant: "default" as const,
            popular: true
        },
        {
            name: "Business",
            price: "$599",
            description: "Enterprise-grade features for scale.",
            users: "51-200 Users",
            features: [
                "Everything in Growth",
                "Custom Report Builder",
                "Career Planning Portal",
                "Team Lead Dashboard",
                "Dedicated Account Manager"
            ],
            color: "text-slate-900",
            buttonVariant: "outline" as const
        }
    ];

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em] italic">Pricing Plans</h2>
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter italic">
                        Simple, <span className="text-indigo-600 not-italic">Transparent</span> Pricing.
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        Choose the plan that fits your organizational needs. No hidden fees, cancel anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, i) => (
                        <Card
                            key={plan.name}
                            className={`relative border-none shadow-2xl rounded-[3rem] transition-all duration-500 hover:-translate-y-2 ${plan.popular
                                    ? "ring-4 ring-indigo-600 ring-offset-8 scale-105 z-10 bg-white"
                                    : "bg-white/80 backdrop-blur-sm"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-indigo-600 text-white font-black italic px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader className="p-10 pb-0 text-center space-y-4">
                                <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${plan.color}`}>
                                    {plan.popular ? <Star className="w-4 h-4 fill-current" /> : <Shield className="w-4 h-4" />}
                                    {plan.name} Tier
                                </div>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-6xl font-black text-slate-900 tracking-tighter italic">{plan.price}</span>
                                    <span className="text-slate-400 font-bold text-lg lowercase">/mo</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 font-medium text-sm">{plan.description}</p>
                                    <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold text-[10px] uppercase py-1">
                                        {plan.users}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-10 pt-8 space-y-6">
                                <div className="h-px bg-slate-100 w-full" />
                                <ul className="space-y-4">
                                    {plan.features.map((feature, fi) => (
                                        <li key={fi} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-0.5 border border-green-100">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 italic leading-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="p-10 pt-0">
                                <Button
                                    className={`w-full h-16 rounded-2xl text-lg font-black italic gap-3 group transition-all duration-300 ${plan.popular
                                            ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-white"
                                            : "bg-slate-50 hover:bg-slate-100 border-2 border-slate-100 text-slate-800"
                                        }`}
                                >
                                    Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-20 p-10 rounded-[3rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 group overflow-hidden relative">
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-indigo-600 -skew-x-12 translate-x-1/2 -z-0 opacity-20 blur-3xl group-hover:opacity-30 transition-opacity" />

                    <div className="relative z-10 space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black italic tracking-tight">Need an Enterprise solution?</h3>
                        <p className="text-slate-400 font-medium">Custom deployment, white-labeling, and unlimited assessments for 200+ users.</p>
                    </div>

                    <Button className="relative z-10 h-16 px-10 rounded-2xl bg-white text-slate-900 hover:bg-indigo-50 font-black italic gap-4 shadow-2xl">
                        Contact Sales <Zap className="w-5 h-5 text-indigo-600" />
                    </Button>
                </div>
            </div>
        </section>
    );
};
