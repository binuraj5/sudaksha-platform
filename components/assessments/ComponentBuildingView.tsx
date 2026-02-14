"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ComponentType } from "@/lib/assessment/component-suggester";
import { AIGenerateQuestions } from "@/components/assessments/AIGenerateQuestions";
import { QuestionForm } from "@/components/assessments/QuestionForm";
import { BulkUploadQuestions } from "@/components/assessments/BulkUploadQuestions";
import { LibraryBrowser } from "@/components/assessments/LibraryBrowser";
import { VoiceComponentBuilder, type VoiceConfig } from "@/components/assessments/VoiceComponentBuilder";
import { type VideoConfig } from "@/components/assessments/VideoComponentBuilder";
import { type CodeConfig } from "@/components/assessments/CodeComponentBuilder";
import { VideoComponentBuilder } from "@/components/assessments/VideoComponentBuilder";
import { CodeComponentBuilder } from "@/components/assessments/CodeComponentBuilder";
import { AdaptiveConfigForm, type AdaptiveConfig } from "@/components/assessments/AdaptiveConfigForm";
import { PanelComponentBuilder } from "@/components/assessments/PanelComponentBuilder";
import { Brain, FileEdit, Upload, Library, Loader2 } from "lucide-react";
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
    config?: unknown;
    competency?: {
        name: string;
        category: string;
        indicators?: { id: string; text: string; level: string }[];
    };
}

interface ComponentBuildingViewProps {
    modelId: string;
    selections: Map<string, ComponentSelection>;
    competencies: { id: string; name: string; category: string; indicators?: { id: string; text: string; level: string }[] }[];
    targetLevel: string;
    onBack: () => void;
    onStatusUpdate: (
        competencyId: string,
        componentType: ComponentType,
        status: Partial<ComponentBuildStatus>,
        componentId?: string
    ) => void;
    onComplete: () => void;
}

type BuildMethod = "AI_GENERATE" | "MANUAL" | "USE_EXISTING" | "BULK_UPLOAD" | null;

export function ComponentBuildingView({
    modelId,
    selections,
    competencies,
    targetLevel,
    onBack,
    onStatusUpdate,
    onComplete,
}: ComponentBuildingViewProps) {
    const [components, setComponents] = useState<ModelComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentBuild, setCurrentBuild] = useState<{
        competencyId: string;
        componentType: ComponentType;
    } | null>(null);
    const [buildMethod, setBuildMethod] = useState<BuildMethod>(null);

    useEffect(() => {
        async function fetchComponents() {
            try {
                const res = await fetch(`/api/assessments/admin/models/${modelId}/components`);
                if (res.ok) {
                    const data = await res.json();
                    setComponents(data);
                }
            } catch {
                toast.error("Failed to load components");
            } finally {
                setLoading(false);
            }
        }
        fetchComponents();
    }, [modelId]);

    const getComponentId = (competencyId: string, componentType: ComponentType): string | null => {
        const comp = components.find((c) => {
            if (c.competencyId !== competencyId) return false;
            if (c.componentType === componentType) return true;
            // Map legacy types
            if (
                (componentType === ComponentType.ADAPTIVE_AI || componentType === ComponentType.ADAPTIVE_QUESTIONNAIRE) &&
                (c.componentType === "ADAPTIVE_AI" || c.componentType === "ADAPTIVE_QUESTIONNAIRE")
            )
                return true;
            return false;
        });
        return comp?.id ?? null;
    };

    const startBuilding = (competencyId: string, componentType: ComponentType) => {
        setCurrentBuild({ competencyId, componentType });
        setBuildMethod(null);
    };

    const closeDialog = () => {
        setCurrentBuild(null);
        setBuildMethod(null);
    };

    const handleUseLibrarySuccess = () => {
        if (currentBuild) {
            onStatusUpdate(currentBuild.competencyId, currentBuild.componentType, {
                status: "COMPLETE",
                progress: 100
            }, getComponentId(currentBuild.competencyId, currentBuild.componentType) ?? undefined);
        }
        closeDialog();
    };

    const handleAcceptAI = async (competencyId: string, componentType: ComponentType, questions: { questionText: string; questionType: string; options?: unknown[]; correctAnswer?: string | null; points?: number; timeLimit?: number | null; linkedIndicators?: string[]; explanation?: string }[]) => {
        const compId = getComponentId(competencyId, componentType);
        if (!compId) {
            closeDialog();
            return;
        }
        try {
            const res = await fetch(`/api/assessments/admin/components/${compId}/questions/bulk-json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions })
            });
            if (res.ok) {
                toast.success(`Saved ${questions.length} questions`);
                onStatusUpdate(competencyId, componentType, { status: "COMPLETE", progress: 100 }, compId);
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save questions");
            }
        } catch {
            toast.error("Failed to save questions");
        }
        closeDialog();
    };

    const handleSaveQuestion = (competencyId: string, componentType: ComponentType) => {
        onStatusUpdate(competencyId, componentType, { status: "COMPLETE", progress: 100 });
        closeDialog();
    };

    const handleBulkComplete = (competencyId: string, componentType: ComponentType) => {
        onStatusUpdate(competencyId, componentType, { status: "COMPLETE", progress: 100 });
        closeDialog();
    };

    const isSpecializedComponent = (type: ComponentType) =>
        type === ComponentType.VOICE ||
        type === ComponentType.VIDEO ||
        type === ComponentType.CODE ||
        type === ComponentType.ADAPTIVE_AI ||
        type === ComponentType.ADAPTIVE_QUESTIONNAIRE ||
        type === ComponentType.PANEL;

    const renderBuildDialog = () => {
        if (!currentBuild) return null;
        const competency = competencies.find((c) => c.id === currentBuild.competencyId);
        const componentId = getComponentId(currentBuild.competencyId, currentBuild.componentType);

        // Specialized builders (VOICE, VIDEO, CODE) - show config UI directly
        if (componentId && isSpecializedComponent(currentBuild.componentType)) {
            const handleSpecializedComplete = () => {
                onStatusUpdate(currentBuild.competencyId, currentBuild.componentType, {
                    status: "COMPLETE",
                    progress: 100,
                }, componentId);
                closeDialog();
            };
            if (currentBuild.componentType === ComponentType.VOICE) {
                return (
                    <Dialog open={true} onOpenChange={() => closeDialog()}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Build AI Voice Component</DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    Competency: {competency?.name} ({targetLevel} Level)
                                </p>
                            </DialogHeader>
                            <VoiceComponentBuilder
                                componentId={componentId}
                                modelId={modelId}
                                competencyName={competency?.name ?? ""}
                                targetLevel={targetLevel}
                                indicators={competency?.indicators}
                                initialConfig={
                                    components.find(
                                        (c) => c.id === componentId && c.componentType === "VOICE"
                                    )?.config as VoiceConfig | undefined
                                }
                                onComplete={handleSpecializedComplete}
                                onCancel={closeDialog}
                            />
                        </DialogContent>
                    </Dialog>
                );
            }
            if (currentBuild.componentType === ComponentType.VIDEO) {
                return (
                    <Dialog open={true} onOpenChange={() => closeDialog()}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Build AI Video Component</DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    Competency: {competency?.name} ({targetLevel} Level)
                                </p>
                            </DialogHeader>
                            <VideoComponentBuilder
                                componentId={componentId}
                                modelId={modelId}
                                competencyName={competency?.name ?? ""}
                                targetLevel={targetLevel}
                                indicators={competency?.indicators}
                                initialConfig={
                                    components.find(
                                        (c) => c.id === componentId && c.componentType === "VIDEO"
                                    )?.config as VideoConfig | undefined
                                }
                                onComplete={handleSpecializedComplete}
                                onCancel={closeDialog}
                            />
                        </DialogContent>
                    </Dialog>
                );
            }
            if (currentBuild.componentType === ComponentType.CODE) {
                return (
                    <Dialog open={true} onOpenChange={() => closeDialog()}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Build Code Test Component</DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    Competency: {competency?.name} ({targetLevel} Level)
                                </p>
                            </DialogHeader>
                            <CodeComponentBuilder
                                componentId={componentId}
                                modelId={modelId}
                                competencyName={competency?.name ?? ""}
                                targetLevel={targetLevel}
                                indicators={competency?.indicators}
                                initialConfig={
                                    components.find(
                                        (c) => c.id === componentId && c.componentType === "CODE"
                                    )?.config as CodeConfig | undefined
                                }
                                onComplete={handleSpecializedComplete}
                                onCancel={closeDialog}
                            />
                        </DialogContent>
                    </Dialog>
                );
            }
            if (
                currentBuild.componentType === ComponentType.ADAPTIVE_AI ||
                currentBuild.componentType === ComponentType.ADAPTIVE_QUESTIONNAIRE
            ) {
                return (
                    <Dialog open={true} onOpenChange={() => closeDialog()}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Configure Adaptive AI Component</DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    Competency: {competency?.name} ({targetLevel} Level)
                                </p>
                            </DialogHeader>
                            <AdaptiveConfigForm
                                componentId={componentId}
                                modelId={modelId}
                                competencyName={competency?.name ?? ""}
                                targetLevel={targetLevel}
                                initialConfig={
                                    components.find(
                                        (c) =>
                                            c.id === componentId &&
                                            (c.componentType === "ADAPTIVE_AI" ||
                                                c.componentType === "ADAPTIVE_QUESTIONNAIRE")
                                    )?.config as AdaptiveConfig | undefined
                                }
                                onComplete={handleSpecializedComplete}
                                onCancel={closeDialog}
                            />
                        </DialogContent>
                    </Dialog>
                );
            }
            if (currentBuild.componentType === ComponentType.PANEL) {
                return (
                    <Dialog open={true} onOpenChange={() => closeDialog()}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Configure Panel Interview</DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    Competency: {competency?.name} ({targetLevel} Level)
                                </p>
                            </DialogHeader>
                            <PanelComponentBuilder
                                componentId={componentId}
                                competencyName={competency?.name ?? ""}
                                targetLevel={targetLevel}
                                onComplete={handleSpecializedComplete}
                                onCancel={closeDialog}
                            />
                        </DialogContent>
                    </Dialog>
                );
            }
        }

        return (
            <Dialog open={true} onOpenChange={() => closeDialog()}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Build {currentBuild.componentType} Component
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Competency: {competency?.name} ({targetLevel} Level)
                        </p>
                    </DialogHeader>

                    {!componentId ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            Loading component...
                        </div>
                    ) : !buildMethod ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Choose how to create questions:
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <Card
                                    className="cursor-pointer hover:border-navy-300 transition border"
                                    onClick={() => setBuildMethod("AI_GENERATE")}
                                >
                                    <CardContent className="pt-6 text-center">
                                        <Brain className="w-10 h-10 mx-auto mb-2 text-navy-600" />
                                        <div className="font-semibold">AI Generate</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            AI creates questions from indicators
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card
                                    className="cursor-pointer hover:border-navy-300 transition border"
                                    onClick={() => setBuildMethod("MANUAL")}
                                >
                                    <CardContent className="pt-6 text-center">
                                        <FileEdit className="w-10 h-10 mx-auto mb-2 text-navy-600" />
                                        <div className="font-semibold">Manual Entry</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Create questions one by one
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card
                                    className="cursor-pointer hover:border-navy-300 transition border"
                                    onClick={() => setBuildMethod("USE_EXISTING")}
                                >
                                    <CardContent className="pt-6 text-center">
                                        <Library className="w-10 h-10 mx-auto mb-2 text-navy-600" />
                                        <div className="font-semibold">Use Existing</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Select from component library
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card
                                    className="cursor-pointer hover:border-navy-300 transition border"
                                    onClick={() => setBuildMethod("BULK_UPLOAD")}
                                >
                                    <CardContent className="pt-6 text-center">
                                        <Upload className="w-10 h-10 mx-auto mb-2 text-navy-600" />
                                        <div className="font-semibold">Bulk Upload</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Upload via CSV/Excel
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : buildMethod === "AI_GENERATE" ? (
                        <AIGenerateQuestions
                            componentId={componentId}
                            modelId={modelId}
                            indicators={competency?.indicators?.map((i) => ({ ...i, level: i.level })) ?? []}
                            onAcceptAll={(questions) =>
                                handleAcceptAI(currentBuild.competencyId, currentBuild.componentType, questions)
                            }
                        />
                    ) : buildMethod === "MANUAL" ? (
                        <QuestionForm
                            componentId={componentId}
                            indicators={competency?.indicators ?? []}
                            onSave={() =>
                                handleSaveQuestion(currentBuild.competencyId, currentBuild.componentType)
                            }
                            onCancel={closeDialog}
                        />
                    ) : buildMethod === "BULK_UPLOAD" ? (
                        <BulkUploadQuestions
                            componentId={componentId}
                            onComplete={() =>
                                handleBulkComplete(currentBuild.competencyId, currentBuild.componentType)
                            }
                        />
                    ) : buildMethod === "USE_EXISTING" ? (
                        <LibraryBrowser
                            competencyId={currentBuild.competencyId}
                            componentType={currentBuild.componentType}
                            targetLevel={targetLevel}
                            modelId={modelId}
                            componentId={componentId}
                            onSuccess={handleUseLibrarySuccess}
                            onCancel={closeDialog}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-navy-600" />
                <p className="text-muted-foreground">Loading components...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Build Components</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>
                        ← Back to Selection
                    </Button>
                    <Button onClick={onComplete}>
                        Done → Go to Questions
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-semibold">Competency</th>
                                    <th className="text-left p-4 font-semibold">Component Type</th>
                                    <th className="text-left p-4 font-semibold">Build Action</th>
                                    <th className="text-left p-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(selections.entries()).map(([compId, selection]) => {
                                    const competency = competencies.find((c) => c.id === compId);
                                    if (!competency || selection.selectedComponents.size === 0)
                                        return null;

                                    return Array.from(selection.selectedComponents).map(
                                        (type: ComponentType) => {
                                            const status = selection.componentStatus.get(type);
                                            return (
                                                <tr
                                                    key={`${compId}-${type}`}
                                                    className="border-b"
                                                >
                                                    <td className="p-4">{competency.name}</td>
                                                    <td className="p-4">
                                                        <Badge>{type}</Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                startBuilding(compId, type)
                                                            }
                                                        >
                                                            {status?.status === "COMPLETE"
                                                                ? "View/Edit"
                                                                : "Build"}
                                                        </Button>
                                                    </td>
                                                    <td className="p-4">
                                                        {status?.status === "COMPLETE" ? (
                                                            <Badge variant="default">
                                                                ✓ Complete
                                                            </Badge>
                                                        ) : status?.status === "IN_PROGRESS" ? (
                                                            <Badge variant="secondary">
                                                                {status.progress}%
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Not Started
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {renderBuildDialog()}
        </div>
    );
}
