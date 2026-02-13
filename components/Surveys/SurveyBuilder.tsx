"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, GripVertical, Settings2, Save, Eye } from "lucide-react";
import { toast } from "sonner";

interface SurveyQuestion {
    id: string;
    type: "LIKERT" | "RATING" | "TEXT";
    text: string;
    description?: string;
    required: boolean;
}

export function SurveyBuilder() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);

    const addQuestion = (type: SurveyQuestion["type"]) => {
        const newQuestion: SurveyQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            text: "",
            required: true
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const handleSave = () => {
        if (!title) {
            toast.error("Please enter a survey title");
            return;
        }
        if (questions.length === 0) {
            toast.error("Please add at least one question");
            return;
        }
        toast.success("Survey saved successfully");
    };

    return (
        <div className="grid grid-cols-12 gap-8">
            {/* Main Builder Area */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <Card>
                    <CardHeader>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled Survey"
                            className="text-3xl font-bold border-none px-0 focus-visible:ring-0 placeholder:opacity-50"
                        />
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description for this survey..."
                            className="resize-none border-none px-0 focus-visible:ring-0 min-h-[60px]"
                        />
                    </CardHeader>
                </Card>

                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <Card key={q.id} className="group relative border-l-4 border-l-blue-500">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                            </div>
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Question {index + 1}</span>
                                        <Separator orientation="vertical" className="h-3" />
                                        <span className="text-xs text-muted-foreground uppercase">{q.type}</span>
                                    </div>
                                    <Input
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                        placeholder="Enter your question here..."
                                        className="text-lg font-medium border-none px-0 focus-visible:ring-0"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {q.type === 'LIKERT' && (
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-dashed">
                                        <span className="text-xs text-muted-foreground italic">Likert Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)</span>
                                    </div>
                                )}
                                {q.type === 'RATING' && (
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-dashed">
                                        <span className="text-xs text-muted-foreground italic">Numeric Rating: 1 to 10</span>
                                    </div>
                                )}
                                {q.type === 'TEXT' && (
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-dashed">
                                        <span className="text-xs text-muted-foreground italic">Multi-line text response box</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {questions.length === 0 && (
                    <div className="border-2 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center bg-slate-50">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Plus className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-900">No questions yet</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                            Select a question type from the sidebar to start building your survey.
                        </p>
                    </div>
                )}
            </div>

            {/* Sidebar Tools */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Add Components</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <Button variant="outline" className="justify-start h-12" onClick={() => addQuestion('LIKERT')}>
                            <Plus className="mr-2 h-4 w-4" /> Likert Scale
                        </Button>
                        <Button variant="outline" className="justify-start h-12" onClick={() => addQuestion('RATING')}>
                            <Plus className="mr-2 h-4 w-4" /> Rating Field
                        </Button>
                        <Button variant="outline" className="justify-start h-12" onClick={() => addQuestion('TEXT')}>
                            <Plus className="mr-2 h-4 w-4" /> Open Text
                        </Button>
                        <Separator className="my-2" />
                        <Button variant="outline" className="justify-start h-12">
                            <Plus className="mr-2 h-4 w-4" /> Section Header
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 border-t pt-6 mt-2">
                        <Button className="w-full" onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" /> Save Survey
                        </Button>
                        <Button variant="secondary" className="w-full">
                            <Eye className="mr-2 h-4 w-4" /> Preview Mode
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Settings2 className="h-4 w-4" /> Survey Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <Label>Anonymous Responses</Label>
                            <input type="checkbox" className="h-4 w-4" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <Label>Email Notifications</Label>
                            <input type="checkbox" defaultChecked className="h-4 w-4" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
