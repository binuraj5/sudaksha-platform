"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface GapItem {
    competencyId: string;
    name: string;
    category: string;
    actualScore: number;
    requiredScore: number;
    requiredLevel: string;
    requiredLevelInt?: number;
    achievedLevel?: string;
    achievedLevelInt?: number;
    gap: number;
    priority?: "HIGH" | "MEDIUM" | "NONE" | "EXCEEDS";
    isMet: boolean;
}

interface GapAnalysisData {
    roleName: string;
    userName: string;
    analysis: GapItem[];
    overallFitness: number;
}

const PRIORITY_STYLES: Record<string, { badge: string; label: string }> = {
    HIGH:    { badge: "bg-red-100 text-red-700 border-red-200",       label: "HIGH GAP" },
    MEDIUM:  { badge: "bg-amber-100 text-amber-700 border-amber-200", label: "MEDIUM GAP" },
    NONE:    { badge: "bg-green-100 text-green-700 border-green-200", label: "MET" },
    EXCEEDS: { badge: "bg-blue-100 text-blue-700 border-blue-200",    label: "EXCEEDS" },
};

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

    const hasIntLevels = data.analysis.some(a => a.requiredLevelInt !== undefined);
    const highGaps = data.analysis.filter(a => a.priority === "HIGH").length;
    const mediumGaps = data.analysis.filter(a => a.priority === "MEDIUM").length;

    return (
        <Card className="border-blue-100 shadow-xl shadow-blue-50/50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-white text-blue-600 border-blue-200 font-bold uppercase tracking-wider text-[10px]">
                            Competency Gap Analysis
                        </Badge>
                        <CardTitle className="text-2xl font-black text-gray-900">Role Fitness Report</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">
                            Target Role: <span className="text-blue-700 font-bold">{data.roleName}</span>
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-blue-600">{data.overallFitness}%</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Requirements Met</div>
                    </div>
                </div>
                {hasIntLevels && (
                    <div className="flex gap-3 mt-4">
                        {highGaps > 0 && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                                {highGaps} HIGH gap{highGaps > 1 ? "s" : ""}
                            </span>
                        )}
                        {mediumGaps > 0 && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                {mediumGaps} MEDIUM gap{mediumGaps > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-6">
                {hasIntLevels ? (
                    /* ── New: integer-level table with Required / Achieved / Gap / Priority ── */
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Competency</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Required</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Achieved</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Gap</th>
                                    <th className="text-center px-4 py-3 font-bold text-gray-500 text-[11px] uppercase tracking-wider">Priority</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.analysis.map((item, idx) => {
                                    const ps = PRIORITY_STYLES[item.priority ?? (item.isMet ? "NONE" : "MEDIUM")];
                                    const reqInt = item.requiredLevelInt ?? 0;
                                    const achInt = item.achievedLevelInt ?? 0;
                                    return (
                                        <motion.tr
                                            key={item.competencyId}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-gray-50/50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900 text-[13px]">{item.name}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-mono">{item.category}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <LevelPips total={4} filled={reqInt + 1} color="blue" />
                                                <div className="text-[10px] font-mono text-gray-500 mt-1">{item.requiredLevel}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <LevelPips total={4} filled={achInt + 1} color={item.isMet ? "green" : "red"} />
                                                <div className="text-[10px] font-mono text-gray-500 mt-1">{item.achievedLevel ?? "—"}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-base font-black ${item.gap > 0 ? "text-red-600" : item.gap < 0 ? "text-blue-600" : "text-green-600"}`}>
                                                    {item.gap > 0 ? `+${item.gap}` : item.gap}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="outline" className={`text-[10px] font-bold ${ps.badge}`}>
                                                    {ps.label}
                                                </Badge>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* ── Legacy: percentage bar chart for older data ── */
                    <div className="grid gap-6">
                        {data.analysis.map((item, idx) => (
                            <div key={item.competencyId} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
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
                                    <div className="absolute inset-y-0 left-0 bg-gray-200 opacity-50 border-r-2 border-white" style={{ width: `${item.requiredScore}%` }} />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.actualScore}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className={`absolute inset-y-0 left-0 rounded-full ${item.isMet ? "bg-green-500" : "bg-red-500"}`}
                                    />
                                    <div className="absolute inset-y-0 w-0.5 bg-black/20 z-10" style={{ left: `${item.requiredScore}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Strength / focus summary */}
                <div className="flex gap-4 mt-6 pt-6 border-t">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-50 flex-1">
                        <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Top Strength</h5>
                        <p className="text-sm font-bold text-gray-900">
                            {[...data.analysis].sort((a, b) => (b.achievedLevelInt ?? 0) - (a.achievedLevelInt ?? 0))[0]?.name || "N/A"}
                        </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-red-50 flex-1">
                        <TrendingDown className="h-5 w-5 text-red-600 mb-2" />
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Biggest Gap</h5>
                        <p className="text-sm font-bold text-gray-900">
                            {[...data.analysis].sort((a, b) => b.gap - a.gap)[0]?.name || "N/A"}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function LevelPips({ total, filled, color }: { total: number; filled: number; color: "blue" | "green" | "red" }) {
    const colorMap = { blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-500" };
    return (
        <div className="flex items-center justify-center gap-1">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${i < filled ? colorMap[color] : "bg-gray-200"}`} />
            ))}
        </div>
    );
}
