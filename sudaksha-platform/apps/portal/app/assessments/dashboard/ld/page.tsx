"use client";

/**
 * L&D Dashboard — /assessments/dashboard/ld
 * SEPL/INT/2026/IMPL-STEPS-01 Step 14
 *
 * Shows:
 *  • 4 metrics: Open TNI items / Active programmes / Avg pre→post delta / Training ROI score
 *  • Programme progress list (Activity.type = CURRICULUM/BOOTCAMP, real data)
 *  • TNI → Programme linkage table (gap: linked vs unlinked TNI items)
 *  • SCIP learning style insight panel (placeholder — Step 23)
 *
 * APIs used:
 *   GET /api/clients/[clientId]/dashboard/gap-analysis   → open TNI items
 *   GET /api/v1/activities?type=CURRICULUM&status=ACTIVE  → active programmes
 *   GET /api/v1/activities?type=BOOTCAMP&status=ACTIVE    → active bootcamps
 * (AssessmentDelta, SCIP: no routes yet — graceful empty states)
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    BookOpen, Play, TrendingUp, BarChart2,
    Loader2, Link2, Link2Off, FlaskConical,
    CheckCircle2, AlertCircle, Users
} from "lucide-react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TniCard, TniCardSkeleton, type TniItem } from "@/components/Dashboard/TniCard";

// ── Types ───────────────────────────────────────────────────────────────────

interface Programme {
    id: string;
    name: string;
    type: string;
    status: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    _count?: { members: number; orgUnits: number };
    // completion derived from assessments if available
    completionPct?: number | null;
    // linked competencies — populated from metadata or assessment linkage
    linkedCompetencies?: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Very simple heuristic: if a programme name or description mentions a
 * competency name, consider it "linked". Full linkage query would go through
 * ActivityAssessment → AssessmentModel → AssessmentComponent → competency,
 * which requires a dedicated API. For now we match on name substring.
 */
function linkTniToProgramme(
    tniItem: TniItem,
    programmes: Programme[]
): Programme | null {
    const needle = tniItem.competency.toLowerCase();
    return programmes.find(p =>
        p.name.toLowerCase().includes(needle) ||
        (p.description ?? "").toLowerCase().includes(needle) ||
        (p.linkedCompetencies ?? []).some(c => c.toLowerCase().includes(needle))
    ) ?? null;
}

function statusBadge(status: string) {
    switch (status?.toUpperCase()) {
        case "ACTIVE":
            return <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 text-[11px]"><Play className="h-3 w-3" />Active</Badge>;
        case "COMPLETED":
            return <Badge className="bg-gray-100 text-gray-600 border-gray-200 gap-1 text-[11px]"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
        case "DRAFT":
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 text-[11px]"><AlertCircle className="h-3 w-3" />Draft</Badge>;
        default:
            return <Badge variant="outline" className="text-[11px]">{status ?? "—"}</Badge>;
    }
}

function typeBadge(type: string) {
    const labels: Record<string, string> = {
        CURRICULUM: "Curriculum",
        BOOTCAMP: "Bootcamp",
        COURSE: "Course",
        PROJECT: "Project",
        INITIATIVE: "Initiative",
    };
    return (
        <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200">
            {labels[type] ?? type}
        </Badge>
    );
}

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

export default function LDDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [tniItems, setTniItems] = useState<TniItem[]>([]);
    const [programmes, setProgrammes] = useState<Programme[]>([]);
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
            // TNI items (gap analysis)
            fetch(`/api/clients/${clientId}/dashboard/gap-analysis`)
                .then(r => r.ok ? r.json() : []),
            // Active curriculum/bootcamp programmes from v1 API (tenant-scoped via session)
            fetch(`/api/v1/activities?type=CURRICULUM&status=ACTIVE&pageSize=50`)
                .then(r => r.ok ? r.json() : { data: [] }),
            fetch(`/api/v1/activities?type=BOOTCAMP&status=ACTIVE&pageSize=50`)
                .then(r => r.ok ? r.json() : { data: [] }),
        ])
            .then(([gapRaw, curriculaRaw, bootcampsRaw]) => {
                setTniItems(Array.isArray(gapRaw) ? gapRaw : []);

                const curricula: Programme[] = (curriculaRaw?.data ?? curriculaRaw ?? []).map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    status: a.status,
                    startDate: a.startDate,
                    endDate: a.endDate,
                    description: a.description,
                    _count: a._count,
                    completionPct: a.completionPercentage ?? null,
                    linkedCompetencies: a.metadata?.competencies ?? [],
                }));
                const bootcamps: Programme[] = (bootcampsRaw?.data ?? bootcampsRaw ?? []).map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    status: a.status,
                    startDate: a.startDate,
                    endDate: a.endDate,
                    description: a.description,
                    _count: a._count,
                    completionPct: a.completionPercentage ?? null,
                    linkedCompetencies: a.metadata?.competencies ?? [],
                }));
                setProgrammes([...curricula, ...bootcamps]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [session, status]);

    // ── Derived ──────────────────────────────────────────────────────────────

    const openTniCount = tniItems.filter(t => t.gap !== "LOW").length;
    const activeProgrammeCount = programmes.length;
    // AssessmentDelta: no route yet — always null
    const avgDelta: number | null = null;
    // ROI score: placeholder — would come from a future analytics endpoint
    const roiScore: number | null = null;

    // TNI → Programme linkage
    const linked = tniItems.filter(t => linkTniToProgramme(t, programmes) !== null);
    const unlinked = tniItems.filter(t => linkTniToProgramme(t, programmes) === null);

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
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">L&amp;D Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Programme delivery, training needs, and learning effectiveness
                        </p>
                    </div>
                    <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50 gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        Learning &amp; Development View
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* ── 4-Metric Summary Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? [1, 2, 3, 4].map(i => <MetricSkeleton key={i} />) : (<>
                        {/* 1. Open TNI Items */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Open TNI Items</CardTitle>
                                <div className="p-2 bg-red-50 rounded-full"><AlertCircle className="h-4 w-4 text-red-500" /></div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{openTniCount}</div>
                                <p className="text-xs text-gray-500 mt-1">Critical or High gaps</p>
                            </CardContent>
                        </Card>

                        {/* 2. Active Programmes */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Programmes</CardTitle>
                                <div className="p-2 bg-blue-50 rounded-full"><Play className="h-4 w-4 text-blue-600" /></div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{activeProgrammeCount}</div>
                                <p className="text-xs text-gray-500 mt-1">Curricula &amp; bootcamps</p>
                            </CardContent>
                        </Card>

                        {/* 3. Avg Pre→Post Delta */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Score Delta</CardTitle>
                                <div className="p-2 bg-green-50 rounded-full"><TrendingUp className="h-4 w-4 text-green-600" /></div>
                            </CardHeader>
                            <CardContent>
                                {avgDelta != null ? (
                                    <>
                                        <div className="text-3xl font-bold text-green-700">+{avgDelta}%</div>
                                        <p className="text-xs text-gray-500 mt-1">Pre→post improvement</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-lg font-semibold text-gray-400 mt-1">—</div>
                                        {/* TODO: wire to /api/clients/[clientId]/delta once AssessmentDelta routes built */}
                                        <p className="text-xs text-amber-600 mt-1 font-medium">No delta data yet</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* 4. Training ROI Score */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Training ROI</CardTitle>
                                <div className="p-2 bg-purple-50 rounded-full"><BarChart2 className="h-4 w-4 text-purple-600" /></div>
                            </CardHeader>
                            <CardContent>
                                {roiScore != null ? (
                                    <>
                                        <div className="text-3xl font-bold text-gray-900">{roiScore}%</div>
                                        <p className="text-xs text-gray-500 mt-1">Competency gain per programme</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-lg font-semibold text-gray-400 mt-1">—</div>
                                        <p className="text-xs text-gray-400 mt-1">Requires delta data</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>)}
                </div>

                {/* ── Programme Progress List ── */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            Active Programmes
                        </CardTitle>
                        <CardDescription>
                            Curricula and bootcamps currently running — enrolment and completion status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : programmes.length === 0 ? (
                            <div className="py-12 flex flex-col items-center gap-3 text-center">
                                <BookOpen className="h-8 w-8 text-gray-300" />
                                <p className="text-sm text-gray-400">No active programmes found.</p>
                                <p className="text-xs text-gray-400">
                                    Create a Curriculum or Bootcamp activity to track it here.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Programme</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Enrolled</th>
                                            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Completion</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {programmes.map((p, idx) => (
                                            <tr key={p.id ?? idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{p.name}</p>
                                                    {p.description && (
                                                        <p className="text-xs text-gray-400 truncate max-w-[280px]">{p.description}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{typeBadge(p.type)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="flex items-center justify-center gap-1 text-gray-600">
                                                        <Users className="h-3.5 w-3.5 text-gray-400" />
                                                        {p._count?.members ?? 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {p.completionPct != null ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                                                                <div
                                                                    className="h-1.5 rounded-full bg-blue-400"
                                                                    style={{ width: `${Math.min(100, p.completionPct)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-500 tabular-nums shrink-0">
                                                                {p.completionPct}%
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-300 flex justify-center">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{statusBadge(p.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── TNI → Programme Linkage + SCIP Panel ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* TNI Linkage */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                TNI → Programme Coverage
                            </h2>
                            <p className="text-xs text-gray-400">
                                Which training needs have a linked programme, and which are gaps.
                            </p>
                        </div>

                        {loading ? (
                            [1, 2, 3].map(i => <TniCardSkeleton key={i} />)
                        ) : tniItems.length === 0 ? (
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-6 text-center text-sm text-gray-400">
                                    No training need items identified yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Linked items */}
                                {linked.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 uppercase tracking-wide">
                                            <Link2 className="h-3.5 w-3.5" />
                                            Covered by programme ({linked.length})
                                        </div>
                                        {linked.map((item, idx) => {
                                            const prog = linkTniToProgramme(item, programmes)!;
                                            return (
                                                <TniCard
                                                    key={idx}
                                                    item={item}
                                                    consequence={`Addressed by: ${prog.name}`}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Unlinked items */}
                                {unlinked.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 uppercase tracking-wide">
                                            <Link2Off className="h-3.5 w-3.5" />
                                            No programme linked ({unlinked.length})
                                        </div>
                                        {unlinked.map((item, idx) => (
                                            <TniCard
                                                key={idx}
                                                item={item}
                                                consequence={`No active programme addresses this gap yet.`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SCIP Learning Style Panel */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                Learning Style Insights
                            </h2>
                            <p className="text-xs text-gray-400">
                                SCIP instrument results — personalised delivery recommendations.
                            </p>
                        </div>
                        <Card className="border-none shadow-sm flex-1">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
                                <div className="p-4 bg-indigo-50 rounded-full">
                                    <FlaskConical className="h-8 w-8 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600">
                                        SCIP assessment required
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                                        Learning style data is generated from SCIP instrument scores.
                                        Deploy the SCIP assessment to your team to unlock personalised
                                        delivery recommendations.
                                    </p>
                                </div>
                                {/* TODO: wire to SCIP learning style API in Step 23 */}
                                <Badge
                                    variant="outline"
                                    className="text-indigo-600 border-indigo-200 bg-indigo-50 text-xs"
                                >
                                    Pending SCIP deployment
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}
