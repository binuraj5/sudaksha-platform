"use client";

import React, { useState } from "react";
import {
    Brain,
    Sparkles,
    ArrowRight,
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
import { QuestionType } from "@prisma/client";
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

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch(getAiGenerateUrl(componentId, modelId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    count,
                    difficulty,
                    questionTypes: selectedTypes,
                    additionalContext
                })
            });

            if (res.ok) {
                const data = await res.json();
                setQuestions(data.questions);
                setStep("preview");
                toast.success(`Generated ${data.questions.length} questions!`);
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to generate questions");
            }
        } catch (error) {
            toast.error("An error occurred during generation");
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerateOne = async (index: number) => {
        setRegeneratingIndex(index);
        try {
            const res = await fetch(getAiGenerateUrl(componentId, modelId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    count: 1,
                    difficulty,
                    questionTypes: [questions[index].questionType],
                    additionalContext: `This is a replacement for: ${questions[index].questionText}. ${additionalContext}`
                })
            });

            if (res.ok) {
                const data = await res.json();
                const newQuestions = [...questions];
                newQuestions[index] = data.questions[0];
                setQuestions(newQuestions);
                toast.success("Question regenerated!");
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
        <div className="max-w-4xl mx-auto py-8">
            {step === "config" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 mb-6">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">AI Question Generation</h1>
                        <p className="text-gray-500 font-medium max-w-lg mx-auto">
                            Leverage GPT-4 to create pedagogical questions based on your competency indicators and target level.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 p-10 space-y-8">
                            <div className="space-y-6">
                                <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                                    <BarChart3 className="w-4 h-4" /> Parameters
                                </Label>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label className="font-bold text-sm text-gray-700">Number of Questions</Label>
                                        <span className="text-xs font-black text-indigo-600">{count}</span>
                                    </div>
                                    <Input
                                        type="range"
                                        min="1"
                                        max="20"
                                        step="1"
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value))}
                                        className="accent-indigo-600"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="font-bold text-sm text-gray-700">Difficulty Level</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["EASY", "MEDIUM", "HARD"].map((lvl) => (
                                            <div
                                                key={lvl}
                                                onClick={() => setDifficulty(lvl as any)}
                                                className={`py-3 rounded-2xl border-2 text-center cursor-pointer transition-all ${difficulty === lvl
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                                                    : "bg-white border-slate-100 text-slate-400 font-bold hover:border-slate-200"
                                                    }`}
                                            >
                                                <span className="text-[10px] font-black">{lvl}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white ring-1 ring-gray-100 p-10 space-y-8">
                            <div className="space-y-6">
                                <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                                    <FileType className="w-4 h-4" /> Question Types
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
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
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${selectedTypes.includes(t.id as any)
                                                ? "border-indigo-500 bg-indigo-50/20"
                                                : "border-slate-50 hover:border-slate-100"
                                                }`}
                                        >
                                            <Checkbox checked={selectedTypes.includes(t.id as any)} />
                                            <span className="text-xs font-bold text-gray-700">{t.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                                    <Settings2 className="w-4 h-4" /> Additional Context
                                </Label>
                                <Textarea
                                    placeholder="e.g. Focus on Java 11 features, avoid obsolete APIs..."
                                    className="min-h-[100px] rounded-2xl border-2 border-slate-100 bg-slate-50/30"
                                    value={additionalContext}
                                    onChange={(e) => setAdditionalContext(e.target.value)}
                                />
                            </div>
                        </Card>
                    </div>

                    <div className="pt-6">
                        <Button
                            className="w-full h-18 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-2xl font-black italic shadow-2xl shadow-indigo-100 gap-4"
                            onClick={handleGenerate}
                            disabled={generating || selectedTypes.length === 0}
                        >
                            {generating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                            {generating ? "Crafting Questions..." : "Generate with AI"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">
                                <History className="w-4 h-4" /> AI Output Preview
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tight text-gray-900">Generated Questions</h2>
                            <p className="text-gray-500 font-medium">Review, edit, or regenerate before adding to assessment.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="rounded-2xl h-14 px-6 border-2 font-black italic" onClick={() => setStep("config")}>
                                <RefreshCcw className="w-5 h-5 mr-2" /> Start Over
                            </Button>
                            <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 font-black italic shadow-xl shadow-indigo-100 gap-3" onClick={() => onAcceptAll(questions)}>
                                <CheckCircle2 className="w-5 h-5" /> Accept & Save All
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="h-[60vh] rounded-[3rem] border-2 border-slate-100 bg-white shadow-2xl p-8">
                        <div className="space-y-6">
                            {questions.map((q, idx) => (
                                <Card key={idx} className="border-2 border-slate-100 rounded-3xl overflow-hidden group hover:border-indigo-200 transition-all">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase">
                                                        {q.questionType.replace("_", " ")}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-slate-400 ml-3">
                                                        {q.points} Points{q.timeLimit ? ` • ${q.timeLimit}s` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl hover:bg-indigo-50 text-indigo-500"
                                                    disabled={regeneratingIndex === idx}
                                                    onClick={() => handleRegenerateOne(idx)}
                                                >
                                                    {regeneratingIndex === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl hover:bg-indigo-50 text-indigo-500"
                                                    onClick={() => setEditingIndex(idx)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 text-red-400" onClick={() => removeQuestion(idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-lg font-bold text-gray-800 leading-tight">{q.questionText}</p>

                                        {(q.questionType === "MULTIPLE_CHOICE" || q.questionType === "SCENARIO_BASED") && q.options?.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                {q.options.map((opt: any, oi: number) => (
                                                    <div key={oi} className={`p-4 rounded-xl border-2 flex items-center gap-3 ${opt.isCorrect ? "border-green-500 bg-green-50/50" : "border-slate-50"}`}>
                                                        <div className={`w-2 h-2 rounded-full ${opt.isCorrect ? "bg-green-500" : "bg-slate-200"}`} />
                                                        <span className={`text-xs font-bold ${opt.isCorrect ? "text-green-700" : "text-slate-600"}`}>{opt.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="p-4 bg-slate-50/50 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Explanation</p>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">{q.explanation || "—"}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {q.linkedIndicators.map((id, ii) => (
                                                <Badge key={ii} variant="outline" className="text-[9px] border-slate-200 text-slate-400">
                                                    {indicators.find(ind => ind.id === id)?.text || "Linked Indicator"}
                                                </Badge>
                                            ))}
                                        </div>
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
