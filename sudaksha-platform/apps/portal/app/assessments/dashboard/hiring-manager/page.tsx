"use client";
/**
 * Hiring Manager Dashboard — /assessments/dashboard/hiring-manager
 * SEPL/INT/2026/IMPL-STEPS-01 Step 16.2
 *
 * Shows:
 *  • 4 metrics: Top candidate fit score / Internal promotion candidates /
 *               Hire vs Develop recommendation / Team ADAPT-16 average
 *  • Candidate comparison: top 3 side-by-side (RBCA fit, ADAPT-16 avg, SCIP values)
 *  • Internal candidate panel: team members with score ≥ 70 for target role
 *  • Team dynamics / SCIP work style clustering (placeholder)
 *
 * Hire vs Develop logic:
 *   If best internal candidate fitScore ≥ 70 → "Develop Internal"
 *   Else → "Hire External"
 *
 * APIs used:
 *   GET /api/clients/[clientId]/dashboard/stats
 *   GET /api/clients/[clientId]/dashboard/gap-analysis
 *   GET /api/clients/[clientId]/employees?limit=50
 * (CareerFitScore / SCIP: graceful empty states — TODO Step 23)
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Star, TrendingUp, GitBranch, Loader2, UserCheck, FlaskConical, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────

interface CandidateRow {
    id: string;
    name: string;
    email: string;
    fitScore: number;   // overall score as proxy
    adapt16Avg: number; // same proxy until CompetencyScore available
    isInternal: boolean;
}

// ── Hire vs Develop logic ─────────────────────────────────────────────────

/** Returns recommendation based on best internal candidate score */
function hireOrDevelop(internalCandidates: CandidateRow[]): {
    recommendation: "Develop Internal" | "Hire External" | null;
    reason: string;
} {
    if (internalCandidates.length === 0) {
        return { recommendation: null, reason: "No internal candidates scored yet." };
    }
    const bestScore = Math.max(...internalCandidates.map(c => c.fitScore));
    if (bestScore >= 70) {
        return {
            recommendation: "Develop Internal",
            reason: `Top internal candidate scores ${bestScore}% — meets L3+ threshold.`,
        };
    }
    return {
        recommendation: "Hire External",
        reason: `Best internal score is ${bestScore}% — below the 70% development threshold.`,
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function ScoreCell({ score, label }: { score: number | null; label: string }) {
    if (score == null) return <td className="px-3 py-3 text-center text-xs text-gray-300">—</td>;
    const color = score >= 70 ? "text-green-700" : score >= 50 ? "text-amber-600" : "text-red-500";
    return (
        <td className="px-3 py-3 text-center">
            <span className={`text-sm font-semibold tabular-nums ${color}`}>{score}%</span>
            <p className="text-[10px] text-gray-400">{label}</p>
        </td>
    );
}

function MetricCard({ title, value, sub, icon, iconBg }: {
    title: string; value: React.ReactNode; sub: React.ReactNode; icon: React.ReactNode; iconBg: string;
}) {
    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</CardTitle>
                <div className={`p-2 rounded-full ${iconBg}`}>{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 leading-tight">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{sub}</div>
            </CardContent>
        </Card>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function HiringManagerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [candidates, setCandidates] = useState<CandidateRow[]>([]);
    const [teamAvg, setTeamAvg] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (status === "unauthenticated") router.replace("/assessments/login"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated" || !session) return;
        const user = session.user as any;
        const clientId: string | undefined = user.clientId ?? user.tenantId;
        if (!clientId) { setLoading(false); return; }

        Promise.all([
            fetch(`/api/clients/${clientId}/dashboard/stats`).then(r => r.ok ? r.json() : null),
            fetch(`/api/clients/${clientId}/employees?limit=50`).then(r => r.ok ? r.json() : { data: [] }),
        ]).then(([stats, empRaw]) => {
            setTeamAvg(stats?.performance?.overall ?? 0);
            const empArr = Array.isArray(empRaw) ? empRaw : (empRaw?.data ?? []);
            const rows: CandidateRow[] = empArr
                .filter((e: any) => e.overallScore != null || e.lastScore != null)
                .map((e: any) => {
                    const score = e.overallScore ?? e.lastScore ?? 0;
                    return {
                        id: e.id,
                        name: e.name ?? "—",
                        email: e.email ?? "—",
                        fitScore: score,
                        adapt16Avg: score, // proxy until CompetencyScore populated
                        isInternal: true,  // employees list = internal; external would come from a different endpoint
                    };
                })
                .sort((a: CandidateRow, b: CandidateRow) => b.fitScore - a.fitScore);
            setCandidates(rows);
        }).catch(console.error).finally(() => setLoading(false));
    }, [session, status]);

    // ── Derived ───────────────────────────────────────────────────────────
    const top3 = candidates.slice(0, 3);
    const internalCandidates = candidates.filter(c => c.isInternal && c.fitScore >= 70);
    const topFitScore = candidates[0]?.fitScore ?? null;
    const { recommendation, reason } = hireOrDevelop(internalCandidates);

    if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hiring Manager Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Candidate comparison, hire vs develop, and team dynamics</p>
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 gap-1">
                        <UserCheck className="h-3.5 w-3.5" />Hiring Manager View
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* ── 4-Metric Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? [1,2,3,4].map(i => (
                        <Card key={i} className="border-none shadow-sm animate-pulse">
                            <CardContent className="pt-6"><div className="h-10 bg-gray-100 rounded" /></CardContent>
                        </Card>
                    )) : (<>
                        <MetricCard
                            title="Top Candidate Score"
                            value={topFitScore != null ? `${topFitScore}%` : "—"}
                            sub="Best fit score in pipeline"
                            icon={<Star className="h-4 w-4 text-amber-500" />} iconBg="bg-amber-50"
                        />
                        <MetricCard
                            title="Internal Promotables"
                            value={internalCandidates.length}
                            sub="Team members scoring ≥ 70%"
                            icon={<Users className="h-4 w-4 text-blue-600" />} iconBg="bg-blue-50"
                        />
                        <MetricCard
                            title="Hire vs Develop"
                            value={recommendation == null ? "—"
                                : recommendation === "Develop Internal"
                                    ? <span className="flex items-center gap-1 text-green-700 text-lg"><ArrowUpCircle className="h-5 w-5" />Develop</span>
                                    : <span className="flex items-center gap-1 text-violet-700 text-lg"><ArrowDownCircle className="h-5 w-5" />Hire</span>}
                            sub={<span className="text-[11px]">{reason}</span>}
                            icon={<GitBranch className="h-4 w-4 text-purple-600" />} iconBg="bg-purple-50"
                        />
                        <MetricCard
                            title="Team ADAPT-16 Avg"
                            value={teamAvg > 0 ? `${teamAvg}%` : "—"}
                            sub="Organisation-wide average"
                            icon={<TrendingUp className="h-4 w-4 text-green-600" />} iconBg="bg-green-50"
                        />
                    </>)}
                </div>

                {/* ── Candidate Comparison ── */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />Top 3 Candidate Comparison
                        </CardTitle>
                        <CardDescription>
                            Side-by-side RBCA fit, ADAPT-16, and SCIP values
                            {/* TODO: replace proxy scores with CompetencyScore + CareerFitScore when routes built */}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                        ) : top3.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                <Users className="h-8 w-8 text-gray-300" />No scored candidates yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Candidate</th>
                                            <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase">RBCA Fit</th>
                                            <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase">ADAPT-16</th>
                                            <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase">SCIP Values</th>
                                            <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {top3.map((c, idx) => (
                                            <tr key={c.id ?? idx} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                                            ${idx === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{c.name}</p>
                                                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{c.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <ScoreCell score={c.fitScore} label="Role fit" />
                                                <ScoreCell score={c.adapt16Avg} label="Readiness" />
                                                {/* SCIP not yet available */}
                                                <td className="px-3 py-3 text-center">
                                                    <span className="text-xs text-indigo-500 font-medium">Pending</span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <Badge className={c.isInternal
                                                        ? "bg-blue-100 text-blue-700 border-blue-200 text-[11px]"
                                                        : "bg-violet-100 text-violet-700 border-violet-200 text-[11px]"}>
                                                        {c.isInternal ? "Internal" : "External"}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Internal Candidates + SCIP Work Style ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserCheck className="h-4 w-4 text-blue-500" />Internal Promotables
                            </CardTitle>
                            <CardDescription>Team members scoring ≥ 70% — development candidates for role</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                            : internalCandidates.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                    <Users className="h-8 w-8 text-gray-300" />
                                    <p>No internal candidates at L3+ yet.</p>
                                    <p className="text-xs">Members need to score ≥ 70% to appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {internalCandidates.slice(0, 6).map((c, idx) => (
                                        <div key={c.id ?? idx} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                                                {(c.name[0] ?? "?").toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{c.email}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-green-700 tabular-nums">{c.fitScore}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* SCIP Work Style Clustering */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FlaskConical className="h-4 w-4 text-indigo-500" />Team Work Style (SCIP)
                            </CardTitle>
                            <CardDescription>Work style clustering and dynamics from SCIP instrument</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center py-8 gap-3 text-center">
                                <div className="p-3 bg-indigo-50 rounded-full">
                                    <FlaskConical className="h-6 w-6 text-indigo-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">SCIP assessment required</p>
                                <p className="text-xs text-gray-400 max-w-[240px]">
                                    Work style clusters are derived from SCIP instrument responses.
                                    Deploy SCIP to understand team dynamics and new hire compatibility.
                                </p>
                                {/* TODO: wire to SCIP work-style clustering endpoint in Step 23 */}
                                <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 text-xs">
                                    Pending SCIP deployment
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
