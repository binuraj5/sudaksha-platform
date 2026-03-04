"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft, Plus, Loader2, Layout, XCircle, CheckCircle2 } from "lucide-react";
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
        id: string;
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
    category: any;
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
    // "SUGGEST" = full-page component suggestion grid (shown when model has 0 components)
    // "BUILD"   = ComponentBuildingView (shown after components are added)
    const [step, setStep] = useState<"SUGGEST" | "BUILD">("SUGGEST");
    // bulkSelections: competencyId → set of selected component types (used in SUGGEST step)
    const [bulkSelections, setBulkSelections] = useState<Map<string, Set<ComponentType>>>(new Map());
    const [isBulkBuilding, setIsBulkBuilding] = useState(false);
    // Dialog state for adding individual components while in BUILD step
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addingCompetencyId, setAddingCompetencyId] = useState<string | null>(null);
    // Multi-select: set of types the user has checked for the current competency
    const [selectedTypes, setSelectedTypes] = useState<Set<ComponentType>>(new Set());
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
            const available = Array.isArray(availableData) ? availableData : [];
            setAvailableCompetencies(available);

            const comps = componentsData as ModelComponent[];
            const compCompetencies = comps
                .filter((c) => c.competency)
                .map((c) => ({
                    id: c.competency!.id,
                    name: c.competency!.name,
                    category: c.competency!.category,
                    indicators: c.competency!.indicators,
                }));
            const uniqueCompetencies = Array.from(
                new Map(compCompetencies.map((c) => [c.id, c])).values()
            );
            setCompetencies(uniqueCompetencies);
            const built = buildSelectionsFromComponents(comps, targetLevel);
            setSelections(built);

            // If model already has components go straight to BUILD; otherwise show SUGGEST
            setStep(comps.length > 0 ? "BUILD" : "SUGGEST");

            // Initialise empty selections for each available competency (user clicks to add)
            if (comps.length === 0 && available.length > 0) {
                const initial = new Map<string, Set<ComponentType>>();
                for (const comp of available) {
                    initial.set(comp.id, new Set<ComponentType>());
                }
                setBulkSelections(initial);
            }
        } catch {
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
            const next = new Map(prev);
            const selection = next.get(competencyId);
            if (!selection) return next;
            const newStatus = new Map(selection.componentStatus);
            const existing = newStatus.get(componentType) || { status: "NOT_STARTED" as const, progress: 0 };
            newStatus.set(componentType, { ...existing, ...status, componentId: componentId ?? existing.componentId });
            next.set(competencyId, { ...selection, componentStatus: newStatus });
            return next;
        });
    };

    /** Bulk-create all selected component types from the SUGGEST step, then move to BUILD. */
    const handleStartBuilding = async () => {
        const totalSelected = Array.from(bulkSelections.values()).reduce((n, s) => n + s.size, 0);
        if (totalSelected === 0) {
            toast.error("Select at least one component type to continue.");
            return;
        }
        setIsBulkBuilding(true);
        try {
            let orderIdx = 0;
            const lvl = targetLevel as "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
            const allCompetencies = availableCompetencies;
            const newComponents: ModelComponent[] = [];
            const newCompetencies: Competency[] = [];

            for (const [competencyId, types] of Array.from(bulkSelections.entries())) {
                if (types.size === 0) continue;
                const competency = allCompetencies.find((c) => c.id === competencyId);
                for (const componentType of Array.from(types)) {
                    const res = await fetch(`/api/assessments/admin/models/${modelId}/components`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            competencyId,
                            componentType,
                            weight: Math.round(100 / totalSelected),
                            targetLevel: lvl,
                            order: orderIdx++,
                        }),
                    });
                    if (res.ok) {
                        const nc = await res.json();
                        newComponents.push(nc);
                        if (competency && !newCompetencies.some((c) => c.id === competencyId)) {
                            newCompetencies.push(competency);
                        }
                    } else {
                        const err = await res.json().catch(() => ({}));
                        toast.error(err.error || `Failed to add ${componentType}`);
                    }
                }
            }

            if (newComponents.length === 0) {
                toast.error("No components were created. Please try again.");
                return;
            }

            setComponents(newComponents);
            setCompetencies(newCompetencies);
            setSelections(buildSelectionsFromComponents(newComponents, targetLevel));
            setStep("BUILD");
            toast.success(`${newComponents.length} component${newComponents.length > 1 ? "s" : ""} created. Now build each one.`);
        } catch {
            toast.error("Failed to create components");
        } finally {
            setIsBulkBuilding(false);
        }
    };

    const closeDialog = () => {
        setIsAddOpen(false);
        setAddingCompetencyId(null);
        setSelectedTypes(new Set());
    };

    /**
     * Add all selected component types for a competency.
     * Weight is distributed evenly across all existing + new components.
     */
    const handleAddComponents = async (competencyId: string, types: ComponentType[]) => {
        if (types.length === 0) return;
        setIsAdding(true);
        try {
            const equalWeight = Math.max(1, Math.round(100 / (components.length + types.length)));
            let addedCount = 0;

            for (const componentType of types) {
                const res = await fetch(`/api/assessments/admin/models/${modelId}/components`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        competencyId,
                        componentType,
                        weight: equalWeight,
                        targetLevel,
                        order: components.length + addedCount,
                    }),
                });

                if (res.ok) {
                    const newComponent = await res.json();
                    setComponents((prev) => [...prev, newComponent]);

                    // Add to build-view competency list if not already present
                    const competency =
                        availableCompetencies.find((c) => c.id === competencyId) ??
                        competencies.find((c) => c.id === competencyId);
                    if (competency) {
                        setCompetencies((prev) =>
                            prev.some((c) => c.id === competencyId) ? prev : [...prev, competency]
                        );
                    }

                    setSelections((prev) => {
                        const next = new Map(prev);
                        const existing = next.get(competencyId);
                        const sel = existing
                            ? {
                                  ...existing,
                                  selectedComponents: new Set(existing.selectedComponents),
                                  componentStatus: new Map(existing.componentStatus),
                              }
                            : {
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
                    addedCount++;
                } else {
                    const err = await res.json().catch(() => ({}));
                    toast.error(err.error || `Failed to add ${componentType}`);
                }
            }

            if (addedCount > 0) {
                toast.success(`${addedCount} component${addedCount > 1 ? "s" : ""} added`);
            }
            // Keep competency in availableCompetencies — more types can still be added later
            closeDialog();
        } catch {
            toast.error("Failed to add components");
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
            const res = await fetch(`/api/assessments/admin/models/${modelId}/unpublish`, { method: "POST" });
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

    // All competencies that can have more types added (existing in model + new ones)
    const allSelectableCompetencies = (() => {
        const existingIds = new Set(competencies.map((c) => c.id));
        const newOnes = availableCompetencies.filter((c) => !existingIds.has(c.id));
        return [...competencies, ...newOnes];
    })();

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
                        Assessment model not found.
                    </p>
                    <Button asChild variant="outline">
                        <Link href={backHref}>Back to Models</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // ── Step indicator labels
    const stepLabels = ["Component Suggestions", "Build Components"];
    const currentStepIdx = step === "SUGGEST" ? 0 : 1;

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={backHref} className="gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Models
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-sm font-medium">Builder</span>
                    <div className="hidden sm:block h-4 w-px bg-border" />
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            {model.name}
                            <Badge variant="outline" className="font-mono text-xs py-0">{model.code}</Badge>
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
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
                        <span className="text-amber-800">Published. Unpublish to edit.</span>
                        <Button variant="outline" size="sm" onClick={handleUnpublish} disabled={unpublishing}>
                            {unpublishing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                            Unpublish
                        </Button>
                    </div>
                )}
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
                {stepLabels.map((label, idx) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            idx === currentStepIdx
                                ? "bg-primary text-primary-foreground border-primary"
                                : idx < currentStepIdx
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-muted text-muted-foreground border-border"
                        }`}>
                            {idx < currentStepIdx && <CheckCircle2 className="w-3 h-3" />}
                            <span>{idx + 1}. {label}</span>
                        </div>
                        {idx < stepLabels.length - 1 && (
                            <div className={`w-8 h-px ${idx < currentStepIdx ? "bg-emerald-300" : "bg-border"}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* ── STEP 1: SUGGEST ─ 3-column component selection table ── */}
            {step === "SUGGEST" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Select Assessment Components</h2>
                    </div>

                    {availableCompetencies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-muted/30 gap-4">
                            <Layout className="w-10 h-10 text-muted-foreground" />
                            <div className="text-center max-w-sm">
                                <h3 className="font-semibold">No competencies linked</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    This model has no competencies linked yet. Ensure the role has competencies mapped.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-4 sm:p-6">
                                <div className="overflow-x-auto -mx-4 sm:mx-0">
                                    <table className="w-full text-sm min-w-[600px]">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4 font-semibold">Competency</th>
                                                <th className="text-left p-4 font-semibold">Suggested Components</th>
                                                <th className="text-left p-4 font-semibold">Selected</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableCompetencies.map((comp) => {
                                                const lvl = targetLevel as "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
                                                const suggestions = ComponentSuggester.suggestComponents(
                                                    comp as unknown as { category: "TECHNICAL" | "BEHAVIORAL" | "COGNITIVE" | "DOMAIN_SPECIFIC" },
                                                    lvl
                                                );
                                                const selected = bulkSelections.get(comp.id) ?? new Set<ComponentType>();

                                                const toggleType = (type: ComponentType) => {
                                                    setBulkSelections((prev) => {
                                                        const next = new Map(prev);
                                                        const cur = new Set(next.get(comp.id) ?? []);
                                                        if (cur.has(type)) cur.delete(type); else cur.add(type);
                                                        next.set(comp.id, cur);
                                                        return next;
                                                    });
                                                };

                                                return (
                                                    <tr key={comp.id} className="border-b">
                                                        <td className="p-4">
                                                            <div className="font-medium">{comp.name}</div>
                                                            <div className="text-muted-foreground text-xs">{comp.category}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {suggestions.map((s: ComponentSuggestion) => {
                                                                    const isSelected = selected.has(s.type);
                                                                    return (
                                                                        <Badge
                                                                            key={s.type}
                                                                            variant={isSelected ? "default" : s.priority === "HIGH" ? "secondary" : "outline"}
                                                                            className={`cursor-pointer select-none transition-all ${isSelected
                                                                                ? "ring-2 ring-primary ring-offset-2"
                                                                                : "hover:opacity-90 hover:scale-105"
                                                                            }`}
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            onClick={() => toggleType(s.type)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter" || e.key === " ") {
                                                                                    e.preventDefault();
                                                                                    toggleType(s.type);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {isSelected ? "✓ " : ""}{s.icon ? `${s.icon} ` : ""}{s.type}
                                                                            <span className="ml-1 text-xs">({s.estimatedQuestions}Q, {s.estimatedDuration}m)</span>
                                                                        </Badge>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {Array.from(selected).map((type) => (
                                                                    <Badge
                                                                        key={type}
                                                                        variant="default"
                                                                        className="cursor-pointer"
                                                                        onClick={() => toggleType(type)}
                                                                    >
                                                                        ✓ {type}
                                                                    </Badge>
                                                                ))}
                                                                {selected.size === 0 && (
                                                                    <span className="text-muted-foreground text-xs">Click to select →</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            {Array.from(bulkSelections.values()).reduce((n, s) => n + s.size, 0)}
                                        </span> component type{Array.from(bulkSelections.values()).reduce((n, s) => n + s.size, 0) !== 1 ? "s" : ""} selected
                                    </p>
                                    <Button
                                        size="lg"
                                        disabled={Array.from(bulkSelections.values()).reduce((n, s) => n + s.size, 0) === 0 || isBulkBuilding}
                                        onClick={handleStartBuilding}
                                    >
                                        {isBulkBuilding
                                            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating…</>
                                            : "Start Building Components →"
                                        }
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* ── STEP 2: BUILD ─ ComponentBuildingView ── */}
            {step === "BUILD" && selections.size === 0 && (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg bg-muted/30 gap-4">
                    <div className="w-16 h-16 bg-card rounded-xl border flex items-center justify-center text-muted-foreground">
                        <Layout className="w-8 h-8" />
                    </div>
                    <div className="text-center max-w-sm">
                        <h2 className="text-lg font-bold">No components yet</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isPublished
                                ? "Unpublish to add components."
                                : allSelectableCompetencies.length > 0
                                ? "Select a competency and choose which component types to include."
                                : "Add competencies to your library first."}
                        </p>
                    </div>
                    {!isPublished && allSelectableCompetencies.length > 0 && (
                        <Button size="lg" className="bg-navy-700 hover:bg-navy-600" onClick={() => setIsAddOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Add Component
                        </Button>
                    )}
                </div>
            )}

            {step === "BUILD" && selections.size > 0 && (
                <ComponentBuildingView
                    modelId={modelId}
                    selections={selections}
                    competencies={competencies}
                    targetLevel={targetLevel}
                    onBack={() => setStep("SUGGEST")}
                    onStatusUpdate={updateComponentStatus}
                    onComplete={handleComplete}
                />
            )}

            {/* Always show "Add Another" when there are selections and not published */}
            {step === "BUILD" && selections.size > 0 && !isPublished && (
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Another Component
                    </Button>
                </div>
            )}

            {/* ─── Add Component Dialog ─── Two steps: pick competency → multi-select types */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
                <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Competency Component</DialogTitle>
                        <DialogDescription>
                            {!addingCompetencyId
                                ? "Select a competency to add to this assessment."
                                : "Check one or more component types. Each type becomes a separate assessment section."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        {/* Step 1 — Competency picker */}
                        {!addingCompetencyId ? (
                            <div className="grid gap-2 max-h-[350px] overflow-y-auto pr-1">
                                {(() => {
                                    const rows = allSelectableCompetencies.map((comp) => {
                                        const addedTypes = selections.get(comp.id)?.selectedComponents;
                                        const allSuggestions = ComponentSuggester.suggestComponents(
                                            comp as unknown as { category: "TECHNICAL" | "BEHAVIORAL" | "COGNITIVE" | "DOMAIN_SPECIFIC" },
                                            targetLevel as "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT"
                                        );
                                        const remainingCount = addedTypes
                                            ? allSuggestions.filter((s) => !addedTypes.has(s.type)).length
                                            : allSuggestions.length;
                                        if (remainingCount === 0) return null;
                                        return (
                                            <button
                                                key={comp.id}
                                                type="button"
                                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 text-left transition-colors"
                                                onClick={() => { setAddingCompetencyId(comp.id); setSelectedTypes(new Set()); }}
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">{comp.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {comp.category}
                                                        {addedTypes && addedTypes.size > 0 && (
                                                            <span className="ml-2 text-primary font-medium">
                                                                {addedTypes.size} type{addedTypes.size > 1 ? "s" : ""} added
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                                    {remainingCount} available →
                                                </span>
                                            </button>
                                        );
                                    });
                                    const visible = rows.filter(Boolean);
                                    if (visible.length === 0) {
                                        return (
                                            <p className="text-sm text-muted-foreground py-8 text-center">
                                                All component types have been added for every competency.
                                            </p>
                                        );
                                    }
                                    return rows;
                                })()}
                            </div>
                        ) : (
                            /* Step 2 — Multi-select component types */
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">
                                        {(competencies.find((c) => c.id === addingCompetencyId) ??
                                            availableCompetencies.find((c) => c.id === addingCompetencyId))?.name}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => { setAddingCompetencyId(null); setSelectedTypes(new Set()); }}
                                    >
                                        ← Back
                                    </Button>
                                </div>

                                <div className="grid gap-2 max-h-[320px] overflow-y-auto pr-1">
                                    {(() => {
                                        const comp =
                                            competencies.find((c) => c.id === addingCompetencyId) ??
                                            availableCompetencies.find((c) => c.id === addingCompetencyId);
                                        const alreadyAdded =
                                            selections.get(addingCompetencyId ?? "")?.selectedComponents ??
                                            new Set<ComponentType>();
                                        const suggestions = comp
                                            ? ComponentSuggester.suggestComponents(
                                                  comp as unknown as { category: "TECHNICAL" | "BEHAVIORAL" | "COGNITIVE" | "DOMAIN_SPECIFIC" },
                                                  targetLevel as "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT"
                                              )
                                            : [];
                                        const available = suggestions.filter((s) => !alreadyAdded.has(s.type));

                                        if (available.length === 0) {
                                            return (
                                                <p className="text-sm text-muted-foreground py-6 text-center">
                                                    All component types have been added for this competency.
                                                </p>
                                            );
                                        }

                                        return available.map((s: ComponentSuggestion) => {
                                            const checked = selectedTypes.has(s.type);
                                            return (
                                                <label
                                                    key={s.type}
                                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${
                                                        checked ? "bg-primary/5 border-primary/40" : "hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="mt-0.5 h-4 w-4 rounded accent-primary"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const next = new Set(selectedTypes);
                                                            if (e.target.checked) next.add(s.type);
                                                            else next.delete(s.type);
                                                            setSelectedTypes(next);
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-medium">
                                                                {s.icon} {s.type}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[10px] py-0 px-1.5 ${
                                                                    s.priority === "HIGH"
                                                                        ? "border-emerald-300 text-emerald-700"
                                                                        : s.priority === "MEDIUM"
                                                                        ? "border-amber-300 text-amber-700"
                                                                        : "border-muted-foreground/30 text-muted-foreground"
                                                                }`}
                                                            >
                                                                {s.priority}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                                                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                                            ~{s.estimatedQuestions} questions · ~{s.estimatedDuration} min
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        });
                                    })()}
                                </div>

                                <Button
                                    className="w-full"
                                    disabled={selectedTypes.size === 0 || isAdding}
                                    onClick={() =>
                                        addingCompetencyId &&
                                        handleAddComponents(addingCompetencyId, Array.from(selectedTypes))
                                    }
                                >
                                    {isAdding ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <Plus className="w-4 h-4 mr-2" />
                                    )}
                                    {selectedTypes.size === 0
                                        ? "Select at least one type"
                                        : `Add ${selectedTypes.size} Component${selectedTypes.size > 1 ? "s" : ""}`}
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
