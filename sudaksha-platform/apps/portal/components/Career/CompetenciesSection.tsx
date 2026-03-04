"use client";

import React, { useState, useEffect } from "react";
import {
    Award, Search, Plus, Trash2, ShieldCheck,
    Zap, Brain, Code, Loader2, Sparkles, Target,
    CheckCircle2, XCircle, ChevronDown, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../ui/_dialog";
import { COMPETENCY_CATEGORY_OPTIONS } from "@/lib/competency-categories";

interface CompetencyIndicator {
    id: string;
    type: "POSITIVE" | "NEGATIVE";
    text: string;
    level: string;
}

interface Competency {
    id: string;
    name: string;
    category: string;
    description: string;
    indicators?: CompetencyIndicator[];
}

interface CompetenciesSectionProps {
    member: any;
    onUpdate: () => void;
}

export function CompetenciesSection({ member, onUpdate }: CompetenciesSectionProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [allCompetencies, setAllCompetencies] = useState<Competency[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [selfAssigned, setSelfAssigned] = useState<Competency[]>(() => {
        try {
            return (member.selfAssignedCompetencies as Competency[]) || [];
        } catch {
            return [];
        }
    });

    // Extract role competencies (current and aspirational)
    const currentRoleCompetencies = (member.currentRole?.competencies || []).map((rc: any) => rc.competency);
    const aspirationalRoleCompetencies = (member.aspirationalRole?.competencies || []).map((rc: any) => rc.competency);

    // Skills I Want to Develop state
    const [requests, setRequests] = useState<any[]>([]);
    const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("TECHNICAL");
    const [newSkillReason, setNewSkillReason] = useState("");
    const [newSkillBenefit, setNewSkillBenefit] = useState("");
    const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

    useEffect(() => {
        if (isAdding) {
            fetch("/api/competencies")
                .then(res => res.json())
                .then(setAllCompetencies);
        }
    }, [isAdding]);

    useEffect(() => {
        fetch("/api/career/competency-requests")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRequests(data);
            })
            .catch(console.error);
    }, []);

    const handleSubmitSkillRequest = async () => {
        if (!newSkillName.trim()) {
            toast.error("Please enter a skill name");
            return;
        }
        setIsSubmittingSkill(true);
        try {
            const res = await fetch("/api/career/competency-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newSkillName,
                    category: newSkillCategory,
                    description: newSkillReason,
                    roleBenefit: newSkillBenefit,
                }),
            });
            if (res.ok) {
                const newReq = await res.json();
                setRequests([newReq, ...requests]);
                setNewSkillName("");
                setNewSkillCategory("TECHNICAL");
                setNewSkillReason("");
                setNewSkillBenefit("");
                setIsRequestFormOpen(false);
                toast.success("Skill request submitted — your admin will review it.");
            } else {
                toast.error("Failed to submit request");
            }
        } catch {
            toast.error("An error occurred while submitting the request");
        } finally {
            setIsSubmittingSkill(false);
        }
    };

    const handleAdd = async (comp: Competency) => {
        if (selfAssigned.find(c => c.id === comp.id) || currentRoleCompetencies.find((c: any) => c.id === comp.id)) {
            toast.error("Competency already in profile");
            return;
        }
        const newList = [...selfAssigned, comp];
        await saveCompetencies(newList);
    };

    const handleRemove = async (id: string) => {
        const newList = selfAssigned.filter(c => c.id !== id);
        await saveCompetencies(newList);
    };

    const saveCompetencies = async (list: Competency[]) => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selfAssignedCompetencies: list }),
            });
            if (res.ok) {
                setSelfAssigned(list);
                toast.success("Competencies updated");
                onUpdate();
            } else {
                toast.error("Failed to update competencies");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const filtered = allCompetencies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !selfAssigned.find(s => s.id === c.id) &&
        !currentRoleCompetencies.find((r: any) => r.id === c.id)
    );

    const CategoryIcon = ({ cat }: { cat: string }) => {
        switch (cat) {
            case 'TECHNICAL': return <Code className="h-4 w-4" />;
            case 'BEHAVIORAL': return <Brain className="h-4 w-4" />;
            case 'LEADERSHIP': return <ShieldCheck className="h-4 w-4" />;
            default: return <Zap className="h-4 w-4" />;
        }
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    /** Reusable expandable competency table for both current + aspirational roles */
    const RoleCompetencyTable = ({ competencies, dark = false }: { competencies: any[]; dark?: boolean }) => {
        if (competencies.length === 0) {
            return (
                <div className={`py-12 text-center italic ${dark ? "text-slate-500" : "text-slate-400"}`}>
                    No competencies mapped to this role yet.
                </div>
            );
        }

        return (
            <Table>
                <TableHeader className={dark ? "bg-white/5 border-b border-white/10" : "bg-slate-50 border-b border-slate-100"}>
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className={dark ? "text-slate-400" : "text-slate-500"}>Category</TableHead>
                        <TableHead className={dark ? "text-slate-400" : "text-slate-500"}>Competency</TableHead>
                        <TableHead className={dark ? "text-slate-400" : "text-slate-500"}>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {competencies.map((c: any) => {
                        const rowKey = `${c.id}`;
                        const isExpanded = expandedRows.has(rowKey);
                        const positiveIndicators = (c.indicators || []).filter((i: any) => i.type === "POSITIVE");
                        const negativeIndicators = (c.indicators || []).filter((i: any) => i.type === "NEGATIVE");
                        const hasIndicators = c.indicators && c.indicators.length > 0;

                        return (
                            <React.Fragment key={c.id}>
                                <TableRow
                                    className={`border-b ${dark ? "border-white/10 hover:bg-white/5" : "border-slate-100 hover:bg-slate-50/50"} ${hasIndicators ? "cursor-pointer" : ""}`}
                                    onClick={() => hasIndicators && toggleRow(rowKey)}
                                >
                                    <TableCell className="w-16 py-3">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${dark ? "bg-indigo-500/20 text-indigo-300" : "bg-white text-indigo-600 shadow-sm border border-slate-100"}`}>
                                            <CategoryIcon cat={c.category} />
                                        </div>
                                    </TableCell>
                                    <TableCell className={`font-bold whitespace-nowrap py-3 ${dark ? "text-white" : "text-slate-900"}`}>
                                        <div className="flex items-center gap-2">
                                            {c.name}
                                            {hasIndicators && (
                                                isExpanded
                                                    ? <ChevronDown className={`h-3.5 w-3.5 ${dark ? "text-indigo-300" : "text-indigo-500"}`} />
                                                    : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-sm py-3 max-w-md truncate ${dark ? "text-slate-400" : "text-slate-500 italic"}`}>{c.description}</TableCell>
                                </TableRow>
                                {isExpanded && hasIndicators && (
                                    <TableRow className={dark ? "border-b border-white/10 bg-white/5" : "border-b border-slate-100 bg-slate-50/50"}>
                                        <TableCell colSpan={3} className="py-4 px-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {positiveIndicators.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${dark ? "text-emerald-400" : "text-emerald-600"}`}>🟢 Positive Indicators</p>
                                                        <ul className="space-y-1.5">
                                                            {positiveIndicators.map((ind: any) => (
                                                                <li key={ind.id} className={`text-sm flex items-start gap-2 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                                                                    <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                                                    {ind.text}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {negativeIndicators.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${dark ? "text-red-400" : "text-red-600"}`}>🔴 Negative Indicators</p>
                                                        <ul className="space-y-1.5">
                                                            {negativeIndicators.map((ind: any) => (
                                                                <li key={ind.id} className={`text-sm flex items-start gap-2 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                                                                    <span className="text-red-400 mt-0.5 shrink-0">•</span>
                                                                    {ind.text}
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
    };

    const statusBadge = (status: string) => {
        if (status === "APPROVED") return <Badge className="bg-green-50 text-green-700 border-green-200 border">Approved</Badge>;
        if (status === "REJECTED") return <Badge className="bg-red-50 text-red-700 border-red-200 border">Rejected</Badge>;
        if (status === "COMPLETED") return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 border">Created &amp; Assigned</Badge>;
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 border">Pending Review</Badge>;
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 lowercase italic">My <span className="text-indigo-600 font-serif not-italic">Competencies</span></h2>
                    <p className="text-slate-500 italic font-medium mt-1">Role-required abilities, self-assigned skills, and development goals.</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg gap-2 px-6">
                            <Plus className="h-5 w-5" />
                            Self-Assign Competency
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Search Competencies</DialogTitle>
                            <DialogDescription>Find and add skills that you possess or are developing.</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search (e.g. React, Leadership, Project Management)..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 italic">No matching competencies found.</div>
                                ) : (
                                    filtered.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900 truncate">{c.name}</p>
                                                    <Badge variant="outline" className="text-[10px] lowercase text-slate-400">{c.category}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">{c.description}</p>
                                            </div>
                                            <Button size="sm" onClick={() => handleAdd(c)} className="bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 shadow-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                Add
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Done</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="space-y-8">

                {/* ── SECTION 1: CURRENT ROLE COMPETENCIES ── */}
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <ShieldCheck className="h-6 w-6 text-indigo-300" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight">Competencies for My Current Role</CardTitle>
                                <CardDescription className="text-slate-400 italic mt-0.5">
                                    Mapped to: <span className="text-indigo-300 font-bold">{member.currentRole?.name || "No role assigned"}</span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RoleCompetencyTable competencies={currentRoleCompetencies} dark />
                    </CardContent>
                </Card>

                {/* ── SECTION 2: ASPIRATIONAL ROLE COMPETENCIES ── */}
                <Card className="border-none shadow-xl bg-indigo-950 text-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Target className="h-6 w-6 text-violet-300" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight">Competencies for My Aspirational Role</CardTitle>
                                <CardDescription className="text-slate-400 italic mt-0.5">
                                    Goal role: <span className="text-violet-300 font-bold">{member.aspirationalRole?.name || "No aspirational role set"}</span>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {member.aspirationalRole ? (
                            <RoleCompetencyTable competencies={aspirationalRoleCompetencies} dark />
                        ) : (
                            <div className="py-12 text-center text-slate-500 italic px-8">
                                Set an aspirational role in your career profile to see the competencies you need to develop.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── SECTION 3: SELF-ASSIGNED ── */}
                <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <Sparkles className="h-6 w-6 text-indigo-600" />
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Self-Assigned</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 italic">Additional skills you have identified beyond your core role.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {selfAssigned.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-100">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-slate-500">Category</TableHead>
                                        <TableHead className="text-slate-500">Competency</TableHead>
                                        <TableHead className="text-slate-500">Description</TableHead>
                                        <TableHead className="text-slate-500 w-16 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selfAssigned.map((c: any) => (
                                        <TableRow key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 group border-none">
                                            <TableCell className="w-16 py-3">
                                                <div className="h-10 w-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm border border-slate-100">
                                                    <CategoryIcon cat={c.category} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-900 whitespace-nowrap py-3">{c.name}</TableCell>
                                            <TableCell className="text-sm text-slate-500 py-3 max-w-md truncate italic">{c.description}</TableCell>
                                            <TableCell className="py-3 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleRemove(c.id)} className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                                    <Zap className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 text-sm font-medium italic">Your skill stack is ready for expansion.</p>
                                <Button onClick={() => setIsAdding(true)} variant="link" className="text-indigo-600 font-bold p-0 h-auto mt-2">Add your first skill</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── SECTION 4: SKILLS I WANT TO DEVELOP ── */}
                <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-50 rounded-xl">
                                    <Award className="h-6 w-6 text-pink-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Skills I Want to Develop</CardTitle>
                                    <CardDescription className="text-slate-500 italic mt-0.5">Request a new competency to be created and assigned to your profile.</CardDescription>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setIsRequestFormOpen(!isRequestFormOpen)}
                                className={`gap-2 rounded-xl transition-colors ${isRequestFormOpen ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-pink-600 hover:bg-pink-700 text-white"}`}
                            >
                                {isRequestFormOpen ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                {isRequestFormOpen ? "Cancel" : "+ Request a Competency"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-0 space-y-6">

                        {/* ── Request Form (collapsible) ── */}
                        {isRequestFormOpen && (
                            <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-200">
                                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-pink-500" /> Submit a Competency Request
                                </h4>
                                <div className="grid gap-4">
                                    {/* Competency Name */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                                            Competency Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="e.g. Advanced AI Prompting"
                                            value={newSkillName}
                                            onChange={(e) => setNewSkillName(e.target.value)}
                                            className="bg-white border-slate-200"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                                            <SelectTrigger className="bg-white border-slate-200">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COMPETENCY_CATEGORY_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Why do you want to develop this? */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                                            Why do you want to develop this?
                                        </label>
                                        <Textarea
                                            placeholder="Describe why this skill is important to your growth..."
                                            value={newSkillReason}
                                            onChange={(e) => setNewSkillReason(e.target.value)}
                                            className="resize-none bg-white border-slate-200 h-20"
                                        />
                                    </div>

                                    {/* How will this benefit your role? */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                                            How will this benefit your role?
                                        </label>
                                        <Textarea
                                            placeholder="Explain how developing this competency will improve your performance..."
                                            value={newSkillBenefit}
                                            onChange={(e) => setNewSkillBenefit(e.target.value)}
                                            className="resize-none bg-white border-slate-200 h-20"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSubmitSkillRequest}
                                        disabled={isSubmittingSkill || !newSkillName.trim()}
                                        className="bg-pink-600 hover:bg-pink-700 w-fit"
                                    >
                                        {isSubmittingSkill ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                        Submit Request
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ── Past Requests ── */}
                        {requests.length > 0 ? (
                            <div>
                                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Your Requests</h4>
                                <Table>
                                    <TableHeader className="bg-transparent">
                                        <TableRow className="border-b border-slate-100">
                                            <TableHead className="text-slate-500 py-2 h-auto">Competency</TableHead>
                                            <TableHead className="text-slate-500 py-2 h-auto hidden md:table-cell">Category</TableHead>
                                            <TableHead className="text-slate-500 py-2 h-auto hidden lg:table-cell">Reason</TableHead>
                                            <TableHead className="text-slate-500 py-2 h-auto w-36">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.map((req) => (
                                            <TableRow key={req.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <TableCell className="font-semibold text-slate-900 py-3">{req.name}</TableCell>
                                                <TableCell className="text-sm text-slate-500 hidden md:table-cell py-3">
                                                    <Badge variant="outline" className="text-[10px] lowercase">{req.category || "—"}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 hidden lg:table-cell italic py-3 max-w-xs truncate">{req.description || "—"}</TableCell>
                                                <TableCell className="py-3">{statusBadge(req.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            !isRequestFormOpen && (
                                <div className="text-center py-8">
                                    <div className="p-4 bg-pink-50 rounded-2xl w-fit mx-auto mb-3">
                                        <Award className="h-8 w-8 text-pink-300" />
                                    </div>
                                    <p className="text-slate-500 text-sm italic">No skill requests yet. Click &ldquo;+ Request a Competency&rdquo; to get started.</p>
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
