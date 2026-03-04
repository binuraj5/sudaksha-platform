"use client";

import React, { useState } from "react";
import {
    Brain,
    Sparkles,
    Loader2,
    RefreshCcw,
    Trash2,
    Edit2,
    CheckCircle2,
    Settings2,
    FileType,
    BarChart3,
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionType } from "@sudaksha/db-core";
import { QuestionEditDialog } from "@/components/assessments/QuestionEditDialog";

interface AIQuestion {
    questionText: string;
    questionType: QuestionType;
    options: any[];
    correctAnswer: string | null;
    points: number;
    timeLimit: number;
    linkedIndicators: string[];
    explanation: string;
}

interface AIGenerateProps {
    componentId: string;
    modelId?: string; // When provided, uses model-scoped API (fixes "Component not found")
    indicators: { id: string; text: string; level: string }[];
    onAcceptAll: (questions: AIQuestion[]) => void;
}

const getAiGenerateUrl = (componentId: string, modelId?: string) =>
    modelId
        ? `/api/assessments/admin/models/${modelId}/components/${componentId}/questions/ai-generate`
        : `/api/assessments/admin/components/${componentId}/questions/ai-generate`;

export const AIGenerateQuestions: React.FC<AIGenerateProps> = ({
    componentId,
    modelId,
    indicators,
    onAcceptAll
}) => {
    const [generating, setGenerating] = useState(false);
    const [step, setStep] = useState<"config" | "preview">("config");
    const [questions, setQuestions] = useState<AIQuestion[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

    // Config State
    const [count, setCount] = useState(5);
    const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
    const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["MULTIPLE_CHOICE", "TRUE_FALSE"]);
    const [additionalContext, setAdditionalContext] = useState("");

    const callAiGenerate = async (url: string, payload: object) => {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        return res;
    };

    const handleGenerate = async () => {
        if (!componentId) {
            toast.error("No competency selected. Please select a competency from the sidebar.");
            return;
        }
        if (count === 0) {
            setQuestions([]);
            setStep("preview");
            toast.success("Generated 0 questions");
            return;
        }
        setGenerating(true);
        try {
            const payload = { count, difficulty, questionTypes: selectedTypes, additionalContext };
            let res = await callAiGenerate(getAiGenerateUrl(componentId, modelId), payload);

            // Fallback: if model-scoped API returns 404 "Component not found", try component-level API
            if (!res.ok && modelId) {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 404 && (errData?.error?.includes("Component not found") || errData?.error?.includes("component"))) {
                    res = await callAiGenerate(getAiGenerateUrl(componentId), payload);
                }
            }

            if (res.ok) {
                const data = await res.json();
                setQuestions(data.questions);
                setStep("preview");
                toast.success(`Generated ${data.questions.length} questions!`);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to generate questions");
            }
        } catch (error) {
            toast.error("An error occurred during generation");
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerateOne = async (index: number) => {
        if (!componentId) return;
        setRegeneratingIndex(index);
        try {
            const payload = {
                count: 1,
                difficulty,
                questionTypes: [questions[index].questionType],
                additionalContext: `This is a replacement for: ${questions[index].questionText}. ${additionalContext}`
            };
            let res = await callAiGenerate(getAiGenerateUrl(componentId, modelId), payload);

            if (!res.ok && modelId) {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 404 && (errData?.error?.includes("Component not found") || errData?.error?.includes("component"))) {
                    res = await callAiGenerate(getAiGenerateUrl(componentId), payload);
                }
            }

            if (res.ok) {
                const data = await res.json();
                const newQuestions = [...questions];
                newQuestions[index] = data.questions[0];
                setQuestions(newQuestions);
                toast.success("Question regenerated!");
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Regeneration failed");
            }
        } catch (error) {
            toast.error("Regeneration failed");
        } finally {
            setRegeneratingIndex(null);
        }
    };

    const handleSaveEdit = (updated: AIQuestion) => {
        const newQuestions = [...questions];
        if (editingIndex !== null) {
            newQuestions[editingIndex] = updated;
            setQuestions(newQuestions);
        }
    };

    const toggleType = (type: QuestionType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            {step === "config" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">AI Question Generation</h2>
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                            Generate questions based on your competency indicators and target level.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border border-border bg-card shadow-sm rounded-xl p-6">
                            <div className="space-y-6">
                                <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <BarChart3 className="w-4 h-4" /> Parameters
                                </Label>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label className="font-medium text-sm text-foreground">Number of Questions</Label>
                                        <span className="text-xs font-semibold text-primary">{count}</span>
                                    </div>
                                    <Input
                                        type="range"
                                        min="0"
                                        max="20"
                                        step="1"
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value))}
                                        className="accent-primary"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="font-medium text-sm text-foreground">Difficulty Level</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["EASY", "MEDIUM", "HARD"].map((lvl) => (
                                            <div
                                                key={lvl}
                                                onClick={() => setDifficulty(lvl as any)}
                                                className={`py-2.5 rounded-lg border text-center cursor-pointer transition-all text-xs font-medium ${difficulty === lvl
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-card border-border text-muted-foreground hover:border-muted-foreground/30"
                                                    }`}
                                            >
                                                {lvl}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="border border-border bg-card shadow-sm rounded-xl p-6">
                            <div className="space-y-6">
                                <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <FileType className="w-4 h-4" /> Question Types
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: "MULTIPLE_CHOICE", label: "Multiple Choice" },
                                        { id: "TRUE_FALSE", label: "True / False" },
                                        { id: "SCENARIO_BASED", label: "Scenario / Situational" },
                                        { id: "FILL_IN_BLANK", label: "Short Answer" },
                                        { id: "ESSAY", label: "Long Essay" }
                                    ].map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => toggleType(t.id as any)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${selectedTypes.includes(t.id as any)
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border bg-card hover:border-muted-foreground/30"
                                                }`}
                                        >
                                            <Checkbox checked={selectedTypes.includes(t.id as any)} />
                                            <span className="text-xs font-medium text-foreground">{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Settings2 className="w-4 h-4" /> Additional Context
                                </Label>
                                <Textarea
                                    placeholder="e.g. Focus on Java 11 features, avoid obsolete APIs..."
                                    className="min-h-[80px] rounded-lg border border-border bg-muted/30 text-foreground"
                                    value={additionalContext}
                                    onChange={(e) => setAdditionalContext(e.target.value)}
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
                            onClick={handleGenerate}
                            disabled={generating || selectedTypes.length === 0}
                        >
                            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {generating ? "Generating..." : "Generate with AI"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider mb-1">
                                <History className="w-4 h-4" /> AI Output Preview
                            </div>
                            <h2 className="text-lg font-bold tracking-tight text-foreground">Generated Questions</h2>
                            <p className="text-sm text-muted-foreground">Review, edit, or regenerate before adding to assessment.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg h-9 border-border" onClick={() => setStep("config")}>
                                <RefreshCcw className="w-4 h-4 mr-2" /> Start Over
                            </Button>
                            <Button size="sm" className="rounded-lg h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => onAcceptAll(questions)}>
                                <CheckCircle2 className="w-4 h-4" /> Accept & Save All
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="h-[55vh] rounded-xl border border-border bg-card p-4">
                        <div className="space-y-4">
                            {questions.map((q, idx) => (
                                <Card key={idx} className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors">
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <Badge variant="secondary" className="text-[10px] font-medium">
                                                        {q.questionType.replace("_", " ")}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground ml-2">
                                                        {q.points} pts{q.timeLimit ? ` • ${q.timeLimit}s` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-md hover:bg-muted"
                                                    disabled={regeneratingIndex === idx}
                                                    onClick={() => handleRegenerateOne(idx)}
                                                >
                                                    {regeneratingIndex === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted" onClick={() => setEditingIndex(idx)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-destructive/10 text-destructive" onClick={() => removeQuestion(idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium text-foreground leading-snug">{q.questionText}</p>

                                        {(q.questionType === "MULTIPLE_CHOICE" || q.questionType === "SCENARIO_BASED") && q.options?.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                                {q.options.map((opt: any, oi: number) => (
                                                    <div key={oi} className={`p-3 rounded-lg border flex items-center gap-2 ${opt.isCorrect ? "border-green-500/50 bg-green-500/5" : "border-border bg-muted/30"}`}>
                                                        <div className={`w-2 h-2 rounded-full shrink-0 ${opt.isCorrect ? "bg-green-600" : "bg-muted-foreground/40"}`} />
                                                        <span className={`text-xs ${opt.isCorrect ? "text-green-700 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>{opt.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Explanation</p>
                                            <p className="text-xs text-foreground/80 leading-relaxed">{q.explanation || "—"}</p>
                                        </div>

                                        {q.linkedIndicators?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {q.linkedIndicators.map((id, ii) => (
                                                    <Badge key={ii} variant="outline" className="text-[9px] border-border text-muted-foreground font-normal">
                                                        {indicators.find(ind => ind.id === id)?.text || "Linked Indicator"}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>

                    <QuestionEditDialog
                        open={editingIndex !== null}
                        onOpenChange={(open) => !open && setEditingIndex(null)}
                        question={editingIndex !== null ? questions[editingIndex] : null}
                        indicators={indicators}
                        onSave={handleSaveEdit}
                    />
                </div>
            )}
        </div>
    );
};
