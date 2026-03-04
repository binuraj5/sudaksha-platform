"use client";

import { useEffect, useState, useCallback } from "react";
import { CareerProfileForm } from "@/components/Career/CareerProfileForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    LineChart,
    Network,
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
    Milestone
} from "lucide-react";
import { toast } from "sonner";

export default function CareerPortalPage() {
    const [member, setMember] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [memberRes, planRes] = await Promise.all([
                fetch("/api/profile"), // Assuming this exists or returns current member
                fetch("/api/career/plan/generate")
            ]);

            const memberData = await memberRes.json();
            const planData = await planRes.json();

            // /api/profile returns the member object directly (not { member })
            if (memberRes.ok && memberData?.id && !memberData.error) setMember(memberData);
            if (planRes.ok && planData?.plan) setPlan(planData.plan);

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
        } catch (error) {
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
                body: JSON.stringify({ plan: updated })
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
            const total = plan.gaps.reduce((s: number, g: any) => s + (g.actions?.length ?? 0), 0);
            const completed = plan.gaps.reduce(
                (s: number, g: any) => s + (g.actions?.filter((a: any) => a.status === "COMPLETED").length ?? 0),
                0
            );
            return { total, completed, milestones: plan.gaps.length };
        })()
        : null;

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading your career profile...</div>;
    }

    if (!member) {
        return <div className="p-8 text-center text-gray-500">Member profile not found. Please complete your registration.</div>;
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-indigo-900">
                        Career Hub
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">
                        Navigate your professional growth with precision.
                    </p>
                </div>
                <Button
                    onClick={generatePlan}
                    disabled={generating || !member.aspirationalRoleId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 rounded-xl h-12 px-6 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <Sparkles className="h-5 w-5" />
                    {generating ? "Generating..." : "Auto-Generate Plan"}
                </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-[800px] mb-8 bg-slate-100/50 p-1 rounded-2xl border">
                    <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <Target className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Dev Plan
                    </TabsTrigger>
                    <TabsTrigger value="org" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                        <Network className="h-4 w-4" /> Hierarchy
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Current Role */}
                        <Card className="border-l-4 border-l-blue-500 rounded-3xl overflow-hidden shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="text-[10px] mb-2 text-blue-600 border-blue-200 bg-blue-50">CURRENT POST</Badge>
                                        <CardTitle className="text-2xl font-black italic">{member.currentRole?.name || "Unassigned"}</CardTitle>
                                    </div>
                                    <Briefcase className="h-6 w-6 text-blue-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                    {member.currentRole?.description || "Define your current role to start your career journey."}
                                </p>
                                {member.currentRole && (
                                    <div className="space-y-4">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Core Competencies</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {member.currentRole.competencies?.map((rc: any) => (
                                                <Badge key={rc.id} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-3 py-1">
                                                    {rc.competency.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Aspirational Role */}
                        <Card className="border-l-4 border-l-purple-500 rounded-3xl overflow-hidden shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="text-[10px] mb-2 text-purple-600 border-purple-200 bg-purple-50">CAREER GOAL</Badge>
                                        <CardTitle className="text-2xl font-black italic">{member.aspirationalRole?.name || "Not Set"}</CardTitle>
                                    </div>
                                    <TrendingUp className="h-6 w-6 text-purple-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {member.aspirationalRole ? (
                                    <div className="space-y-4">
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {member.aspirationalRole.description}
                                        </p>

                                        <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                                <AlertCircle className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-purple-900 leading-none mb-1">Gap Analysis</h4>
                                                <p className="text-sm text-purple-600 leading-relaxed mb-4">
                                                    You matches {Math.round((member.currentRole?.competencies?.length / member.aspirationalRole.competencies?.length) * 100) || 0}% of the requirements.
                                                </p>
                                                <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-100 text-xs gap-2">
                                                    View Detailed Gaps <ChevronRight className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-slate-400 mb-6 italic">Where do you see yourself next?</p>
                                        <Button variant="outline" className="rounded-xl border-dashed border-2 hover:bg-slate-50">Identify Aspirational Role</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="profile">
                    <CareerProfileForm />
                </TabsContent>

                <TabsContent value="plan" className="space-y-6">
                    {plan ? (
                        <div className="grid gap-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 rounded-full px-4">PERSONALIZED PLAN</Badge>
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Roadmap</span>
                                    </div>
                                    <h3 className="text-3xl font-black italic text-slate-900">Goal: {plan.aspirationalRoleName}</h3>
                                    <p className="text-slate-500 font-medium italic mt-1">Generated {new Date(plan.generatedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="rounded-2xl h-11 border-2 font-bold" onClick={generatePlan} disabled={generating}>
                                        Refresh Plan
                                    </Button>
                                </div>
                            </div>

                            {planProgress && (
                                <Card className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 overflow-hidden">
                                    <CardContent className="p-6 flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                                <Milestone className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-slate-900">{planProgress.milestones}</p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Milestones</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <Target className="h-6 w-6 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-slate-900">{planProgress.total}</p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total steps</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center">
                                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-slate-900">{planProgress.completed} / {planProgress.total}</p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Completed</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-[120px] h-3 rounded-full bg-slate-200 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-indigo-600 transition-all"
                                                style={{ width: planProgress.total ? `${(planProgress.completed / planProgress.total) * 100}%` : "0%" }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {plan.gaps.map((gap: any, idx: number) => (
                                <Card key={idx} className="rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden bg-white">
                                    <CardHeader className="bg-slate-50/50 p-8 pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black italic text-slate-900">{gap.name}</h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Circle className="h-3 w-3 fill-slate-200 text-slate-200" /> Current: {gap.currentLevel}</span>
                                                    <span className="flex items-center gap-1 text-indigo-600"><Target className="h-3 w-3" /> Target: {gap.targetLevel}</span>
                                                </div>
                                            </div>
                                            <Badge className={`rounded-xl px-4 py-1 font-black italic ${gap.priority === "HIGH" ? "bg-red-50 text-red-600" :
                                                    gap.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" :
                                                        "bg-blue-50 text-blue-600"
                                                }`}>
                                                {gap.priority} PRIORITY
                                            </Badge>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {gap.actions?.filter((a: any) => a.status === "COMPLETED").length ?? 0} / {gap.actions?.length ?? 0} steps
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-6">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step-by-Step Guidance</h4>
                                            <div className="grid gap-4">
                                                {gap.actions.map((action: any, aidx: number) => (
                                                    <div key={aidx} className="flex gap-6 p-6 rounded-[1.8rem] bg-white border-2 border-slate-50 hover:border-indigo-100 transition-all group">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = action.status === "COMPLETED" ? "NOT_STARTED" : action.status === "NOT_STARTED" ? "IN_PROGRESS" : "COMPLETED";
                                                                updateActionStatus(idx, aidx, next);
                                                            }}
                                                            className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors border-2 border-transparent hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            style={{
                                                                backgroundColor: action.status === "COMPLETED" ? "rgb(34 197 94 / 0.2)" : action.status === "IN_PROGRESS" ? "rgb(99 102 241 / 0.15)" : "rgb(248 250 252)",
                                                                color: action.status === "COMPLETED" ? "rgb(22 163 74)" : action.status === "IN_PROGRESS" ? "rgb(99 102 241)" : "rgb(148 163 184)"
                                                            }}
                                                            title={action.status === "COMPLETED" ? "Mark not started" : action.status === "IN_PROGRESS" ? "Mark complete" : "Mark in progress"}
                                                        >
                                                            {action.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5" /> : action.status === "IN_PROGRESS" ? <Clock className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                                        </button>
                                                        <div className="space-y-1 flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <span className="font-black italic text-slate-900">{action.title}</span>
                                                                <Badge variant="outline" className="text-[8px] font-black h-4 px-2 tracking-tighter rounded-lg border-2 uppercase">{action.type}</Badge>
                                                                <Badge variant="secondary" className="text-[8px] font-bold uppercase">{action.status?.replace("_", " ") ?? "NOT_STARTED"}</Badge>
                                                            </div>
                                                            <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                                                                {action.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                            <Sparkles className="h-20 w-20 text-slate-300 mb-8" />
                            <h2 className="text-4xl font-black italic text-slate-900">No Roadmap Yet</h2>
                            <p className="text-slate-500 max-w-sm text-center mt-3 mb-10 text-lg font-medium italic">
                                Your growth shouldn't be a guessing game. Click the button to map your journey to {member.aspirationalRole?.name || "your next role"}.
                            </p>
                            <Button
                                onClick={generatePlan}
                                disabled={generating || !member.aspirationalRoleId}
                                size="lg"
                                className="rounded-[1.5rem] h-16 px-10 bg-indigo-600 hover:bg-black font-black italic text-xl shadow-xl shadow-indigo-100"
                            >
                                {generating ? "Mapping Journey..." : "Build My Roadmap"}
                            </Button>
                            {!member.aspirationalRoleId && (
                                <p className="text-xs text-red-500 mt-4 font-bold">Please set an aspirational role in Profile first.</p>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="org">
                    <div className="flex flex-col items-center justify-center p-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <Network className="h-16 w-16 text-gray-300 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 italic font-black">Coming Soon: Org Visualization</h2>
                        <p className="text-gray-500 max-w-md text-center mt-2 italic font-medium">
                            Interact with your team and see how you connect to the rest of the organization structure.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
