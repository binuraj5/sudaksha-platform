import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, AlertTriangle, TrendingDown } from "lucide-react";
import Link from "next/link";
import { generateTNI, type GapPriority } from "@/lib/training-recommendations";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD"];

import { getGapBand, GAP_BAND_PRIORITY, GapBand } from "@/lib/tni-utils";

const PRIORITY_COLORS: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700 border-red-200",
    MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
};

export default async function TNIPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string };
    const isAdmin = ADMIN_ROLES.includes(u.role ?? "") || ADMIN_ROLES.includes(u.userType ?? "");
    const hasAccess = u.userType === "SUPER_ADMIN" || u.tenantSlug === slug;
    if (!hasAccess || !isAdmin) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    // Fetch all completed assessments for the tenant with competency data
    const assessments = await (prisma as any).memberAssessment.findMany({
        where: {
            status: "COMPLETED",
            member: { tenantId: tenant.id },
        },
        include: {
            member: {
                select: {
                    name: true,
                    currentRole: {
                        include: {
                            competencies: {
                                include: { competency: true }
                            }
                        }
                    }
                }
            },
            assessmentModel: {
                include: {
                    components: {
                        include: { competency: true }
                    }
                }
            }
        },
    });

    // Build aggregated gap data across all members
    // competencyId → { name, gaps by member }
    const competencyGapMap: Record<string, {
        name: string;
        category: string;
        gaps: Array<{ memberId: string; memberName: string; gap: number; priority: GapPriority; requiredLevel: string; achievedLevel: string }>;
    }> = {};

    for (const assessment of assessments) {
        const member = assessment.member;
        const role = member?.currentRole;
        if (!role?.competencies?.length) continue;

        // Get UAM component scores for this member's assessment
        const user = await prisma.user.findFirst({
            where: { email: { equals: member.email ?? "", mode: "insensitive" } },
            select: { id: true }
        });
        if (!user) continue;

        const uam = await (prisma as any).userAssessmentModel.findFirst({
            where: { userId: user.id, modelId: assessment.assessmentModelId },
            orderBy: { createdAt: "desc" },
            include: {
                componentResults: {
                    include: { component: true }
                }
            }
        });
        if (!uam) continue;

        // Build competency scores from component results
        const compScores: Record<string, number[]> = {};
        for (const cr of uam.componentResults) {
            const compId = cr.component?.competencyId;
            if (!compId) continue;
            const pct = cr.percentage ?? (cr.maxScore > 0 ? (cr.score / cr.maxScore) * 100 : 0);
            if (!compScores[compId]) compScores[compId] = [];
            compScores[compId].push(pct);
        }

        for (const rc of role.competencies) {
            const compId = rc.competencyId;
            const scores = compScores[compId];
            
            // Bug 1 Fix: Only include if componentResult exists for this session
            if (!scores || scores.length === 0) continue;
            
            const avgPct = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
            const gapBand = getGapBand(avgPct, rc.requiredLevel);
            const priority = GAP_BAND_PRIORITY[gapBand];

            if ((priority as string) === "NONE" || (priority as string) === "EXCEEDS") continue;

            if (!competencyGapMap[compId]) {
                competencyGapMap[compId] = {
                    name: rc.competency.name,
                    category: rc.competency.category ?? "",
                    gaps: [],
                };
            }
            competencyGapMap[compId].gaps.push({
                memberId: assessment.memberId,
                memberName: member.name ?? "Unknown",
                gap: Math.max(0, 100 - avgPct), // using a generic positive gap visual for now
                priority: priority as GapPriority,
                requiredLevel: rc.requiredLevel,
                achievedLevel: `${Math.round(avgPct)}%`,
            });
        }
    }

    // Aggregate to TNI summary per competency
    const tniByCompetency = Object.values(competencyGapMap)
        .map(comp => {
            const highCount = comp.gaps.filter(g => g.priority === "HIGH").length;
            const medCount = comp.gaps.filter(g => g.priority === "MEDIUM").length;
            const topGap = comp.gaps.reduce((max, g) => g.gap > max.gap ? g : max, comp.gaps[0]);
            const recommendations = generateTNI([{
                name: comp.name,
                gap: topGap.gap,
                priority: topGap.priority,
                requiredLevel: topGap.requiredLevel,
                achievedLevel: topGap.achievedLevel,
            }]);
            return { ...comp, highCount, medCount, totalAffected: comp.gaps.length, recommendations };
        })
        .sort((a, b) => b.highCount - a.highCount || b.totalAffected - a.totalAffected);

    const totalHigh = tniByCompetency.reduce((s, c) => s + c.highCount, 0);
    const totalMedium = tniByCompetency.reduce((s, c) => s + c.medCount, 0);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-xl">
                        <BookOpen className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Training Needs Identification</h1>
                        <p className="text-gray-500 font-medium">Auto-generated from competency gap analysis across {assessments.length} completed assessments</p>
                    </div>
                </div>
                <Link
                    href={`/assessments/org/${slug}/results`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    View All Results
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Summary chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-red-50 border-red-100">
                    <CardContent className="p-4">
                        <div className="text-3xl font-black text-red-700">{totalHigh}</div>
                        <div className="text-xs font-bold text-red-500 uppercase tracking-wider mt-1">High Priority Gaps</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-100">
                    <CardContent className="p-4">
                        <div className="text-3xl font-black text-amber-700">{totalMedium}</div>
                        <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mt-1">Medium Priority Gaps</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-4">
                        <div className="text-3xl font-black text-blue-700">{tniByCompetency.length}</div>
                        <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mt-1">Competencies Needing Dev</div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-100">
                    <CardContent className="p-4">
                        <div className="text-3xl font-black text-indigo-700">{assessments.length}</div>
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mt-1">Assessments Analysed</div>
                    </CardContent>
                </Card>
            </div>

            {tniByCompetency.length === 0 ? (
                <Card className="py-20 text-center border-dashed">
                    <CardContent>
                        <TrendingDown className="h-12 w-12 text-gray-200 mx-auto" />
                        <h3 className="mt-4 text-xl font-black text-gray-900">No gaps identified</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">All members with assigned roles meet or exceed their role competency requirements.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {tniByCompetency.map(comp => (
                        <Card key={comp.name} className="border-gray-100 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-black text-gray-900">{comp.name}</CardTitle>
                                        <p className="text-xs text-gray-400 font-mono uppercase mt-0.5">{comp.category}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {comp.highCount > 0 && (
                                            <Badge variant="outline" className={`text-[10px] font-bold ${PRIORITY_COLORS.HIGH}`}>
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                {comp.highCount} HIGH
                                            </Badge>
                                        )}
                                        {comp.medCount > 0 && (
                                            <Badge variant="outline" className={`text-[10px] font-bold ${PRIORITY_COLORS.MEDIUM}`}>
                                                {comp.medCount} MEDIUM
                                            </Badge>
                                        )}
                                        <span className="text-xs text-gray-400 font-mono">{comp.totalAffected} member{comp.totalAffected !== 1 ? "s" : ""}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Affected members */}
                                <div className="flex flex-wrap gap-2">
                                    {comp.gaps.slice(0, 8).map((g, i) => (
                                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                                            {g.memberName} <span className="text-gray-400">({g.achievedLevel} → {g.requiredLevel})</span>
                                        </span>
                                    ))}
                                    {comp.gaps.length > 8 && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">+{comp.gaps.length - 8} more</span>
                                    )}
                                </div>

                                {/* Recommended programmes */}
                                {comp.recommendations.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recommended Training</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {comp.recommendations.flatMap(r => r.programmes).map((prog, i) => (
                                                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{prog.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{prog.provider}</p>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <Badge variant="outline" className="text-[10px] bg-white">{prog.format}</Badge>
                                                            <p className="text-[10px] text-gray-400 mt-1">{prog.durationDays}d</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{prog.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
