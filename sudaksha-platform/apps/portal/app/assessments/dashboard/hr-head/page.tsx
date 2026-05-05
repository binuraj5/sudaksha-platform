"use client";
/**
 * HR Head Dashboard — /assessments/dashboard/hr-head
 * SEPL/INT/2026/IMPL-STEPS-01 Step 17.1
 *
 * Shows:
 *  • 4 strategic metrics: Workforce Readiness / Succession Coverage /
 *    Culture Health / L&D ROI
 *  • Department comparison bar chart (ADAPT-16 aggregate per dept)
 *  • Risk dashboard: departments below 60% readiness
 *  • Top 5 succession-ready employees (proxy: overallScore, CareerFitScore TODO)
 *  • "Download board brief" → POST /api/clients/[clientId]/reports/generate
 *
 * APIs used:
 *   GET /api/clients/[clientId]/dashboard/stats
 *   GET /api/clients/[clientId]/analytics/competency-heatmap
 *   GET /api/clients/[clientId]/dashboard/gap-analysis
 *   GET /api/clients/[clientId]/employees?limit=50
 *   POST /api/clients/[clientId]/reports/generate
 */

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    TrendingUp, GitBranch, FlaskConical, BarChart2,
    Loader2, AlertTriangle, Star, Download, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────

interface DeptScore { name: string; score: number }
interface EmployeeRow { id: string; name: string; email: string; overallScore: number }
interface WRIData { wri: number; benchmark: number; gap: number }

// ── Helpers ───────────────────────────────────────────────────────────────

function barColor(score: number) {
    return score >= 70 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
}

function MetricCard({ title, value, sub, icon, iconBg, accent }: {
    title: string; value: React.ReactNode; sub: React.ReactNode;
    icon: React.ReactNode; iconBg: string; accent?: string;
}) {
    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</CardTitle>
                <div className={`p-2 rounded-full ${iconBg}`}>{icon}</div>
            </CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold ${accent ?? "text-gray-900"}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{sub}</div>
            </CardContent>
        </Card>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function HRHeadDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [deptScores, setDeptScores] = useState<DeptScore[]>([]);
    const [topEmployees, setTopEmployees] = useState<EmployeeRow[]>([]);
    const [readiness, setReadiness] = useState(0);
    const [wriData, setWriData] = useState<WRIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportDone, setExportDone] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/assessments/login");
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated" || !session) return;
        const user = session.user as any;
        const clientId: string | undefined = user.clientId ?? user.tenantId;
        if (!clientId) { setLoading(false); return; }

        Promise.all([
            fetch(`/api/clients/${clientId}/dashboard/stats`).then(r => r.ok ? r.json() : null),
            fetch(`/api/clients/${clientId}/analytics/competency-heatmap`).then(r => r.ok ? r.json() : []),
            fetch(`/api/clients/${clientId}/employees?limit=50`).then(r => r.ok ? r.json() : { data: [] }),
            fetch(`/api/clients/${clientId}/analytics/workforce-readiness`).then(r => r.ok ? r.json() : null),
        ]).then(([stats, heatmapRaw, empRaw, wri]) => {
            setReadiness(stats?.performance?.overall ?? 0);
            setWriData(wri);

            // Department scores from heatmap
            const heatmap: { department: string; competencies: { name: string; level: number }[] }[] =
                Array.isArray(heatmapRaw) ? heatmapRaw : [];
            const depts: DeptScore[] = heatmap.map(row => {
                const avg = row.competencies.length > 0
                    ? Math.round(row.competencies.reduce((s, c) => s + c.level * 20, 0) / row.competencies.length)
                    : 0;
                return { name: row.department, score: avg };
            }).sort((a, b) => b.score - a.score);
            setDeptScores(depts);

            // Top employees by overallScore
            const empArr = Array.isArray(empRaw) ? empRaw : (empRaw?.data ?? []);
            const top = empArr
                .filter((e: any) => e.overallScore != null || e.lastScore != null)
                .map((e: any) => ({
                    id: e.id, name: e.name ?? "—", email: e.email ?? "—",
                    overallScore: e.overallScore ?? e.lastScore ?? 0,
                }))
                .sort((a: EmployeeRow, b: EmployeeRow) => b.overallScore - a.overallScore)
                .slice(0, 5);
            setTopEmployees(top);
        }).catch(console.error).finally(() => setLoading(false));
    }, [session, status]);

    const handleExport = useCallback(async () => {
        if (exporting) return;
        const user = (session?.user as any) ?? {};
        const clientId: string | undefined = user.clientId ?? user.tenantId;
        if (!clientId) return;

        setExporting(true);
        try {
            // Fetch first available template
            const tmplRes = await fetch(`/api/clients/${clientId}/reports/templates`);
            const templates = tmplRes.ok ? await tmplRes.json() : [];
            const templateId = templates?.[0]?.id ?? null;
            if (!templateId) { alert("No report templates available."); return; }

            await fetch(`/api/clients/${clientId}/reports/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId,
                    name: `Board Brief — ${new Date().toLocaleDateString()}`,
                    filters: { type: "BOARD_BRIEF" },
                }),
            });
            setExportDone(true);
            setTimeout(() => setExportDone(false), 3000);
        } catch (e) {
            console.error("Export failed", e);
        } finally {
            setExporting(false);
        }
    }, [exporting, session]);

    // ── Derived ───────────────────────────────────────────────────────────
    const riskDepts = deptScores.filter(d => d.score < 60);
    // Succession & culture: no API yet
    const successionCoverage: null = null;
    const cultureHealth: null = null;
    const ldRoi: null = null;

    if (status === "loading") return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">HR Head Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Strategic workforce health and succession intelligence</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50">HR Head View</Badge>
                        <button
                            id="btn-download-board-brief"
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg
                                hover:bg-gray-700 disabled:opacity-60 transition-colors"
                        >
                            {exporting
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : exportDone
                                    ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    : <Download className="h-4 w-4" />}
                            {exportDone ? "Report queued!" : "Download Board Brief"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* ── Strategic Metrics ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? [1,2,3,4].map(i => (
                        <Card key={i} className="border-none shadow-sm animate-pulse">
                            <CardContent className="pt-6"><div className="h-10 bg-gray-100 rounded" /></CardContent>
                        </Card>
                    )) : (<>
                        <MetricCard title="Workforce Readiness" value={`${wriData?.wri ?? readiness}%`}
                            sub={`Benchmark ${wriData?.benchmark ?? 65}% · Gap ${(wriData?.gap ?? 0) > 0 ? "+" : ""}${wriData?.gap ?? 0}% ${(wriData?.gap ?? 0) >= 0 ? "↑" : "↓"}`}
                            icon={<TrendingUp className="h-4 w-4 text-blue-600" />} iconBg="bg-blue-50"
                            accent={(wriData?.wri ?? readiness) >= 70 ? "text-green-700" : (wriData?.wri ?? readiness) >= 55 ? "text-amber-600" : "text-red-600"} />
                        <MetricCard title="Succession Coverage"
                            value={successionCoverage != null ? `${successionCoverage}%` : "—"}
                            sub={successionCoverage != null ? "Critical roles covered" : "Pending CareerFitScore data"}
                            icon={<GitBranch className="h-4 w-4 text-purple-600" />} iconBg="bg-purple-50" />
                        <MetricCard title="Culture Health"
                            value={cultureHealth != null ? `${cultureHealth}%` : "—"}
                            sub={cultureHealth != null ? "SCIP values alignment" : "Pending SCIP data"}
                            icon={<FlaskConical className="h-4 w-4 text-indigo-500" />} iconBg="bg-indigo-50" />
                        <MetricCard title="L&D ROI"
                            value={ldRoi != null ? `${ldRoi}%` : "—"}
                            sub={ldRoi != null ? "Competency gain per cohort" : "Requires delta data"}
                            icon={<BarChart2 className="h-4 w-4 text-green-600" />} iconBg="bg-green-50" />
                    </>)}
                </div>

                {/* ── Department Comparison Chart ── */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Department Readiness Comparison</CardTitle>
                        <CardDescription>
                            ADAPT-16 aggregate proficiency per department — threshold at 60%
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <div className="h-[280px] bg-gray-100 rounded animate-pulse" />
                        : deptScores.length === 0 ? (
                            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
                                No department data available yet.
                            </div>
                        ) : (
                            <>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={deptScores} margin={{ top: 4, right: 24, left: 0, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
                                            <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                                            <Tooltip
                                                formatter={((v: number) => [`${v}%`, "Readiness"]) as any}
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)" }}
                                                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                                            />
                                            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 3"
                                                label={{ value: "60% threshold", position: "insideTopRight", fontSize: 11, fill: "#ef4444" }} />
                                            <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={32}>
                                                {deptScores.map((d, i) => (
                                                    <Cell key={i} fill={barColor(d.score)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 justify-center mt-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Below 60%</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> 60–69%</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> 70%+</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* ── Risk Dashboard + Top Succession ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk flags */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-red-500" />Risk Dashboard
                            </CardTitle>
                            <CardDescription>Departments below 60% readiness — action required</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-4 space-y-2">{[1,2].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                            : riskDepts.length === 0 ? (
                                <div className="py-10 flex flex-col items-center gap-2 text-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                                    <p className="text-sm text-green-700 font-medium">All departments above threshold</p>
                                    <p className="text-xs text-gray-400">No readiness risks detected.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {riskDepts.map((d, idx) => (
                                        <div key={idx} className="flex items-center justify-between px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{d.name}</p>
                                                <p className="text-xs text-red-500 font-medium mt-0.5">Action required</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-red-600">{d.score}%</span>
                                                    <p className="text-[10px] text-gray-400">{60 - d.score}% below threshold</p>
                                                </div>
                                                <Badge className="bg-red-100 text-red-700 border-red-200 text-[11px]">At Risk</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top 5 Succession-Ready */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Star className="h-4 w-4 text-amber-500" />Succession-Ready Employees
                            </CardTitle>
                            <CardDescription>
                                Top 5 by assessment score — CareerFitScore will refine this list
                                {/* TODO: replace with CareerFitScore.fitScore once routes built */}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                            : topEmployees.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                    <Star className="h-8 w-8 text-gray-300" />No scored employees yet.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {topEmployees.map((e, idx) => (
                                        <div key={e.id ?? idx} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                                ${idx === 0 ? "bg-amber-100 text-amber-700"
                                                : idx === 1 ? "bg-gray-200 text-gray-600"
                                                : idx === 2 ? "bg-orange-100 text-orange-600"
                                                : "bg-gray-100 text-gray-500"}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{e.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{e.email}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`text-sm font-bold tabular-nums ${e.overallScore >= 70 ? "text-green-700" : "text-amber-600"}`}>
                                                    {e.overallScore}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
