"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BrainCircuit, CheckCircle2, Target, ArrowRight, XCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function AdaptiveAssessment({
    memberAssessmentId,
    componentId,
    competencyId,
    targetLevel,
    onComplete
}: {
    memberAssessmentId: string,
    componentId: string,
    competencyId: string,
    targetLevel: string,
    onComplete?: (metrics: any) => void
}) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [session, setSession] = useState<any>(null);
    const [question, setQuestion] = useState<any>(null);

    // UI State
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [feedback, setFeedback] = useState<{ isCorrect: boolean, explanation: string } | null>(null);
    const [completedMetrics, setCompletedMetrics] = useState<any>(null);

    useEffect(() => {
        startSession();
    }, []);

    const startSession = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/assessments/adaptive/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberAssessmentId, componentId, competencyId, targetLevel })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSession(data.session);
            setQuestion(data.question);
        } catch (e: any) {
            toast.error(e.message || "Failed to start assessment");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async () => {
        if (!selectedOption) return toast.info("Please select an answer.");

        setSubmitting(true);
        try {
            const res = await fetch("/api/assessments/adaptive/answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: session.id,
                    questionId: question.id,
                    answer: selectedOption
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setFeedback({
                isCorrect: data.isCorrect,
                explanation: question.explanation || "No explanation provided."
            });

            if (data.completed) {
                await completeSession(session.id);
            } else {
                setSession(data.session);
                // Pre-fetch the next question which was generated synchronously
                setTimeout(() => {
                    setQuestion(data.question);
                    setSelectedOption("");
                    setFeedback(null);
                }, 2500); // give time to read explanation
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to submit answer");
        } finally {
            setSubmitting(false);
        }
    };

    const completeSession = async (sessionId: string) => {
        setLoading(true); // lock screen for final calculations
        try {
            const res = await fetch("/api/assessments/adaptive/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setCompletedMetrics(data.metrics);
            if (onComplete) onComplete(data.metrics);
        } catch (e: any) {
            toast.error(e.message || "Failed to complete assessment");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !session && !completedMetrics) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <BrainCircuit className="w-12 h-12 text-indigo-500 animate-pulse" />
                <div>
                    <h3 className="text-lg font-semibold">Initializing AI Assessor</h3>
                    <p className="text-sm text-muted-foreground">Generating an intelligent path tailored to {targetLevel} level...</p>
                </div>
            </div>
        );
    }

    if (completedMetrics) {
        return (
            <Card className="max-w-xl mx-auto border-indigo-100 shadow-sm mt-8">
                <CardHeader className="bg-indigo-50/50 pb-6 border-b border-indigo-100 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl">Assessment Completed</CardTitle>
                    <CardDescription>The intelligent evaluator has concluded your profile mapping.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                    <div className="flex justify-between items-center p-4 border rounded-lg bg-gray-50/50">
                        <span className="font-semibold text-gray-700">Final Weighted Score</span>
                        <span className="text-2xl font-black text-indigo-600">{completedMetrics.percentage}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Questions</p>
                            <p className="text-xl font-bold mt-1">{completedMetrics.questionsAsked}</p>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                            <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Final Ability</p>
                            <p className="text-xl font-bold mt-1">{Number(completedMetrics.finalAbility).toFixed(1)} <span className="text-sm text-muted-foreground font-normal">/ 10</span></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!question) return null;

    const progressPercentage = Math.min(100, Math.max(0, (session.questionsAsked / 15) * 100));

    return (
        <Card className="max-w-3xl mx-auto shadow-sm mt-8 relative overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 absolute top-0 left-0"></div>

            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 text-indigo-600 bg-indigo-50 border-indigo-200">
                            Question {session.questionsAsked + 1}
                        </Badge>
                        <CardTitle className="text-lg leading-relaxed">{question.questionText}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 min-w-max">
                        <Target className="w-3 h-3" /> Diff: {Number(question.difficulty).toFixed(1)} / 10
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption} disabled={!!feedback || submitting}>
                    <div className="space-y-3 pt-2">
                        {question.options?.map((opt: any) => {
                            let itemStateClasses = "border-gray-200 hover:border-indigo-300";
                            if (selectedOption === opt.id) itemStateClasses = "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500";

                            // Visual feedback mode after submission
                            if (feedback) {
                                if (opt.id === question.correctAnswer) {
                                    itemStateClasses = "border-emerald-500 bg-emerald-50 stroke-emerald-600";
                                } else if (opt.id === selectedOption && !feedback.isCorrect) {
                                    itemStateClasses = "border-red-400 bg-red-50 text-red-900";
                                } else {
                                    itemStateClasses = "border-gray-200 opacity-50";
                                }
                            }

                            return (
                                <Label
                                    key={opt.id}
                                    htmlFor={`opt-${opt.id}`}
                                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${itemStateClasses}`}
                                >
                                    <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} className="mt-0.5" />
                                    <span className="leading-snug text-gray-700 font-normal">{opt.text}</span>

                                    {feedback && opt.id === question.correctAnswer && (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                                    )}
                                    {feedback && opt.id === selectedOption && !feedback.isCorrect && (
                                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                                    )}
                                </Label>
                            );
                        })}
                    </div>
                </RadioGroup>

                {feedback && (
                    <div className={`p-4 rounded-lg mt-6 text-sm ${feedback.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                        <p className="font-semibold mb-1">{feedback.isCorrect ? "Correct!" : "Incorrect."}</p>
                        <p>{feedback.explanation}</p>
                        <div className="mt-3 flex items-center text-xs opacity-75 gap-2 font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Calibrating Intelligence & AI synthesizing next state...
                        </div>
                    </div>
                )}

                {!feedback && (
                    <div className="flex items-center justify-between pt-4 mt-6 border-t">
                        <div className="flex-1 mr-8">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium px-1">
                                <span>Minimum Matrix Curve</span>
                                <span>Max Bound Curve</span>
                            </div>
                            <Progress value={progressPercentage} className="h-1.5" />
                        </div>
                        <Button
                            onClick={handleAnswer}
                            disabled={!selectedOption || submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Submit Answer <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
