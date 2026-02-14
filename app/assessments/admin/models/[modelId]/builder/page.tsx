"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ComponentBuildingView,
} from "@/components/assessments/ComponentBuildingView";
import {
    ComponentSuggester,
    ComponentType,
    type ComponentSuggestion,
} from "@/lib/assessment/component-suggester";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Loader2, Layout, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ComponentBuildStatus {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
    progress: number;
    componentId?: string;
}

interface ComponentSelection {
    competencyId: string;
    selectedComponents: Set<ComponentType>;
    componentStatus: Map<ComponentType, ComponentBuildStatus>;
}

interface ModelComponent {
    id: string;
    competencyId: string | null;
    componentType: string;
    competency?: {
        name: string;
        category: string;
        indicators?: { id: string; text: string; level: string }[];
    };
    _count?: { questions: number };
}

interface AssessmentModel {
    id: string;
    name: string;
    code: string;
    status?: string | null;
    targetLevel?: string | null;
    roleId?: string | null;
}

interface Competency {
    id: string;
    name: string;
    category: string;
    indicators?: { id: string; text: string; level: string }[];
}

function buildSelectionsFromComponents(
    components: ModelComponent[],
    targetLevel: string
): Map<string, ComponentSelection> {
    const selections = new Map<string, ComponentSelection>();

    for (const comp of components) {
        const competencyId = comp.competencyId;
        if (!competencyId) continue;

        const componentType = (comp.componentType || "QUESTIONNAIRE") as ComponentType;
        const questionCount = comp._count?.questions ?? 0;
        const status: ComponentBuildStatus = questionCount > 0
            ? { status: "COMPLETE", progress: 100, componentId: comp.id }
            : { status: "NOT_STARTED", progress: 0, componentId: comp.id };

        let selection = selections.get(competencyId);
        if (!selection) {
            selection = {
                competencyId,
                selectedComponents: new Set(),
                componentStatus: new Map(),
            };
            selections.set(competencyId, selection);
        }
        selection.selectedComponents.add(componentType);
        selection.componentStatus.set(componentType, status);
    }

    return selections;
}

interface AssessmentBuilderProps {
    modelId: string;
    backHref?: string;
    completeHref?: string;
}

export function AssessmentBuilder({ modelId, backHref = "/assessments/admin/models", completeHref }: AssessmentBuilderProps) {
    const router = useRouter();
    const [model, setModel] = useState<AssessmentModel | null>(null);
    const [components, setComponents] = useState<ModelComponent[]>([]);
    const [selections, setSelections] = useState<Map<string, ComponentSelection>>(new Map());
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [availableCompetencies, setAvailableCompetencies] = useState<Competency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addingCompetencyId, setAddingCompetencyId] = useState<string | null>(null);
    const [addingType, setAddingType] = useState<ComponentType | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [unpublishing, setUnpublishing] = useState(false);

    const targetLevel = model?.targetLevel || "JUNIOR";

    const fetchData = useCallback(async () => {
        try {
            const [modelRes, componentsRes, availableRes] = await Promise.all([
                fetch(`/api/assessments/admin/models/${modelId}`),
                fetch(`/api/assessments/admin/models/${modelId}/components`),
                fetch(`/api/assessments/admin/models/${modelId}/available-competencies`),
            ]);

            if (!modelRes.ok) {
                const err = await modelRes.json().catch(() => ({}));
                toast.error(err?.error || `Model: ${modelRes.status}`);
                setLoading(false);
                return;
            }
            if (!componentsRes.ok) {
                const err = await componentsRes.json().catch(() => ({}));
                toast.error(err?.error || `Components: ${componentsRes.status}`);
                setLoading(false);
                return;
            }

            const modelData = await modelRes.json();
            const componentsData = await componentsRes.json();
            const availableData = availableRes.ok ? await availableRes.json() : [];

            setModel(modelData);
            setComponents(componentsData);
            setAvailableCompetencies(Array.isArray(availableData) ? availableData : []);

            const comps = componentsData as ModelComponent[];
            const compCompetencies = comps
                .filter((c) => c.competency)
                .map((c) => c.competency!)
                .filter(Boolean);
            const uniqueCompetencies = Array.from(
                new Map(compCompetencies.map((c) => [c.id, c])).values()
            );
            setCompetencies(uniqueCompetencies);

            const sel = buildSelectionsFromComponents(comps, targetLevel);
            setSelections(sel);
        } catch (error) {
            toast.error("Failed to load builder data");
        } finally {
            setLoading(false);
        }
    }, [modelId, targetLevel]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const handleAddComponent = async (competencyId: string, componentType: ComponentType) => {
        setIsAdding(true);
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/components`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    competencyId,
                    componentType,
                    weight: 1.0,
                    targetLevel,
                    order: components.length,
                }),
            });

            if (res.ok) {
                const newComponent = await res.json();
                setComponents((prev) => [...prev, newComponent]);

                const competency = availableCompetencies.find((c) => c.id === competencyId);
                if (competency && !competencies.some((c) => c.id === competencyId)) {
                    setCompetencies((prev) => [...prev, competency]);
                }

                setSelections((prev) => {
                    const next = new Map(prev);
                    const sel = next.get(competencyId) || {
                        competencyId,
                        selectedComponents: new Set<ComponentType>(),
                        componentStatus: new Map<ComponentType, ComponentBuildStatus>(),
                    };
                    sel.selectedComponents.add(componentType);
                    sel.componentStatus.set(componentType, {
                        status: "NOT_STARTED",
                        progress: 0,
                        componentId: newComponent.id,
                    });
                    next.set(competencyId, sel);
                    return next;
                });

                setAvailableCompetencies((prev) => prev.filter((c) => c.id !== competencyId));
                setIsAddOpen(false);
                setAddingCompetencyId(null);
                setAddingType(null);
                toast.success("Component added");
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to add component");
            }
        } catch {
            toast.error("Failed to add component");
        } finally {
            setIsAdding(false);
        }
    };

    const handleComplete = () => {
        router.push(completeHref ?? `/assessments/admin/models/${modelId}/questions`);
        toast.success("Assessment ready for questions.");
    };

    const handleUnpublish = async () => {
        if (model?.status !== "PUBLISHED") return;
        setUnpublishing(true);
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/unpublish`, {
                method: "POST",
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setModel((prev) => prev ? { ...prev, status: "DRAFT" } : null);
                toast.success(data.message || "Model unpublished");
            } else {
                toast.error(data.error || "Failed to unpublish");
            }
        } catch {
            toast.error("Failed to unpublish");
        } finally {
            setUnpublishing(false);
        }
    };

    const isPublished = model?.status === "PUBLISHED";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-8 h-8 text-navy-600 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading builder...</p>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <p className="text-muted-foreground">
                        This assessment model was not found. It may have been deleted or the link may be outdated.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button asChild variant="outline">
                            <Link href="/assessments/admin/models">Back to Models</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/assessments/admin/models/create">Create New Model</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={backHref} className="gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Models
                        </Link>
                    </Button>
                    <div className="h-4 w-px bg-border" />
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            {model.name}
                            <Badge variant="outline" className="font-mono text-xs py-0">
                                {model.code}
                            </Badge>
                            {model.status && (
                                <Badge variant={model.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs py-0">
                                    {model.status}
                                </Badge>
                            )}
                        </h1>
                        <p className="text-xs text-muted-foreground">Assessment Builder</p>
                    </div>
                </div>
                {isPublished && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 px-4 py-2 text-sm">
                        <span className="text-amber-800 dark:text-amber-200">
                            This model is published. Unpublish to add or edit components.
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnpublish}
                            disabled={unpublishing}
                        >
                            {unpublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Unpublish
                        </Button>
                    </div>
                )}
            </div>

            {selections.size === 0 ? (
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-muted/30 gap-4">
                        <div className="w-16 h-16 bg-card rounded-xl border flex items-center justify-center text-muted-foreground">
                            <Layout className="w-8 h-8" />
                        </div>
                        <div className="text-center max-w-sm">
                            <h2 className="text-lg font-bold">No components yet</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isPublished
                                    ? "This model is published. Unpublish it above to add components."
                                    : availableCompetencies.length > 0
                                        ? "Add competency components to start building your assessment."
                                        : "Add competencies to your role or competency library first, then return here to build."}
                            </p>
                        </div>
                        {availableCompetencies.length > 0 ? (
                            <Button
                                size="lg"
                                className="bg-navy-700 hover:bg-navy-600"
                                onClick={() => setIsAddOpen(true)}
                                disabled={isPublished}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Component
                            </Button>
                        ) : (
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/assessments/admin/competencies">Go to Competency Library</Link>
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <ComponentBuildingView
                    modelId={modelId}
                    selections={selections}
                    competencies={competencies}
                    targetLevel={targetLevel}
                    onBack={() => router.push(backHref)}
                    onStatusUpdate={updateComponentStatus}
                    onComplete={handleComplete}
                />
            )}

            {selections.size > 0 && availableCompetencies.length > 0 && (
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)} disabled={isPublished}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Component
                    </Button>
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={(open) => !open && (setIsAddOpen(false), setAddingCompetencyId(null), setAddingType(null))}>
                <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Competency Component</DialogTitle>
                        <DialogDescription>
                            Select a competency and component type to add to this assessment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {!addingCompetencyId ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Select competency</p>
                                <div className="grid gap-2 max-h-[240px] overflow-y-auto">
                                    {availableCompetencies.map((comp) => (
                                        <button
                                            key={comp.id}
                                            type="button"
                                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 text-left transition-colors"
                                            onClick={() => setAddingCompetencyId(comp.id)}
                                        >
                                            <div>
                                                <p className="font-medium text-sm">{comp.name}</p>
                                                <p className="text-xs text-muted-foreground">{comp.category}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {availableCompetencies.length === 0 && (
                                        <p className="text-sm text-muted-foreground py-4 text-center">
                                            All competencies are already in this assessment.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : !addingType ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Select component type</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {(() => {
                                        const comp = availableCompetencies.find((c) => c.id === addingCompetencyId);
                                        const suggestions = comp
                                            ? ComponentSuggester.suggestComponents(comp, targetLevel as "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT")
                                            : [];
                                        return suggestions.map((s: ComponentSuggestion) => (
                                            <button
                                                key={s.type}
                                                type="button"
                                                className="p-3 rounded-lg border hover:bg-muted/50 text-left transition-colors"
                                                onClick={() => setAddingType(s.type)}
                                            >
                                                <p className="font-medium text-sm">
                                                    {s.icon ? `${s.icon} ` : ""}{s.type}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {s.estimatedQuestions}Q, {s.estimatedDuration}m
                                                </p>
                                            </button>
                                        ));
                                    })()}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setAddingCompetencyId(null)}
                                >
                                    ← Back
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm">
                                    Add{" "}
                                    <strong>
                                        {addingType}
                                    </strong>{" "}
                                    for{" "}
                                    <strong>
                                        {availableCompetencies.find((c) => c.id === addingCompetencyId)?.name}
                                    </strong>
                                    ?
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setAddingType(null)}
                                        disabled={isAdding}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => addingCompetencyId && handleAddComponent(addingCompetencyId, addingType)}
                                        disabled={isAdding}
                                    >
                                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Add
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        </>
    );
}

export default function AssessmentBuilderPage({ params }: { params: Promise<{ modelId: string }> }) {
    const resolved = use(params);
    const modelId = resolved?.modelId;
    if (!modelId) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <p className="text-muted-foreground">Invalid model. Please select an assessment from the list.</p>
                <Link href="/assessments/admin/models">
                    <Button variant="outline" className="mt-4">Back to Models</Button>
                </Link>
            </div>
        );
    }
    return <AssessmentBuilder modelId={modelId} backHref="/assessments/admin/models" />;
}
