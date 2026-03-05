"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface SurveyQuestion {
    id: string;
    questionText: string;
    questionType: string;
    options: any;
    isRequired: boolean;
    order: number;
}

interface Survey {
    id: string;
    name: string;
    description: string | null;
    questions: SurveyQuestion[];
}

export function SurveyPlayer({ id }: { id: string }) {
    const router = useRouter();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchSurvey() {
            try {
                const res = await fetch(`/api/surveys/${id}`);
                if (!res.ok) throw new Error("Failed to load survey");
                const data = await res.json();
                setSurvey(data);
            } catch {
                toast.error("Could not load survey");
            } finally {
                setLoading(false);
            }
        }
        fetchSurvey();
    }, [id]);

    const handleAnswer = (qid: string, val: string) => {
        setResponses(prev => ({ ...prev, [qid]: val }));
    };

    const handleSubmit = async () => {
        if (!survey) return;
        const required = survey.questions.filter(q => q.isRequired);
        const unanswered = required.filter(q => !responses[q.id]);
        if (unanswered.length > 0) {
            toast.error("Please answer all required questions");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/surveys/${id}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: responses }),
            });
            if (!res.ok) throw new Error("Submission failed");
            setIsSubmitted(true);
            toast.success("Thank you for your feedback!");
        } catch {
            toast.error("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center p-8">
                    <CardTitle>Survey Not Found</CardTitle>
                    <CardDescription className="mt-2">This survey is unavailable or has been removed.</CardDescription>
                    <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
                </Card>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center p-8 space-y-4">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">Feedback Received</CardTitle>
                    <CardDescription>
                        Your responses have been recorded. Thank you for your input.
                    </CardDescription>
                    <Button onClick={() => router.back()} className="w-full">
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    const progress = survey.questions.length > 0
        ? (Object.keys(responses).length / survey.questions.length) * 100
        : 0;

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
            <header className="space-y-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{survey.name}</h1>
                    {survey.description && <p className="text-slate-500">{survey.description}</p>}
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>Completion Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </header>

            <div className="space-y-6">
                {survey.questions.map((q, idx) => (
                    <Card key={q.id}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-medium">
                                <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                                {q.questionText}
                                {q.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(q.questionType === 'LIKERT' || q.questionType === 'RATING') && (
                                <RadioGroup
                                    onValueChange={(v) => handleAnswer(q.id, v)}
                                    value={responses[q.id]}
                                    className="flex flex-col md:flex-row justify-between gap-4 py-2"
                                >
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <div key={val} className="flex flex-col items-center gap-2">
                                            <RadioGroupItem value={val.toString()} id={`${q.id}-${val}`} className="h-6 w-6" />
                                            <Label htmlFor={`${q.id}-${val}`} className="text-[10px] font-bold uppercase text-muted-foreground">
                                                {val === 1 ? 'Strongly Disagree' : val === 5 ? 'Strongly Agree' : val}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                            {q.questionType === 'MULTIPLE_CHOICE' && Array.isArray(q.options) && (
                                <RadioGroup
                                    onValueChange={(v) => handleAnswer(q.id, v)}
                                    value={responses[q.id]}
                                    className="space-y-2"
                                >
                                    {(q.options as string[]).map((opt) => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                            <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                            {(q.questionType === 'TEXT' || q.questionType === 'OPEN_ENDED') && (
                                <Textarea
                                    className="resize-none min-h-[120px]"
                                    placeholder="Share your thoughts..."
                                    value={responses[q.id] || ""}
                                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                                />
                            )}
                            {q.questionType === 'YES_NO' && (
                                <RadioGroup
                                    onValueChange={(v) => handleAnswer(q.id, v)}
                                    value={responses[q.id]}
                                    className="flex gap-6"
                                >
                                    {["Yes", "No"].map((opt) => (
                                        <div key={opt} className="flex items-center space-x-2">
                                            <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                            <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <CardFooter className="px-0 pt-4 flex justify-end">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-12 h-14 text-lg font-bold shadow-lg bg-blue-600 hover:bg-blue-700"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Submit Survey
                </Button>
            </CardFooter>
        </div>
    );
}
