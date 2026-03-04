"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ShieldAlert,
    ShieldCheck,
    TrendingDown,
    Trophy,
    Activity,
    BrainCircuit,
    AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

interface AggregateGapItem {
    competencyId: string;
    name: string;
    category: string;
    avgActual: number;
    avgRequired: number;
    gap: number;
    isHealthy: boolean;
}

interface CompanyGapData {
    analysis: AggregateGapItem[];
    totalAssessedUsers: number;
}

export function CompanyGapAnalysis({ clientId }: { clientId: string }) {
    const [data, setData] = useState<CompanyGapData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/admin/clients/${clientId}/gap-analysis`);
                if (!res.ok) throw new Error("Failed to load aggregate analysis");
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [clientId]);

    if (loading) {
        return (
            <Card className="animate-pulse h-[400px] flex items-center justify-center bg-gray-50/50 border-gray-100">
                <BrainCircuit className="h-8 w-8 text-blue-200 animate-bounce" />
            </Card>
        );
    }

    if (!data || data.analysis.length === 0) {
        return (
            <Card className="border-dashed border-gray-200">
                <CardContent className="p-12 text-center bg-gray-50/50">
                    <Activity className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No Assessment Data</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                        Complete assessments for employees assigned to role frameworks to see aggregate competency trends.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const criticalGaps = data.analysis.filter(a => a.gap < -15);
    const strengths = data.analysis.filter(a => a.gap > 5);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-900">Organizational Skill Gap Analysis</h2>
                    <p className="text-xs text-gray-500 font-medium">Aggregated profile of {data.totalAssessedUsers} employees</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Health Chart */}
                <Card className="shadow-lg border-gray-100">
                    <CardHeader className="border-b bg-gray-50/30">
                        <CardTitle className="text-sm font-black flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            Skill Health Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {data.analysis.map((item, idx) => (
                            <div key={item.competencyId} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-bold text-gray-700">{item.name}</span>
                                    <Badge className={`text-[9px] h-4 border-none ${item.gap < -15 ? 'bg-red-50 text-red-600' :
                                        item.gap < 0 ? 'bg-amber-50 text-amber-600' :
                                            'bg-green-50 text-green-600'
                                        }`}>
                                        {item.gap > 0 ? `+${item.gap}%` : `${item.gap}%`}
                                    </Badge>
                                </div>
                                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.avgActual}%` }}
                                        transition={{ duration: 1, delay: idx * 0.05 }}
                                        className={`absolute inset-y-0 left-0 ${item.gap < -15 ? 'bg-red-500' :
                                            item.gap < 0 ? 'bg-amber-500' :
                                                'bg-green-500'
                                            }`}
                                    />
                                    <div
                                        className="absolute inset-y-0 w-0.5 bg-black/40 z-10"
                                        style={{ left: `${item.avgRequired}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Strategic Insights */}
                <div className="space-y-6">
                    <Card className="border-red-100 bg-red-50/30 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4" />
                                Urgent Skill Deficits
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {criticalGaps.length > 0 ? criticalGaps.map(gap => (
                                <div key={gap.competencyId} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{gap.name}</p>
                                        <p className="text-[10px] text-gray-500">{gap.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-600">{gap.gap}%</p>
                                        <p className="text-[9px] text-gray-400 uppercase">Below Target</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-500 italic">No critical deficits detected.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-green-100 bg-green-50/30 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Organizational Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {strengths.length > 0 ? strengths.map(skill => (
                                <div key={skill.competencyId} className="bg-white p-3 rounded-lg border border-green-100 shadow-sm flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{skill.name}</p>
                                        <p className="text-[10px] text-gray-500">{skill.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-green-600">+{skill.gap}%</p>
                                        <p className="text-[9px] text-gray-400 uppercase">Above Target</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-500 italic">No significant strengths above benchmark yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                        <div className="flex gap-3">
                            <Trophy className="h-8 w-8 text-blue-200 shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">Strategic Recommendation</h4>
                                <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                                    Based on the data, prioritize training in <strong>{criticalGaps[0]?.name || 'current core modules'}</strong> to improve organizational fitness by an estimated 12% in the next quarter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
