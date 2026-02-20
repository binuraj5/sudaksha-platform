"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Briefcase,
    Loader2,
    Layout,
    Target,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IndicatorPreview } from "@/components/assessments/IndicatorPreview";
import { ModelCompetencySelector } from "@/components/assessments/ModelCompetencySelector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { STUDENT_LEVEL_TOOLTIP } from "@/lib/assessment-student-restrictions";
import { useRoleCompetencyPermissions } from "@/hooks/useRoleCompetencyPermissions";

type Step = 1 | 2 | 3;

interface RoleData {
    id: string;
    name: string;
    _count: { competencies: number };
}

interface CompetencyMapping {
    id: string;
    competencyId: string;
    weight: number;
    competency: { id: string; name: string; category: string };
}

const STEPS = [
    { num: 1, label: "Role & level" },
    { num: 2, label: "Competencies" },
    { num: 3, label: "Create" },
];

const WIZARD_WEIGHTS_KEY = "assessment-wizard-competency-weights";

export default function CreateAssessmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const permissions = useRoleCompetencyPermissions();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [targetLevel, setTargetLevel] = useState<string>("JUNIOR");
    const [targetAudience, setTargetAudience] = useState<"ALL" | "STUDENTS">("ALL");
    const [roleCompetencies, setRoleCompetencies] = useState<CompetencyMapping[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [weights, setWeights] = useState<Record<string, number>>({});
    const [indicatorPreview, setIndicatorPreview] = useState<any[]>([]);

    const fetchRoleCompetencies = useCallback(async (roleId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/roles/${roleId}/competencies`);
            if (res.ok) {
                const data = await res.json();
                setRoleCompetencies(data);
                const ids = new Set<string>(data.map((rc: CompetencyMapping) => rc.competencyId));
                setSelectedIds(ids);
                const w: Record<string, number> = {};
                data.forEach((rc: CompetencyMapping) => {
                    const raw = rc.weight ?? 1;
                    w[rc.competencyId] =
                        raw > 0 && raw <= 1 ? raw * 100 : typeof raw === "number" ? raw : 100 / data.length;
                });
                const total = Object.values(w).reduce((s, v) => s + v, 0);
                if (total <= 0) {
                    const equal = data.length > 0 ? 100 / data.length : 0;
                    data.forEach((rc: CompetencyMapping) => (w[rc.competencyId] = equal));
                } else if (Math.abs(total - 100) > 0.5) {
                    Object.keys(w).forEach((id) => {
                        w[id] = Math.round((w[id] / total) * 1000) / 10;
                    });
                }
                setWeights(w);
            }
        } catch {
            toast.error("Failed to load competencies");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch("/api/admin/roles")
            .then((r) => r.json())
            .then((data) => {
                const list = data?.roles ?? (Array.isArray(data) ? data : []);
                setRoles(Array.isArray(list) ? list : []);
            })
            .catch(() => setRoles([]));
    }, []);

    const urlRoleId = searchParams.get("roleId");
    const urlLevel = searchParams.get("level");
    const urlRoleName = searchParams.get("roleName");
    const isWizardEntry = searchParams.get("wizard") === "1";

    useEffect(() => {
        if (!urlRoleId || !urlLevel) return;
        const validLevels = ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"];
        if (!validLevels.includes(urlLevel)) return;
        setSelectedRoleId(urlRoleId);
        setTargetLevel(urlLevel);
        if (urlRoleName) setName(`${decodeURIComponent(urlRoleName)} - ${urlLevel} Assessment`);
        fetchRoleCompetencies(urlRoleId);
        if (isWizardEntry) setStep(2);
    }, [urlRoleId, urlLevel, urlRoleName, isWizardEntry, fetchRoleCompetencies]);

    useEffect(() => {
        if (!selectedRoleId || name) return;
        const role = roles.find((r) => r.id === selectedRoleId);
        if (role) setName(`${role.name} - ${targetLevel} Assessment`);
    }, [roles, selectedRoleId, targetLevel, name]);

    const handleRoleSelect = (roleId: string) => {
        setSelectedRoleId(roleId);
        fetchRoleCompetencies(roleId);
    };

    const totalWeight = Object.keys(weights).reduce((s, k) => s + (weights[k] ?? 0), 0);
    const weightsValid = Math.abs(totalWeight - 100) <= 0.5;
    const selectedCompetencies = roleCompetencies.filter((rc) => selectedIds.has(rc.competencyId));

    const fetchPreview = async () => {
        if (!selectedRoleId || selectedCompetencies.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch("/api/assessments/admin/indicators/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    competencyIds: selectedCompetencies.map((rc) => rc.competencyId),
                    targetLevel,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setIndicatorPreview(data);
                setStep(3);
            }
        } catch {
            toast.error("Failed to generate preview");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const competencyWeights: Record<string, number> = {};
        selectedCompetencies.forEach((rc) => {
            const w = weights[rc.competencyId];
            if (w != null) competencyWeights[rc.competencyId] = w;
        });

        setCreating(true);
        try {
            const res = await fetch("/api/assessments/admin/models/from-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleId: selectedRoleId,
                    targetLevel,
                    name,
                    description,
                    competencyWeights,
                }),
            });
            if (res.ok) {
                const model = await res.json();
                toast.success("Assessment created");
                router.push(`/assessments/admin/models/${model.id}/questions`);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.details || err.error || "Failed to create");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setCreating(false);
        }
    };

    const goToComponentWizard = () => {
        if (selectedIds.size === 0) {
            toast.error("Select at least one competency");
            return;
        }
        const ids = Array.from(selectedIds).join(",");
        const weightsToPass: Record<string, number> = {};
        selectedCompetencies.forEach((rc) => {
            const w = weights[rc.competencyId];
            if (w != null) weightsToPass[rc.competencyId] = w;
        });
        try {
            sessionStorage.setItem(WIZARD_WEIGHTS_KEY, JSON.stringify(weightsToPass));
        } catch {
            /* ignore */
        }
        router.push(
            `/assessments/admin/models/build?roleId=${selectedRoleId}&level=${targetLevel}&competencyIds=${ids}`
        );
    };

    const normalizeWeights = () => {
        const sum = selectedCompetencies.reduce((s, c) => s + (weights[c.competencyId] ?? 0), 0);
        if (sum <= 0) return;
        const next: Record<string, number> = {};
        selectedCompetencies.forEach((c) => {
            next[c.competencyId] = Math.round((((weights[c.competencyId] ?? 0) / sum) * 1000) / 10);
        });
        setWeights(next);
    };

    return (
        <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
            <header>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Link href="/assessments/admin/models" className="hover:text-foreground">
                        Models
                    </Link>
                    <span>/</span>
                    <span>Create</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Create Assessment</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Select a role, level, and competencies. Each model is unique to your selection.
                </p>
            </header>

            <div className="flex flex-wrap gap-2">
                {STEPS.map((s, i) => (
                    <div key={s.num} className="flex items-center">
                        <div
                            className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium ${step === s.num
                                ? "bg-primary text-primary-foreground"
                                : step > s.num
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`w-4 sm:w-6 h-0.5 mx-1 rounded-full ${step > s.num ? "bg-primary" : "bg-muted"}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base sm:text-lg">Role & level</CardTitle>
                        <CardDescription>
                            Choose the job role and target proficiency. Indicators will be filtered by level.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        {!permissions.canApproveGlobal && !!permissions.creatableScope && (
                            <div className="text-sm font-medium text-blue-800 bg-blue-50 border border-blue-200 p-3 rounded-md">
                                ℹ️ This assessment will be created at <strong>{permissions.creatableScope.toLowerCase()}</strong> level.
                                {permissions.canSubmitForGlobal && " You can submit it for global review later."}
                            </div>
                        )}
                        {permissions.isInstitution && (
                            <div className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md">
                                🔒 Note: Institutions can only create assessments at the Junior/Fresher level.
                            </div>
                        )}
                        <div>
                            <Label>Job role</Label>
                            <Select value={selectedRoleId} onValueChange={handleRoleSelect}>
                                <SelectTrigger className="h-10 sm:h-11 mt-1.5">
                                    <SelectValue placeholder="Choose a role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.name} ({r._count.competencies} competencies)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Target audience</Label>
                            <div className="flex gap-2 mt-1.5">
                                <Button
                                    type="button"
                                    variant={targetAudience === "ALL" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTargetAudience("ALL")}
                                >
                                    All
                                </Button>
                                <Button
                                    type="button"
                                    variant={targetAudience === "STUDENTS" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setTargetAudience("STUDENTS");
                                        if (["SENIOR", "EXPERT"].includes(targetLevel)) setTargetLevel("JUNIOR");
                                    }}
                                >
                                    Students
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label>Proficiency level</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                                {(["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"] as const).map((level) => {
                                    const disabled =
                                        (targetAudience === "STUDENTS" && (level === "SENIOR" || level === "EXPERT")) ||
                                        (permissions.isInstitution && level !== "JUNIOR");
                                    const el = (
                                        <div
                                            key={level}
                                            onClick={() => !disabled && setTargetLevel(level)}
                                            className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${disabled ? "opacity-50 cursor-not-allowed bg-muted/50" : ""
                                                } ${targetLevel === level && !disabled ? "bg-primary border-primary text-primary-foreground" : "hover:border-primary/50"}`}
                                        >
                                            <p className="text-xs font-medium">
                                                {level === "MIDDLE" ? "Mid" : level}
                                            </p>
                                            <Target className="w-4 h-4 mx-auto mt-1 opacity-70" />
                                        </div>
                                    );
                                    return disabled ? (
                                        <TooltipProvider key={level}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>{el}</TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>{STUDENT_LEVEL_TOOLTIP}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        el
                                    );
                                })}
                            </div>
                            {targetAudience === "STUDENTS" && (
                                <p className="text-xs text-muted-foreground mt-1">{STUDENT_LEVEL_TOOLTIP}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <div className="flex flex-col-reverse sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => router.push("/assessments/admin/models")}>
                                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                                </Button>
                                <Button
                                    onClick={() => selectedRoleId && setStep(2)}
                                    disabled={!selectedRoleId || loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            {selectedRoleId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        router.push(
                                            `/assessments/admin/models/build?roleId=${selectedRoleId}&level=${targetLevel}`
                                        )
                                    }
                                    disabled={loading}
                                >
                                    <Layout className="w-4 h-4 mr-1" />
                                    Build from role (select competencies in wizard)
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base sm:text-lg">Select competencies</CardTitle>
                        <CardDescription>
                            Choose which competencies to include in this model. Weights apply to this model only.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ModelCompetencySelector
                            competencies={roleCompetencies}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            weights={weights}
                            onWeightsChange={setWeights}
                            roleId={selectedRoleId}
                            loading={loading}
                            compact
                        />

                        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                            <div className="flex flex-col sm:flex-row gap-2 flex-1">
                                <Button
                                    variant="secondary"
                                    onClick={goToComponentWizard}
                                    disabled={selectedIds.size === 0}
                                >
                                    <Layout className="w-4 h-4 mr-1" /> Component Wizard
                                </Button>
                                <Button
                                    onClick={fetchPreview}
                                    disabled={selectedIds.size === 0 || !weightsValid || loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base sm:text-lg">Create assessment</CardTitle>
                                <CardDescription>Name it and confirm. Weights saved to this model only.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                                Change selection
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4">
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Project Manager - Senior Assessment"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label>Description (optional)</Label>
                                <Input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief purpose..."
                                    className="mt-1.5"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Weights</Label>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={
                                            weightsValid ? "default" : totalWeight > 100 ? "destructive" : "secondary"
                                        }
                                    >
                                        {totalWeight.toFixed(1)}%
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={normalizeWeights}
                                        disabled={selectedCompetencies.length === 0}
                                    >
                                        Normalize
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedCompetencies.map((rc) => {
                                    const val = weights[rc.competencyId] ?? 0;
                                    return (
                                        <div
                                            key={rc.competencyId}
                                            className="flex flex-col sm:flex-row sm:items-center gap-2 py-2"
                                        >
                                            <span className="text-sm font-medium truncate flex-1">
                                                {rc.competency.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step={0.5}
                                                    value={val === 0 ? "" : val}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        if (raw === "") {
                                                            setWeights({ ...weights, [rc.competencyId]: 0 });
                                                            return;
                                                        }
                                                        const num = parseFloat(raw);
                                                        if (!Number.isNaN(num))
                                                            setWeights({
                                                                ...weights,
                                                                [rc.competencyId]: Math.min(100, Math.max(0, num)),
                                                            });
                                                    }}
                                                    className="h-8 w-16 text-right"
                                                />
                                                <span className="text-sm text-muted-foreground">%</span>
                                                <Slider
                                                    value={[val]}
                                                    max={100}
                                                    step={0.5}
                                                    onValueChange={([v]) =>
                                                        setWeights({ ...weights, [rc.competencyId]: v })
                                                    }
                                                    className="w-20 sm:w-24"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Indicators ({indicatorPreview.reduce((a, p) => a + (p.indicators?.length || 0), 0)})
                                </span>
                                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            {showPreview && (
                                <div className="mt-4">
                                    <IndicatorPreview
                                        competencies={selectedCompetencies.map((rc) => ({
                                            name: rc.competency.name,
                                            targetLevel: targetLevel as any,
                                            indicators:
                                                indicatorPreview.find((p) => p.competencyId === rc.competencyId)
                                                    ?.indicators || [],
                                        }))}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                Back
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleCreate}
                                disabled={creating || !weightsValid || !name.trim()}
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                Create assessment
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
