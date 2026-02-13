"use client";

import React from "react";
import {
    Check,
    X,
    Zap,
    Shield,
    Star,
    ArrowRight,
    Users,
    MousePointer2,
    Calendar,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
    const plans = [
        {
            name: "Starter",
            users: "1-10",
            corp: "$49",
            inst: "$39",
            b2c: "FREE",
            description: "Core features for small teams.",
            accent: "slate"
        },
        {
            name: "Growth",
            users: "11-50",
            corp: "$199",
            inst: "$149",
            b2c: "FREE",
            description: "Scaling tools for active departments.",
            accent: "indigo",
            popular: true
        },
        {
            name: "Business",
            users: "51-200",
            corp: "$599",
            inst: "$449",
            b2c: "FREE",
            description: "Comprehensive enterprise-ready features.",
            accent: "slate"
        }
    ];

    const featureRows = [
        { category: "Core Features", name: "Auth & User Mgmt", starter: true, growth: true, business: true, b2c: "FREE" },
        { category: "Core Features", name: "Departments & Teams", starter: true, growth: true, business: true, b2c: "N/A" },
        { category: "Core Features", name: "Basic Assessments", starter: true, growth: true, business: true, b2c: "FREE" },
        { category: "Premium Add-Ons", name: "Adv. Role/Comp Mgmt", starter: "+$20", growth: "+$20", business: "Included", b2c: "+$5" },
        { category: "Premium Add-Ons", name: "Bulk Upload (500+)", starter: "+$15", growth: "Included", business: "Included", b2c: "N/A" },
        { category: "AI Features", name: "AI Question Gen", starter: "+$50", growth: "+$50", business: "Included", b2c: "+$10" },
        { category: "AI Features", name: "AI Voice Interview", starter: "+$150", growth: "+$150", business: "+$150", b2c: "+$30" },
        { category: "Enterprise", name: "White Labeling", starter: false, growth: false, business: "+$300", b2c: "N/A" },
        { category: "Enterprise", name: "Dedicated Support", starter: false, growth: true, business: true, b2c: "N/A" },
    ];

    return (
        <div className="pt-24 pb-20">
            {/* Header */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
                    <Badge className="bg-indigo-50 text-indigo-600 font-black italic px-4 py-1.5 border-none">
                        PILOT PHASE: ALL FEATURES FREE
                    </Badge>
                    <h1 className="text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter italic">
                        Plans that scale with your <span className="text-indigo-600">Ambition</span>.
                    </h1>
                    <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto italic">
                        Transparent pricing for organizations of all sizes. From solo developers to global institutions.
                    </p>
                </div>
            </section>

            {/* Base Tiers */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`p-10 rounded-[3rem] border-2 transition-all group ${plan.popular ? "border-indigo-600 bg-white shadow-2xl scale-105" : "border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200"
                                }`}
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-black italic tracking-tighter text-gray-900">{plan.name}</h3>
                                    {plan.popular && <Badge className="bg-indigo-600">Popular</Badge>}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-gray-900 italic tracking-tighter">{plan.corp}</span>
                                        <span className="text-gray-400 font-bold">/mo</span>
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Corporate Pricing</p>
                                </div>
                                <p className="text-gray-500 font-medium text-sm leading-relaxed">{plan.description}</p>
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <Users className="w-4 h-4" /> {plan.users} Users
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">
                                        <Star className="w-4 h-4" /> Inst. Price: {plan.inst}/mo
                                    </div>
                                </div>
                                <Button className={`w-full h-14 rounded-2xl font-black italic text-lg gap-2 ${plan.popular ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100" : "bg-white border-2 border-gray-100 text-gray-900 hover:bg-gray-50"
                                    }`}>
                                    Select Plan <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-24 px-6 bg-white overflow-x-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-3xl font-black italic tracking-tight text-gray-900 uppercase">Detailed Comparison</h2>
                        <p className="text-gray-500 font-medium">Find the perfect feature set for your organization.</p>
                    </div>

                    <div className="rounded-[3rem] border-2 border-gray-100 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="w-[300px] h-20 text-xs font-black uppercase tracking-[0.2em] px-10">Features</TableHead>
                                    <TableHead className="text-center text-xs font-black uppercase tracking-[0.2em]">Starter</TableHead>
                                    <TableHead className="text-center text-xs font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50/30">Growth</TableHead>
                                    <TableHead className="text-center text-xs font-black uppercase tracking-[0.2em]">Business</TableHead>
                                    <TableHead className="text-center text-xs font-black uppercase tracking-[0.2em]">B2C</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {featureRows.map((row, i) => (
                                    <TableRow key={i} className="border-gray-50 h-20 hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="px-10">
                                            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-0.5">{row.category}</p>
                                            <p className="text-sm font-bold text-gray-700 italic">{row.name}</p>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderCell(row.starter)}
                                        </TableCell>
                                        <TableCell className="text-center bg-indigo-50/10">
                                            {renderCell(row.growth, true)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderCell(row.business)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-[10px] font-black border-none text-slate-400 uppercase tracking-widest">
                                                {row.b2c === "FREE" ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : row.b2c}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </section>

            {/* Discounts */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-20 text-center space-y-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/20 -skew-x-12 translate-x-1/2" />
                    <div className="relative z-10 space-y-4">
                        <Badge className="bg-indigo-500 text-white border-none font-bold uppercase tracking-widest group-hover:scale-110 transition-transform px-4 py-1">Save with Annual Billing</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">Commit and <span className="text-indigo-400">Save 20%</span>.</h2>
                        <p className="text-slate-400 font-medium max-w-lg mx-auto italic">Pay annually and get 12 months for the price of 10. Perfect for established teams looking for long-term growth.</p>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Monthly", discount: "0%" },
                            { label: "Quarterly", discount: "5%" },
                            { label: "Semi-Annual", discount: "10%" },
                            { label: "Annual", discount: "20%" }
                        ].map((d) => (
                            <div key={d.label} className="p-6 rounded-3xl bg-slate-800 border border-slate-700 space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.label}</p>
                                <p className="text-3xl font-black text-white italic">{d.discount}</p>
                                <p className="text-[10px] text-indigo-400 font-bold">OFF</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function renderCell(val: any, highlight = false) {
    if (val === true) return <Check className={`w-5 h-5 mx-auto ${highlight ? "text-indigo-600" : "text-green-500"}`} />;
    if (val === false) return <X className="w-5 h-5 mx-auto text-gray-200" />;
    return <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? "text-indigo-600" : "text-gray-400"}`}>{val}</span>;
}
