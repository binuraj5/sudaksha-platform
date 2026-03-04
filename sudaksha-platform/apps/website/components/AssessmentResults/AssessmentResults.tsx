"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, FileText, ArrowRight, RotateCcw } from "lucide-react";
import { useRouter } from 'next/navigation';

interface ResultData {
    id: string;
    assessmentTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: string;
    status: "PASS" | "FAIL" | "PENDING";
    feedback: string;
    breakdown: {
        category: string;
        score: number;
        max: number;
    }[];
}

const MOCK_RESULT: ResultData = {
    id: "res-123",
    assessmentTitle: "React & TypeScript Fundamentals",
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    timeTaken: "28:45",
    status: "PASS",
    feedback: "Excellent work! You have shown strong proficiency in React hooks and TypeScript integration. Focus slightly more on advanced performance patterns.",
    breakdown: [
        { category: "React Hooks", score: 8, max: 10 },
        { category: "TypeScript Basics", score: 5, max: 5 },
        { category: "State Management", score: 4, max: 5 },
    ]
};

export function AssessmentResults({ attemptId }: { attemptId: string }) {
    const router = useRouter();
    const result = MOCK_RESULT; // In real app, fetch by attemptId

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Result Header Card */}
                <Card className="overflow-hidden border-t-8 border-t-green-500 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            {result.status === "PASS" ? (
                                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                                    <XCircle className="h-10 w-10" />
                                </div>
                            )}
                        </div>
                        <CardTitle className="text-3xl font-bold">Assessment Complete!</CardTitle>
                        <CardDescription className="text-lg mt-2">
                            {result.assessmentTitle}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-6 pb-8">
                        <div className="inline-flex flex-col items-center">
                            <span className="text-5xl font-extrabold text-slate-900">{result.score}%</span>
                            <Badge variant={result.status === "PASS" ? "default" : "destructive"} className="mt-2 px-4 py-1 text-sm uppercase tracking-widest">
                                {result.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-y py-6">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Correct</p>
                                <p className="text-xl font-bold">{result.correctAnswers}/{result.totalQuestions}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Time Taken</p>
                                <p className="text-xl font-bold">{result.timeTaken}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Percentile</p>
                                <p className="text-xl font-bold">Top 12%</p>
                            </div>
                        </div>

                        <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                                <AlertCircle className="h-4 w-4 text-primary" /> Feedback
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {result.feedback}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {result.breakdown.map((item, idx) => {
                            const percent = (item.score / item.max) * 100;
                            return (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{item.category}</span>
                                        <span className="text-muted-foreground">{item.score}/{item.max} ({Math.round(percent)}%)</span>
                                    </div>
                                    <Progress value={percent} className="h-2" />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
                    <Button variant="outline" onClick={() => router.push('/assessments/dashboard')}>
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Dashboard
                    </Button>
                    <div className="flex gap-4">
                        <Button variant="ghost">
                            <FileText className="mr-2 h-4 w-4" /> Download Report
                        </Button>
                        <Button onClick={() => router.push(`/assessments/take/${result.id}`)}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Retake Plan (if allowed)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
