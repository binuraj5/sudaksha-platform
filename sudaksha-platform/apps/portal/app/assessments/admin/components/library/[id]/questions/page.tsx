"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Box, Plus, Trash2, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type LibraryQuestion = {
    questionText?: string;
    questionType?: string;
    options?: unknown[];
    correctAnswer?: string | null;
    points?: number;
    timeLimit?: number | null;
};

export default function LibraryQuestionsPage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const [questions, setQuestions] = useState<LibraryQuestion[]>([]);

    const { data: component, isLoading } = useQuery({
        queryKey: ["library-component", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/assessments/library/${params.id}`);
            if (!res.ok) throw new Error("Failed to fetch component");
            return res.json();
        },
        enabled: !!params.id
    });

    useEffect(() => {
        if (component?.questions) {
            setQuestions(Array.isArray(component.questions) ? [...component.questions] : []);
        }
    }, [component]);

    const updateMutation = useMutation({
        mutationFn: async (updated: LibraryQuestion[]) => {
            const res = await fetch(`/api/assessments/library/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions: updated })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["library-component", params.id] });
            queryClient.invalidateQueries({ queryKey: ["component-library"] });
        }
    });

    const addQuestion = () => {
        setQuestions([...questions, { questionText: "New question", questionType: "MCQ", options: [], points: 1 }]);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx: number, field: keyof LibraryQuestion, value: unknown) => {
        const next = [...questions];
        next[idx] = { ...next[idx], [field]: value };
        setQuestions(next);
    };

    const saveQuestions = () => {
        updateMutation.mutate(questions);
    };

    if (isLoading || !component) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/assessments/admin/components" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Questions</h1>
                        <p className="text-sm text-gray-500">{component.name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={addQuestion} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                    </Button>
                    <Button onClick={saveQuestions} disabled={updateMutation.isPending} className="bg-red-600 hover:bg-red-700">
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
                {questions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Box className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No questions yet. Add your first question.</p>
                        <Button onClick={addQuestion} variant="outline" className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    </div>
                ) : (
                    questions.map((q, idx) => (
                        <div key={idx} className="p-4 flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={q.questionText ?? ""}
                                    onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
                                    placeholder="Question text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Type: {q.questionType ?? "—"} | Points: {q.points ?? 1}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(idx)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
