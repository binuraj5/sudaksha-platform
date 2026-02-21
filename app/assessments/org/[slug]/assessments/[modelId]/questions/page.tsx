"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QuestionForm } from "@/components/assessments/QuestionForm";
import { BulkUploadQuestions } from "@/components/assessments/BulkUploadQuestions";
import { QuestionList } from "@/components/assessments/QuestionList";
import { AIGenerateQuestions } from "@/components/assessments/AIGenerateQuestions";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function ClientAssessmentQuestionsPage() {
    const params = useParams();
    const router = useRouter();
    const modelId = params.modelId as string;
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [model, setModel] = useState<any>(null);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [mode, setMode] = useState<"list" | "manual" | "bulk" | "ai">("list");
    const [questions, setQuestions] = useState<any[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

    useEffect(() => {
        fetchModel();
    }, [modelId]);

    const fetchModel = async () => {
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}`);
            if (res.ok) {
                const data = await res.json();
                setModel(data);
                if (data.components?.length > 0) {
                    setSelectedComponentId(data.components[0].id);
                    fetchQuestions(data.components[0].id);
                }
            } else {
                toast.error("Failed to load assessment data");
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
                setQuestions(Array.isArray(data) ? data : data?.questions || []);
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

    const handleSaveQuestion = async (data: any, isEditContext: boolean = !!editingQuestion) => {
        try {
            const url = isEditContext
                ? `/api/assessments/admin/models/${modelId}/components/${selectedComponentId}/questions/${editingQuestion.id}`
                : `/api/assessments/admin/models/${modelId}/components/${selectedComponentId}/questions`;

            const method = isEditContext ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                toast.success(`Question ${isEditContext ? 'updated' : 'added'} successfully!`);
                fetchQuestions(selectedComponentId!);
                setMode("list");
                setEditingQuestion(null);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || `Failed to ${isEditContext ? 'update' : 'add'} question`);
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;
        try {
            const res = await fetch(`/api/assessments/admin/models/${modelId}/components/${selectedComponentId}/questions/${id}`, { method: "DELETE" });
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
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    const currentComponent = model?.components?.find((c: any) => c.id === selectedComponentId);
    const indicators = currentComponent?.competency?.indicators || [];

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-2">
                        <Link href={`/assessments/org/${slug}/assessments`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">{model?.name}</h1>
                    <p className="text-gray-500 font-medium">Add questions to each competency component.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href={`/assessments/org/${slug}/assessments`}>Save for Later</Link>
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                        <Link href={`/assessments/org/${slug}/assessments/${modelId}/builder`}>
                            Review Entire Assessment <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">Competencies</Label>
                    <div className="space-y-2">
                        {(model?.components || []).map((comp: any) => (
                            <div key={comp.id} onClick={() => handleComponentChange(comp.id)}
                                className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-start justify-between ${selectedComponentId === comp.id ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-white border-slate-100 hover:border-indigo-200"}`}>
                                <div className="space-y-1">
                                    <h3 className={`text-sm font-black italic ${selectedComponentId === comp.id ? "text-white" : "text-slate-800"}`}>{comp.competency?.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className={`text-[9px] font-bold ${selectedComponentId === comp.id ? "bg-indigo-400 text-white border-none" : "bg-slate-50 text-slate-400"}`}>
                                            {comp.questions?.length || 0} Questions
                                        </Badge>
                                        <Badge variant="outline" className={`text-[9px] font-bold ${selectedComponentId === comp.id ? "text-indigo-200 border-indigo-400" : "text-slate-400 border-slate-100"}`}>
                                            Weight: {comp.weight}%
                                        </Badge>
                                    </div>
                                </div>
                                <ChevronRight className={`w-5 h-5 ${selectedComponentId === comp.id ? "translate-x-1" : "text-slate-200"}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <TabsList className="bg-slate-100/50 p-1.5 rounded-[1.25rem] h-14 w-fit border-2 border-slate-100">
                                <TabsTrigger value="list" className="rounded-xl px-6 h-10 font-black italic text-xs data-[state=active]:bg-white data-[state=active]:shadow-lg"><FileText className="w-4 h-4 mr-2" /> Questions</TabsTrigger>
                                <TabsTrigger value="manual" className="rounded-xl px-6 h-10 font-black italic text-xs data-[state=active]:bg-white data-[state=active]:shadow-lg"><Plus className="w-4 h-4 mr-2" /> Manual Entry</TabsTrigger>
                                <TabsTrigger value="bulk" className="rounded-xl px-6 h-10 font-black italic text-xs data-[state=active]:bg-white data-[state=active]:shadow-lg"><Upload className="w-4 h-4 mr-2" /> Bulk Upload</TabsTrigger>
                                <TabsTrigger value="ai" className="rounded-xl px-6 h-10 font-black italic text-xs data-[state=active]:bg-white data-[state=active]:shadow-lg"><Brain className="w-4 h-4 mr-2" /> AI Generate</TabsTrigger>
                            </TabsList>
                            {mode === "list" && (
                                <Button className="h-12 rounded-xl bg-slate-800 hover:bg-slate-900 font-bold gap-2 text-xs" onClick={() => { setEditingQuestion(null); setMode("manual"); }}>
                                    <Plus className="w-4 h-4" /> Add One
                                </Button>
                            )}
                        </div>

                        <TabsContent value="list" className="mt-0 focus-visible:ring-0">
                            <QuestionList
                                questions={questions}
                                indicators={indicators}
                                onEdit={(q) => {
                                    setEditingQuestion(q);
                                    setMode("manual");
                                }}
                                onDelete={handleDeleteQuestion}
                                onDuplicate={(q) => {
                                    const { id, ...rest } = q;
                                    handleSaveQuestion(rest, false);
                                }}
                            />
                        </TabsContent>
                        <TabsContent value="manual" className="mt-0 focus-visible:ring-0">
                            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white/80 overflow-hidden">
                                <CardContent className="p-10">
                                    <QuestionForm
                                        key={editingQuestion?.id || "new"}
                                        componentId={selectedComponentId!}
                                        indicators={indicators}
                                        onSave={handleSaveQuestion}
                                        onCancel={() => {
                                            setEditingQuestion(null);
                                            setMode("list");
                                        }}
                                        initialData={editingQuestion}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="bulk" className="mt-0 focus-visible:ring-0">
                            <BulkUploadQuestions componentId={selectedComponentId!} onComplete={() => { fetchQuestions(selectedComponentId!); setMode("list"); }} />
                        </TabsContent>
                        <TabsContent value="ai" className="mt-0 focus-visible:ring-0">
                            <AIGenerateQuestions componentId={selectedComponentId!} indicators={indicators} onAcceptAll={handleAcceptAIQuestions} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
