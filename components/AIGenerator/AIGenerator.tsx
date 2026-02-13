"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wand2, Loader2, Check, RefreshCw, Plus, Edit2, Trash2, ArrowRight } from "lucide-react";

export function AIGenerator() {
    const [isLoading, setIsLoading] = useState(false);
    const [params, setParams] = useState({
        topic: "",
        difficulty: "Intermediate",
        type: "MCQ",
        count: 3
    });
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

    const handleGenerate = async () => {
        if (!params.topic) {
            toast.error("Please enter a topic");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/questions/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });

            const data = await response.json();
            if (data.success) {
                setGeneratedQuestions(data.questions);
                toast.success(`Generated ${data.questions.length} questions`);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to generate");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-purple-600" />
                        AI Question Generator
                    </CardTitle>
                    <CardDescription>
                        Instantly create high-quality assessment content based on topics or documentation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                        <Label>Topic or Skill</Label>
                        <Input
                            placeholder="e.g. Advanced Next.js Server Actions"
                            value={params.topic}
                            onChange={(e) => setParams({ ...params, topic: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={params.type} onValueChange={(v) => setParams({ ...params, type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MCQ">Multiple Choice</SelectItem>
                                <SelectItem value="BOOLEAN">True/False</SelectItem>
                                <SelectItem value="TEXT">Short Answer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={params.difficulty} onValueChange={(v) => setParams({ ...params, difficulty: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="justify-between border-t p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                        Powered by Google Gemini 1.5 Pro
                    </div>
                    <Button onClick={handleGenerate} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><RefreshCw className="mr-2 h-4 w-4" /> Generate Questions</>}
                    </Button>
                </CardFooter>
            </Card>

            {generatedQuestions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Review & Selection</h3>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Import All
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {generatedQuestions.map((q, idx) => (
                            <Card key={idx} className="group relative border-l-4 border-l-purple-500">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary">{q.type}</Badge>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{q.text}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {q.options && (
                                        <ul className="space-y-2 mt-4">
                                            {q.options.map((opt: string, oi: number) => (
                                                <li key={oi} className={`text-sm p-3 rounded-md border flex items-center justify-between ${opt === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50'}`}>
                                                    {opt}
                                                    {opt === q.correctAnswer && <Check className="h-4 w-4" />}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {q.explanation && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                                            <strong>Explanation:</strong> {q.explanation}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0 justify-end">
                                    <Button variant="ghost" size="sm">
                                        Keep Question <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
