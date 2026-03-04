"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ComponentSuggester,
    ComponentType,
    type ComponentSuggestion,
} from "@/lib/assessment/component-suggester";
import { ComponentBuildingView } from "@/components/assessments/ComponentBuildingView";
import { ModelCompetencySelector, type RoleCompetencyItem } from "@/components/assessments/ModelCompetencySelector";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Competency {
    id: string;
    name: string;
    category: string;
    indicators?: { id: string; text: string; level: string }[];
}

interface ComponentBuildStatus {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
    progress: number;
    componentId?: string;
}

interface ComponentSelection {
    competencyId: string;
    suggestedComponents: ComponentSuggestion[];
    selectedComponents: Set<ComponentType>;
    componentStatus: Map<ComponentType, ComponentBuildStatus>;
}

interface CompetencySelection {
    selectedCompetencyIds: string[];
    weights: Record<string, number>;
}

interface AssessmentBuilderWizardProps {
    roleId: string;
    roleName: string;
    competencies: Competency[];
    roleCompetencies?: RoleCompetencyItem[];
    targetLevel: "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
    /** When provided, skip SELECT_COMPETENCIES and use these as pre-selected */
    preSelectedCompetencyIds?: string[] | null;
    initialModel?: {
        id: string;
        name: string;
        components: {
            id: string;
            competencyId: string | null;
            componentType: string;
        }[];
        competencyWeights: Record<string, number>;
    } | null;
    requesterId?: string;
    requestId?: string;
    tenantId?: string;
    basePath?: string;
}

function calculateCompetencyProgress(selection: ComponentSelection): number {
    if (selection.selectedComponents.size === 0) return 0;
    let total = 0;
    selection.selectedComponents.forEach((type) => {
        const status = selection.componentStatus.get(type);
        if (status?.status === "COMPLETE") total += 100;
        else if (status?.status === "IN_PROGRESS") total += status.progress;
    });
    return Math.round(total / selection.selectedComponents.size);
}

const WIZARD_WEIGHTS_KEY = "assessment-wizard-competency-weights";
const WIZARD_DRAFT_KEY = "assessment-wizard-draft";

const STEPS_ORDER: Array<"OVERVIEW" | "SELECT_COMPETENCIES" | "COMPONENTS" | "BUILD"> = [
    "OVERVIEW",
    "SELECT_COMPETENCIES",
    "COMPONENTS",
    "BUILD",
];

export function AssessmentBuilderWizard({
    roleId,
    roleName,
    competencies,
    roleCompetencies = [],
    targetLevel,
    preSelectedCompetencyIds = null,
    initialModel = null,
    requesterId,
    requestId,
    tenantId,
    basePath,
}: AssessmentBuilderWizardProps) {
    const router = useRouter();
    const competencyWeightsRef = useRef<Record<string, number> | null>(null);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(WIZARD_WEIGHTS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Record<string, number>;
                competencyWeightsRef.current = parsed;
            }
        } catch {
            /* ignore */
        }
    }, []);

    const [modelName, setModelName] = useState(
        initialModel?.name || `${roleName} - ${targetLevel} Assessment`
    );
    const [step, setStep] = useState<
        "OVERVIEW" | "SELECT_COMPETENCIES" | "COMPONENTS" | "BUILD"
    >(initialModel ? "BUILD" : "OVERVIEW");

    const initialCompetencyIds = useMemo(() => {
        if (initialModel) {
            return Array.from(new Set(initialModel.components.map(c => c.competencyId).filter(Boolean))) as string[];
        }
        return preSelectedCompetencyIds;
    }, [initialModel, preSelectedCompetencyIds]);

    const [competencySelection, setCompetencySelection] = useState<CompetencySelection | null>(
        initialCompetencyIds?.length
            ? {
                selectedCompetencyIds: initialCompetencyIds,
                weights: initialModel?.competencyWeights || {},
            }
            : null
    );
    const [selectStepSelectedIds, setSelectStepSelectedIds] = useState<Set<string>>(new Set());
    const [selectStepWeights, setSelectStepWeights] = useState<Record<string, number>>({});
    const selectStepInitialized = useRef(false);
    useEffect(() => {
        if (
            step === "SELECT_COMPETENCIES" &&
            !selectStepInitialized.current &&
            roleCompetencies.length > 0
        ) {
            selectStepInitialized.current = true;
            const ids = new Set(roleCompetencies.map((rc) => rc.competencyId));
            const w: Record<string, number> = {};
            roleCompetencies.forEach((rc) => {
                w[rc.competencyId] =
                    rc.weight ?? 100 / roleCompetencies.length;
            });
            setSelectStepSelectedIds(ids);
            setSelectStepWeights(w);
        }
    }, [step, roleCompetencies]);
    const [modelId, setModelId] = useState<string | null>(initialModel?.id || null);
    const [creatingModel, setCreatingModel] = useState(false);

    const [selections, setSelections] = useState<Map<string, ComponentSelection>>(
        new Map()
    );

    const effectiveCompetencies = useMemo(() => {
        if (competencySelection) {
            return competencies.filter((c) =>
                competencySelection.selectedCompetencyIds.includes(c.id)
            );
        }
        return competencies;
    }, [competencies, competencySelection]);

    useEffect(() => {
        const newSelections = new Map<string, ComponentSelection>();
        effectiveCompetencies.forEach((comp) => {
            const suggestions = ComponentSuggester.suggestComponents(
                comp as unknown as { category: "TECHNICAL" | "BEHAVIORAL" | "COGNITIVE" | "DOMAIN_SPECIFIC" },
                targetLevel
            );

            const existingComponentsForComp = initialModel?.components.filter(c => c.competencyId === comp.id) || [];

            newSelections.set(comp.id, {
                competencyId: comp.id,
                suggestedComponents: suggestions,
                selectedComponents: new Set(existingComponentsForComp.map(c => c.componentType as ComponentType)),
                componentStatus: new Map(existingComponentsForComp.map(c => [
                    c.componentType as ComponentType,
                    { status: "NOT_STARTED", progress: 0, componentId: c.id }
                ])),
            });
        });
        setSelections(newSelections);
    }, [effectiveCompetencies, targetLevel, initialModel]);

    const calculateProgress = (): number => {
        let totalComponents = 0;
        let completedComponents = 0;
        selections.forEach((selection) => {
            selection.selectedComponents.forEach((componentType) => {
                totalComponents++;
                const status = selection.componentStatus.get(componentType);
                if (status?.status === "COMPLETE") completedComponents++;
            });
        });
        return totalComponents > 0
            ? Math.round((completedComponents / totalComponents) * 100)
            : 0;
    };

    const toggleComponent = (competencyId: string, componentType: ComponentType) => {
        setSelections((prev) => {
            const newSelections = new Map(prev);
            const selection = newSelections.get(competencyId);
            if (!selection) return newSelections;
            const newSelected = new Set(selection.selectedComponents);
            const newStatus = new Map(selection.componentStatus);
            if (newSelected.has(componentType)) {
                newSelected.delete(componentType);
                newStatus.delete(componentType);
            } else {
                newSelected.add(componentType);
                newStatus.set(componentType, {
                    status: "NOT_STARTED",
                    progress: 0,
                });
            }
            newSelections.set(competencyId, {
                ...selection,
                selectedComponents: newSelected,
                componentStatus: newStatus,
            });
            return newSelections;
        });
    };

    const updateComponentStatus = (
        competencyId: string,
        componentType: ComponentType,
        status: Partial<ComponentBuildStatus>,
        componentId?: string
    ) => {
        setSelections((prev) => {
            const newSelections = new Map(prev);
            const selection = newSelections.get(competencyId);
            if (!selection) return newSelections;
            const newStatus = new Map(selection.componentStatus);
            const existing = newStatus.get(componentType) || {
                status: "NOT_STARTED" as const,
                progress: 0,
            };
            newStatus.set(componentType, {
                ...existing,
                ...status,
                componentId: componentId ?? existing.componentId,
            });
            newSelections.set(competencyId, {
                ...selection,
                componentStatus: newStatus,
            });
            return newSelections;
        });
    };

    const hasAnySelection = (): boolean => {
        return Array.from(selections.values()).some(
            (s) => s.selectedComponents.size > 0
        );
    };

    const handleSaveDraft = () => {
        try {
            const draft = {
                step,
                modelName,
                competencySelection,
                selectStepSelectedIds: Array.from(selectStepSelectedIds),
                selectStepWeights: { ...selectStepWeights },
                roleId,
                targetLevel,
            };
            sessionStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify(draft));
            toast.success("Draft saved. Return to this page to continue.");
        } catch {
            toast.error("Failed to save draft");
        }
    };

    const stepProgressPercent =
        step === "OVERVIEW"
            ? 10
            : step === "SELECT_COMPETENCIES"
                ? 30
                : step === "COMPONENTS"
                    ? 60
                    : 90;

    const handleStartBuilding = async () => {
        if (!hasAnySelection()) return;
        setCreatingModel(true);
        try {
            const components: { competencyId: string; componentType: string }[] = [];
            selections.forEach((sel) => {
                sel.selectedComponents.forEach((type) => {
                    components.push({
                        competencyId: sel.competencyId,
                        componentType: type,
                    });
                });
            });

            const body: Record<string, unknown> = {
                roleId,
                name: modelName,
                targetLevel,
                components,
                requesterId,
                requestId,
                tenantId
            };
            const weights =
                competencyWeightsRef.current && Object.keys(competencyWeightsRef.current).length > 0
                    ? competencyWeightsRef.current
                    : competencySelection?.selectedCompetencyIds?.length
                        ? Object.fromEntries(
                            competencySelection.selectedCompetencyIds.map((id) => [
                                id,
                                100 / competencySelection.selectedCompetencyIds.length,
                            ])
                        )
                        : undefined;
            if (weights && Object.keys(weights).length > 0) {
                body.competencyWeights = weights;
            }
            const res = await fetch("/api/assessments/admin/models/from-wizard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            try {
                sessionStorage.removeItem(WIZARD_WEIGHTS_KEY);
            } catch {
                /* ignore */
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to create model");
            }
            const model = await res.json();
            setModelId(model.id);
            setStep("BUILD");
            toast.success("Assessment model created. Build each component.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to create model");
        } finally {
            setCreatingModel(false);
        }
    };

    const handlePublish = async () => {
        if (modelId) {
            const redirectUrl = basePath
                ? `${basePath}/assessments/${modelId}/questions`
                : `/assessments/admin/models/${modelId}/questions`;
            router.push(redirectUrl);
            toast.success("Assessment ready for questions.");
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Assessment Model Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="mb-2">Model Name</Label>
                        <Input
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Role</Label>
                            <div className="text-lg font-semibold mt-1">{roleName}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Target Level</Label>
                            <Badge className="mt-1">{targetLevel}</Badge>
                        </div>
                    </div>
                    <div>
                        <Label className="mb-2">Competencies ({competencies.length})</Label>
                        <div className="flex flex-wrap gap-2">
                            {competencies.map((comp) => (
                                <Badge key={comp.id} variant="outline">
                                    {comp.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            setStep(
                                preSelectedCompetencyIds?.length
                                    ? "COMPONENTS"
                                    : "SELECT_COMPETENCIES"
                            )
                        }
                        className="w-full"
                        size="lg"
                    >
                        Continue{" "}
                        {preSelectedCompetencyIds?.length
                            ? "to Component Selection"
                            : "to Select Competencies"}
                        {" →"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const handleContinueFromSelectCompetencies = () => {
        const selectedList = roleCompetencies.filter((c) =>
            selectStepSelectedIds.has(c.competencyId)
        );
        const totalWeight = selectedList.reduce(
            (sum, c) => sum + (selectStepWeights[c.competencyId] ?? 0),
            0
        );
        if (selectStepSelectedIds.size === 0) {
            toast.error("Select at least one competency");
            return;
        }
        if (Math.abs(totalWeight - 100) > 0.5) {
            toast.error("Weights must sum to 100%");
            return;
        }
        setCompetencySelection({
            selectedCompetencyIds: Array.from(selectStepSelectedIds),
            weights: { ...selectStepWeights },
        });
        competencyWeightsRef.current = { ...selectStepWeights };
        setStep("COMPONENTS");
    };

    const renderSelectCompetencies = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Select Competencies & Weights</h2>
                <Button variant="outline" onClick={() => setStep("OVERVIEW")}>
                    ← Back
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Choose competencies for this model</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Select competencies and set weights (must sum to 100%).
                    </p>
                </CardHeader>
                <CardContent>
                    <ModelCompetencySelector
                        competencies={roleCompetencies}
                        selectedIds={selectStepSelectedIds}
                        onSelectionChange={setSelectStepSelectedIds}
                        weights={selectStepWeights}
                        onWeightsChange={setSelectStepWeights}
                        roleId={roleId}
                    />
                    <Button
                        onClick={handleContinueFromSelectCompetencies}
                        className="w-full mt-6"
                        size="lg"
                    >
                        Continue to Component Selection →
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const renderComponentSelection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Select Assessment Components</h2>
                <Button
                    variant="outline"
                    onClick={() =>
                        setStep(
                            preSelectedCompetencyIds?.length ? "OVERVIEW" : "SELECT_COMPETENCIES"
                        )
                    }
                >
                    ← Back
                </Button>
            </div>
            <Card>
                <CardContent className="p-4 sm:p-6">
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-semibold">Competency</th>
                                    <th className="text-left p-4 font-semibold">Suggested Components</th>
                                    <th className="text-left p-4 font-semibold">Selected</th>
                                    <th className="text-left p-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(selections.entries()).map(([compId, selection]) => {
                                    const competency = effectiveCompetencies.find((c) => c.id === compId);
                                    if (!competency) return null;
                                    const weight =
                                        competencyWeightsRef.current?.[compId] ??
                                        competencySelection?.weights?.[compId] ??
                                        (competencySelection?.selectedCompetencyIds?.length
                                            ? 100 / competencySelection.selectedCompetencyIds.length
                                            : 0);
                                    return (
                                        <tr key={compId} className="border-b">
                                            <td className="p-4">
                                                <div className="font-medium">{competency.name}</div>
                                                <div className="text-muted-foreground text-xs flex items-center gap-2">
                                                    <span>{competency.category}</span>
                                                    {weight > 0 && (
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {Math.round(weight)}%
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {selection.suggestedComponents.map((s, idx) => {
                                                        const isSelected = selection.selectedComponents.has(s.type);
                                                        return (
                                                            <Badge
                                                                key={idx}
                                                                variant={
                                                                    isSelected
                                                                        ? "default"
                                                                        : s.priority === "HIGH"
                                                                            ? "secondary"
                                                                            : s.priority === "MEDIUM"
                                                                                ? "outline"
                                                                                : "outline"
                                                                }
                                                                className={`cursor-pointer select-none transition-all ${isSelected
                                                                    ? "ring-2 ring-primary ring-offset-2"
                                                                    : "hover:opacity-90 hover:scale-105"
                                                                    }`}
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => toggleComponent(compId, s.type)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" || e.key === " ") {
                                                                        e.preventDefault();
                                                                        toggleComponent(compId, s.type);
                                                                    }
                                                                }}
                                                            >
                                                                {isSelected ? "✓ " : ""}
                                                                {s.icon ? `${s.icon} ` : ""}{s.type}
                                                                <span className="ml-1 text-xs">
                                                                    ({s.estimatedQuestions}Q, {s.estimatedDuration}m)
                                                                </span>
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.from(selection.selectedComponents).map(
                                                        (type) => (
                                                            <Badge
                                                                key={type}
                                                                variant="default"
                                                                className="cursor-pointer"
                                                                onClick={() =>
                                                                    toggleComponent(compId, type)
                                                                }
                                                            >
                                                                ✓ {type}
                                                            </Badge>
                                                        )
                                                    )}
                                                    {selection.selectedComponents.size === 0 && (
                                                        <span className="text-muted-foreground text-xs">
                                                            Click to select
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {calculateCompetencyProgress(selection)}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 pt-6 border-t flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">
                                Overall Progress
                            </div>
                            <div className="text-2xl font-bold">{calculateProgress()}%</div>
                        </div>
                        <Button
                            onClick={handleStartBuilding}
                            size="lg"
                            disabled={!hasAnySelection() || creatingModel}
                        >
                            {creatingModel ? "Creating..." : "Start Building Components →"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderComponentBuilding = () =>
        modelId ? (
            <ComponentBuildingView
                modelId={modelId}
                selections={selections}
                competencies={effectiveCompetencies}
                targetLevel={targetLevel}
                onBack={() => setStep("COMPONENTS")}
                onStatusUpdate={updateComponentStatus}
                onComplete={handlePublish}
            />
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                Creating model...
            </div>
        );

    return (
        <div className="container mx-auto py-8 max-w-5xl px-4 sm:px-6">
            {/* Step progress indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>
                        Step {STEPS_ORDER.indexOf(step) + 1} of {STEPS_ORDER.length}
                    </span>
                    <span className="capitalize">{step.replace(/_/g, " ").toLowerCase()}</span>
                </div>
                <Progress value={stepProgressPercent} className="h-2" />
            </div>

            {step === "OVERVIEW" && (
                <div className="space-y-4">
                    {renderOverview()}
                    <Button variant="outline" onClick={handleSaveDraft} className="w-full sm:w-auto">
                        Save draft
                    </Button>
                </div>
            )}
            {step === "SELECT_COMPETENCIES" && (
                <div className="space-y-4">
                    {renderSelectCompetencies()}
                    <Button variant="outline" onClick={handleSaveDraft} className="w-full sm:w-auto">
                        Save draft
                    </Button>
                </div>
            )}
            {step === "COMPONENTS" && (
                <div className="space-y-4">
                    {renderComponentSelection()}
                    <Button variant="outline" onClick={handleSaveDraft} className="w-full sm:w-auto">
                        Save draft
                    </Button>
                </div>
            )}
            {step === "BUILD" && renderComponentBuilding()}
        </div>
    );
}
