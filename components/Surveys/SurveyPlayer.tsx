"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface Survey {
    id: string;
    title: string;
    description: string;
    questions: any[];
}

const MOCK_SURVEY: Survey = {
    id: "sur-1",
    title: "Quarterly Team Engagement",
    description: "Help us understand your experience working with the team over the last 3 months.",
    questions: [
        {
            id: "sq1",
            type: "LIKERT",
            text: "I feel supported by my immediate manager."
        },
        {
            id: "sq2",
            type: "LIKERT",
            text: "I have the tools and resources I need to do my job well."
        },
        {
            id: "sq3",
            type: "LIKERT",
            text: "Our team communication is effective."
        },
        {
            id: "sq4",
            type: "TEXT",
            text: "What is one thing we could do better as a team?"
        }
    ]
};

export function SurveyPlayer({ id }: { id: string }) {
    const router = useRouter();
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleLikert = (qid: string, val: string) => {
        setResponses({ ...responses, [qid]: val });
    };

    const handleSubmit = () => {
        if (Object.keys(responses).length < MOCK_SURVEY.questions.length) {
            toast.error("Please answer all questions");
            return;
        }
        setIsSubmitted(true);
        toast.success("Thank you for your feedback!");
    };

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
                        Your responses have been recorded anonymously. Your input helps us build a better workplace.
                    </CardDescription>
                    <Button onClick={() => router.push('/assessments/dashboard')} className="w-full">
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    const progress = (Object.keys(responses).length / MOCK_SURVEY.questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
            <header className="space-y-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{MOCK_SURVEY.title}</h1>
                    <p className="text-slate-500">{MOCK_SURVEY.description}</p>
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
                {MOCK_SURVEY.questions.map((q, idx) => (
                    <Card key={q.id}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-medium">
                                <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                                {q.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {q.type === 'LIKERT' && (
                                <RadioGroup
                                    onValueChange={(v) => handleLikert(q.id, v)}
                                    className="flex flex-col md:flex-row justify-between gap-4 py-2"
                                >
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <div key={val} className="flex flex-col items-center gap-2">
                                            <RadioGroupItem value={val.toString()} id={`${q.id}-${val}`} className="h-6 w-6" />
                                            <Label htmlFor={`${q.id}-${val}`} className="text-[10px] font-bold uppercase text-muted-foreground">
                                                {val === 1 ? 'Disagree' : val === 5 ? 'Agree' : val}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                            {q.type === 'TEXT' && (
                                <Textarea
                                    className="resize-none min-h-[120px]"
                                    placeholder="Share your thoughts..."
                                    onChange={(e) => handleLikert(q.id, e.target.value)}
                                />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <CardFooter className="px-0 pt-4 flex justify-end">
                <Button size="lg" onClick={handleSubmit} className="px-12 h-14 text-lg font-bold shadow-lg bg-blue-600 hover:bg-blue-700">
                    Submit Survey
                </Button>
            </CardFooter>
        </div>
    );
}
