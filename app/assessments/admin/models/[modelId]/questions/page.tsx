"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
    Search
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QuestionsPage({ params }: { params: Promise<{ modelId: string }> }) {
    const { modelId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [model, setModel] = useState<any>(null);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [mode, setMode] = useState<"list" | "manual" | "bulk" | "ai">("list");
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        fetchModel();
    }, [modelId]);

    const fetchModel = async () => {
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}`);
            if (res.ok) {
                const data = await res.json();
                setModel(data);
                if (data.components.length > 0) {
                    setSelectedComponentId(data.components[0].id);
                    fetchQuestions(data.components[0].id);
                }
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-sudaksha-blue-500" />
                <p className="text-xs text-sudaksha-navy-500">Loading...</p>
            </div>
        );
    }

    const currentComponent = model?.components.find((c: any) => c.id === selectedComponentId);
    const indicators = currentComponent?.competency?.indicators || [];

    return (
        <div className="container mx-auto max-w-5xl space-y-4 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-sudaksha-blue-600 font-medium text-xs uppercase tracking-wider mb-0.5">
                        <Link href="/assessments/admin/models">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-sudaksha-blue-600 hover:text-sudaksha-blue-700 hover:bg-sudaksha-blue-50 -ml-2 h-6 text-xs">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back
                            </Button>
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <span>Questions</span>
                    </div>
                    <h1 className="text-lg font-semibold text-foreground">
                        {model?.name}
                    </h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Link href="/assessments/admin/models">
                        <Button variant="outline" size="sm" className="h-7 px-3 text-xs border-sudaksha-blue-200 text-sudaksha-blue-700 hover:bg-sudaksha-blue-50">
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
                        <Button size="sm" className="h-7 px-3 text-xs bg-sudaksha-orange-500 hover:bg-sudaksha-orange-600 text-white gap-1">
                            Review <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Helpful description */}
            <div className="rounded-lg border border-sudaksha-orange-200/60 bg-gradient-to-r from-sudaksha-orange-50/80 via-sudaksha-warning-50/50 to-sudaksha-blue-50/80 px-4 py-2.5">
                <p className="text-xs text-sudaksha-navy-700 leading-relaxed">
                    <span className="font-semibold text-sudaksha-navy-800">What to do:</span> Pick a competency on the left, then choose: <span className="font-medium text-sudaksha-orange-600">Questions</span> — view & manage; <span className="font-medium text-sudaksha-blue-600">Manual</span> — add one; <span className="font-medium text-sudaksha-orange-500">Bulk</span> — upload file; <span className="font-medium text-sudaksha-blue-600">AI</span> — generate.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Left Sidebar: Components */}
                <div className="lg:col-span-1 space-y-2">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-sudaksha-blue-600 px-1">Competencies</Label>
                    <div className="space-y-1">
                        {model?.components.map((comp: any) => (
                            <div
                                key={comp.id}
                                onClick={() => handleComponentChange(comp.id)}
                                className={`p-2.5 rounded-md border transition-all cursor-pointer group flex items-start justify-between ${selectedComponentId === comp.id
                                    ? "bg-sudaksha-blue-100 border-sudaksha-blue-300 text-sudaksha-navy-800"
                                    : "bg-white border-sudaksha-blue-100 hover:border-sudaksha-blue-200 hover:bg-sudaksha-blue-50/50"
                                    }`}
                            >
                                <div className="space-y-0.5 min-w-0">
                                    <h3 className={`text-xs font-semibold truncate ${selectedComponentId === comp.id ? "text-sudaksha-navy-800" : "text-foreground"}`}>
                                        {comp.competency.name}
                                    </h3>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <Badge variant="secondary" className={`text-[10px] font-medium px-1.5 py-0 ${selectedComponentId === comp.id ? "bg-sudaksha-orange-200 text-sudaksha-orange-800 border-none" : "bg-sudaksha-blue-50 text-sudaksha-blue-700"}`}>
                                            {comp.questions?.length || 0}
                                        </Badge>
                                        <span className={`text-[10px] ${selectedComponentId === comp.id ? "text-sudaksha-navy-600" : "text-muted-foreground"}`}>
                                            {comp.weight}%
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedComponentId === comp.id ? "text-sudaksha-blue-600" : "text-muted-foreground group-hover:text-sudaksha-blue-500"}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-3">
                    <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <TabsList className="bg-sudaksha-blue-50/60 p-1 rounded-md border border-sudaksha-blue-200/60 h-8 w-fit">
                                <TabsTrigger value="list" className="rounded px-3 py-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sudaksha-blue-700 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-sudaksha-blue-200">
                                    <FileText className="w-3 h-3 mr-1.5" /> Questions
                                </TabsTrigger>
                                <TabsTrigger value="manual" className="rounded px-3 py-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sudaksha-orange-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-sudaksha-orange-200">
                                    <Plus className="w-3 h-3 mr-1.5" /> Manual
                                </TabsTrigger>
                                <TabsTrigger value="bulk" className="rounded px-3 py-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sudaksha-orange-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-sudaksha-orange-200">
                                    <Upload className="w-3 h-3 mr-1.5" /> Bulk
                                </TabsTrigger>
                                <TabsTrigger value="ai" className="rounded px-3 py-1 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sudaksha-blue-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-sudaksha-blue-200">
                                    <Brain className="w-3 h-3 mr-1.5" /> AI
                                </TabsTrigger>
                            </TabsList>

                            {mode === "list" && (
                                <div className="flex gap-1.5">
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
                                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-sudaksha-blue-200">
                                        <Search className="w-3.5 h-3.5 text-sudaksha-blue-600" />
                                    </Button>
                                    <Button size="sm" className="h-7 px-3 text-xs bg-sudaksha-orange-500 hover:bg-sudaksha-orange-600 text-white gap-1" onClick={() => setMode("manual")}>
                                        <Plus className="w-3.5 h-3.5" /> Add
                                    </Button>
                                </div>
                            )}
                        </div>

                        <TabsContent value="list" className="mt-0 focus-visible:ring-0">
                            <QuestionList
                                questions={questions}
                                indicators={indicators}
                                onEdit={(q) => {
                                    // Set editing mode or something
                                    toast.info("Edit functionality coming soon. Currently focused on build flow.");
                                }}
                                onDelete={handleDeleteQuestion}
                                onDuplicate={(q) => {
                                    // Handle duplicate
                                    const { id, ...rest } = q;
                                    handleSaveQuestion(rest);
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="manual" className="mt-0 focus-visible:ring-0">
                            <Card className="border border-sudaksha-blue-200/60 shadow-sm rounded-lg bg-white overflow-hidden">
                                <CardContent className="p-4">
                                    <QuestionForm
                                        componentId={selectedComponentId!}
                                        indicators={indicators}
                                        onSave={handleSaveQuestion}
                                        onCancel={() => setMode("list")}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="bulk" className="mt-0 focus-visible:ring-0">
                            <BulkUploadQuestions
                                componentId={selectedComponentId!}
                                onComplete={() => {
                                    fetchQuestions(selectedComponentId!);
                                    setMode("list");
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="ai" className="mt-0 focus-visible:ring-0">
                            <AIGenerateQuestions
                                componentId={selectedComponentId!}
                                modelId={modelId}
                                indicators={indicators}
                                onAcceptAll={handleAcceptAIQuestions}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
