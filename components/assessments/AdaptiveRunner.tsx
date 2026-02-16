"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Brain } from "lucide-react";
import { toast } from "sonner";

interface AdaptiveRunnerProps {
    userComponentId: string;
    assessmentId: string;
    componentId: string;
    questionId: string;
    sectionName: string;
    onComplete: () => void;
}

interface AdaptiveQuestion {
    id: string;
    questionText: string;
    questionType: string;
    options?: { text: string; isCorrect?: boolean }[];
    difficulty?: number;
}

function parseOptions(opts: unknown): { text: string; isCorrect?: boolean }[] {
    if (Array.isArray(opts)) {
        return opts.map((o) =>
            typeof o === "object" && o && "text" in (o as object)
                ? { text: (o as { text: string }).text, isCorrect: (o as { isCorrect?: boolean }).isCorrect }
                : { text: String(o) }
        );
    }
    return [];
}

export function AdaptiveRunner({
    userComponentId,
    assessmentId,
    componentId,
    questionId,
    sectionName,
    onComplete,
}: AdaptiveRunnerProps) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/assessments/adaptive/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ assessmentId, componentId }),
                });
                if (cancelled) return;
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to start adaptive section");
                }
                const data = await res.json();
                setSessionId(data.sessionId);
                const q = data.firstQuestion;
                if (q) {
                    setCurrentQuestion({
                        id: q.id,
                        questionText: q.questionText,
                        questionType: q.questionType ?? "MULTIPLE_CHOICE",
                        options: parseOptions(q.options),
                        difficulty: q.difficulty,
                    });
                }
            } catch (e) {
                if (!cancelled) {
                    setError((e as Error).message);
                    toast.error("Could not start adaptive section");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [assessmentId, componentId]);

    const handleSubmit = async () => {
        if (!sessionId || !currentQuestion || selectedAnswer === null) {
            toast.error("Please select an answer");
            return;
        }
        setSubmitting(true);
        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
        try {
            const res = await fetch("/api/assessments/adaptive/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    questionId: currentQuestion.id,
                    answer: selectedAnswer,
                    timeTaken,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to submit answer");
            }
            const data = await res.json();

            if (data.shouldContinue && data.nextQuestion) {
                const q = data.nextQuestion;
                setCurrentQuestion({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType ?? "MULTIPLE_CHOICE",
                    options: parseOptions(q.options),
                    difficulty: q.difficulty,
                });
                setSelectedAnswer(null);
                startTimeRef.current = Date.now();
            } else {
                const completeRes = await fetch("/api/assessments/adaptive/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });
                if (!completeRes.ok) throw new Error("Failed to complete");
                const completeData = await completeRes.json();

                await fetch("/api/assessments/runner/response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userComponentId,
                        questionId,
                        responseData: {
                            type: "ADAPTIVE_INTERVIEW",
                            finalScore: completeData.finalScore,
                            abilityEstimate: completeData.abilityEstimate,
                            accuracy: completeData.accuracy,
                            questionsAsked: completeData.questionsAsked,
                            questionsCorrect: completeData.questionsCorrect,
                        },
                        maxPoints: 100,
                    }),
                });
                toast.success("Section completed");
                onComplete();
            }
        } catch (e) {
            toast.error((e as Error).message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
                <p className="text-muted-foreground">Starting adaptive section...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-red-600">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!currentQuestion) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">No question loaded.</p>
                </CardContent>
            </Card>
        );
    }

    const options = parseOptions(currentQuestion.options);

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        {sectionName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Answer the question below. Difficulty adapts to your performance.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg border">
                        <p className="font-medium text-gray-900 whitespace-pre-wrap">
                            {currentQuestion.questionText}
                        </p>
                    </div>

                    {options.length > 0 ? (
                        <RadioGroup
                            value={selectedAnswer ?? ""}
                            onValueChange={setSelectedAnswer}
                            className="space-y-3"
                            disabled={submitting}
                        >
                            {options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 cursor-pointer"
                                >
                                    <RadioGroupItem value={opt.text} id={`q-${currentQuestion.id}-${idx}`} />
                                    <Label
                                        htmlFor={`q-${currentQuestion.id}-${idx}`}
                                        className="flex-1 cursor-pointer font-normal"
                                    >
                                        {opt.text}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    ) : (
                        <p className="text-sm text-muted-foreground">No options – free response (not yet supported in runner).</p>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={submitting || (options.length > 0 && selectedAnswer === null)}
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {submitting ? "Submitting..." : "Submit & Next"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
