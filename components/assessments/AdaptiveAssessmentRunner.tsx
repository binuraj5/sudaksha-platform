"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdaptiveConfig {
    min_questions?: number;
    max_questions?: number;
    starting_difficulty?: number;
    allowed_question_types?: string[];
}

interface AdaptiveAssessmentRunnerProps {
    assessmentId: string;
    componentId: string;
    adaptiveConfig: AdaptiveConfig;
    sectionName: string;
    onComplete: () => void;
}

interface AdaptiveQuestion {
    id: string;
    questionText: string;
    questionType: string;
    options: { key: string; text: string; isCorrect?: boolean }[];
    difficulty?: number;
}

export function AdaptiveAssessmentRunner({
    assessmentId,
    componentId,
    adaptiveConfig,
    sectionName,
    onComplete,
}: AdaptiveAssessmentRunnerProps) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState<number>(Date.now());

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
                    throw new Error(data.error || "Failed to start");
                }
                const data = await res.json();
                setSessionId(data.sessionId);
                setCurrentQuestion(data.firstQuestion);
                setStartTime(Date.now());
            } catch (e) {
                if (!cancelled) toast.error((e as Error).message || "Failed to start adaptive assessment");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [assessmentId, componentId]);

    const submitAnswer = async () => {
        if (!selectedAnswer || !sessionId || !currentQuestion) return;
        setIsSubmitting(true);
        try {
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
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
                throw new Error(data.error || "Failed to submit");
            }
            const data = await res.json();

            if (data.shouldContinue && data.nextQuestion) {
                setCurrentQuestion(data.nextQuestion);
                setSelectedAnswer(null);
                setStartTime(Date.now());
            } else {
                await fetch("/api/assessments/adaptive/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });
                toast.success("Adaptive section completed!");
                onComplete();
            }
        } catch (e) {
            toast.error((e as Error).message || "Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-navy-600 mb-4" />
                <p className="text-muted-foreground">Starting adaptive assessment...</p>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">No question available.</p>
                    <Button variant="outline" className="mt-4" onClick={onComplete}>
                        Continue
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const options = currentQuestion.options ?? [];
    const minQ = adaptiveConfig.min_questions ?? 8;
    const maxQ = adaptiveConfig.max_questions ?? 15;

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{sectionName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Adaptive assessment • {minQ}-{maxQ} questions
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="font-medium text-gray-900 whitespace-pre-wrap">
                            {currentQuestion.questionText}
                        </p>
                    </div>

                    <RadioGroup
                        value={selectedAnswer ?? ""}
                        onValueChange={setSelectedAnswer}
                        className="space-y-3"
                    >
                        {options.map((opt) => (
                            <div
                                key={opt.key}
                                className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 cursor-pointer"
                            >
                                <RadioGroupItem value={opt.text} id={`opt-${opt.key}`} />
                                <Label htmlFor={`opt-${opt.key}`} className="flex-1 cursor-pointer font-normal">
                                    {opt.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={submitAnswer}
                        disabled={!selectedAnswer || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            "Submit & Next"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
