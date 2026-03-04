"use client";

import React from "react";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    User,
    Sparkles,
    Briefcase,
    TrendingUp,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Target,
    CheckCircle2,
    Clock,
    Circle,
    Loader2,
    Milestone,
    Plus,
    Pencil,
    Trash2,
    X,
    Award,
    ShieldCheck,
    Brain,
    Code,
    Zap,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import { CareerProfileForm } from "@/components/Career/CareerProfileForm";
import { COMPETENCY_CATEGORY_OPTIONS } from "@/lib/competency-categories";
import { COMPETENCY_LEVEL_OPTIONS } from "@/lib/competency-levels";

export default function IndividualCareerPage() {
    const [member, setMember] = useState<any>(null);
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Previous Roles state
    const [prevRoles, setPrevRoles] = useState<any[]>([]);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editBuf, setEditBuf] = useState({ title: "", company: "", startDate: "", endDate: "" });
    const [savingRole, setSavingRole] = useState(false);

    // Competency expand state (for list rows in Competencies tab)
    const [expandedCompetency, setExpandedCompetency] = useState<string | null>(null);

    // Skills I Want to Develop form state
    const [skillRequests, setSkillRequests] = useState<any[]>([]);
    const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("TECHNICAL");
    const [newSkillLevel, setNewSkillLevel] = useState("JUNIOR");
    const [newSkillReason, setNewSkillReason] = useState("");
    const [newSkillBenefit, setNewSkillBenefit] = useState("");
    const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const memberRes = await fetch("/api/profile");
            const memberData = await memberRes.json();
            if (memberRes.ok && memberData?.id && !memberData.error) {
                setMember(memberData);
                // Sync previousRoles
                if (Array.isArray(memberData.previousRoles)) {
                    setPrevRoles(memberData.previousRoles);
                }
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

    // Fetch past skill requests on mount
    useEffect(() => {
        fetch("/api/career/competency-requests")
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setSkillRequests(d); })
            .catch(console.error);
    }, []);

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

    // ── Previous Roles helpers ──────────────────────────────────────────────
    const savePrevRoles = async (updated: any[]) => {
        setSavingRole(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ previousRoles: updated }),
            });
            if (res.ok) {
                setPrevRoles(updated);
                toast.success("Previous roles updated!");
            } else {
                toast.error("Failed to save roles.");
            }
        } catch {
            toast.error("Error saving roles.");
        } finally {
            setSavingRole(false);
        }
    };

    const startAddRole = () => {
        setEditBuf({ title: "", company: "", startDate: "", endDate: "" });
        setEditingIdx(-1);
    };

    const startEditRole = (idx: number) => {
        setEditBuf({ ...prevRoles[idx] });
        setEditingIdx(idx);
    };

    const commitRole = async () => {
        if (!editBuf.title.trim()) return;
        const updated = editingIdx === -1
            ? [...prevRoles, { ...editBuf }]
            : prevRoles.map((r, i) => i === editingIdx ? { ...editBuf } : r);
        await savePrevRoles(updated);
        setEditingIdx(null);
    };

    const deleteRole = async (idx: number) => {
        const updated = prevRoles.filter((_, i) => i !== idx);
        await savePrevRoles(updated);
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

    // ── Helpers ─────────────────────────────────────────────────────────────
    const CategoryIcon = ({ cat }: { cat: string }) => {
        switch (cat) {
            case "TECHNICAL": return <Code className="h-4 w-4" />;
            case "BEHAVIORAL": return <Brain className="h-4 w-4" />;
            case "LEADERSHIP": return <ShieldCheck className="h-4 w-4" />;
            default: return <Zap className="h-4 w-4" />;
        }
    };

    const handleSubmitSkillRequest = async () => {
        if (!newSkillName.trim()) { toast.error("Please enter a skill name"); return; }
        setIsSubmittingSkill(true);
        try {
            const res = await fetch("/api/career/competency-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSkillName, category: newSkillCategory, level: newSkillLevel, description: newSkillReason, roleBenefit: newSkillBenefit }),
            });
            if (res.ok) {
                const nr = await res.json();
                setSkillRequests(prev => [nr, ...prev]);
                setNewSkillName(""); setNewSkillCategory("TECHNICAL"); setNewSkillLevel("JUNIOR"); setNewSkillReason(""); setNewSkillBenefit("");
                setIsSkillFormOpen(false);
                toast.success("Request submitted — your admin will review it.");
            } else { toast.error("Failed to submit request"); }
        } catch { toast.error("An error occurred"); }
        finally { setIsSubmittingSkill(false); }
    };

    const skillStatusBadge = (status: string) => {
        if (status === "APPROVED") return <Badge className="bg-green-50 text-green-700 border-green-200 border text-xs">Approved</Badge>;
        if (status === "REJECTED") return <Badge className="bg-red-50 text-red-700 border-red-200 border text-xs">Rejected</Badge>;
        if (status === "COMPLETED") return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 border text-xs">Created &amp; Assigned</Badge>;
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-xs">Pending Review</Badge>;
    };

    /** Shared list table for a role's competencies with expandable +/- indicators */
    function CompetencyListTable({ competencies, accentColor }: { competencies: any[]; accentColor: string }) {
        if (competencies.length === 0) {
            return <p className="text-sm text-gray-400 italic py-6 text-center">No competencies linked to this role yet.</p>;
        }
        return (
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                        <TableHead className="text-gray-500 w-10" />
                        <TableHead className="text-gray-500">Competency</TableHead>
                        <TableHead className="text-gray-500">Category</TableHead>
                        <TableHead className="text-gray-500">Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {competencies.map((rc: any) => {
                        const comp = rc.competency ?? rc;
                        // The indicators could be on `rc.competency.indicators` (from the relation) or directly on `comp.indicators`
                        const allIndicators = comp?.indicators || rc?.indicators || [];
                        // requiredLevel is the Prisma field; fall back to expectedLevel / level for legacy data
                        const expectedLevel = rc.requiredLevel || rc.expectedLevel || rc.level;
                        const filteredIndicators = expectedLevel
                            ? allIndicators.filter((i: any) => i.level === expectedLevel)
                            : allIndicators;
                        const positives: any[] = filteredIndicators.filter((i: any) => i.type === "POSITIVE") ?? [];
                        const negatives: any[] = filteredIndicators.filter((i: any) => i.type === "NEGATIVE") ?? [];
                        const hasIndicators = positives.length > 0 || negatives.length > 0;
                        const isExpanded = expandedCompetency === comp.id;
                        return (
                            <React.Fragment key={comp.id}>
                                <TableRow
                                    className={`border-b border-gray-100 ${hasIndicators ? "cursor-pointer hover:bg-gray-50" : ""}`}
                                    onClick={() => hasIndicators && setExpandedCompetency(isExpanded ? null : comp.id)}
                                >
                                    <TableCell className="py-3 w-10">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white`} style={{ background: accentColor }}>
                                            <CategoryIcon cat={comp.category} />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {comp.name}
                                            {hasIndicators && (isExpanded
                                                ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                                : <ChevronRight className="h-3.5 w-3.5 text-gray-300" />)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <Badge variant="outline" className="text-[10px] text-gray-500 lowercase">{comp.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500 italic py-3 max-w-xs truncate">{comp.description || "—"}</TableCell>
                                </TableRow>
                                {isExpanded && hasIndicators && (
                                    <TableRow className="bg-gray-50 border-b border-gray-100">
                                        <TableCell colSpan={4} className="py-4 px-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {positives.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 flex items-center gap-1">
                                                            <ThumbsUp className="h-3 w-3" /> Positive Indicators
                                                        </p>
                                                        <ul className="space-y-1.5">
                                                            {positives.map((ind: any) => (
                                                                <li key={ind.id} className="flex items-start gap-2 text-sm text-gray-700">
                                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                                                                    {ind.text || ind.description}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {negatives.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 flex items-center gap-1">
                                                            <ThumbsDown className="h-3 w-3" /> Negative Indicators
                                                        </p>
                                                        <ul className="space-y-1.5">
                                                            {negatives.map((ind: any) => (
                                                                <li key={ind.id} className="flex items-start gap-2 text-sm text-gray-700">
                                                                    <X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                                                                    {ind.text || ind.description}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        );
    }

    // ── Role competency tab helper (tabs 3 & 4) ──────────────────────────────
    function RoleCompetencyTab({ role }: { role: any }) {
        if (!role) {
            return (
                <Card className="border-none shadow-md bg-white">
                    <CardContent className="py-16 text-center text-gray-400">
                        <Briefcase className="h-10 w-10 mx-auto mb-3" />
                        <p>No role set. Update it in My Profile.</p>
                    </CardContent>
                </Card>
            );
        }

        const competencies: any[] = role.competencies ?? [];

        return (
            <div className="space-y-4">
                <Card className="border-none shadow-md bg-white overflow-hidden">
                    <div className="h-1 bg-indigo-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-gray-900">{role.name}</CardTitle>
                        {role.description && (
                            <CardDescription className="text-sm text-gray-500 mt-1">{role.description}</CardDescription>
                        )}
                    </CardHeader>
                </Card>

                {competencies.length === 0 ? (
                    <Card className="border-none shadow-md bg-white">
                        <CardContent className="py-10 text-center text-gray-400 text-sm">
                            No competencies linked to this role yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-5 gap-4">
                        {/* Left vertical list */}
                        <div className="md:col-span-2 space-y-1">
                            {competencies.map((rc: any) => {
                                const comp = rc.competency ?? rc;
                                const isActive = expandedCompetency === comp.id;
                                return (
                                    <button
                                        key={comp.id}
                                        onClick={() => setExpandedCompetency(isActive ? null : comp.id)}
                                        className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${isActive
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                                            : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span>{comp.name}</span>
                                        {isActive ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right detail panel */}
                        <div className="md:col-span-3">
                            {(() => {
                                const rc = competencies.find((rc: any) => (rc.competency ?? rc).id === expandedCompetency);
                                if (!rc) {
                                    return (
                                        <Card className="border-none shadow-md bg-white h-full flex items-center justify-center">
                                            <CardContent className="py-10 text-center text-gray-400 text-sm">
                                                <Target className="h-8 w-8 mx-auto mb-2" />
                                                Select a competency to view its indicators
                                            </CardContent>
                                        </Card>
                                    );
                                }
                                const comp = rc.competency ?? rc;
                                const allIndicators = comp?.indicators || rc?.indicators || [];
                                // Filter indicators to the role's overall level only
                                const roleLevel = role?.overallLevel;
                                const levelFiltered = roleLevel
                                    ? allIndicators.filter((i: any) => i.level === roleLevel)
                                    : allIndicators;
                                const positives: any[] = levelFiltered.filter((i: any) => i.type === "POSITIVE") ?? [];
                                const negatives: any[] = levelFiltered.filter((i: any) => i.type === "NEGATIVE") ?? [];
                                return (
                                    <Card className="border-none shadow-md bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg text-gray-900">{comp.name}</CardTitle>
                                            {comp.description && <CardDescription className="text-sm text-gray-500">{comp.description}</CardDescription>}
                                            {rc.targetLevel && <Badge variant="outline" className="w-fit mt-1 text-xs">{rc.targetLevel}</Badge>}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {positives.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                        <ThumbsUp className="h-3.5 w-3.5" /> Positive Indicators
                                                    </p>
                                                    <ul className="space-y-1.5">
                                                        {positives.map((ind: any) => (
                                                            <li key={ind.id} className="flex items-start gap-2 text-sm text-gray-700">
                                                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                                {ind.text || ind.description}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {negatives.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                        <ThumbsDown className="h-3.5 w-3.5" /> Negative Indicators
                                                    </p>
                                                    <ul className="space-y-1.5">
                                                        {negatives.map((ind: any) => (
                                                            <li key={ind.id} className="flex items-start gap-2 text-sm text-gray-700">
                                                                <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                                                {ind.text || ind.description}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {positives.length === 0 && negatives.length === 0 && (
                                                <p className="text-sm text-gray-400">No indicators defined for this competency yet.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Career Hub</h1>
                        <p className="text-gray-500 mt-1">Navigate your professional growth with precision.</p>
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
                    <TabsList className="grid w-full grid-cols-6 max-w-4xl mb-6 bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex items-center gap-1">
                            <Target className="h-3.5 w-3.5" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> My Profile
                        </TabsTrigger>
                        <TabsTrigger value="current-role" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" /> Current Role
                        </TabsTrigger>
                        <TabsTrigger value="aspirational-role" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" /> Aspirational
                        </TabsTrigger>
                        <TabsTrigger value="previous-roles" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Prev. Roles
                        </TabsTrigger>
                        <TabsTrigger value="competencies" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Competencies
                        </TabsTrigger>
                    </TabsList>

                    {/* ── TAB 1: OVERVIEW ──────────────────────────────────────────── */}
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
                                    <p className="text-gray-500 text-sm mb-4">{member.currentRole?.description || "Set your current role in My Profile."}</p>
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
                                            <p className="text-gray-500 text-sm mb-4">{member.aspirationalRole.description}</p>
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
                                                            <Badge key={rc.id} variant="outline" className="text-gray-600">{rc.competency?.name}</Badge>
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
                                            <p className="text-gray-500 mb-4">Set your aspirational role in My Profile to see your gap and generate a plan.</p>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href="/assessments/individuals/career?tab=profile">Edit in My Profile</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Dev Plan progress summary */}
                        {plan?.gaps?.length > 0 && planProgress && planProgress.total > 0 && (
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
                                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-gray-900">{planProgress.completed}/{planProgress.total}</p>
                                            <p className="text-xs text-gray-500">Steps Completed</p>
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
                    </TabsContent>

                    {/* ── TAB 2: MY PROFILE (CareerProfileForm restored) ────────────── */}
                    <TabsContent value="profile" className="mt-0">
                        <CareerProfileForm />
                    </TabsContent>

                    {/* ── TAB 3: CURRENT ROLE ──────────────────────────────────────── */}
                    <TabsContent value="current-role" className="mt-0">
                        <RoleCompetencyTab role={member.currentRole} />
                    </TabsContent>

                    {/* ── TAB 4: ASPIRATIONAL ROLE ─────────────────────────────────── */}
                    <TabsContent value="aspirational-role" className="mt-0">
                        <RoleCompetencyTab role={member.aspirationalRole} />
                    </TabsContent>

                    {/* ── TAB 5: PREVIOUS ROLES ────────────────────────────────────── */}
                    <TabsContent value="previous-roles" className="mt-0 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Previous Roles</h2>
                            <Button size="sm" onClick={startAddRole} disabled={editingIdx !== null} className="gap-1">
                                <Plus className="h-4 w-4" /> Add Role
                            </Button>
                        </div>

                        {/* Add / Edit inline form */}
                        {editingIdx !== null && (
                            <Card className="border-2 border-indigo-200 shadow-sm bg-indigo-50/20">
                                <CardContent className="pt-5 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Job Title *</Label>
                                            <Input value={editBuf.title} onChange={(e) => setEditBuf({ ...editBuf, title: e.target.value })} placeholder="e.g. Software Engineer" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Company</Label>
                                            <Input value={editBuf.company} onChange={(e) => setEditBuf({ ...editBuf, company: e.target.value })} placeholder="e.g. Acme Corp" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Start Date</Label>
                                            <Input value={editBuf.startDate} onChange={(e) => setEditBuf({ ...editBuf, startDate: e.target.value })} placeholder="e.g. Jan 2019" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>End Date</Label>
                                            <Input value={editBuf.endDate} onChange={(e) => setEditBuf({ ...editBuf, endDate: e.target.value })} placeholder="e.g. Dec 2022 or Present" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={commitRole} disabled={savingRole || !editBuf.title.trim()}>
                                            {savingRole ? "Saving..." : "Save"}
                                        </Button>
                                        <Button variant="outline" onClick={() => setEditingIdx(null)}>
                                            <X className="h-4 w-4 mr-1" /> Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {prevRoles.length === 0 && editingIdx === null ? (
                            <Card className="border-dashed border-2 border-gray-200">
                                <CardContent className="py-12 text-center text-gray-400">
                                    <Briefcase className="h-10 w-10 mx-auto mb-3" />
                                    <p className="text-sm">No previous roles added yet. Click "Add Role" to get started.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {prevRoles.map((role, idx) => (
                                    <Card key={idx} className="border-none shadow-sm bg-white">
                                        <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">{role.title}</p>
                                                {role.company && <p className="text-sm text-gray-600">{role.company}</p>}
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {role.startDate || "?"} — {role.endDate || "Present"}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEditRole(idx)} disabled={editingIdx !== null}>
                                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteRole(idx)} disabled={savingRole}>
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── TAB 6: COMPETENCIES ──────────────────────────────────────── */}
                    <TabsContent value="competencies" className="mt-0 space-y-8">

                        {/* ── Section A: Current Role Competencies ── */}
                        <Card className="border-none shadow-md bg-white overflow-hidden">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                    <div>
                                        <CardTitle className="text-base font-semibold text-gray-900">
                                            Competencies for My Current Role
                                        </CardTitle>
                                        <div className="text-xs mt-1">
                                            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                                                {member.currentRole?.name || "No role set"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {!member.currentRole ? (
                                    <p className="text-sm text-gray-400 italic py-8 text-center">
                                        No current role set. <Link href="#" className="text-indigo-600 underline">Update in My Profile</Link>.
                                    </p>
                                ) : (
                                    <CompetencyListTable
                                        competencies={member.currentRole.competencies ?? []}
                                        accentColor="#6366f1"
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* ── Section B: Aspirational Role Competencies ── */}
                        <Card className="border-none shadow-md bg-white overflow-hidden">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                                    <div>
                                        <CardTitle className="text-base font-semibold text-gray-900">
                                            Competencies for My Aspirational Role
                                        </CardTitle>
                                        <div className="text-xs mt-1">
                                            <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                                                {member.aspirationalRole?.name || "No aspirational role set"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {!member.aspirationalRole ? (
                                    <p className="text-sm text-gray-400 italic py-8 text-center">
                                        Set an aspirational role in My Profile to see target competencies.
                                    </p>
                                ) : (
                                    <CompetencyListTable
                                        competencies={member.aspirationalRole.competencies ?? []}
                                        accentColor="#a855f7"
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* ── Section C: Self-Assessment Scores ── */}
                        {(() => {
                            const scores: any[] = member?.careerFormData?.selfAssessmentScores ?? [];
                            if (scores.length === 0) return null;
                            const categoryColor: Record<string, string> = {
                                TECHNICAL: "bg-blue-100 text-blue-700",
                                BEHAVIORAL: "bg-purple-100 text-purple-700",
                                COGNITIVE: "bg-amber-100 text-amber-700",
                                DOMAIN_SPECIFIC: "bg-green-100 text-green-700",
                            };
                            return (
                                <Card className="border-none shadow-md bg-white overflow-hidden">
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-amber-400" />
                                            <CardTitle className="text-base font-semibold text-gray-900">My Self-Assessment</CardTitle>
                                        </div>
                                        <CardDescription className="text-xs">Your self-rated proficiency scores for role competencies (saved from My Profile).</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow className="hover:bg-transparent border-b border-gray-100">
                                                    <TableHead className="text-gray-500 text-xs">Competency</TableHead>
                                                    <TableHead className="text-gray-500 text-xs">Category</TableHead>
                                                    <TableHead className="text-gray-500 text-xs text-center">My Rating</TableHead>
                                                    <TableHead className="text-gray-500 text-xs hidden md:table-cell">Notes</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {scores.map((s: any) => (
                                                    <TableRow key={s.competencyId} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <TableCell className="font-medium text-gray-900 py-3 text-sm">{s.name}</TableCell>
                                                        <TableCell className="py-3">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColor[s.category] ?? "bg-gray-100 text-gray-600"}`}>{s.category}</span>
                                                        </TableCell>
                                                        <TableCell className="py-3 text-center">
                                                            <div className="flex items-center justify-center gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(lvl => (
                                                                    <div key={lvl} className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border ${s.rating >= lvl
                                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                                        : "bg-white text-gray-300 border-gray-200"
                                                                        }`}>{lvl}</div>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3 text-sm text-gray-500 italic hidden md:table-cell max-w-xs truncate">{s.note || "—"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* ── Section D: Skills I Want to Develop ── */}
                        <Card className="border-none shadow-md bg-white overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3 rounded-full bg-pink-500" />
                                        <div>
                                            <CardTitle className="text-base font-semibold text-gray-900">Skills I Want to Develop</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">Request a competency to be created and assigned to your profile.</CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => setIsSkillFormOpen(v => !v)}
                                        className={isSkillFormOpen
                                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            : "bg-pink-600 hover:bg-pink-700 text-white"}
                                    >
                                        {isSkillFormOpen ? <X className="h-3.5 w-3.5 mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                                        {isSkillFormOpen ? "Cancel" : "+ Request a Competency"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-0">

                                {/* Request Form */}
                                {isSkillFormOpen && (
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                                            <Award className="h-3.5 w-3.5 text-pink-500" /> Submit a Competency Request
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-600">
                                                    Competency Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    placeholder="e.g. Advanced AI Prompting"
                                                    value={newSkillName}
                                                    onChange={e => setNewSkillName(e.target.value)}
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-600">
                                                    Category <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COMPETENCY_CATEGORY_OPTIONS.map(opt => (
                                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-gray-600">
                                                        Level <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {COMPETENCY_LEVEL_OPTIONS.map(opt => (
                                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Label className="text-xs font-semibold text-gray-600">Why do you want to develop this?</Label>
                                                <Textarea
                                                    placeholder="Describe why this skill is important for your growth..."
                                                    value={newSkillReason}
                                                    onChange={e => setNewSkillReason(e.target.value)}
                                                    className="resize-none bg-white h-20 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-600">How will this benefit your role?</Label>
                                                <Textarea
                                                    placeholder="Explain how this competency will improve your performance..."
                                                    value={newSkillBenefit}
                                                    onChange={e => setNewSkillBenefit(e.target.value)}
                                                    className="resize-none bg-white h-20 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleSubmitSkillRequest}
                                            disabled={isSubmittingSkill || !newSkillName.trim()}
                                            className="bg-pink-600 hover:bg-pink-700 text-white"
                                        >
                                            {isSubmittingSkill ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                            Submit Request
                                        </Button>
                                    </div>
                                )}

                                {/* Past requests */}
                                {(() => {
                                    const approvedCompetencies = skillRequests
                                        .filter(req => req.status === "APPROVED" && req.competency)
                                        .map(req => ({ competency: req.competency, expectedLevel: req.level }));
                                    const pendingRequests = skillRequests.filter(req => req.status !== "APPROVED" || !req.competency);

                                    return (
                                        <div className="space-y-6">
                                            {approvedCompetencies.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 px-1">Approved &amp; Assigned Competencies</h4>
                                                    <CompetencyListTable competencies={approvedCompetencies} accentColor="rgb(236, 72, 153)" />
                                                </div>
                                            )}

                                            {pendingRequests.length > 0 && (
                                                <div>
                                                    {approvedCompetencies.length > 0 && <h4 className="text-sm font-semibold text-gray-700 mb-3 px-1 mt-6">Pending &amp; Rejected Requests</h4>}
                                                    <Table>
                                                        <TableHeader className="bg-gray-50">
                                                            <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                                                <TableHead className="text-gray-500 text-xs">Competency</TableHead>
                                                                <TableHead className="text-gray-500 text-xs hidden md:table-cell">Category</TableHead>
                                                                <TableHead className="text-gray-500 text-xs hidden md:table-cell">Level</TableHead>
                                                                <TableHead className="text-gray-500 text-xs hidden lg:table-cell">Reason</TableHead>
                                                                <TableHead className="text-gray-500 text-xs w-36">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {pendingRequests.map(req => (
                                                                <TableRow key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                                    <TableCell className="font-medium text-gray-900 py-3 text-sm">{req.name}</TableCell>
                                                                    <TableCell className="py-3 hidden md:table-cell">
                                                                        <Badge variant="outline" className="text-[10px] text-gray-500 lowercase">{req.category || "—"}</Badge>
                                                                    </TableCell>
                                                                    <TableCell className="py-3 hidden md:table-cell">
                                                                        <Badge variant="secondary" className="text-[10px] lowercase">{req.level || "—"}</Badge>
                                                                    </TableCell>
                                                                    <TableCell className="py-3 text-sm text-gray-400 italic hidden lg:table-cell max-w-xs truncate">{req.description || "—"}</TableCell>
                                                                    <TableCell className="py-3">{skillStatusBadge(req.status)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}

                                            {skillRequests.length === 0 && !isSkillFormOpen && (
                                                <div className="text-center py-6">
                                                    <div className="p-3 bg-pink-50 rounded-xl w-fit mx-auto mb-2">
                                                        <Award className="h-6 w-6 text-pink-300" />
                                                    </div>
                                                    <p className="text-sm text-gray-400 italic">No requests yet. Click &ldquo;+ Request a Competency&rdquo; to get started.</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
