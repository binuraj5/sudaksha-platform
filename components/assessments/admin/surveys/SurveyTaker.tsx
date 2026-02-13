
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Send, ArrowRight, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const SurveyTaker: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);

    // Mock Survey Data
    const survey = {
        title: "Q1 Employee Pulse Survey",
        description: "Your feedback is vital to help us improve our workplace culture.",
        isAnonymous: true,
        questions: [
            { id: 'q1', text: "How satisfied are you with the current remote work policy?", type: 'RATING' },
            { id: 'q2', text: "What is the one thing we could do better as a team?", type: 'LONG_TEXT' },
            { id: 'q3', text: "Do you feel your growth is supported?", type: 'MULTIPLE_CHOICE', options: ['Completely', 'Mostly', 'Somewhat', 'Not at all'] },
        ]
    };

    const progress = ((currentStep + 1) / survey.questions.length) * 100;

    const handleAnswer = (questionId: string, value: any) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const nextStep = () => {
        if (currentStep < survey.questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        console.log("Submitting Answers:", answers);
        setSubmitted(true);
        toast.success("Thank you for your feedback!");
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
                <div className="bg-green-100 text-green-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Send className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Feedback Submitted</h1>
                <p className="text-gray-500 max-w-md mx-auto">
                    Your responses have been recorded {survey.isAnonymous ? 'anonymously' : ''}. We appreciate your time and honesty.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>Back to Dashboard</Button>
            </div>
        );
    }

    const currentQuestion = survey.questions[currentStep];

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
                    <span className="text-sm font-medium text-gray-500">Question {currentStep + 1} of {survey.questions.length}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <Card className="min-h-[400px] flex flex-col">
                <CardHeader>
                    <CardTitle className="leading-relaxed">{currentQuestion.text}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    {currentQuestion.type === 'RATING' && (
                        <div className="flex justify-center gap-4 py-10">
                            {[1, 2, 3, 4, 5].map(val => (
                                <button
                                    key={val}
                                    className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${answers[currentQuestion.id] === val
                                            ? 'bg-blue-600 text-white border-blue-600 scale-110'
                                            : 'border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-500'
                                        }`}
                                    onClick={() => handleAnswer(currentQuestion.id, val)}
                                >
                                    <span className="text-xl font-bold">{val}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'LONG_TEXT' && (
                        <Textarea
                            className="h-40 text-lg"
                            placeholder="Type your response here..."
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        />
                    )}

                    {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                        <RadioGroup
                            value={answers[currentQuestion.id]}
                            onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
                            className="space-y-3"
                        >
                            {currentQuestion.options?.map(opt => (
                                <div key={opt} className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <RadioGroupItem value={opt} id={opt} />
                                    <Label htmlFor={opt} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                </CardContent>
                <div className="p-6 border-t flex justify-between">
                    <Button variant="ghost" disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                        onClick={nextStep}
                        disabled={!answers[currentQuestion.id]}
                    >
                        {currentStep === survey.questions.length - 1 ? 'Finish' : 'Next'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
};
