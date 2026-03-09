import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, FileText, ArrowRight, Download, Users } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN", "DEPARTMENT_HEAD"];

export default async function OrgResultsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const u = session.user as { tenantSlug?: string; role?: string; userType?: string; id?: string };
    const isSuperAdmin = u.userType === "SUPER_ADMIN" || u.role === "SUPER_ADMIN";
    const isTenantAdmin = u.role === "TENANT_ADMIN" || u.role === "DEPARTMENT_HEAD";
    const isAdmin = isSuperAdmin || isTenantAdmin;
    const hasAccess = isSuperAdmin || u.tenantSlug === slug;

    if (!hasAccess) {
        redirect(u.tenantSlug ? `/assessments/org/${u.tenantSlug}/dashboard` : "/assessments");
    }

    const basePath = `/assessments/org/${slug}`;

    if (isAdmin) {
        // ── Admin view: show ALL members' completed assessments for this tenant ──
        const memberAssessments = await (prisma as any).memberAssessment.findMany({
            where: {
                status: "COMPLETED",
                member: { tenantId: tenant.id },
            },
            include: {
                assessmentModel: { select: { name: true } },
                member: {
                    select: {
                        name: true,
                        email: true,
                        currentRole: { select: { name: true } },
                        orgUnit: { select: { name: true } },
                    }
                },
            },
            orderBy: { completedAt: "desc" },
        });

        const allResults = memberAssessments.map((a: any) => ({
            id: a.id,
            memberName: a.member.name ?? "—",
            memberEmail: a.member.email ?? "—",
            roleName: a.member.currentRole?.name ?? "—",
            department: a.member.orgUnit?.name ?? "—",
            assessmentName: a.assessmentModel.name,
            score: Math.round(a.overallScore || 0),
            passed: a.passed,
            completedAt: a.completedAt,
            url: `${basePath}/results/${a.id}`,
        }));

        return (
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">All Assessment Results</h1>
                            <p className="text-gray-500 font-medium">{allResults.length} completed assessments across your organisation</p>
                        </div>
                    </div>
                    <a
                        href={`/api/assessments/export/csv?tenantId=${tenant.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Download CSV
                    </a>
                </div>

                {allResults.length === 0 ? (
                    <Card className="py-20 text-center border-dashed rounded-3xl border-2">
                        <CardContent>
                            <FileText className="h-12 w-12 text-gray-200 mx-auto" />
                            <h3 className="mt-4 text-xl font-black text-gray-900">No results yet</h3>
                            <p className="text-gray-500 font-medium max-w-xs mx-auto">No members have completed assessments in this organisation.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-white overflow-hidden shadow-2xl shadow-slate-100 border-none rounded-3xl">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-8">Member</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Role / Dept</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Assessment</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Score</TableHead>
                                    <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Date</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allResults.map((a: any) => (
                                    <TableRow key={a.id} className="border-slate-50 hover:bg-indigo-50/20 transition-colors">
                                        <TableCell className="pl-8 py-4">
                                            <div className="font-bold text-slate-900">{a.memberName}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">{a.memberEmail}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="text-sm font-semibold text-slate-700">{a.roleName}</div>
                                            <div className="text-[11px] text-slate-400">{a.department}</div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600 italic py-4">{a.assessmentName}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-black text-slate-900">{a.score}%</span>
                                                {a.passed ? (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg font-black italic text-[10px]">PASSED</Badge>
                                                ) : (
                                                    <Badge className="bg-rose-50 text-rose-600 border-none rounded-lg font-black italic text-[10px]">BELOW TARGET</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-400 font-mono py-4">
                                            {a.completedAt ? formatDate(a.completedAt) : "N/A"}
                                        </TableCell>
                                        <TableCell className="pr-8">
                                            <Button variant="ghost" className="h-10 hover:bg-white hover:shadow-md rounded-xl font-bold flex gap-2" asChild>
                                                <Link href={a.url}>
                                                    Details
                                                    <ArrowRight className="h-4 w-4 text-indigo-500" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </div>
        );
    }

    // ── Employee view: show own completed assessments ────────────────────────
    const [completedMemberAssessments, completedProjectAssessments] = await Promise.all([
        (prisma as any).memberAssessment.findMany({
            where: {
                memberId: session.user.id,
                status: "COMPLETED",
            },
            include: {
                assessmentModel: { select: { name: true } }
            },
            orderBy: { completedAt: "desc" },
        }),
        (prisma as any).projectUserAssessment.findMany({
            where: {
                userId: session.user.id,
                status: "COMPLETED",
            },
            include: {
                projectAssignment: {
                    include: {
                        model: { select: { name: true } },
                        project: { select: { name: true } },
                    },
                },
            },
            orderBy: { completedAt: "desc" },
        })
    ]);

    const allResults = [
        ...completedMemberAssessments.map((a: any) => ({
            id: a.id,
            name: a.assessmentModel.name,
            context: "Personal",
            score: a.overallScore || 0,
            passed: a.passed,
            completedAt: a.completedAt,
            url: `${basePath}/results/${a.id}`
        })),
        ...completedProjectAssessments.map((a: any) => ({
            id: a.id,
            name: a.projectAssignment.model.name,
            context: a.projectAssignment.project.name,
            score: a.overallScore || 0,
            passed: a.passed,
            completedAt: a.completedAt,
            url: `${basePath}/results/${a.id}`
        }))
    ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto text-indigo-950">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                    <Trophy className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Assessment Scores</h1>
                    <p className="text-gray-500 font-medium">Your scores and performance insights</p>
                </div>
            </div>

            {allResults.length === 0 ? (
                <Card className="py-20 text-center border-dashed rounded-3xl border-2">
                    <CardContent>
                        <FileText className="h-12 w-12 text-gray-200 mx-auto" />
                        <h3 className="mt-4 text-xl font-black text-gray-900">No results found</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">Complete your first assessment to unlock your score history and career insights.</p>
                        <Button asChild className="mt-8 bg-indigo-600 hover:bg-black rounded-xl h-12 px-8 font-black italic shadow-lg shadow-indigo-100" variant="secondary">
                            <Link href={`${basePath}/assessments`}>Explore Assessments</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-white overflow-hidden shadow-2xl shadow-slate-100 border-none rounded-3xl">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100">
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-8">Assessment</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Context</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Performance</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Completion</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allResults.map((a) => (
                                <TableRow key={a.id} className="border-slate-50 hover:bg-indigo-50/20 transition-colors">
                                    <TableCell className="pl-8 py-6">
                                        <div className="font-black italic text-slate-900 text-lg">{a.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ASSESSMENT EVALUATION</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500 font-bold italic">
                                        {a.context}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-black text-slate-900">{a.score}%</span>
                                            {a.passed ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg font-black italic">PASSED</Badge>
                                            ) : (
                                                <Badge className="bg-rose-50 text-rose-600 border-none rounded-lg font-black italic">FAILED</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-400 font-mono">
                                        {a.completedAt ? formatDate(a.completedAt) : "N/A"}
                                    </TableCell>
                                    <TableCell className="pr-8">
                                        <Button variant="ghost" className="h-10 hover:bg-white hover:shadow-md rounded-xl font-bold flex gap-2" asChild>
                                            <Link href={a.url}>
                                                Details
                                                <ArrowRight className="h-4 w-4 text-indigo-500" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
