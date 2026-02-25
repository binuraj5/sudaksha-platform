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
    /** memberAssessmentId or projectUserAssessmentId — passed as assessmentId from runner */
    assessmentId: string;
    componentId: string;
    questionId: string;
    sectionName: string;
    onComplete: () => void;
    /** Optional: competencyId — read from component config at start time */
    competencyId?: string;
    /** Optional: targetLevel — read from component config at start time */
    targetLevel?: string;
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
    competencyId,
    targetLevel,
}: AdaptiveRunnerProps) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questionCount, setQuestionCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                // The adaptive/start API expects: memberAssessmentId, componentId
                // It resolves competency from the component's config/relation
                const res = await fetch("/api/assessments/adaptive/start", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        memberAssessmentId: assessmentId,
                        componentId,
                        competencyId: competencyId ?? "",
                        targetLevel: targetLevel ?? "JUNIOR",
                    }),
                });
                if (cancelled) return;
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || "Failed to start adaptive section");
                }
                const data = await res.json();
                // API returns { session, question } OR { sessionId, firstQuestion } for compatibility
                const session = data.session ?? data;
                const q = data.question ?? data.firstQuestion;
                setSessionId(session?.id ?? data.sessionId ?? null);
                if (q) {
                    setCurrentQuestion({
                        id: q.id,
                        questionText: q.questionText,
                        questionType: q.questionType ?? "MULTIPLE_CHOICE",
                        options: parseOptions(q.options),
                        difficulty: typeof q.difficulty === "number" ? q.difficulty : Number(q.difficulty ?? 5),
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
    }, [assessmentId, componentId, competencyId, targetLevel]);

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

            const isCorrect = data.isCorrect;
            setQuestionCount((n) => n + 1);
            if (isCorrect) setCorrectCount((n) => n + 1);

            // API returns: { completed: bool, session, question, isCorrect }
            // OR for completion: { completed: true, sessionId }
            const isCompleted = data.completed === true;
            const nextQuestion = data.question ?? data.nextQuestion ?? null;

            if (!isCompleted && nextQuestion) {
                // Continue with next question
                const q = nextQuestion;
                setCurrentQuestion({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType ?? "MULTIPLE_CHOICE",
                    options: parseOptions(q.options),
                    difficulty: typeof q.difficulty === "number" ? q.difficulty : Number(q.difficulty ?? 5),
                });
                setSelectedAnswer(null);
                startTimeRef.current = Date.now();
            } else {
                // Session complete — fetch final scores then save response
                let finalScore = 0;
                let abilityEstimate = 0;
                let accuracy = 0;
                let questionsAsked = 0;
                let questionsCorrect = 0;

                try {
                    const completeRes = await fetch("/api/assessments/adaptive/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId }),
                    });
                    if (completeRes.ok) {
                        const completeData = await completeRes.json();
                        // API returns { success, session, metrics: { percentage, questionsAsked, correctAnswers, finalAbility } }
                        const m = completeData.metrics ?? completeData;
                        finalScore = m.percentage ?? m.finalScore ?? 0;
                        abilityEstimate = m.finalAbility ?? m.abilityEstimate ?? 0;
                        questionsAsked = m.questionsAsked ?? questionCount + 1;
                        questionsCorrect = m.correctAnswers ?? m.questionsCorrect ?? correctCount + (isCorrect ? 1 : 0);
                        accuracy = questionsAsked > 0 ? questionsCorrect / questionsAsked : 0;
                    }
                } catch {
                    // Use local counts if complete API fails
                    questionsAsked = questionCount + 1;
                    questionsCorrect = correctCount + (isCorrect ? 1 : 0);
                    accuracy = questionsAsked > 0 ? questionsCorrect / questionsAsked : 0;
                    finalScore = Math.round(accuracy * 100);
                }

                await fetch("/api/assessments/runner/response", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userComponentId,
                        questionId,
                        responseData: {
                            type: "ADAPTIVE_INTERVIEW",
                            finalScore,
                            abilityEstimate,
                            accuracy,
                            questionsAsked,
                            questionsCorrect,
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
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    <Brain className="h-4 w-4 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-muted-foreground font-medium">Calibrating adaptive engine...</p>
                <p className="text-xs text-muted-foreground">Generating your first question based on your profile</p>
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

    const difficultyPct = ((currentQuestion.difficulty ?? 5) / 10) * 100;
    const difficultyLabel =
        (currentQuestion.difficulty ?? 5) <= 3 ? "Foundational" :
            (currentQuestion.difficulty ?? 5) <= 6 ? "Intermediate" :
                (currentQuestion.difficulty ?? 5) <= 8 ? "Advanced" : "Expert";
    const difficultyColor =
        (currentQuestion.difficulty ?? 5) <= 3 ? "bg-green-500" :
            (currentQuestion.difficulty ?? 5) <= 6 ? "bg-yellow-500" :
                (currentQuestion.difficulty ?? 5) <= 8 ? "bg-orange-500" : "bg-red-500";

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            {/* Progress + Difficulty header */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">
                        {questionCount > 0 ? `${correctCount}/${questionCount} correct` : "Adaptive Assessment"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Difficulty:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${difficultyColor}`} style={{ width: `${difficultyPct}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${(currentQuestion.difficulty ?? 5) <= 3 ? 'text-green-600' :
                            (currentQuestion.difficulty ?? 5) <= 6 ? 'text-yellow-600' :
                                (currentQuestion.difficulty ?? 5) <= 8 ? 'text-orange-600' : 'text-red-600'
                            }`}>{difficultyLabel}</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        {sectionName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Your answer difficulty adjusts in real-time based on your performance.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">Question</p>
                        <p className="font-semibold text-gray-900 leading-relaxed whitespace-pre-wrap">
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
