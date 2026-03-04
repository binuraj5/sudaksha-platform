"use client";

import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    Target,
    CheckCircle2,
    XCircle,
    BarChart,
    ChevronRight,
    Search
} from "lucide-react";
import { COMPETENCY_CATEGORIES } from "@/lib/competency-categories";
import { Industry, CompetencyCategory, ProficiencyLevel, IndicatorType } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Indicator {
    text: string;
    type: IndicatorType;
    level: ProficiencyLevel;
}

interface CompetencyPreviewProps {
    data: {
        name: string;
        code?: string;
        category: CompetencyCategory;
        description: string;
        industries: Industry[];
        indicators: Indicator[];
    }
}

export function CompetencyPreview({ data }: CompetencyPreviewProps) {
    const categoryInfo = COMPETENCY_CATEGORIES[data.category as keyof typeof COMPETENCY_CATEGORIES];

    const getStats = (level: ProficiencyLevel) => {
        const levelInds = data.indicators.filter(i => i.level === level);
        return {
            positive: levelInds.filter(i => i.type === "POSITIVE").length,
            negative: levelInds.filter(i => i.type === "NEGATIVE").length,
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-100">
                    {categoryInfo?.icon || "🎯"}
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 lowercase">{data.name || "Untitled Competency"}</h2>
                        {data.code && <Badge className="bg-slate-100 text-slate-400 border-none font-bold italic tracking-widest">{data.code}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="rounded-lg border-indigo-100 text-indigo-600 font-bold italic px-3">{categoryInfo?.label}</Badge>
                        <span className="text-slate-300 text-xs font-black">•</span>
                        <div className="flex gap-1">
                            {data.industries.slice(0, 3).map(ind => (
                                <span key={ind} className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{ind.replace(/_/g, " ")}</span>
                            ))}
                            {data.industries.length > 3 && <span className="text-[10px] font-black text-slate-400">+{data.industries.length - 3}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white ring-1 ring-slate-100/50 overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Scope Section */}
                        <div className="p-10 border-b md:border-b-0 md:border-r border-slate-50 space-y-6 bg-slate-50/30">
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" /> Scope & Definition
                                </h3>
                                <p className="text-slate-600 font-medium leading-relaxed italic">
                                    {data.description || "No description provided."}
                                </p>
                            </div>

                            <div className="pt-6 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Industry Focus</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.industries.map(ind => (
                                        <Badge key={ind} variant="outline" className="rounded-xl border-slate-100 bg-white text-slate-500 font-bold italic lowercase">
                                            {ind.replace(/_/g, " ")}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Benchmark Section */}
                        <div className="p-10 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
                                <Target className="w-3 h-3" /> Proficiency Benchmarks
                            </h3>

                            <div className="space-y-4">
                                {(["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"] as ProficiencyLevel[]).map((level) => {
                                    const stats = getStats(level);
                                    return (
                                        <div key={level} className="group relative">
                                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl ring-1 ring-slate-100 group-hover:ring-indigo-100 group-hover:shadow-lg group-hover:shadow-indigo-50/50 transition-all cursor-default">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-600 transition-colors" />
                                                    <span className="font-black italic tracking-tight text-slate-700 lowercase">{level}</span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        <span className="text-xs font-black text-slate-400">{stats.positive}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <XCircle className="w-3 h-3 text-red-400" />
                                                        <span className="text-xs font-black text-slate-400">{stats.negative}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 text-center space-y-1">
                    <BarChart className="w-5 h-5 text-indigo-600 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Indicators</p>
                    <p className="text-2xl font-black italic text-indigo-700 tracking-tighter">{data.indicators.length}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center space-y-1">
                    <Search className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library Searchable</p>
                    <p className="text-2xl font-black italic text-slate-700 tracking-tighter">YES</p>
                </div>
            </div>
        </div>
    );
}
