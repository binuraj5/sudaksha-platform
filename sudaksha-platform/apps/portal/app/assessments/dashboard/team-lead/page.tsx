"use client";

/**
 * Team Lead Dashboard — /assessments/dashboard/team-lead
 * SEPL/INT/2026/IMPL-STEPS-01 Step 12
 *
 * Shows:
 *  • 4-metric summary row (readiness %, critical gaps, top scorer, next re-assessment)
 *  • Bottom-5 competencies horizontal bar chart (GapAnalysisChart)
 *  • Top-3 TNI cards (urgency badge, title, business consequence)
 *  • Team member list (name, role, overall score, status badge)
 *
 * All data is fetched from existing /api/clients/[clientId]/* endpoints.
 * clientId is sourced from the session (user.clientId or user.tenantId).
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TniCard, TniCardSkeleton, type TniItem } from "@/components/Dashboard/TniCard";
import {
    Users, AlertTriangle, Trophy, CalendarClock,
    Loader2, ShieldAlert, TrendingDown, CheckCircle2,
    Clock, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GapAnalysisChart, type GapData } from "@/components/Dashboard/GapAnalysisChart";

// ── Types ───────────────────────────────────────────────────────────────────

interface StatsResponse {
    employees: { total: number; active: number; inactive: number; trend: number };
    assessments: { pending: number; completed: number; avgScore: number };
    performance: { overall: number; byDepartment: { name: string; score: number }[] };
}

interface MemberRow {
    id: string;
    name: string;
    email: string;
    role?: string;
    status: string;
    overallScore?: number | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
    switch (status?.toUpperCase()) {
        case "ACTIVE":
            return <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>;
        case "INACTIVE":
            return <Badge className="bg-gray-100 text-gray-600 border-gray-200 gap-1"><XCircle className="h-3 w-3" />Inactive</Badge>;
        case "PENDING":
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
        default:
            return <Badge variant="outline">{status ?? "—"}</Badge>;
    }
}

// ── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <Card className="border-none shadow-sm animate-pulse">
            <CardHeader className="pb-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
            </CardContent>
        </Card>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function TeamLeadDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [gapData, setGapData] = useState<GapData[]>([]);
    const [members, setMembers] = useState<MemberRow[]>([]);
    const [loading, setLoading] = useState(true);

    // Redirect if unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") router.replace("/assessments/login");
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated" || !session) return;

        const user = session.user as any;
        const clientId: string | undefined = user.clientId ?? user.tenantId;

        if (!clientId) {
            setLoading(false);
            return;
        }

        // Fetch all data in parallel
        Promise.all([
            fetch(`/api/clients/${clientId}/dashboard/stats`).then(r => r.ok ? r.json() : null),
            fetch(`/api/clients/${clientId}/dashboard/gap-analysis`).then(r => r.ok ? r.json() : []),
            fetch(`/api/clients/${clientId}/employees`).then(r => r.ok ? r.json() : []),
        ])
            .then(([statsData, gapRaw, empRaw]) => {
                setStats(statsData ?? null);

                // Bottom-5 competencies by currentLevel (ascending = worst first)
                const sorted = (Array.isArray(gapRaw) ? gapRaw : [])
                    .sort((a: GapData, b: GapData) => a.currentLevel - b.currentLevel)
                    .slice(0, 5);
                setGapData(sorted);

                // Normalise employee list
                const empList: MemberRow[] = (Array.isArray(empRaw) ? empRaw : empRaw?.employees ?? [])
                    .slice(0, 20)
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

    // ── Derived metrics ──────────────────────────────────────────────────────

    const readinessPct = stats?.performance.overall ?? 0;

    const criticalGaps = gapData.filter(g => g.gap === "HIGH").length;

    const topScorer = members.length > 0
        ? members.reduce((best, m) =>
            (m.overallScore ?? 0) > (best.overallScore ?? 0) ? m : best,
            members[0]
        )
        : null;

    // Placeholder: days until next re-assessment (would come from a schedule API)
    const daysUntilReassessment: number | null = null;

    // Top-3 TNI: highest-gap items
    const topTni: TniItem[] = (gapData as TniItem[])
        .sort((a, b) => (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel))
        .slice(0, 3);

    // ── Render ───────────────────────────────────────────────────────────────

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
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Team Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Team performance, readiness, and development priorities
                        </p>
                    </div>
                    <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Team Lead View
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* ── 4-Metric Summary Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                    ) : (<>
                        {/* 1. Team Readiness */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Team Readiness
                                </CardTitle>
                                <div className="p-2 bg-blue-50 rounded-full">
                                    <TrendingDown className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{readinessPct}%</div>
                                <p className="text-xs text-gray-500 mt-1">Average assessment score</p>
                            </CardContent>
                        </Card>

                        {/* 2. Critical Gaps */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Critical Gaps
                                </CardTitle>
                                <div className="p-2 bg-red-50 rounded-full">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{criticalGaps}</div>
                                <p className="text-xs text-gray-500 mt-1">Competencies with HIGH gap</p>
                            </CardContent>
                        </Card>

                        {/* 3. Top Scorer */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Top Performer
                                </CardTitle>
                                <div className="p-2 bg-amber-50 rounded-full">
                                    <Trophy className="h-4 w-4 text-amber-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-gray-900 truncate">
                                    {topScorer?.name ?? "—"}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {topScorer?.overallScore != null
                                        ? `Score: ${topScorer.overallScore}%`
                                        : "No scores yet"}
                                </p>
                            </CardContent>
                        </Card>

                        {/* 4. Next Re-assessment */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Next Re-assessment
                                </CardTitle>
                                <div className="p-2 bg-purple-50 rounded-full">
                                    <CalendarClock className="h-4 w-4 text-purple-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">
                                    {daysUntilReassessment != null ? `${daysUntilReassessment}d` : "—"}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {daysUntilReassessment != null ? "days remaining" : "No schedule set"}
                                </p>
                            </CardContent>
                        </Card>
                    </>)}
                </div>

                {/* ── Bottom-5 Competencies Chart + TNI Cards ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart spans 2 cols */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <Card className="h-[400px] animate-pulse border-none shadow-sm">
                                <div className="h-full bg-gray-100 rounded-lg" />
                            </Card>
                        ) : (
                            <GapAnalysisChart data={gapData} />
                        )}
                    </div>

                    {/* TNI cards */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Top Training Needs
                            </h2>
                        </div>
                        {loading ? (
                            [1, 2, 3].map(i => <TniCardSkeleton key={i} />)
                        ) : topTni.length === 0 ? (
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-6 text-center text-sm text-gray-400">
                                    No training needs identified yet.
                                </CardContent>
                            </Card>
                        ) : (
                            topTni.map((item, idx) => (
                                <TniCard key={idx} item={item} />
                            ))
                        )}
                    </div>
                </div>

                {/* ── Team Member List ── */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4 text-gray-500" />
                            Team Members
                        </CardTitle>
                        <CardDescription>
                            {members.length > 0
                                ? `Showing ${members.length} team member${members.length !== 1 ? "s" : ""}`
                                : "No team members found"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : members.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                <ShieldAlert className="h-8 w-8 text-gray-300" />
                                No team members available. Assign members to this team first.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Name</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Role</th>
                                            <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Score</th>
                                            <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((m, idx) => (
                                            <tr
                                                key={m.id ?? idx}
                                                className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{m.name}</div>
                                                    <div className="text-xs text-gray-400">{m.email}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{m.role ?? "—"}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {m.overallScore != null ? (
                                                        <span className={`font-semibold ${m.overallScore >= 70 ? "text-green-600" : m.overallScore >= 40 ? "text-amber-600" : "text-red-500"}`}>
                                                            {m.overallScore}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {statusBadge(m.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
