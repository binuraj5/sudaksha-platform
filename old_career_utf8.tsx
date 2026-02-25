"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Sparkles,
    Circle,
    Briefcase,
    TrendingUp,
    AlertCircle,
    ChevronRight,
    Target,
    CheckCircle2,
    Clock,
    Loader2,
    Milestone,
    Network,
    Pencil,
} from "lucide-react";
import { toast } from "sonner";

export default function IndividualCareerPage() {
    const [member, setMember] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const memberRes = await fetch("/api/profile");
            const memberData = await memberRes.json();
            if (memberRes.ok && memberData?.id && !memberData.error) {
                setMember(memberData);
                // Use developmentPlan from profile when available (Phase 6: one request)
                if (memberData.developmentPlan && typeof memberData.developmentPlan === "object") {
                    setPlan(memberData.developmentPlan);
                } else {
                    const planRes = await fetch("/api/career/plan/generate");
                    const planData = await planRes.json();
                    if (planRes.ok && planData?.plan) setPlan(planData.plan);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const generatePlan = async () => {
        setGenerating(true);
        try {
            const res = await fetch("/api/career/plan/generate", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setPlan(data.plan);
                toast.success("Development plan generated successfully!");
            } else {
                toast.error(data.error || "Failed to generate plan");
            }
        } catch {
            toast.error("An error occurred during plan generation");
        } finally {
            setGenerating(false);
        }
    };

    const updateActionStatus = async (
        gapIndex: number,
        actionIndex: number,
        status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
    ) => {
        if (!plan) return;
        const updated = JSON.parse(JSON.stringify(plan)) as typeof plan;
        if (updated.gaps[gapIndex]?.actions[actionIndex]) {
            updated.gaps[gapIndex].actions[actionIndex].status = status;
        }
        try {
            const res = await fetch("/api/career/plan/generate", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: updated }),
            });
            const data = await res.json();
            if (data.success) {
                setPlan(data.plan);
                toast.success(status === "COMPLETED" ? "Step marked complete" : "Step updated");
            } else {
                toast.error(data.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update step");
        }
    };

    const planProgress = plan
        ? (() => {
            const total = plan.gaps?.reduce((s: number, g: any) => s + (g.actions?.length ?? 0), 0) ?? 0;
            const completed = plan.gaps?.reduce(
                (s: number, g: any) => s + (g.actions?.filter((a: any) => a.status === "COMPLETED").length ?? 0),
                0
            ) ?? 0;
            return { total, completed, milestones: plan.gaps?.length ?? 0 };
        })()
        : null;

    const gapPercent =
        member?.currentRole?.competencies?.length && member?.aspirationalRole?.competencies?.length
            ? Math.round(
                (member.currentRole.competencies.length / member.aspirationalRole.competencies.length) * 100
            )
            : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="max-w-7xl mx-auto flex justify-center items-center py-16 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    Loading your career profile...
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="max-w-7xl mx-auto text-center py-16 text-gray-500">
                    <p className="mb-4">Member profile not found. Please complete your registration.</p>
                    <Button asChild variant="outline">
                        <Link href="/assessments/individuals/profile">Go to My Details</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
            {/* Header ΓÇô same style as Dashboard / Profile */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Career Hub</h1>
                    <p className="text-gray-500 mt-1">
                        Navigate your professional growth with precision.
                    </p>
                </div>
                <Button
                    onClick={generatePlan}
                    disabled={generating || !member.aspirationalRoleId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                    <Sparkles className="h-4 w-4" />
                    {generating ? "Generating..." : "Auto-Generate Plan"}
                </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-6 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <Target className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <User className="h-4 w-4" /> My Profile
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Dev Plan
                    </TabsTrigger>
                    <TabsTrigger value="org" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <Network className="h-4 w-4" /> Hierarchy
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW ΓÇô from member (profile API with competencies) */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none shadow-md bg-white overflow-hidden">
                            <div className="h-1 bg-indigo-500" />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="text-xs mb-2 text-indigo-600 border-indigo-200 bg-indigo-50">CURRENT ROLE</Badge>
                                        <CardTitle className="text-xl font-semibold text-gray-900">{member.currentRole?.name || "Unassigned"}</CardTitle>
                                    </div>
                                    <Briefcase className="h-5 w-5 text-indigo-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500 text-sm mb-4">
                                    {member.currentRole?.description || "Set your current role in My Details."}
                                </p>
                                {member.currentRole?.competencies?.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Core Competencies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {member.currentRole.competencies.map((rc: any) => (
                                                <Badge key={rc.id} variant="secondary" className="bg-gray-100 text-gray-700 border-none">
                                                    {rc.competency?.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md bg-white overflow-hidden">
                            <div className="h-1 bg-purple-500" />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="text-xs mb-2 text-purple-600 border-purple-200 bg-purple-50">CAREER GOAL</Badge>
                                        <CardTitle className="text-xl font-semibold text-gray-900">{member.aspirationalRole?.name || "Not Set"}</CardTitle>
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {member.aspirationalRole ? (
                                    <>
                                        <p className="text-gray-500 text-sm mb-4">
                                            {member.aspirationalRole.description}
                                        </p>
                                        {gapPercent != null && (
                                            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100 flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Gap to goal</p>
                                                    <p className="text-sm text-gray-600">You match {gapPercent}% of the target role requirements.</p>
                                                </div>
                                            </div>
                                        )}
                                        {member.aspirationalRole.competencies?.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Target competencies</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {member.aspirationalRole.competencies.slice(0, 8).map((rc: any) => (
                                                        <Badge key={rc.id} variant="outline" className="text-gray-600">
                                                            {rc.competency?.name}
                                                        </Badge>
                                                    ))}
                                                    {member.aspirationalRole.competencies.length > 8 && (
                                                        <span className="text-xs text-gray-500">+{member.aspirationalRole.competencies.length - 8} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 mb-4">Set your aspirational role in My Details to see your gap and generate a plan.</p>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href="/assessments/individuals/profile">Edit in My Details</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* MY PROFILE ΓÇô read-only summary from member + careerFormData; edit on My Details (Phase 5) */}
                <TabsContent value="profile" className="mt-0">
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="pb-2">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl text-gray-900">Profile summary</CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                        Your career details from My Details. Edit there to update.
                                    </CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                                    <Link href="/assessments/individuals/profile">
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit in My Details
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Name</p>
                                    <p className="text-gray-900">
                                        {[member.firstName, member.lastName].filter(Boolean).join(" ") || member.name || "ΓÇö"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                    <p className="text-gray-900">{member.email ?? "ΓÇö"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                                    <p className="text-gray-900">{member.phone ?? "ΓÇö"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current role</p>
                                    <p className="text-gray-900">{member.currentRole?.name ?? "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Aspirational role</p>
                                    <p className="text-gray-900">{member.aspirationalRole?.name ?? "Not set"}</p>
                                </div>
                            </div>
                            {member.bio && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bio</p>
                                    <p className="text-gray-700 text-sm">{member.bio}</p>
                                </div>
                            )}
                            {(() => {
                                const form = (member.careerFormData as Record<string, unknown>) || {};
                                const responsibilities = form.responsibilities;
                                const learning = form.learningPreferences;
                                const hasExtra = responsibilities != null || learning != null;
                                if (!hasExtra) return null;
                                return (
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        {responsibilities != null && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Responsibilities</p>
                                                <p className="text-gray-700 text-sm">
                                                    {typeof responsibilities === "string" ? responsibilities : Array.isArray(responsibilities) ? responsibilities.join(", ") : String(responsibilities)}
                                                </p>
                                            </div>
                                        )}
                                        {learning != null && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Learning preferences</p>
                                                <p className="text-gray-700 text-sm">
                                                    {typeof learning === "string" ? learning : Array.isArray(learning) ? learning.join(", ") : String(learning)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DEV PLAN ΓÇô from /api/career/plan/generate (member.developmentPlan) */}
                <TabsContent value="plan" className="mt-0 space-y-6">
                    {plan?.gaps?.length > 0 ? (
                        <div className="space-y-6">
                            <Card className="border-none shadow-md bg-white">
                                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <Badge className="bg-indigo-600 text-white mb-2">PERSONALIZED PLAN</Badge>
                                        <h3 className="text-xl font-bold text-gray-900">Goal: {plan.aspirationalRoleName}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Generated {plan.generatedAt ? new Date(plan.generatedAt).toLocaleDateString() : "ΓÇö"}
                                        </p>
                                    </div>
                                    <Button variant="outline" onClick={generatePlan} disabled={generating}>
                                        Refresh Plan
                                    </Button>
                                </CardContent>
                            </Card>

                            {planProgress && planProgress.total > 0 && (
                                <Card className="border-none shadow-md bg-white">
                                    <CardContent className="p-6 flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <Milestone className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900">{planProgress.milestones}</p>
                                                <p className="text-xs text-gray-500">Milestones</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Target className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900">{planProgress.total}</p>
                                                <p className="text-xs text-gray-500">Total steps</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900">{planProgress.completed} / {planProgress.total}</p>
                                                <p className="text-xs text-gray-500">Completed</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-[120px] h-2 rounded-full bg-gray-200 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-indigo-600 transition-all"
                                                style={{ width: planProgress.total ? `${(planProgress.completed / planProgress.total) * 100}%` : "0%" }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="space-y-4">
                                {plan.gaps.map((gap: any, idx: number) => (
                                    <Card key={idx} className="border-none shadow-md bg-white">
                                        <CardHeader className="pb-2">
                                            <div className="flex flex-wrap justify-between items-start gap-2">
                                                <div>
                                                    <CardTitle className="text-lg text-gray-900">{gap.name}</CardTitle>
                                                    <CardDescription className="text-xs mt-1">
                                                        Current: {gap.currentLevel} ΓåÆ Target: {gap.targetLevel}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        gap.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-200" :
                                                            gap.priority === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                "bg-blue-50 text-blue-700 border-blue-200"
                                                    }
                                                >
                                                    {gap.priority}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {gap.actions?.map((action: any, aidx: number) => (
                                                <div
                                                    key={aidx}
                                                    className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const next = action.status === "COMPLETED" ? "NOT_STARTED" : action.status === "NOT_STARTED" ? "IN_PROGRESS" : "COMPLETED";
                                                            updateActionStatus(idx, aidx, next);
                                                        }}
                                                        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors"
                                                        style={{
                                                            backgroundColor: action.status === "COMPLETED" ? "rgb(34 197 94 / 0.15)" : action.status === "IN_PROGRESS" ? "rgb(99 102 241 / 0.1)" : "rgb(249 250 251)",
                                                            color: action.status === "COMPLETED" ? "rgb(22 163 74)" : action.status === "IN_PROGRESS" ? "rgb(99 102 241)" : "rgb(156 163 175)",
                                                        }}
                                                    >
                                                        {action.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5" /> : action.status === "IN_PROGRESS" ? <Clock className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-medium text-gray-900">{action.title}</span>
                                                            <Badge variant="secondary" className="text-xs">{action.type}</Badge>
                                                            <Badge variant="outline" className="text-xs">{action.status?.replace("_", " ") ?? "NOT_STARTED"}</Badge>
                                                        </div>
                                                        {action.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="border-none shadow-md bg-white">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Sparkles className="h-14 w-14 text-gray-300 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900">No roadmap yet</h2>
                                <p className="text-gray-500 max-w-sm mt-2 mb-6">
                                    Generate a development plan based on your current and aspirational roles.
                                </p>
                                <Button
                                    onClick={generatePlan}
                                    disabled={generating || !member.aspirationalRoleId}
                                    className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                                >
                                    {generating ? "Generating..." : "Build My Roadmap"}
                                </Button>
                                {!member.aspirationalRoleId && (
                                    <p className="text-sm text-amber-600 mt-4">Set your aspirational role in My Details first.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* HIERARCHY ΓÇô placeholder, same card style */}
                <TabsContent value="org" className="mt-0">
                    <Card className="border-none shadow-md bg-white">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Network className="h-14 w-14 text-gray-300 mb-4" />
                            <h2 className="text-xl font-bold text-gray-800">Coming soon</h2>
                            <p className="text-gray-500 max-w-md mt-2">
                                Org visualization and how you connect to the rest of the organization.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            </div>
        </div>
    );
}
