"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Loader2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { IndicatorPreview } from "@/components/assessments/IndicatorPreview";
import { AssessmentTypeSelector } from "@/components/assessments/AssessmentTypeSelector";
import { LevelSelector, type ProficiencyLevelStr } from "@/components/assessments/LevelSelector";

type Step = 0 | 1 | 2 | 3;

interface RoleData {
    id: string;
    name: string;
    overallLevel: string;
    _count?: { competencies: number };
    competencies?: Array<{ competency: { id: string; name: string } }>;
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

interface Props {
    slug: string;
    clientId: string;
}

export function OrgCreateAssessmentWizard({ slug, clientId }: Props) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(0);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [targetLevel, setTargetLevel] = useState<string>("JUNIOR");
    const [roleCompetencies, setRoleCompetencies] = useState<CompetencyMapping[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [weights, setWeights] = useState<Record<string, number>>({});
    const [indicatorPreview, setIndicatorPreview] = useState<any[]>([]);

    // Load roles scoped to this tenant
    useEffect(() => {
        fetch(`/api/clients/${clientId}/roles`)
            .then((r) => r.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setRoles(list);
            })
            .catch(() => setRoles([]));
    }, [clientId]);

    const fetchRoleCompetencies = useCallback(
        async (roleId: string) => {
            setLoading(true);
            try {
                const res = await fetch(`/api/clients/${clientId}/roles/${roleId}/competencies`);
                if (res.ok) {
                    const data: CompetencyMapping[] = await res.json();
                    setRoleCompetencies(data);
                    const ids = new Set<string>(data.map((rc) => rc.competencyId));
                    setSelectedIds(ids);
                    const w: Record<string, number> = {};
                    const equal = data.length > 0 ? Math.round((100 / data.length) * 10) / 10 : 0;
                    data.forEach((rc) => {
                        const raw = rc.weight ?? 1;
                        w[rc.competencyId] =
                            raw > 0 && raw <= 1
                                ? Math.round(raw * 1000) / 10
                                : typeof raw === "number" && raw > 1
                                    ? raw
                                    : equal;
                    });
                    setWeights(w);
                }
            } catch {
                toast.error("Failed to load competencies");
            } finally {
                setLoading(false);
            }
        },
        [clientId]
    );

    const handleRoleSelect = (roleId: string) => {
        setSelectedRoleId(roleId);
        fetchRoleCompetencies(roleId);
        const role = roles.find((r) => r.id === roleId);
        if (role) setName(`${role.name} - ${targetLevel} Assessment`);
    };

    useEffect(() => {
        if (!selectedRoleId || !name) return;
        const role = roles.find((r) => r.id === selectedRoleId);
        if (role) setName(`${role.name} - ${targetLevel} Assessment`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetLevel]);

    const totalWeight = Object.keys(weights).reduce((s, k) => {
        if (selectedIds.has(k)) return s + (weights[k] ?? 0);
        return s;
    }, 0);
    const weightsValid = Math.abs(totalWeight - 100) <= 0.5;
    const selectedCompetencies = roleCompetencies.filter((rc) => selectedIds.has(rc.competencyId));

    const toggleCompetency = (compId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(compId)) next.delete(compId);
            else next.add(compId);
            return next;
        });
    };

    const normalizeWeights = () => {
        const sum = selectedCompetencies.reduce((s, c) => s + (weights[c.competencyId] ?? 0), 0);
        if (sum <= 0) return;
        const next: Record<string, number> = { ...weights };
        selectedCompetencies.forEach((c) => {
            next[c.competencyId] = Math.round(((weights[c.competencyId] ?? 0) / sum) * 1000) / 10;
        });
        setWeights(next);
    };

    const goToStep3 = async () => {
        if (selectedIds.size === 0) {
            toast.error("Select at least one competency");
            return;
        }
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
            } else {
                // Still allow proceeding without preview
                setStep(3);
            }
        } catch {
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("Please enter a name for the assessment");
            return;
        }
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
                    name: name.trim(),
                    description,
                    competencyWeights,
                    tenantId: clientId,
                }),
            });
            if (res.ok) {
                const model = await res.json();
                toast.success("Assessment created successfully");
                router.push(`/assessments/org/${slug}/assessments/${model.id}/questions`);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.details || err.error || "Failed to create assessment");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <header>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Link href={`/assessments/org/${slug}/assessments`} className="hover:text-foreground">
                        Assessments
                    </Link>
                    <span>/</span>
                    <span>Create</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Create Assessment</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Select a role, proficiency level, and competencies to build an assessment for your org.
                </p>
            </header>

            {/* Steps */}
            <div className="flex flex-wrap gap-2">
                {STEPS.map((s, i) => (
                    <div key={s.num} className="flex items-center">
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${step === s.num
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
                                className={`w-6 h-0.5 mx-1 rounded-full ${step > s.num ? "bg-primary" : "bg-muted"}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 0: Type Selector */}
            {step === 0 && (
                <AssessmentTypeSelector
                    userRole="ORG_USER"
                    orgSlug={slug}
                    onSelect={(type) => {
                        if (type === 'role') setStep(1);
                        if (type === 'competency') router.push(`/assessments/org/${slug}/assessments/competency-builder`);
                        if (type === 'component') router.push(`/assessments/org/${slug}/assessments/component-builder`);
                    }}
                />
            )}

            {/* Step 1: Role & Level */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Role & level</CardTitle>
                        <CardDescription>
                            Choose the job role and target proficiency level for this assessment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <Label>Job role</Label>
                            <Select value={selectedRoleId} onValueChange={handleRoleSelect}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Select a role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.length === 0 && (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No roles found — create roles first
                                        </div>
                                    )}
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Proficiency level</Label>
                            <LevelSelector
                                value={targetLevel as ProficiencyLevelStr}
                                onChange={(level) => setTargetLevel(level)}
                                className="mt-1.5"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/assessments/org/${slug}/assessments`)}
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                            <Button
                                onClick={() => selectedRoleId && setStep(2)}
                                disabled={!selectedRoleId || loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                Continue <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Competencies */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select competencies</CardTitle>
                        <CardDescription>
                            Choose which competencies to include and adjust their weights (must total 100%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : roleCompetencies.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                This role has no competencies yet. Add competencies to the role first.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {roleCompetencies.map((rc) => {
                                    const isSelected = selectedIds.has(rc.competencyId);
                                    const val = weights[rc.competencyId] ?? 0;
                                    return (
                                        <div
                                            key={rc.competencyId}
                                            className={`p-3 rounded-lg border transition-colors ${isSelected ? "border-primary/50 bg-primary/5" : "border-border"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleCompetency(rc.competencyId)}
                                                />
                                                <span className="text-sm font-medium flex-1">
                                                    {rc.competency.name}
                                                </span>
                                                {isSelected && (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step={0.5}
                                                            value={val === 0 ? "" : val}
                                                            onChange={(e) => {
                                                                const num = parseFloat(e.target.value);
                                                                if (!Number.isNaN(num))
                                                                    setWeights({
                                                                        ...weights,
                                                                        [rc.competencyId]: Math.min(100, Math.max(0, num)),
                                                                    });
                                                                else
                                                                    setWeights({
                                                                        ...weights,
                                                                        [rc.competencyId]: 0,
                                                                    });
                                                            }}
                                                            className="h-7 w-16 text-right text-xs"
                                                        />
                                                        <span className="text-xs text-muted-foreground">%</span>
                                                        <Slider
                                                            value={[val]}
                                                            max={100}
                                                            step={0.5}
                                                            onValueChange={([v]) =>
                                                                setWeights({ ...weights, [rc.competencyId]: v })
                                                            }
                                                            className="w-20"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Total:</span>
                                        <Badge
                                            variant={
                                                weightsValid
                                                    ? "default"
                                                    : totalWeight > 100
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {totalWeight.toFixed(1)}%
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={normalizeWeights}
                                        disabled={selectedCompetencies.length === 0}
                                    >
                                        Auto-balance to 100%
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                            <Button
                                onClick={goToStep3}
                                disabled={selectedIds.size === 0 || !weightsValid || loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                Continue <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Confirm & Create */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create assessment</CardTitle>
                        <CardDescription>Name your assessment and confirm the settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <Label>Assessment name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Senior Software Engineer Assessment"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label>Description (optional)</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this assessment..."
                                className="mt-1.5"
                            />
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                            <p>
                                <span className="font-medium">Role:</span>{" "}
                                {roles.find((r) => r.id === selectedRoleId)?.name ?? selectedRoleId}
                            </p>
                            <p>
                                <span className="font-medium">Level:</span> {targetLevel}
                            </p>
                            <p>
                                <span className="font-medium">Competencies:</span>{" "}
                                {selectedCompetencies.length} selected
                            </p>
                        </div>

                        {indicatorPreview.length > 0 && (
                            <div className="border-t pt-4">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Indicators (
                                        {indicatorPreview.reduce(
                                            (a, p) => a + (p.indicators?.length || 0),
                                            0
                                        )}
                                        )
                                    </span>
                                    {showPreview ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </Button>
                                {showPreview && (
                                    <div className="mt-4">
                                        <IndicatorPreview
                                            competencies={selectedCompetencies.map((rc) => ({
                                                name: rc.competency.name,
                                                targetLevel: targetLevel as any,
                                                indicators:
                                                    indicatorPreview.find(
                                                        (p) => p.competencyId === rc.competencyId
                                                    )?.indicators || [],
                                            }))}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleCreate}
                                disabled={creating || !weightsValid || !name.trim()}
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                Create Assessment
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
