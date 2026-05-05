"use client";

/**
 * Department Head Dashboard — /assessments/dashboard/dept-head
 * SEPL/INT/2026/IMPL-STEPS-01 Step 13
 *
 * Shows:
 *  • 4 metrics: Dept readiness index / Role-ready % at L3+ / High-potential count /
 *               Culture alignment % (placeholder if no SCIP data)
 *  • Domain-level bar chart (5 ADAPT-16 domains: A, AL, P, D, T — aggregated from heatmap)
 *  • Top-3 TNI cards (dept-scoped, reuses shared TniCard)
 *  • Succession gap panel (roles where fitScore < 75; empty state if no CareerFitScore yet)
 *  • Top-5 performers by CompetencyScore average
 *
 * APIs used:
 *   GET /api/clients/[clientId]/dashboard/stats
 *   GET /api/clients/[clientId]/dashboard/gap-analysis
 *   GET /api/clients/[clientId]/analytics/competency-heatmap
 *   GET /api/clients/[clientId]/employees
 * (CareerFitScore & SCIP: no routes yet — graceful empty state rendered)
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    TrendingUp, Users, Star, ShieldCheck,
    Loader2, AlertTriangle, GitBranch,
    ChevronRight, FlaskConical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TniCard, TniCardSkeleton, type TniItem } from "@/components/Dashboard/TniCard";

// ── Types ───────────────────────────────────────────────────────────────────

interface StatsResponse {
    employees: { total: number; active: number };
    assessments: { pending: number; completed: number; avgScore: number };
    performance: { overall: number };
}

interface HeatmapRow {
    department: string;
    competencies: { name: string; level: number }[];
}

interface MemberRow {
    id: string;
    name: string;
    email: string;
    role?: string;
    status: string;
    overallScore?: number | null;
}

// ── ADAPT-16 Domain mapping ─────────────────────────────────────────────────
// Competency codes → domain label.
// Names from API may be full names or codes; we match on prefix heuristic.
const DOMAIN_LABELS: Record<string, string> = {
    A: "Adaptability",
    AL: "Agile Leadership",
    P: "People & Impact",
    D: "Decision Making",
    T: "Team Dynamics",
};

/** Maps a competency name/code to one of the 5 ADAPT-16 domain keys */
function inferDomain(name: string): string | null {
    const upper = name.toUpperCase();
    if (upper.startsWith("AL") || upper.includes("AGILE") || upper.includes("LEADERSHIP")) return "AL";
    if (upper.startsWith("A-") || upper.startsWith("A ") || upper === "A" || upper.includes("ADAPT")) return "A";
    if (upper.startsWith("P-") || upper.startsWith("P ") || upper === "P" || upper.includes("PEOPLE") || upper.includes("IMPACT")) return "P";
    if (upper.startsWith("D-") || upper.startsWith("D ") || upper === "D" || upper.includes("DECISION")) return "D";
    if (upper.startsWith("T-") || upper.startsWith("T ") || upper === "T" || upper.includes("TEAM")) return "T";
    return null;
}

/**
 * Aggregates raw heatmap / gap data into 5 domain averages.
 * Falls back to distributing all competencies evenly if no domain matches.
 */
function aggregateToDomains(
    gapData: TniItem[],
    heatmap: HeatmapRow[]
): { domain: string; label: string; avgScore: number }[] {
    const domainTotals: Record<string, { sum: number; count: number }> = {
        A: { sum: 0, count: 0 },
        AL: { sum: 0, count: 0 },
        P: { sum: 0, count: 0 },
        D: { sum: 0, count: 0 },
        T: { sum: 0, count: 0 },
    };

    // From gap data
    for (const item of gapData) {
        const domain = inferDomain(item.competency);
        if (domain) {
            domainTotals[domain].sum += item.currentLevel;
            domainTotals[domain].count += 1;
        }
    }

    // From heatmap — supplement if gap data was sparse
    for (const row of heatmap) {
        for (const c of row.competencies) {
            const domain = inferDomain(c.name);
            if (domain) {
                // heatmap level is 1-5, normalise to 0-100
                domainTotals[domain].sum += c.level * 20;
                domainTotals[domain].count += 1;
            }
        }
    }

    return Object.entries(domainTotals).map(([key, val]) => ({
        domain: key,
        label: DOMAIN_LABELS[key] ?? key,
        avgScore: val.count > 0 ? Math.round(val.sum / val.count) : 0,
    }));
}

// ── Derived: role-ready % at L3+ ────────────────────────────────────────────
// L3+ = avgScore ≥ 60 (proxy: 60%+ = proficiency L3 on 0-100 scale)
function roleReadyPct(members: MemberRow[]): number {
    if (members.length === 0) return 0;
    const ready = members.filter(m => (m.overallScore ?? 0) >= 60).length;
    return Math.round((ready / members.length) * 100);
}

// High-potential: top quartile AND score ≥ 75
function highPotentialCount(members: MemberRow[]): number {
    return members.filter(m => (m.overallScore ?? 0) >= 75).length;
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function MetricSkeleton() {
    return (
        <Card className="border-none shadow-sm animate-pulse">
            <CardHeader className="pb-2"><div className="h-3 w-24 bg-gray-200 rounded" /></CardHeader>
            <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
            </CardContent>
        </Card>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function DeptHeadDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [gapData, setGapData] = useState<TniItem[]>([]);
    const [heatmap, setHeatmap] = useState<HeatmapRow[]>([]);
    const [members, setMembers] = useState<MemberRow[]>([]);
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
            fetch(`/api/clients/${clientId}/employees`).then(r => r.ok ? r.json() : []),
        ])
            .then(([statsData, gapRaw, heatmapRaw, empRaw]) => {
                setStats(statsData ?? null);
                setGapData(Array.isArray(gapRaw) ? gapRaw : []);
                setHeatmap(Array.isArray(heatmapRaw) ? heatmapRaw : []);
                const empList: MemberRow[] = (Array.isArray(empRaw) ? empRaw : empRaw?.employees ?? [])
                    .map((e: any) => ({
                        id: e.id ?? e.memberId,
                        name: e.name ?? e.fullName ?? "—",
                        email: e.email ?? "—",
                        role: e.role?.name ?? e.currentRole?.name ?? e.assignedRole ?? "—",
                        status: e.status ?? "ACTIVE",
                        overallScore: e.overallScore ?? e.lastScore ?? null,
                    }));
                setMembers(empList);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [session, status]);

    // ── Derived ──────────────────────────────────────────────────────────────

    const readinessPct = stats?.performance.overall ?? 0;
    const rlPct = roleReadyPct(members);
    const hiPotCount = highPotentialCount(members);
    // SCIP culture alignment — not yet deployed, always null for now
    const cultureAlignPct: number | null = null;

    // Domain aggregation for chart
    const domainData = aggregateToDomains(gapData, heatmap);

    // Top-3 TNI (highest gap magnitude)
    const topTni: TniItem[] = [...gapData]
        .sort((a, b) => (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel))
        .slice(0, 3);

    // Top-5 performers
    const topPerformers = [...members]
        .filter(m => m.overallScore != null)
        .sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
        .slice(0, 5);

    const domainBarColor = (score: number) =>
        score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ── */}
            <div className="bg-white border-b px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Department Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Competency health, succession readiness, and development priorities
                        </p>
                    </div>
                    <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50 gap-1">
                        <GitBranch className="h-3.5 w-3.5" />
                        Department Head View
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* ── 4-Metric Summary Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? [1, 2, 3, 4].map(i => <MetricSkeleton key={i} />) : (<>
                        {/* 1. Dept Readiness Index */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dept Readiness</CardTitle>
                                <div className="p-2 bg-blue-50 rounded-full"><TrendingUp className="h-4 w-4 text-blue-600" /></div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{readinessPct}%</div>
                                <p className="text-xs text-gray-500 mt-1">Avg assessment score across dept</p>
                            </CardContent>
                        </Card>

                        {/* 2. Role-Ready at L3+ */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role-Ready L3+</CardTitle>
                                <div className="p-2 bg-green-50 rounded-full"><ShieldCheck className="h-4 w-4 text-green-600" /></div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{rlPct}%</div>
                                <p className="text-xs text-gray-500 mt-1">Members scoring ≥ 60%</p>
                            </CardContent>
                        </Card>

                        {/* 3. High-Potential Count */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">High Potentials</CardTitle>
                                <div className="p-2 bg-amber-50 rounded-full"><Star className="h-4 w-4 text-amber-500" /></div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{hiPotCount}</div>
                                <p className="text-xs text-gray-500 mt-1">Members scoring ≥ 75%</p>
                            </CardContent>
                        </Card>

                        {/* 4. Culture Alignment (SCIP) */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Culture Alignment</CardTitle>
                                <div className="p-2 bg-indigo-50 rounded-full"><FlaskConical className="h-4 w-4 text-indigo-500" /></div>
                            </CardHeader>
                            <CardContent>
                                {cultureAlignPct != null ? (
                                    <>
                                        <div className="text-3xl font-bold text-gray-900">{cultureAlignPct}%</div>
                                        <p className="text-xs text-gray-500 mt-1">SCIP culture score</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-lg font-semibold text-gray-400 mt-1">—</div>
                                        <p className="text-xs text-indigo-500 mt-1 font-medium">Pending SCIP data</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>)}
                </div>

                {/* ── Domain Chart + TNI Cards ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Domain Bar Chart — 2 cols */}
                    <Card className="lg:col-span-2 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">ADAPT-16 Domain Scores</CardTitle>
                            <CardDescription>Average proficiency across 5 competency domains</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-[260px] bg-gray-100 rounded animate-pulse" />
                            ) : domainData.every(d => d.avgScore === 0) ? (
                                <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                                    No domain score data available yet.
                                </div>
                            ) : (
                                <div className="h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={domainData}
                                            margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                                            <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                formatter={((v: number) => [`${v}%`, "Avg Score"]) as any}
                                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                                            />
                                            <Bar dataKey="avgScore" radius={[0, 4, 4, 0]} barSize={24}>
                                                {domainData.map((entry, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={domainBarColor(entry.avgScore)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            <div className="flex items-center gap-4 mt-4 justify-center text-xs text-gray-500">
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Below 45%</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> 45–69%</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> 70%+</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top-3 TNI */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Top Training Needs</h2>
                        {loading
                            ? [1, 2, 3].map(i => <TniCardSkeleton key={i} />)
                            : topTni.length === 0
                                ? (
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="p-6 text-center text-sm text-gray-400">
                                            No training needs identified yet.
                                        </CardContent>
                                    </Card>
                                )
                                : topTni.map((item, idx) => <TniCard key={idx} item={item} />)
                        }
                    </div>
                </div>

                {/* ── Succession Gap Panel + Top Performers ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Succession Gap Panel */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Succession Gaps
                            </CardTitle>
                            <CardDescription>
                                Roles with no internal candidate at L3+ (fitScore &lt; 75)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* CareerFitScore API not yet built — always empty state for now.
                                TODO: wire to /api/clients/[clientId]/career-fit?minLevel=SENIOR&maxFit=75
                                once CareerFitScore routes are created in a future step. */}
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-full">
                                    <GitBranch className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">No succession data yet</p>
                                <p className="text-xs text-gray-400 max-w-[220px]">
                                    Succession gap analysis requires CareerFitScore records.
                                    Scores are computed after assessment completion.
                                </p>
                                <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 text-xs">
                                    Pending CareerFitScore data
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Star className="h-4 w-4 text-amber-500" />
                                Top Performers
                            </CardTitle>
                            <CardDescription>Top 5 by overall assessment score</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-6 space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : topPerformers.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                    <Users className="h-8 w-8 text-gray-300" />
                                    No scored members yet.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {topPerformers.map((m, idx) => (
                                        <div key={m.id ?? idx} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                            {/* Rank badge */}
                                            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                                                ${idx === 0 ? "bg-amber-100 text-amber-700"
                                                    : idx === 1 ? "bg-gray-200 text-gray-600"
                                                    : idx === 2 ? "bg-orange-100 text-orange-600"
                                                    : "bg-gray-100 text-gray-500"}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{m.role ?? "—"}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-green-400"
                                                        style={{ width: `${Math.min(100, m.overallScore ?? 0)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 tabular-nums w-10 text-right">
                                                    {m.overallScore}%
                                                </span>
                                                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
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
