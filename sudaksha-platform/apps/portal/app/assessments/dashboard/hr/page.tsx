"use client";

/**
 * HR / Talent Management Dashboard — /assessments/dashboard/hr
 * SEPL/INT/2026/IMPL-STEPS-01 Step 15
 *
 * Shows:
 *  • 4 metrics: Workforce Readiness Index / High-potential count /
 *               Culture risk flags / Succession coverage %
 *  • Lens toggle tabs: "RBCA Gaps" / "ADAPT-16 Readiness" / "SCIP Culture"
 *    – Each tab renders a different bar chart or placeholder
 *  • Full competency domain bars (org-wide)
 *  • Top-3 high-urgency TNI items (org-wide)
 *  • Quick people search (debounced, hits /api/clients/[clientId]/employees?search=)
 *
 * Data sources:
 *   GET /api/clients/[clientId]/dashboard/stats          → aggregate metrics
 *   GET /api/clients/[clientId]/dashboard/gap-analysis   → gaps (RBCA tab)
 *   GET /api/clients/[clientId]/analytics/competency-heatmap → ADAPT-16 tab
 *   GET /api/clients/[clientId]/employees?search=        → people search
 * (CareerFitScore / SCIP: no routes yet → placeholders)
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    TrendingUp, Star, ShieldAlert, GitBranch,
    Loader2, Search, X, Users, FlaskConical, BarChart2, ChevronRight
} from "lucide-react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { TniCard, TniCardSkeleton, type TniItem } from "@/components/Dashboard/TniCard";

// ── Types ─────────────────────────────────────────────────────────────────

type LensTab = "RBCA" | "ADAPT16" | "SCIP";

interface GapItem extends TniItem { employeesAffected?: number }

interface HeatmapRow {
    department: string;
    competencies: { name: string; level: number }[];
}

interface StatsResponse {
    employees: { total: number; active: number };
    performance: { overall: number };
}

interface PersonResult {
    id: string;
    name: string;
    email: string;
    employeeId?: string | null;
    memberCode?: string | null;
}

// ── Domain aggregation (same as dept-head) ────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
    A: "Adaptability", AL: "Agile Leadership", P: "People & Impact",
    D: "Decision Making", T: "Team Dynamics",
};

function inferDomain(name: string): string | null {
    const u = name.toUpperCase();
    if (u.startsWith("AL") || u.includes("AGILE") || u.includes("LEADERSHIP")) return "AL";
    if (u.startsWith("A-") || u === "A" || u.includes("ADAPT")) return "A";
    if (u.startsWith("P-") || u === "P" || u.includes("PEOPLE") || u.includes("IMPACT")) return "P";
    if (u.startsWith("D-") || u === "D" || u.includes("DECISION")) return "D";
    if (u.startsWith("T-") || u === "T" || u.includes("TEAM")) return "T";
    return null;
}

function aggregateDomains(gaps: GapItem[], heatmap: HeatmapRow[]) {
    const totals: Record<string, { sum: number; count: number }> = {
        A: { sum: 0, count: 0 }, AL: { sum: 0, count: 0 },
        P: { sum: 0, count: 0 }, D: { sum: 0, count: 0 }, T: { sum: 0, count: 0 },
    };
    for (const g of gaps) {
        const d = inferDomain(g.competency);
        if (d) { totals[d].sum += g.currentLevel; totals[d].count++; }
    }
    for (const row of heatmap) {
        for (const c of row.competencies) {
            const d = inferDomain(c.name);
            if (d) { totals[d].sum += c.level * 20; totals[d].count++; }
        }
    }
    return Object.entries(totals).map(([key, val]) => ({
        key, label: DOMAIN_LABELS[key] ?? key,
        score: val.count > 0 ? Math.round(val.sum / val.count) : 0,
    }));
}

function barColor(score: number) {
    return score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";
}

// ── Sub-components ─────────────────────────────────────────────────────────

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

/** RBCA Gaps tab — horizontal bar chart of gap-analysis data */
function RBCALens({ data, loading }: { data: GapItem[]; loading: boolean }) {
    if (loading) return <div className="h-[280px] bg-gray-100 rounded-lg animate-pulse" />;
    if (data.length === 0) return (
        <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
            No RBCA gap data available yet.
        </div>
    );
    const chartData = [...data].sort((a, b) => a.currentLevel - b.currentLevel).slice(0, 10);
    return (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={chartData}
                    margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <YAxis dataKey="competency" type="category" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip
                        formatter={((v: number) => [`${v}%`, "Current Level"]) as any}
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)" }}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    />
                    <Bar dataKey="currentLevel" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((e, i) => (
                            <Cell key={i} fill={barColor(e.currentLevel)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/** ADAPT-16 Readiness tab — 5-domain aggregated bars */
function Adapt16Lens({
    gaps, heatmap, loading
}: { gaps: GapItem[]; heatmap: HeatmapRow[]; loading: boolean }) {
    if (loading) return <div className="h-[280px] bg-gray-100 rounded-lg animate-pulse" />;
    const domains = aggregateDomains(gaps, heatmap);
    const allZero = domains.every(d => d.score === 0);
    if (allZero) return (
        <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
            No ADAPT-16 domain data available yet.
        </div>
    );
    return (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={domains}
                    margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <YAxis dataKey="label" type="category" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip
                        formatter={((v: number) => [`${v}%`, "Domain Avg"]) as any}
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)" }}
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={28}>
                        {domains.map((d, i) => (
                            <Cell key={i} fill={barColor(d.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/** SCIP Culture tab — placeholder until Step 23 */
function SCIPLens() {
    return (
        <div className="h-[280px] flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 bg-indigo-50 rounded-full">
                <FlaskConical className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-600">SCIP Culture data not yet available</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[260px]">
                    Culture alignment scores are generated from SCIP instrument responses.
                    Deploy SCIP to your organisation to unlock this lens.
                </p>
            </div>
            {/* TODO: wire to SCIP culture API in Step 23 */}
            <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 text-xs">
                Pending SCIP deployment
            </Badge>
        </div>
    );
}

/** Debounced people search panel */
function PeopleSearch({ clientId }: { clientId: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PersonResult[]>([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const doSearch = useCallback((q: string) => {
        if (!q.trim()) { setResults([]); return; }
        setSearching(true);
        fetch(`/api/clients/${clientId}/employees?search=${encodeURIComponent(q)}&simple=true&limit=8`)
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                // simple=true returns array directly; otherwise use data.data
                setResults(Array.isArray(data) ? data : (data.data ?? []));
            })
            .catch(console.error)
            .finally(() => setSearching(false));
    }, [clientId]);

    const handleChange = (val: string) => {
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 300);
    };

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-4 w-4 text-gray-500" />
                    Quick People Search
                </CardTitle>
                <CardDescription>Search employees by name, email or employee ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        id="hr-people-search"
                        type="text"
                        value={query}
                        onChange={e => handleChange(e.target.value)}
                        placeholder="Search name, email, employee ID…"
                        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setResults([]); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {searching && (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                )}

                {!searching && results.length > 0 && (
                    <div className="divide-y rounded-lg border border-gray-100 overflow-hidden">
                        {results.map((p, idx) => (
                            <div key={p.id ?? idx}
                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-default">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-blue-700">
                                        {(p.name ?? "?")[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{p.email}</p>
                                </div>
                                {(p.employeeId ?? p.memberCode) && (
                                    <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                                        {p.employeeId ?? p.memberCode}
                                    </span>
                                )}
                                <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                            </div>
                        ))}
                    </div>
                )}

                {!searching && query.trim() && results.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-400">
                        No people found for "{query}"
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function HRDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<LensTab>("ADAPT16");

    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [gaps, setGaps] = useState<GapItem[]>([]);
    const [heatmap, setHeatmap] = useState<HeatmapRow[]>([]);
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
        ])
            .then(([s, g, h]) => {
                setStats(s ?? null);
                setGaps(Array.isArray(g) ? g : []);
                setHeatmap(Array.isArray(h) ? h : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [session, status]);

    // ── Derived metrics ───────────────────────────────────────────────────

    const readiness = stats?.performance.overall ?? 0;

    // High-potential: score >= 75 from gap-analysis avg as proxy
    // (true HP count would come from CompetencyScore.compositeRawScore >= 75)
    const hiPotProxy = gaps.filter(g => g.currentLevel >= 75).length;

    // Culture risk flags — no SCIP yet
    const cultureRiskFlags: null = null;

    // Succession coverage — no CareerFitScore yet
    const successionCoverage: null = null;

    // Top-3 org-wide TNI
    const topTni: GapItem[] = [...gaps]
        .sort((a, b) => (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel))
        .slice(0, 3);

    const user = (session?.user as any) ?? {};
    const clientId: string | undefined = user.clientId ?? user.tenantId;

    const TABS: { id: LensTab; label: string; icon: React.ReactNode }[] = [
        { id: "RBCA", label: "RBCA Gaps", icon: <BarChart2 className="h-3.5 w-3.5" /> },
        { id: "ADAPT16", label: "ADAPT-16 Readiness", icon: <TrendingUp className="h-3.5 w-3.5" /> },
        { id: "SCIP", label: "SCIP Culture", icon: <FlaskConical className="h-3.5 w-3.5" /> },
    ];

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
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">HR &amp; Talent Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Organisation-wide talent health, readiness, and culture intelligence
                        </p>
                    </div>
                    <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50 gap-1">
                        <Users className="h-3.5 w-3.5" />
                        HR &amp; Talent View
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* ── 4-Metric Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? [1, 2, 3, 4].map(i => <MetricSkeleton key={i} />) : (<>
                        {/* 1. Workforce Readiness Index */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Workforce Readiness</CardTitle>
                                <div className="p-2 bg-blue-50 rounded-full"><TrendingUp className="h-4 w-4 text-blue-600" /></div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{readiness}%</div>
                                <p className="text-xs text-gray-500 mt-1">ADAPT-16 composite index</p>
                            </CardContent>
                        </Card>

                        {/* 2. High-Potential Count */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">High Potentials</CardTitle>
                                <div className="p-2 bg-amber-50 rounded-full"><Star className="h-4 w-4 text-amber-500" /></div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{hiPotProxy}</div>
                                <p className="text-xs text-gray-500 mt-1">Competencies scoring ≥ 75%</p>
                            </CardContent>
                        </Card>

                        {/* 3. Culture Risk Flags */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Culture Risk Flags</CardTitle>
                                <div className="p-2 bg-red-50 rounded-full"><ShieldAlert className="h-4 w-4 text-red-500" /></div>
                            </CardHeader>
                            <CardContent>
                                {cultureRiskFlags != null ? (
                                    <>
                                        <div className="text-3xl font-bold text-gray-900">{cultureRiskFlags}</div>
                                        <p className="text-xs text-gray-500 mt-1">Values misalignment detected</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-lg font-semibold text-gray-400 mt-1">—</div>
                                        {/* TODO: wire to CareerFitScore.gapAnalysis once SCIP routes built */}
                                        <p className="text-xs text-indigo-500 mt-1 font-medium">Pending SCIP data</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* 4. Succession Coverage */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Succession Coverage</CardTitle>
                                <div className="p-2 bg-purple-50 rounded-full"><GitBranch className="h-4 w-4 text-purple-600" /></div>
                            </CardHeader>
                            <CardContent>
                                {successionCoverage != null ? (
                                    <>
                                        <div className="text-3xl font-bold text-gray-900">{successionCoverage}%</div>
                                        <p className="text-xs text-gray-500 mt-1">Roles with L3+ candidates</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-lg font-semibold text-gray-400 mt-1">—</div>
                                        {/* TODO: wire to CareerFitScore once routes built */}
                                        <p className="text-xs text-gray-400 mt-1">Pending CareerFitScore data</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>)}
                </div>

                {/* ── Lens Tabs + Chart ── */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-0">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <CardTitle className="text-base">Talent Intelligence Lens</CardTitle>
                                <CardDescription className="mt-0.5">
                                    Switch between assessment instruments to analyse your organisation
                                </CardDescription>
                            </div>
                            {/* Tab switcher */}
                            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        id={`lens-tab-${tab.id.toLowerCase()}`}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                                            ${activeTab === tab.id
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {activeTab === "RBCA" && (
                            <RBCALens data={gaps} loading={loading} />
                        )}
                        {activeTab === "ADAPT16" && (
                            <Adapt16Lens gaps={gaps} heatmap={heatmap} loading={loading} />
                        )}
                        {activeTab === "SCIP" && <SCIPLens />}
                    </CardContent>
                    <div className="flex items-center gap-4 justify-center pb-5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Below 45%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> 45–69%</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> 70%+</span>
                    </div>
                </Card>

                {/* ── Top TNI + People Search ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top-3 TNI */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Top Org-Wide Training Needs
                            </h2>
                            <p className="text-xs text-gray-400">Highest-priority competency gaps across the organisation</p>
                        </div>
                        {loading
                            ? [1, 2, 3].map(i => <TniCardSkeleton key={i} />)
                            : topTni.length === 0
                                ? (
                                    <Card className="border-none shadow-sm">
                                        <CardContent className="p-6 text-center text-sm text-gray-400">
                                            No TNI data available yet.
                                        </CardContent>
                                    </Card>
                                )
                                : topTni.map((item, idx) => <TniCard key={idx} item={item} />)
                        }
                    </div>

                    {/* People Search */}
                    {clientId
                        ? <PeopleSearch clientId={clientId} />
                        : (
                            <Card className="border-none shadow-sm">
                                <CardContent className="py-10 text-center text-sm text-gray-400">
                                    People search requires an organisation context.
                                </CardContent>
                            </Card>
                        )
                    }
                </div>

            </div>
        </div>
    );
}
