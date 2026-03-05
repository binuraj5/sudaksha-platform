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
import { useAssessmentBuilder } from "@/hooks/useAssessmentBuilder";

type Step = 1 | 2 | 3;
type SourceType = 'ROLE_BASED' | 'COMPETENCY_BASED' | 'CUSTOM' | 'TEMPLATE';

interface CreateAssessmentWizardProps {
    clientId?: string;
    redirectBase: string;
}

export function CreateAssessmentWizard({ clientId, redirectBase }: CreateAssessmentWizardProps) {
    const router = useRouter();
    const builder = useAssessmentBuilder();

    const [step, setStep] = useState<Step>(1);
    const [sourceType, setSourceType] = useState<SourceType | null>(null);
    const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS'>('ALL');
    const [recommendations, setRecommendations] = useState<{ id: string; category: string; recommendationText: string; rationale: string; autoApplyValues: Record<string, unknown> | null }[]>([]);

    const rolesUrl = clientId ? `/api/clients/${clientId}/roles` : "/api/admin/roles";

    useEffect(() => {
        if (step === 2 && builder.roles.length === 0) {
            builder.fetchRoles(rolesUrl);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, clientId]);

    useEffect(() => {
        if (!builder.selectedRoleId || !builder.targetLevel) return;
        const audience = targetAudience === 'STUDENTS' ? 'STUDENTS' : '';
        fetch(`/api/recommendations/assessment?roleLevel=${builder.targetLevel}&targetAudience=${audience}`)
            .then((r) => r.json())
            .then((data) => setRecommendations(data.recommendations || []))
            .catch(() => setRecommendations([]));
    }, [builder.selectedRoleId, builder.targetLevel, targetAudience]);

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
        builder.setSelectedRoleId(roleId);
        const url = clientId
            ? `/api/clients/${clientId}/roles/${roleId}/competencies`
            : `/api/admin/roles/${roleId}/competencies`;
        builder.fetchRoleCompetencies(roleId, url);
        const role = builder.roles.find((r) => r.id === roleId);
        if (role && !builder.name) {
            builder.setName(`${role.name} - ${builder.targetLevel} Assessment`);
        }
    };

    const goToPreview = async () => {
        const ok = await builder.fetchPreview(
            builder.roleCompetencies.map((rc) => rc.competencyId),
            builder.targetLevel
        );
        if (ok) setStep(3);
        else toast.error("Failed to generate preview");
    };

    const totalWeight = Object.values(builder.weights).reduce((a, b) => a + b, 0);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="mb-12 flex items-center justify-between px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                            step === s ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
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
                                <Select onValueChange={handleRoleSelect} value={builder.selectedRoleId}>
                                    <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/30 text-lg font-bold">
                                        <SelectValue placeholder="Choose a role..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                                        {builder.roles.map(role => (
                                            <SelectItem key={role.id} value={role.id} className="h-12 font-medium">
                                                {role.name} ({role._count?.competencies ?? 0} Competencies)
                                            </SelectItem>
                                        ))}
                                        {builder.roles.length === 0 && !builder.loading && (
                                            <SelectItem value="_" disabled>No roles available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Target audience</Label>
                                <div className="flex gap-2">
                                    <Button type="button" variant={targetAudience === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setTargetAudience('ALL')}>All</Button>
                                    <Button type="button" variant={targetAudience === 'STUDENTS' ? 'default' : 'outline'} size="sm" onClick={() => {
                                        setTargetAudience('STUDENTS');
                                        if (['SENIOR', 'EXPERT'].includes(builder.targetLevel)) builder.setTargetLevel('JUNIOR');
                                    }}>Students</Button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Target Proficiency Level</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'].map(level => {
                                        const disabledForStudents = targetAudience === 'STUDENTS' && (level === 'SENIOR' || level === 'EXPERT');
                                        const el = (
                                            <div key={level} onClick={() => !disabledForStudents && builder.setTargetLevel(level)}
                                                className={`p-4 rounded-2xl border-2 transition-all text-center space-y-1 ${disabledForStudents ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100" : "cursor-pointer"} ${builder.targetLevel === level && !disabledForStudents ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : !disabledForStudents ? "bg-white border-gray-100 text-gray-500 hover:border-indigo-200" : ""}`}>
                                                <p className="text-[10px] font-black tracking-tighter uppercase">{level === 'MIDDLE' ? 'Mid-Level' : level}</p>
                                                <Target className={`w-5 h-5 mx-auto ${builder.targetLevel === level && !disabledForStudents ? "text-indigo-200" : "text-gray-300"}`} />
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
                                    onClick={goToPreview} disabled={!builder.selectedRoleId || builder.loading}>
                                    {builder.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "See Smart Selection"}
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
                            <p className="text-gray-500 font-medium">Auto-selected {builder.indicatorPreview.length} competencies based on {builder.targetLevel} level.</p>
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
                                        <Input value={builder.name} onChange={e => builder.setName(e.target.value)} className="h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-gray-400">Description</Label>
                                        <Input value={builder.description} onChange={e => builder.setDescription(e.target.value)} placeholder="Optional purpose..." className="h-11 rounded-xl" />
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
                                    {builder.roleCompetencies.map(rc => (
                                        <div key={rc.competencyId} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-bold text-gray-700">{rc.competency.name}</Label>
                                                <span className="text-xs font-black text-indigo-600">{(builder.weights[rc.competencyId] || 0).toFixed(1)}%</span>
                                            </div>
                                            <Slider value={[builder.weights[rc.competencyId] || 0]} max={100} step={0.5}
                                                onValueChange={([val]) => builder.setWeights({ ...builder.weights, [rc.competencyId]: val })} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Button className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black italic shadow-2xl shadow-indigo-200 gap-3"
                                onClick={() => builder.handleCreate(
                                    {
                                        roleId: builder.selectedRoleId,
                                        targetLevel: builder.targetLevel,
                                        name: builder.name,
                                        description: builder.description,
                                        competencyWeights: builder.weights,
                                        ...(clientId ? { tenantId: clientId } : {}),
                                    },
                                    (model) => router.push(`${redirectBase}/${model.id}/builder`)
                                )}
                                disabled={builder.creating || Math.abs(totalWeight - 100) > 0.1}>
                                {builder.creating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Build Smart Assessment"}
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                        <div className="lg:col-span-3">
                            <IndicatorPreview competencies={builder.roleCompetencies.map(rc => ({
                                name: rc.competency.name,
                                targetLevel: builder.targetLevel as any,
                                indicators: builder.indicatorPreview.find((p: any) => p.competencyId === rc.competencyId)?.indicators || []
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
