"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    Plus,
    ArrowLeft,
    Loader2,
    FileText,
    Upload,
    Brain,
    ArrowRight,
    ChevronRight,
    Search,
    Sparkles,
    XCircle,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QuestionForm } from "@/components/assessments/QuestionForm";
import { BulkUploadQuestions } from "@/components/assessments/BulkUploadQuestions";
import { QuestionList } from "@/components/assessments/QuestionList";
import { AIGenerateQuestions } from "@/components/assessments/AIGenerateQuestions";
import { PublishModelDialog } from "@/components/assessments/PublishModelDialog";
import { SaveToLibraryDialog } from "@/components/assessments/SaveToLibraryDialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function QuestionsPage({ params }: { params: Promise<{ modelId: string }> }) {
    const { modelId } = use(params);
    const [loading, setLoading] = useState(true);
    const [model, setModel] = useState<any>(null);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [mode, setMode] = useState<"list" | "manual" | "bulk" | "ai">("list");
    const [questions, setQuestions] = useState<any[]>([]);
    const [batchCounts, setBatchCounts] = useState<Record<string, number>>({});
    const [batchGenerating, setBatchGenerating] = useState(false);
    const [unpublishing, setUnpublishing] = useState(false);

    useEffect(() => {
        fetchModel();
    }, [modelId]);

    const fetchModel = async () => {
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}`);
            let data: any = null;
            if (res.ok) {
                data = await res.json();
            }
            let components = data?.components ?? [];
            // Fallback: if model API failed or has no components, fetch from components API
            if (components.length === 0) {
                const compRes = await fetch(`/api/assessments/admin/models/${modelId}/components`);
                if (compRes.ok) {
                    const compData = await compRes.json();
                    components = Array.isArray(compData) ? compData : [];
                }
            }
            if (data) {
                data.components = components;
            } else {
                // Model API failed - build minimal model from components for display
                data = { id: modelId, name: "Assessment Model", components };
            }
            setModel(data);
            if (components.length > 0) {
                setSelectedComponentId(components[0].id);
                fetchQuestions(components[0].id);
            }
        } catch (error) {
            toast.error("Failed to load assessment data");
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async (componentId: string) => {
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/components/${componentId}/questions`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            toast.error("Failed to load questions");
        }
    };

    const handleComponentChange = (id: string) => {
        setSelectedComponentId(id);
        fetchQuestions(id);
        setMode("list");
    };

    const handleSaveQuestion = async (data: any) => {
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/components/${selectedComponentId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                toast.success("Question added successfully!");
                fetchQuestions(selectedComponentId!);
                setMode("list");
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to add question");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/components/${selectedComponentId}/questions/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success("Question deleted");
                fetchQuestions(selectedComponentId!);
            }
        } catch (error) {
            toast.error("Failed to delete question");
        }
    };

    const handleAcceptAIQuestions = async (aiQuestions: any[]) => {
        try {
            const res = await fetch(`/api/assessments/admin/components/${selectedComponentId}/questions/bulk-json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions: aiQuestions })
            });

            if (res.ok) {
                toast.success(`Successfully saved ${aiQuestions.length} questions!`);
                fetchQuestions(selectedComponentId!);
                setMode("list");
            } else {
                toast.error("Failed to save AI questions");
            }
        } catch (error) {
            toast.error("An error occurred during save");
        }
    };

    const getAiGenerateUrl = (compId: string) =>
        `/api/assessments/admin/models/${modelId}/components/${compId}/questions/ai-generate`;

    const isPublished = model?.status === "PUBLISHED";

    const handleUnpublish = async () => {
        setUnpublishing(true);
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/unpublish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Model unpublished");
                fetchModel();
            } else {
                toast.error(data.error || "Failed to unpublish");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setUnpublishing(false);
        }
    };

    const handleBatchGenerateAll = async () => {
        if (!model?.components?.length) return;
        setBatchGenerating(true);
        let totalSaved = 0;
        const payload = (count: number) => ({
            count,
            difficulty: "MEDIUM",
            questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
            additionalContext: ""
        });
        try {
            for (let i = 0; i < model.components.length; i++) {
                const comp = model.components[i];
                const count = Math.min(20, Math.max(1, batchCounts[comp.id] ?? 5));
                let res = await fetch(getAiGenerateUrl(comp.id), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload(count))
                });
                if (!res.ok) {
                    res = await fetch(`/api/assessments/admin/components/${comp.id}/questions/ai-generate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload(count))
                    });
                }
                if (!res.ok) {
                    toast.error(`Failed to generate for ${comp.competency?.name || comp.id}`);
                    continue;
                }
                const data = await res.json();
                const saveRes = await fetch(`/api/assessments/admin/components/${comp.id}/questions/bulk-json`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ questions: data.questions })
                });
                if (saveRes.ok) {
                    totalSaved += data.questions?.length || 0;
                    fetchModel();
                }
            }
            toast.success(`Generated and saved ${totalSaved} questions across all competencies!`);
            fetchModel();
        } catch (error) {
            toast.error("Batch generation failed");
        } finally {
            setBatchGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 font-sans">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    const currentComponent = model?.components.find((c: any) => c.id === selectedComponentId);
    const indicators = currentComponent?.competency?.indicators || [];
    const isSpecializedComponent = currentComponent && ["VOICE", "VIDEO", "CODE", "ADAPTIVE_AI", "ADAPTIVE_QUESTIONNAIRE", "PANEL"].includes(currentComponent.componentType);

    return (
        <div className="container mx-auto max-w-7xl py-8 px-4 space-y-6 font-sans">
            {/* Header - matches models page */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Link href="/assessments/admin/models">
                            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 h-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                                <ArrowLeft className="w-4 h-4" />
                                Models
                            </Button>
                        </Link>
                        <span>/</span>
                        <Link href={`/assessments/admin/models/${modelId}`}>
                            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted -ml-1">
                                {model?.name ?? "Details"}
                            </Button>
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">Questions</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        {model?.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Add and manage questions for each competency component.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Link href="/assessments/admin/models">
                        <Button variant="outline" size="sm" className="h-9 border-border hover:bg-muted">
                            Save for Later
                        </Button>
                    </Link>
                    <PublishModelDialog
                        modelId={modelId}
                        modelName={model?.name}
                        currentVisibility={model?.visibility}
                        currentStatus={model?.status}
                        isSuperAdmin={true}
                        onPublished={() => fetchModel()}
                    />
                    <Link href={`/assessments/admin/models/${modelId}/builder`}>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                            Builder <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Published lock banner */}
            {isPublished && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-amber-600" />
                        <p className="text-sm text-amber-800">
                            <span className="font-medium">Model is published.</span> Components and questions are read-only. Unpublish to make changes, then publish as the next version.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUnpublish}
                        disabled={unpublishing}
                        className="border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                        {unpublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                        Unpublish
                    </Button>
                </div>
            )}

            {/* Info banner - simplified, matches admin card style */}
            {!isPublished && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">What to do:</span> Select a competency on the left, then use <span className="font-medium text-foreground">Questions</span> to view & manage, <span className="font-medium text-foreground">Manual</span> to add one, <span className="font-medium text-foreground">Bulk</span> to upload, or <span className="font-medium text-foreground">AI</span> to generate.
                </p>
            </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar: Components - Card style like models page */}
                <div className="lg:col-span-1">
                    <Card className="shadow-sm border bg-card overflow-hidden">
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Competencies
                            </Label>
                        </div>
                        <CardContent className="p-2">
                            {(model?.components ?? []).length === 0 ? (
                                <div className="py-6 px-3 text-center">
                                    <p className="text-xs text-muted-foreground">No competencies yet.</p>
                                    <Link href={`/assessments/admin/models/${modelId}/builder`}>
                                        <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1">
                                            Add in Builder →
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                            <div className="space-y-1">
                                {(model?.components ?? []).map((comp: any) => (
                                    <div
                                        key={comp.id}
                                        onClick={() => handleComponentChange(comp.id)}
                                        className={`p-3 rounded-lg border transition-all cursor-pointer group flex items-start justify-between ${
                                            selectedComponentId === comp.id
                                                ? "bg-primary/10 border-primary/30 text-foreground"
                                                : "bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/20"
                                        }`}
                                    >
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <h3 className="text-sm font-medium truncate">
                                                {comp.competency?.name ?? comp.id}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">
                                                    {comp.componentType ?? "MCQ"}
                                                </Badge>
                                                {(() => {
                                                    const qCount = comp._count?.questions ?? comp.questions?.length ?? 0;
                                                    const isSpecialized = ["VOICE", "VIDEO", "CODE", "ADAPTIVE_AI", "ADAPTIVE_QUESTIONNAIRE", "PANEL"].includes(comp.componentType);
                                                    if (isSpecialized) {
                                                        return <span className="text-xs text-muted-foreground">{qCount > 0 ? `${qCount} Q` : "Configured"}</span>;
                                                    }
                                                    return <Badge variant="secondary" className="text-xs font-medium">{qCount} Q</Badge>;
                                                })()}
                                                <span className="text-xs text-muted-foreground">
                                                    {comp.weight}%
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${
                                            selectedComponentId === comp.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        }`} />
                                    </div>
                                ))}
                            </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="shadow-sm border bg-card overflow-hidden">
                        <CardContent className="p-4">
                            <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <TabsList className="bg-white border p-1 rounded-xl h-11">
                                        <TabsTrigger value="list" className="px-4 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                                            <FileText className="w-4 h-4 mr-2" /> Questions
                                        </TabsTrigger>
                                        <TabsTrigger value="manual" disabled={isPublished || isSpecializedComponent} className="px-4 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700 disabled:opacity-50 disabled:pointer-events-none">
                                            <Plus className="w-4 h-4 mr-2" /> Manual
                                        </TabsTrigger>
                                        <TabsTrigger value="bulk" disabled={isPublished || isSpecializedComponent} className="px-4 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700 disabled:opacity-50 disabled:pointer-events-none">
                                            <Upload className="w-4 h-4 mr-2" /> Bulk
                                        </TabsTrigger>
                                        <TabsTrigger value="ai" disabled={isPublished || isSpecializedComponent} className="px-4 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700 disabled:opacity-50 disabled:pointer-events-none">
                                            <Brain className="w-4 h-4 mr-2" /> AI
                                        </TabsTrigger>
                                    </TabsList>

                                    {mode === "list" && !isPublished && (
                                        <div className="flex gap-2">
                                            {currentComponent && currentComponent.competencyId && questions.length > 0 && (
                                                <SaveToLibraryDialog
                                                    componentId={selectedComponentId!}
                                                    componentType={currentComponent.componentType || "QUESTIONNAIRE"}
                                                    competencyId={currentComponent.competencyId}
                                                    competencyName={currentComponent.competency?.name}
                                                    targetLevel={String(model?.targetLevel || currentComponent.targetLevel || "JUNIOR")}
                                                    questionCount={questions.length}
                                                    onSaved={() => fetchModel()}
                                                />
                                            )}
                                            <Button variant="outline" size="sm" className="h-9">
                                                <Search className="w-4 h-4" />
                                            </Button>
                                            {!isPublished && (
                                            <Button size="sm" className="h-9 bg-navy-700 hover:bg-navy-600 gap-1" onClick={() => setMode("manual")}>
                                                <Plus className="w-4 h-4" /> Add
                                            </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <TabsContent value="list" className="mt-0 focus-visible:ring-0">
                                    {isSpecializedComponent && questions.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                                            <p className="text-sm font-medium text-foreground mb-1">
                                                {currentComponent?.componentType} component
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                This component is configured in the Builder. Voice, Video, Code, and Adaptive components use runtime configuration rather than a static question bank.
                                            </p>
                                            <Link href={`/assessments/admin/models/${modelId}/builder`}>
                                                <Button variant="outline" size="sm">Open Builder to configure</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <QuestionList
                                            questions={questions}
                                            indicators={indicators}
                                            onEdit={(q) => {
                                                toast.info("Edit functionality coming soon. Currently focused on build flow.");
                                            }}
                                            onDelete={handleDeleteQuestion}
                                            onDuplicate={(q) => {
                                                const { id, ...rest } = q;
                                                handleSaveQuestion(rest);
                                            }}
                                            readOnly={isPublished}
                                        />
                                    )}
                                </TabsContent>

                                <TabsContent value="manual" className="mt-0 focus-visible:ring-0">
                                    {selectedComponentId ? (
                                        <div className="rounded-lg border border-border bg-card p-4">
                                            <QuestionForm
                                                componentId={selectedComponentId}
                                                indicators={indicators}
                                                onSave={handleSaveQuestion}
                                                onCancel={() => setMode("list")}
                                            />
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                                            <p className="text-sm text-muted-foreground">Select a competency from the sidebar first.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="bulk" className="mt-0 focus-visible:ring-0">
                                    {selectedComponentId ? (
                                        <BulkUploadQuestions
                                            componentId={selectedComponentId}
                                            onComplete={() => {
                                                fetchQuestions(selectedComponentId);
                                                setMode("list");
                                            }}
                                        />
                                    ) : (
                                        <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                                            <p className="text-sm text-muted-foreground">Select a competency from the sidebar first.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="ai" className="mt-0 focus-visible:ring-0 space-y-6">
                                    {!selectedComponentId ? (
                                        <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                Select a competency from the sidebar to generate questions with AI.
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                If no competencies appear, add components in the Builder first.
                                            </p>
                                        </div>
                                    ) : model?.components?.length >= 1 && (
                                        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-foreground">Generate for all competencies</Label>
                                                <span className="text-xs text-muted-foreground">Set question count per competency</span>
                                            </div>
                                            <div className="grid gap-3">
                                                {model.components.map((comp: any) => (
                                                    <div key={comp.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-card border border-border">
                                                        <span className="text-sm font-medium text-foreground truncate flex-1">{comp.competency?.name || comp.id}</span>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Label className="text-xs text-muted-foreground">Count</Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={20}
                                                                value={batchCounts[comp.id] ?? 5}
                                                                onChange={(e) => setBatchCounts(prev => ({ ...prev, [comp.id]: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)) }))}
                                                                className="w-16 h-8 text-center text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
                                                onClick={handleBatchGenerateAll}
                                                disabled={batchGenerating}
                                            >
                                                {batchGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                {batchGenerating ? "Generating..." : "Generate for all competencies"}
                                            </Button>
                                        </div>
                                    )}
                                    {selectedComponentId && (
                                        <div className="border-t border-border pt-4">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Generate for selected competency</Label>
                                            <AIGenerateQuestions
                                                componentId={selectedComponentId}
                                                modelId={modelId}
                                                indicators={indicators}
                                                onAcceptAll={handleAcceptAIQuestions}
                                            />
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
