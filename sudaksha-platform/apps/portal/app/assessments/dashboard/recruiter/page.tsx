"use client";
/**
 * Recruiter Dashboard — /assessments/dashboard/recruiter
 * SEPL/INT/2026/IMPL-STEPS-01 Step 16.1
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Star, ShieldAlert, Clock, Loader2, Briefcase, FlaskConical, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoleRow { id: string; name: string; department?: string; _count?: { competencies: number } }
interface CandidateRow { id: string; name: string; email: string; fitScore: number }

function fitBadge(score: number) {
    if (score >= 75) return <Badge className="bg-green-100 text-green-700 border-green-200">Shortlisted</Badge>;
    if (score >= 55) return <Badge className="bg-amber-100 text-amber-700 border-amber-200">In Review</Badge>;
    return <Badge className="bg-gray-100 text-gray-500 border-gray-200">Not Shortlisted</Badge>;
}

function FitBar({ score }: { score: number }) {
    const color = score >= 75 ? "bg-green-400" : score >= 55 ? "bg-amber-400" : "bg-red-400";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[48px]">
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, score)}%` }} />
            </div>
            <span className="text-xs font-semibold tabular-nums w-8 text-right">{score}%</span>
        </div>
    );
}

function MetricCard({ title, value, sub, icon, iconBg }: {
    title: string; value: React.ReactNode; sub: string;
    icon: React.ReactNode; iconBg: string;
}) {
    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</CardTitle>
                <div className={`p-2 rounded-full ${iconBg}`}>{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </CardContent>
        </Card>
    );
}

export default function RecruiterDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [roles, setRoles] = useState<RoleRow[]>([]);
    const [candidates, setCandidates] = useState<CandidateRow[]>([]);
    const [assessedCount, setAssessedCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (status === "unauthenticated") router.replace("/assessments/login"); }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated" || !session) return;
        const user = session.user as any;
        const clientId: string | undefined = user.clientId ?? user.tenantId;
        if (!clientId) { setLoading(false); return; }

        Promise.all([
            fetch(`/api/clients/${clientId}/dashboard/stats`).then(r => r.ok ? r.json() : null),
            fetch(`/api/clients/${clientId}/roles?scope=my`).then(r => r.ok ? r.json() : []),
            fetch(`/api/clients/${clientId}/employees?limit=100`).then(r => r.ok ? r.json() : { data: [] }),
        ]).then(([stats, rolesRaw, empRaw]) => {
            setAssessedCount(stats?.assessments?.completed ?? 0);
            setRoles((Array.isArray(rolesRaw) ? rolesRaw : rolesRaw?.roles ?? []).slice(0, 10).map((r: any) => ({
                id: r.id, name: r.name ?? "Unnamed", department: r.department ?? r.tenant?.name ?? "—", _count: r._count,
            })));
            const empArr = Array.isArray(empRaw) ? empRaw : (empRaw?.data ?? []);
            setCandidates(
                empArr.filter((e: any) => e.overallScore != null || e.lastScore != null)
                    .map((e: any) => ({ id: e.id, name: e.name ?? "—", email: e.email ?? "—", fitScore: e.overallScore ?? e.lastScore ?? 0 }))
                    .sort((a: CandidateRow, b: CandidateRow) => b.fitScore - a.fitScore)
            );
        }).catch(console.error).finally(() => setLoading(false));
    }, [session, status]);

    const shortlisted = candidates.filter(c => c.fitScore >= 75);

    if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b px-6 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Candidate pipeline, open roles, and fit screening</p>
                    </div>
                    <Badge variant="outline" className="text-violet-700 border-violet-200 bg-violet-50 gap-1">
                        <Briefcase className="h-3.5 w-3.5" />Recruiter View
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? [1,2,3,4].map(i => (
                        <Card key={i} className="border-none shadow-sm animate-pulse">
                            <CardContent className="pt-6"><div className="h-8 bg-gray-100 rounded" /></CardContent>
                        </Card>
                    )) : (<>
                        <MetricCard title="Assessed" value={assessedCount} sub="Completed assessments"
                            icon={<Users className="h-4 w-4 text-blue-600" />} iconBg="bg-blue-50" />
                        <MetricCard title="Shortlisted" value={<span className="text-green-700">{shortlisted.length}</span>} sub="Fit score ≥ 75%"
                            icon={<Star className="h-4 w-4 text-green-600" />} iconBg="bg-green-50" />
                        <MetricCard title="Culture Flags" value="—" sub="Pending SCIP data"
                            icon={<ShieldAlert className="h-4 w-4 text-red-500" />} iconBg="bg-red-50" />
                        <MetricCard title="Avg Time to Shortlist" value="—" sub="No schedule data"
                            icon={<Clock className="h-4 w-4 text-amber-500" />} iconBg="bg-amber-50" />
                    </>)}
                </div>

                {/* Open Roles + Candidate Shortlist */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><Briefcase className="h-4 w-4 text-gray-500" />Open Roles</CardTitle>
                            <CardDescription>Active roles from your organisation</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
                            : roles.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                    <Briefcase className="h-8 w-8 text-gray-300" />No active roles found.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {roles.map((role, idx) => (
                                        <div key={role.id ?? idx} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{role.name}</p>
                                                <p className="text-xs text-gray-400">{role.department} · {role._count?.competencies ?? 0} competencies</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {/* TODO: wire pipeline fill % once CareerFitScore routes built */}
                                                <span className="text-xs text-amber-600 font-medium">Pipeline: —</span>
                                                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><Star className="h-4 w-4 text-amber-500" />Candidate Shortlist</CardTitle>
                            <CardDescription>Sorted by fit score — shortlist threshold 75%</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-4 space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
                            : candidates.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                    <Users className="h-8 w-8 text-gray-300" />No scored candidates yet.
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-gray-50 border-b">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Candidate</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Fit Score</th>
                                        <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr></thead>
                                    <tbody>
                                        {candidates.slice(0, 8).map((c, idx) => (
                                            <tr key={c.id ?? idx} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900 truncate max-w-[140px]">{c.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                                                </td>
                                                <td className="px-4 py-3 w-36"><FitBar score={c.fitScore} /></td>
                                                <td className="px-4 py-3 text-center">{fitBadge(c.fitScore)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Culture Flags */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><FlaskConical className="h-4 w-4 text-indigo-500" />Culture Fit Flags</CardTitle>
                        <CardDescription>Values misalignment via SCIP instrument</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center py-8 gap-3 text-center">
                            <div className="p-3 bg-indigo-50 rounded-full"><FlaskConical className="h-6 w-6 text-indigo-400" /></div>
                            <p className="text-sm font-medium text-gray-500">No SCIP data available</p>
                            <p className="text-xs text-gray-400 max-w-[260px]">Deploy SCIP to surface values misalignment in your candidate pipeline.</p>
                            {/* TODO: wire to SCIP values endpoint in Step 23 */}
                            <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 text-xs">Pending SCIP deployment</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
