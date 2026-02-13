"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Briefcase,
    BookOpen,
    Puzzle,
    Layout,
    Loader2,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IndicatorPreview } from "@/components/assessments/IndicatorPreview";
import { RecommendationCard } from "@/components/assessments/RecommendationCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { STUDENT_LEVEL_TOOLTIP } from "@/lib/assessment-student-restrictions";

type Step = 1 | 2 | 3;
type SourceType = 'ROLE_BASED' | 'COMPETENCY_BASED' | 'CUSTOM' | 'TEMPLATE';

interface RoleData {
    id: string;
    name: string;
    description: string;
    _count?: { competencies: number };
}

interface CompetencyMapping {
    id: string;
    competencyId: string;
    competency: {
        id: string;
        name: string;
        category: string;
    };
    weight: number;
    requiredLevel: string;
}

interface CreateAssessmentWizardProps {
    clientId?: string;
    redirectBase: string;
}

export function CreateAssessmentWizard({ clientId, redirectBase }: CreateAssessmentWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const [sourceType, setSourceType] = useState<SourceType | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [targetLevel, setTargetLevel] = useState<string>("JUNIOR");
    const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS'>('ALL');
    const [recommendations, setRecommendations] = useState<{ id: string; category: string; recommendationText: string; rationale: string; autoApplyValues: Record<string, unknown> | null }[]>([]);

    const [roles, setRoles] = useState<RoleData[]>([]);
    const [roleCompetencies, setRoleCompetencies] = useState<CompetencyMapping[]>([]);
    const [weights, setWeights] = useState<Record<string, number>>({});
    const [indicatorPreview, setIndicatorPreview] = useState<any[]>([]);

    const rolesUrl = clientId ? `/api/clients/${clientId}/roles` : "/api/admin/roles";
    const roleCompetenciesUrl = clientId
        ? `/api/clients/${clientId}/roles/${selectedRoleId}/competencies`
        : `/api/admin/roles/${selectedRoleId}/competencies`;

    useEffect(() => {
        if (step === 2 && roles.length === 0) {
            fetchRoles();
        }
    }, [step, clientId]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await fetch(rolesUrl);
            if (res.ok) {
                const data = await res.json();
                setRoles(Array.isArray(data) ? data : data?.roles || data?.models || []);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to load roles");
            }
        } catch (error) {
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleCompetencies = async (roleId: string) => {
        if (!roleId) return;
        setLoading(true);
        try {
            const url = clientId ? `/api/clients/${clientId}/roles/${roleId}/competencies` : `/api/admin/roles/${roleId}/competencies`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : data?.competencies || [];
                setRoleCompetencies(list);

                const initialWeights: Record<string, number> = {};
                list.forEach((rc: CompetencyMapping) => {
                    initialWeights[rc.competencyId] = rc.weight;
                });
                setWeights(initialWeights);

                const role = roles.find(r => r.id === roleId);
                if (role && !name) {
                    setName(`${role.name} - ${targetLevel} Assessment`);
                }
            } else {
                toast.error("Failed to load role competencies");
            }
        } catch (error) {
            toast.error("Failed to load role competencies");
        } finally {
            setLoading(false);
        }
    };

    const handleSourceSelect = (type: SourceType) => {
        setSourceType(type);
        if (type === 'CUSTOM') {
            toast.error("Direct manual creation is currently managed via the main list.");
            return;
        }
        if (type === 'TEMPLATE') {
            toast.error("From Template - use the main assessments list to clone from existing.");
            return;
        }
        setStep(2);
    };

    const handleRoleSelect = (roleId: string) => {
        setSelectedRoleId(roleId);
        fetchRoleCompetencies(roleId);
    };

    useEffect(() => {
        if (!selectedRoleId || !targetLevel) return;
        const audience = targetAudience === 'STUDENTS' ? 'STUDENTS' : undefined;
        fetch(`/api/recommendations/assessment?roleLevel=${targetLevel}&targetAudience=${audience || ''}`)
            .then((r) => r.json())
            .then((data) => setRecommendations(data.recommendations || []))
            .catch(() => setRecommendations([]));
    }, [selectedRoleId, targetLevel, targetAudience]);

    const fetchPreview = async () => {
        if (!selectedRoleId || roleCompetencies.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch("/api/assessments/admin/indicators/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    competencyIds: roleCompetencies.map(rc => rc.competencyId),
                    targetLevel
                })
            });
            if (res.ok) {
                const data = await res.json();
                setIndicatorPreview(Array.isArray(data) ? data : data?.indicators || []);
                setStep(3);
            } else {
                toast.error("Failed to generate preview");
            }
        } catch (error) {
            toast.error("Failed to generate preview");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setCreating(true);
        try {
            const body: Record<string, unknown> = {
                roleId: selectedRoleId,
                targetLevel,
                name,
                description,
                competencyWeights: weights
            };
            if (clientId) body.tenantId = clientId;

            const res = await fetch("/api/assessments/admin/models/from-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const model = await res.json();
                toast.success("Assessment created successfully!");
                router.push(`${redirectBase}/${model.id}/questions`);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to create assessment");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setCreating(false);
        }
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="mb-12 flex items-center justify-between px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step === s ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
                            step > s ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                            }`}>
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </div>
                        {s < 3 && <div className={`w-24 h-1 mx-2 rounded-full ${step > s ? "bg-green-500" : "bg-gray-200"}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">How do you want to create?</h1>
                        <p className="text-gray-500 font-medium">Select a source to pre-populate assessment content and indicators.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SourceCard icon={<Briefcase className="w-8 h-8" />} title="Based on Role" description="Auto-populate competencies and indicators from a predefined job role." onClick={() => handleSourceSelect('ROLE_BASED')} accent="indigo" />
                        <SourceCard icon={<BookOpen className="w-8 h-8" />} title="Based on Competencies" description="Select specific competencies and levels." onClick={() => handleSourceSelect('COMPETENCY_BASED')} accent="purple" />
                        <SourceCard icon={<Puzzle className="w-8 h-8" />} title="Custom (Manual)" description="Build from scratch." onClick={() => handleSourceSelect('CUSTOM')} accent="slate" />
                        <SourceCard icon={<Layout className="w-8 h-8" />} title="From Template" description="Use an existing structure." onClick={() => handleSourceSelect('TEMPLATE')} accent="blue" />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Define Parameters</h1>
                        <p className="text-gray-500 font-medium">Specify the target role and expected proficiency level.</p>
                    </div>
                    <Card className="border-none shadow-2xl shadow-indigo-100 ring-1 ring-gray-100 overflow-hidden rounded-[2rem]">
                        <CardContent className="p-10 space-y-10">
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Select Job Role</Label>
                                <Select onValueChange={handleRoleSelect} value={selectedRoleId}>
                                    <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 text-lg font-bold">
                                        <SelectValue placeholder="Choose a role..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id} className="h-12 font-medium">
                                                {role.name} ({role._count?.competencies ?? 0} Competencies)
                                            </SelectItem>
                                        ))}
                                        {roles.length === 0 && !loading && (
                                            <SelectItem value="_" disabled>No roles available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Target audience</Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant={targetAudience === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setTargetAudience('ALL')}>All</Button>
                                    <Button type="button" variant={targetAudience === 'STUDENTS' ? 'default' : 'outline'} size="sm" onClick={() => { setTargetAudience('STUDENTS'); if (['SENIOR', 'EXPERT'].includes(targetLevel)) setTargetLevel('JUNIOR'); }}>Students</Button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Target Proficiency Level</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'].map(level => {
                                        const disabledForStudents = targetAudience === 'STUDENTS' && (level === 'SENIOR' || level === 'EXPERT');
                                        const el = (
                                            <div key={level} onClick={() => !disabledForStudents && setTargetLevel(level)}
                                                className={`p-4 rounded-2xl border-2 transition-all text-center space-y-1 ${disabledForStudents ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100" : "cursor-pointer "} ${targetLevel === level && !disabledForStudents ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : !disabledForStudents ? "bg-white border-gray-100 text-gray-500 hover:border-indigo-200" : ""}`}>
                                                <p className="text-[10px] font-black tracking-tighter uppercase">{level === 'MIDDLE' ? 'Mid-Level' : level}</p>
                                                <Target className={`w-5 h-5 mx-auto ${targetLevel === level && !disabledForStudents ? "text-indigo-200" : "text-gray-300"}`} />
                                            </div>
                                        );
                                        return disabledForStudents ? (
                                            <TooltipProvider key={level}>
                                                <Tooltip><TooltipTrigger asChild>{el}</TooltipTrigger>
                                                    <TooltipContent className="max-w-xs"><p>{STUDENT_LEVEL_TOOLTIP}</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : el;
                                    })}
                                </div>
                                {targetAudience === 'STUDENTS' && <p className="text-xs text-muted-foreground">{STUDENT_LEVEL_TOOLTIP}</p>}
                                {recommendations.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-xs text-muted-foreground">Suggestions</Label>
                                        {recommendations.map((rec) => (
                                            <RecommendationCard key={rec.id} recommendation={rec} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <Button variant="ghost" onClick={() => setStep(1)} className="h-12 w-12 p-0 rounded-2xl border-2 border-transparent hover:bg-gray-100">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <Button className="flex-1 h-14 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-700 text-lg font-black italic shadow-xl shadow-indigo-100 gap-3"
                                    onClick={fetchPreview} disabled={!selectedRoleId || loading}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "See Smart Selection"}
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 italic tracking-tight">Refine & Finalize</h1>
                            <p className="text-gray-500 font-medium">Auto-selected {indicatorPreview.length} competencies based on {targetLevel} level.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl h-10 border-gray-200 gap-2" onClick={() => setStep(2)}>
                            <ArrowLeft className="w-4 h-4" /> Change Role
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-lg ring-1 ring-gray-100 rounded-3xl">
                                <CardHeader className="p-6 pb-2">
                                    <CardTitle className="text-lg font-bold">Assessment Info</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-gray-400">Model Name</Label>
                                        <Input value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-gray-400">Description</Label>
                                        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional purpose..." className="h-11 rounded-xl" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-lg ring-1 ring-gray-100 rounded-3xl overflow-hidden">
                                <CardHeader className="p-6 bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold">Competency Weights</CardTitle>
                                        <Badge className={totalWeight > 100 ? "bg-red-500" : "bg-green-500"}>
                                            Sum: {totalWeight.toFixed(1)}/100
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">
                                    {roleCompetencies.map(rc => (
                                        <div key={rc.competencyId} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold text-gray-700">{rc.competency.name}</Label>
                                                <span className="text-xs font-black text-indigo-600">{(weights[rc.competencyId] || 0).toFixed(1)}%</span>
                                            </div>
                                            <Slider value={[weights[rc.competencyId] || 0]} max={100} step={0.5}
                                                onValueChange={([val]) => setWeights({ ...weights, [rc.competencyId]: val })} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Button className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black italic shadow-2xl shadow-indigo-200 gap-3"
                                onClick={handleCreate} disabled={creating || Math.abs(totalWeight - 100) > 0.1}>
                                {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Build Smart Assessment"}
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                        <div className="lg:col-span-3">
                            <IndicatorPreview competencies={roleCompetencies.map(rc => ({
                                name: rc.competency.name,
                                targetLevel: targetLevel as any,
                                indicators: indicatorPreview.find((p: any) => p.competencyId === rc.competencyId)?.indicators || []
                            }))} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SourceCard({ icon, title, description, onClick, accent }: { icon: any, title: string, description: string, onClick: () => void, accent: string }) {
    const accentMap: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-500 ring-indigo-500",
        purple: "bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-500 ring-purple-500",
        slate: "bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-500 ring-slate-500",
        blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-500 ring-blue-500",
    };
    return (
        <div role="button" tabIndex={0} className="block" onClick={onClick} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}>
            <Card className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-indigo-500/10 ${accentMap[accent] || accentMap.indigo}`}>
                <div className="space-y-4">
                    <div className="mb-4">{icon}</div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                        <p className="text-xs font-medium text-gray-500 opacity-80 group-hover:opacity-100">{description}</p>
                    </div>
                    <div className="pt-2">
                        <div className="inline-flex items-center text-[10px] font-black uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            Get Started <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
