"use client";

import { useState, useEffect, useRef } from "react";
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

interface AssessmentBuilderWizardProps {
    roleId: string;
    roleName: string;
    competencies: Competency[];
    targetLevel: "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
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

export function AssessmentBuilderWizard({
    roleId,
    roleName,
    competencies,
    targetLevel,
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
        `${roleName} - ${targetLevel} Assessment`
    );
    const [step, setStep] = useState<
        "OVERVIEW" | "COMPONENTS" | "BUILD"
    >("OVERVIEW");
    const [modelId, setModelId] = useState<string | null>(null);
    const [creatingModel, setCreatingModel] = useState(false);

    const [selections, setSelections] = useState<Map<string, ComponentSelection>>(
        new Map()
    );

    useEffect(() => {
        const newSelections = new Map<string, ComponentSelection>();
        competencies.forEach((comp) => {
            const suggestions = ComponentSuggester.suggestComponents(
                comp,
                targetLevel
            );
            newSelections.set(comp.id, {
                competencyId: comp.id,
                suggestedComponents: suggestions,
                selectedComponents: new Set(),
                componentStatus: new Map(),
            });
        });
        setSelections(newSelections);
    }, [competencies, targetLevel]);

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
            };
            if (competencyWeightsRef.current && Object.keys(competencyWeightsRef.current).length > 0) {
                body.competencyWeights = competencyWeightsRef.current;
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
            router.push(`/assessments/admin/models/${modelId}/questions`);
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
                    <Button onClick={() => setStep("COMPONENTS")} className="w-full" size="lg">
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
                <Button variant="outline" onClick={() => setStep("OVERVIEW")}>
                    ← Back
                </Button>
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
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
                                    const competency = competencies.find((c) => c.id === compId);
                                    if (!competency) return null;
                                    return (
                                        <tr key={compId} className="border-b">
                                            <td className="p-4">
                                                <div className="font-medium">{competency.name}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    {competency.category}
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
                                                                className={`cursor-pointer select-none transition-all ${
                                                                    isSelected
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
                                                                {isSelected ? "✓ " : ""}{s.type}
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
                competencies={competencies}
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
        <div className="container mx-auto py-8 max-w-5xl">
            {step === "OVERVIEW" && renderOverview()}
            {step === "COMPONENTS" && renderComponentSelection()}
            {step === "BUILD" && renderComponentBuilding()}
        </div>
    );
}
