"use client";
/**
 * CEO Dashboard — /assessments/dashboard/ceo
 * SEPL/INT/2026/IMPL-STEPS-01 Step 17.2
 *
 * INTENTIONALLY MINIMAL — max 5 visual elements, no tables, no long lists.
 *
 * Visual elements (exactly 5):
 *  1. Three large KPI numbers (Future-Readiness / Culture Score / Revenue Risk)
 *  2. 6-month trend sparklines per metric (placeholder line chart)
 *  3. Department readiness comparison (5-bar chart)
 *  4. Biggest risk insight card (from TNI data)
 *  5. Biggest opportunity insight card (from TNI data)
 *
 * No competency-level detail. No individual scores. No tables.
 *
 * APIs used:
 *   GET /api/clients/[clientId]/dashboard/stats
 *   GET /api/clients/[clientId]/dashboard/gap-analysis
 *   GET /api/clients/[clientId]/analytics/competency-heatmap
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, LineChart, Line
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────

interface TniItem { competency: string; currentLevel: number; targetLevel: number; gap: "HIGH" | "MEDIUM" | "LOW"; employeesAffected?: number }
interface DeptScore { name: string; score: number }
interface WRIData { wri: number; benchmark: number; gap: number }

// ── Revenue Risk derivation ───────────────────────────────────────────────
// Simple heuristic: readiness < 50 = High risk, 50-70 = Medium, ≥70 = Low
function revenueRisk(readiness: number): { label: "High" | "Medium" | "Low"; color: string; bg: string } {
    if (readiness < 50) return { label: "High", color: "text-red-600", bg: "bg-red-50" };
    if (readiness < 70) return { label: "Medium", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Low", color: "text-green-600", bg: "bg-green-50" };
}

// ── Sparkline placeholder data (6 months) ─────────────────────────────────
// Generated as a plausible upward-trending line. Will be replaced with real
// AssessmentDelta time-series data once the delta API is built (Step 23+).
function mockTrend(current: number, variance = 8): { m: string; v: number }[] {
    const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    return months.map((m, i) => ({
        m,
        v: Math.max(0, Math.min(100, Math.round(current - (5 - i) * (variance / 5) + (Math.random() * 4 - 2)))),
    }));
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function CEODashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [readiness, setReadiness] = useState(0);
    const [deptScores, setDeptScores] = useState<DeptScore[]>([]);
    const [topRisk, setTopRisk] = useState<TniItem | null>(null);
    const [topOpp, setTopOpp] = useState<TniItem | null>(null);
    const [wriData, setWriData] = useState<WRIData | null>(null);
    const [loading, setLoading] = useState(true);

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
            fetch(`/api/clients/${clientId}/dashboard/gap-analysis`).then(r => r.ok ? r.json() : []),
            fetch(`/api/clients/${clientId}/analytics/competency-heatmap`).then(r => r.ok ? r.json() : []),
            fetch(`/api/clients/${clientId}/analytics/workforce-readiness`).then(r => r.ok ? r.json() : null),
        ]).then(([stats, gapRaw, heatmapRaw, wri]) => {
            const r = stats?.performance?.overall ?? 0;
            setReadiness(r);
            setWriData(wri);

            // Dept scores for bar chart (top 5)
            const heatmap: { department: string; competencies: { name: string; level: number }[] }[] =
                Array.isArray(heatmapRaw) ? heatmapRaw : [];
            const depts: DeptScore[] = heatmap
                .map(row => ({
                    name: row.department.length > 12 ? row.department.slice(0, 11) + "…" : row.department,
                    score: row.competencies.length
                        ? Math.round(row.competencies.reduce((s, c) => s + c.level * 20, 0) / row.competencies.length)
                        : 0,
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
            setDeptScores(depts);

            // Biggest risk = highest gap magnitude
            const gaps: TniItem[] = Array.isArray(gapRaw) ? gapRaw : [];
            const sorted = [...gaps].sort((a, b) => (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel));
            setTopRisk(sorted[0] ?? null);

            // Biggest opportunity = highest current score (closest to target = easiest win)
            const opps = [...gaps].sort((a, b) => b.currentLevel - a.currentLevel);
            setTopOpp(opps[0] ?? null);
        }).catch(console.error).finally(() => setLoading(false));
    }, [session, status]);

    // ── Derived ───────────────────────────────────────────────────────────
    // Culture score: no SCIP yet → placeholder value for sparkline shape
    const cultureScore = 0; // TODO: wire to SCIP in Step 23
    const risk = revenueRisk(readiness);

    // Sparkline data (placeholder — TODO replace with delta time-series)
    const readinessTrend = mockTrend(readiness, 10);
    const cultureTrend = mockTrend(cultureScore || 60, 8);

    const barColor = (score: number) =>
        score >= 70 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Minimal header */}
            <div className="px-8 pt-10 pb-6 max-w-6xl mx-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-1">
                    Sudaksha · Executive Intelligence
                </p>
                <h1 className="text-3xl font-black text-white tracking-tight">Talent Readiness Overview</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-8 pb-12 space-y-8">

                {/* ── VISUAL 1: Three large KPI numbers + VISUAL 2: Sparklines ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Future-Readiness */}
                    <Card className="bg-gray-900 border-gray-800 shadow-xl">
                        <CardContent className="pt-6 pb-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                                Future-Readiness Index
                            </p>
                            <div className={`text-6xl font-black tabular-nums mb-1 ${(wriData?.wri ?? readiness) >= 70 ? "text-green-400" : (wriData?.wri ?? readiness) >= 55 ? "text-amber-400" : "text-red-400"}`}>
                                {(wriData?.wri ?? readiness)}<span className="text-2xl text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                Benchmark {wriData?.benchmark ?? 65}% · Gap {(wriData?.gap ?? 0) > 0 ? "+" : ""}{wriData?.gap ?? 0}%
                                <span className={`ml-2 ${(wriData?.gap ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {(wriData?.gap ?? 0) >= 0 ? "↑" : "↓"}
                                </span>
                            </p>
                            {/* Sparkline */}
                            <div className="h-14">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={readinessTrend}>
                                        <Line type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={2} dot={false} />
                                        <Tooltip
                                            formatter={((v: number) => [`${v}%`, "Readiness"]) as any}
                                            contentStyle={{ background: "#1f2937", border: "none", borderRadius: "6px", fontSize: "11px" }}
                                            labelStyle={{ color: "#9ca3af" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1">6-month trend (placeholder — live data in Step 23)</p>
                        </CardContent>
                    </Card>

                    {/* Culture Score */}
                    <Card className="bg-gray-900 border-gray-800 shadow-xl">
                        <CardContent className="pt-6 pb-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                                Culture Score
                            </p>
                            <div className="text-6xl font-black tabular-nums mb-1 text-gray-600">
                                —
                            </div>
                            <p className="text-xs text-indigo-400 mb-4 font-medium">Pending SCIP deployment</p>
                            {/* Sparkline placeholder */}
                            <div className="h-14">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={cultureTrend}>
                                        <Line type="monotone" dataKey="v" stroke="#818cf8" strokeWidth={2} dot={false} strokeDasharray="4 3" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1">Deploy SCIP to populate this metric</p>
                        </CardContent>
                    </Card>

                    {/* Revenue Risk */}
                    <Card className={`border-gray-800 shadow-xl ${risk.label === "High" ? "bg-red-950/50" : risk.label === "Medium" ? "bg-amber-950/40" : "bg-green-950/40"}`}>
                        <CardContent className="pt-6 pb-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                                Revenue Risk
                            </p>
                            <div className={`text-6xl font-black mb-1 ${risk.color}`}>
                                {risk.label}
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                {risk.label === "High"
                                    ? "Critical talent gaps threaten delivery capability"
                                    : risk.label === "Medium"
                                        ? "Moderate gaps — monitor and address top TNIs"
                                        : "Workforce is broadly ready for current demands"}
                            </p>
                            <div className="h-14 flex items-end gap-0.5">
                                {/* Minimal risk bar indicator */}
                                {["Low", "Medium", "High"].map((l, i) => (
                                    <div key={i} className="flex-1 rounded-sm"
                                        style={{
                                            height: `${(i + 1) * 30}%`,
                                            background: l === risk.label
                                                ? (risk.label === "High" ? "#ef4444" : risk.label === "Medium" ? "#f59e0b" : "#22c55e")
                                                : "#374151",
                                        }} />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                <span>Low</span><span>Med</span><span>High</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── VISUAL 3: Department Bar Chart ── */}
                <Card className="bg-gray-900 border-gray-800 shadow-xl">
                    <CardContent className="pt-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-5">
                            Department Readiness
                        </p>
                        {deptScores.length === 0 ? (
                            <div className="h-[180px] flex items-center justify-center text-sm text-gray-600">
                                No department data yet
                            </div>
                        ) : (
                            <div className="h-[180px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deptScores} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                        <Tooltip
                                            formatter={((v: number) => [`${v}%`, "Readiness"]) as any}
                                            contentStyle={{ background: "#1f2937", border: "none", borderRadius: "6px", fontSize: "11px" }}
                                            cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                        />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={36}>
                                            {deptScores.map((d, i) => (
                                                <Cell key={i} fill={barColor(d.score)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── VISUAL 4 + 5: Insight Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Biggest Risk */}
                    <Card className="bg-red-950/40 border-red-900/50 shadow-xl">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Biggest Risk</p>
                            </div>
                            {topRisk ? (
                                <>
                                    <p className="text-xl font-bold text-white mb-1">{topRisk.competency}</p>
                                    <p className="text-sm text-gray-400">
                                        Organisation-wide gap of{" "}
                                        <span className="text-red-400 font-semibold">
                                            {topRisk.targetLevel - topRisk.currentLevel}%
                                        </span>{" "}
                                        in this competency domain.
                                        {topRisk.employeesAffected
                                            ? ` Affects ${topRisk.employeesAffected} employees.`
                                            : ""
                                        }
                                    </p>
                                    <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-red-500"
                                            style={{ width: `${Math.min(100, topRisk.currentLevel)}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                        <span>Current: {topRisk.currentLevel}%</span>
                                        <span>Target: {topRisk.targetLevel}%</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">No risk data yet — complete assessments to surface gaps.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Biggest Opportunity */}
                    <Card className="bg-green-950/30 border-green-900/50 shadow-xl">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                <p className="text-xs font-semibold uppercase tracking-widest text-green-400">Biggest Opportunity</p>
                            </div>
                            {topOpp ? (
                                <>
                                    <p className="text-xl font-bold text-white mb-1">{topOpp.competency}</p>
                                    <p className="text-sm text-gray-400">
                                        Strongest existing capability — current score{" "}
                                        <span className="text-green-400 font-semibold">{topOpp.currentLevel}%</span>.
                                        Leverage this strength for competitive advantage.
                                    </p>
                                    <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-green-500"
                                            style={{ width: `${Math.min(100, topOpp.currentLevel)}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                        <span>Current: {topOpp.currentLevel}%</span>
                                        <span>Target: {topOpp.targetLevel}%</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">No opportunity data yet — complete assessments to identify strengths.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
