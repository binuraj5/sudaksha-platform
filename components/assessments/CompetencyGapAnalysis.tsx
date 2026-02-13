"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface GapItem {
    competencyId: string;
    name: string;
    category: string;
    actualScore: number;
    requiredScore: number;
    requiredLevel: string;
    gap: number;
    isMet: boolean;
}

interface GapAnalysisData {
    roleName: string;
    userName: string;
    analysis: GapItem[];
    overallFitness: number;
}

export function CompetencyGapAnalysis({ assessmentId }: { assessmentId: string }) {
    const [data, setData] = useState<GapAnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/assessments/${assessmentId}/gap-analysis`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to load analysis");
                }
                const json = await res.json();
                setData(json);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [assessmentId]);

    if (loading) {
        return (
            <Card className="animate-pulse bg-gray-50/50">
                <CardContent className="h-64 flex items-center justify-center">
                    <BrainCircuit className="h-8 w-8 text-gray-300 animate-bounce" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="border-dashed border-gray-200">
                <CardContent className="p-8 text-center bg-gray-50/50">
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-gray-900">Analysis Unavailable</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                        {error || "Assign a role framework to this user to see their competency gap analysis."}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-blue-100 shadow-xl shadow-blue-50/50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-white text-blue-600 border-blue-200 font-bold uppercase tracking-wider text-[10px]">
                            Phase 5: Automated Gap Analysis
                        </Badge>
                        <CardTitle className="text-2xl font-black text-gray-900">Role Fitness Report</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">
                            Target Role: <span className="text-blue-700 font-bold">{data.roleName}</span>
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-blue-600">{data.overallFitness}%</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Target Met Rate</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                <div className="grid gap-6">
                    {data.analysis.map((item, idx) => (
                        <div key={item.competencyId} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        {item.name}
                                        {item.isMet ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        )}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 font-mono uppercase">{item.category}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-600">
                                        {item.actualScore}% <span className="text-gray-300 mx-1">/</span> {item.requiredScore}%
                                    </span>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter italic">Required: {item.requiredLevel}</p>
                                </div>
                            </div>

                            <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                {/* Base Required Marker */}
                                <div
                                    className="absolute inset-y-0 left-0 bg-gray-200 opacity-50 border-r-2 border-white"
                                    style={{ width: `${item.requiredScore}%` }}
                                />

                                {/* Actual Score Bar */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.actualScore}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                    className={`absolute inset-y-0 left-0 rounded-full ${item.isMet ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                />

                                {/* Target Pin */}
                                <div
                                    className="absolute inset-y-0 w-0.5 bg-black/20 z-10"
                                    style={{ left: `${item.requiredScore}%` }}
                                />
                            </div>

                            {!item.isMet && (
                                <p className="text-[10px] text-red-600 flex items-center gap-1 font-medium bg-red-50 w-fit px-2 py-0.5 rounded-md italic">
                                    <TrendingDown className="h-3 w-3" />
                                    Gap identified: {Math.abs(item.gap)}% below target benchmark
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t bg-gray-50/50 -mx-6 -mb-6 p-6 rounded-b-xl flex gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-50 flex-1">
                        <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Top Strength</h5>
                        <p className="text-sm font-bold text-gray-900">
                            {data.analysis.sort((a, b) => b.gap - a.gap)[0]?.name || "N/A"}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-red-50 flex-1">
                        <TrendingDown className="h-5 w-5 text-red-600 mb-2" />
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Focus Area</h5>
                        <p className="text-sm font-bold text-gray-900">
                            {data.analysis.sort((a, b) => a.gap - b.gap)[0]?.name || "N/A"}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
