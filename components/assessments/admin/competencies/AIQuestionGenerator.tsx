
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Check, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AIQuestionPreviewProps {
    competency: string;
    level: string;
    indicators: string[];
    onAccept: (questions: any[]) => void;
}

export const AIQuestionGenerator: React.FC<AIQuestionPreviewProps> = ({
    competency,
    level,
    indicators,
    onAccept
}) => {
    const [generating, setGenerating] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);

    const handleGenerate = async () => {
        if (!competency || indicators.length === 0) {
            toast.error("Please provide competency details and indicators first");
            return;
        }

        setGenerating(true);
        try {
            // Mock API call to AI service
            console.log("Generating questions for:", { competency, level, indicators });

            // Simulating AI response delay
            await new Promise(r => setTimeout(r, 2000));

            setQuestions([
                {
                    questionText: `Describe a situation where you successfully demonstrated ${competency} at the ${level} level.`,
                    questionType: 'SCENARIO_BASED',
                    evaluationCriteria: ['Self-awareness', 'Outcome orientation']
                },
                {
                    questionText: `Which of the following is most critical for ${competency}?`,
                    questionType: 'MULTIPLE_CHOICE',
                    options: ['Option A', 'Option B', 'Option C'],
                    correctAnswer: 'Option A'
                }
            ]);
            toast.success("AI generated questions successfully");
        } catch (error) {
            toast.error("AI generation failed");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        AI Question Generation
                    </CardTitle>
                    <CardDescription>Generate questions tailored to indicators.</CardDescription>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {generating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {questions.length > 0 ? 'Regenerate' : 'Generate Questions'}
                </Button>
            </CardHeader>
            <CardContent>
                {questions.length > 0 ? (
                    <div className="space-y-4">
                        {questions.map((q, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm relative group">
                                <Badge variant="outline" className="mb-2">{q.questionType}</Badge>
                                <p className="text-gray-900 font-medium">{q.questionText}</p>
                                {q.options && (
                                    <ul className="mt-2 space-y-1 ml-4 list-disc text-sm text-gray-600">
                                        {q.options.map((opt: string, idx: number) => (
                                            <li key={idx}>{opt}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 mt-4"
                            onClick={() => onAccept(questions)}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Accept & Add All Questions
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 italic">
                        {generating ? 'AI is thinking... crafting relevant questions...' : 'No questions generated yet.'}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
