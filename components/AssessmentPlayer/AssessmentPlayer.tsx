"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

// Mock Interfaces and Data
interface Question {
    id: string;
    text: string;
    type: "MCQ" | "BOOLEAN" | "TEXT" | "CODE";
    options?: string[];
    codeSnippet?: string;
}

interface Assessment {
    id: string;
    title: string;
    durationMinutes: number;
    questions: Question[];
}

const MOCK_ASSESSMENT: Assessment = {
    id: "assess-1",
    title: "React & TypeScript Fundamentals",
    durationMinutes: 45,
    questions: [
        {
            id: "q1",
            text: "What is the return type of React.FC?",
            type: "MCQ",
            options: ["HTMLElement", "ReactNode", "void", "string"]
        },
        {
            id: "q2",
            text: "Does the `useEffect` hook run after every render by default?",
            type: "BOOLEAN",
        },
        {
            id: "q3",
            text: "Explain the concept of 'Lifting State Up' in React.",
            type: "TEXT",
        },
        {
            id: "q4",
            text: "Which hook would you use to memorize a complex calculation?",
            type: "MCQ",
            options: ["useCallback", "useMemo", "useRef", "useContext"]
        }
    ]
};

export function AssessmentPlayer({ assessmentId }: { assessmentId: string }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(MOCK_ASSESSMENT.durationMinutes * 60);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const currentQuestion = MOCK_ASSESSMENT.questions[currentQuestionIndex];
    const progress = ((Object.keys(answers).length) / MOCK_ASSESSMENT.questions.length) * 100;

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Assessment submitted successfully!");
        router.push(`/assessments/results/${assessmentId}`); // Redirect to results
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{MOCK_ASSESSMENT.title}</h1>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">ID: {assessmentId}</span>
                        <span>•</span>
                        <span>{MOCK_ASSESSMENT.questions.length} Questions</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Time Remaining</span>
                        <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                            <Clock className="h-5 w-5" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                    <Button variant={Object.keys(answers).length === MOCK_ASSESSMENT.questions.length ? "default" : "secondary"} onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Finish Assessment"}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container max-w-5xl mx-auto p-8 grid grid-cols-12 gap-8">

                {/* Question Area */}
                <div className="col-span-12 md:col-span-9 space-y-6">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            Question {currentQuestionIndex + 1} of {MOCK_ASSESSMENT.questions.length}
                        </Badge>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{currentQuestion.type}</span>
                    </div>

                    <Card className="min-h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl leading-relaxed">
                                {currentQuestion.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pt-6">
                            {currentQuestion.type === "MCQ" && currentQuestion.options && (
                                <RadioGroup
                                    value={answers[currentQuestion.id] || ""}
                                    onValueChange={handleAnswer}
                                    className="space-y-4"
                                >
                                    {currentQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer">
                                            <RadioGroupItem value={opt} id={`opt-${idx}`} />
                                            <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-normal text-base">{opt}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {currentQuestion.type === "BOOLEAN" && (
                                <RadioGroup
                                    value={answers[currentQuestion.id] || ""}
                                    onValueChange={handleAnswer}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer">
                                        <RadioGroupItem value="true" id="true" />
                                        <Label htmlFor="true" className="flex-1 cursor-pointer font-normal text-base">True</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer">
                                        <RadioGroupItem value="false" id="false" />
                                        <Label htmlFor="false" className="flex-1 cursor-pointer font-normal text-base">False</Label>
                                    </div>
                                </RadioGroup>
                            )}

                            {currentQuestion.type === "TEXT" && (
                                <Textarea
                                    placeholder="Type your answer here..."
                                    className="min-h-[200px] text-base resize-none"
                                    value={answers[currentQuestion.id] || ""}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                />
                            )}
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t p-4 flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(MOCK_ASSESSMENT.questions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === MOCK_ASSESSMENT.questions.length - 1}
                            >
                                Next Question
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Sidebar Navigation */}
                <div className="col-span-12 md:col-span-3 space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>Completed</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                                {MOCK_ASSESSMENT.questions.map((q, idx) => {
                                    const isAnswered = !!answers[q.id];
                                    const isCurrent = currentQuestionIndex === idx;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                            className={`
                                                aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-all
                                                ${isCurrent ? 'ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground' :
                                                    isAnswered ? 'bg-primary/20 text-primary hover:bg-primary/30' :
                                                        'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                                            `}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 text-xs text-muted-foreground pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary text-primary-foreground rounded-sm" /> Current
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-primary/20 rounded-sm" /> Answered
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-100 rounded-sm" /> Not Visited
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-yellow-800 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>Do not refresh the page or switch tabs. Your progress is auto-saved.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
