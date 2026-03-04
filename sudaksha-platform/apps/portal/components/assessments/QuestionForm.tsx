"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    Trophy,
    FileText,
    Settings,
    ChevronDown,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { QuestionType } from "@sudaksha/db-core";

const questionSchema = z.object({
    questionText: z.string().min(10, "Question must be at least 10 characters"),
    questionType: z.nativeEnum(QuestionType),
    points: z.number().min(1).max(10),
    timeLimit: z.number().min(10).max(600).nullable(),
    explanation: z.string().optional(),
    correctAnswer: z.string().optional(),
});

interface Indicator {
    id: string;
    text: string;
    level: string;
}

interface QuestionFormProps {
    componentId: string;
    indicators: Indicator[];
    onSave: (data: any) => void;
    onCancel: () => void;
    initialData?: any;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
    componentId,
    indicators,
    onSave,
    onCancel,
    initialData
}) => {
    const [type, setType] = useState<QuestionType>(initialData?.questionType || "MULTIPLE_CHOICE");
    const [options, setOptions] = useState<{ text: string; isCorrect: boolean; order: number }[]>(
        initialData?.options || [
            { text: "", isCorrect: true, order: 0 },
            { text: "", isCorrect: false, order: 1 }
        ]
    );
    const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<string[]>(
        initialData?.linkedIndicators || []
    );

    const { register, watch, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            questionText: initialData?.questionText || "",
            questionType: initialData?.questionType || ("MULTIPLE_CHOICE" as QuestionType),
            points: initialData?.points || 2,
            timeLimit: initialData?.timeLimit || 120,
            explanation: initialData?.explanation || "",
            correctAnswer: initialData?.correctAnswer || ""
        }
    });

    const handleAddOption = () => {
        if (options.length >= 6) return;
        setOptions([...options, { text: "", isCorrect: false, order: options.length }]);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        // Ensure at least one is correct
        if (!newOptions.some(o => o.isCorrect)) {
            newOptions[0].isCorrect = true;
        }
        setOptions(newOptions);
    };

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };

    const handleToggleCorrect = (index: number) => {
        const newOptions = [...options];
        newOptions[index].isCorrect = !newOptions[index].isCorrect;
        setOptions(newOptions);
    };

    const toggleIndicator = (id: string) => {
        setSelectedIndicatorIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const onSubmit = (data: any) => {
        if (type === "MULTIPLE_CHOICE") {
            if (options.some(o => !o.text)) {
                toast.error("All options must have text");
                return;
            }
            data.options = options;
            data.correctAnswer = null;
        }

        if (selectedIndicatorIds.length === 0) {
            toast.error("Please link at least one indicator");
            return;
        }

        onSave({
            ...data,
            componentId,
            linkedIndicators: selectedIndicatorIds
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Question Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Question Content</Label>
                            <Select
                                value={type}
                                onValueChange={(val: QuestionType) => {
                                    setType(val);
                                    setValue("questionType", val);
                                }}
                            >
                                <SelectTrigger className="w-[200px] h-10 rounded-lg border border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border border-border">
                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                                    <SelectItem value="FILL_IN_BLANK">Short Answer</SelectItem>
                                    <SelectItem value="ESSAY">Essay / Long Text</SelectItem>
                                    <SelectItem value="CODING_CHALLENGE">Coding Task</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Textarea
                                {...register("questionText")}
                                placeholder="Type your question here..."
                                className="min-h-[120px] rounded-lg border border-border p-4 text-foreground focus:ring-primary/20"
                            />
                            {errors.questionText && <p className="text-red-500 text-xs font-bold">{errors.questionText.message as string}</p>}
                        </div>
                    </div>

                    {/* Question Type Specific Fields */}
                    {type === "MULTIPLE_CHOICE" && (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed border-border">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Answer Options</Label>
                            <div className="space-y-3">
                                {options.map((option, idx) => (
                                    <div key={idx} className="flex gap-3 group">
                                        <div
                                            onClick={() => handleToggleCorrect(idx)}
                                            className={`w-10 h-10 rounded-lg border flex items-center justify-center cursor-pointer transition-all shrink-0 ${option.isCorrect ? "bg-green-600 border-green-600 text-white" : "bg-card border-border text-muted-foreground hover:border-muted-foreground/50"
                                                }`}
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <Input
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${idx + 1}`}
                                            className="h-10 rounded-lg border border-border text-foreground focus:ring-primary/20"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={() => handleRemoveOption(idx)}
                                            disabled={options.length <= 2}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-10 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary gap-2"
                                onClick={handleAddOption}
                                disabled={options.length >= 6}
                            >
                                <Plus className="w-4 h-4" /> Add Option
                            </Button>
                        </div>
                    )}

                    {type === "TRUE_FALSE" && (
                        <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-dashed border-border">
                            {["true", "false"].map(val => (
                                <Button
                                    key={val}
                                    type="button"
                                    variant={watch("correctAnswer") === val ? "default" : "outline"}
                                    className={`flex-1 h-12 rounded-lg font-medium transition-all ${watch("correctAnswer") === val ? "bg-primary text-primary-foreground" : "border-border"
                                        }`}
                                    onClick={() => setValue("correctAnswer", val)}
                                >
                                    {val.toUpperCase()}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Explanation (Optional)</Label>
                        <Textarea
                            {...register("explanation")}
                            placeholder="Explain why the answer is correct..."
                            className="rounded-lg border border-border min-h-[80px] text-foreground"
                        />
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <Card className="border border-border rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 px-4 py-3 border-b border-border">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Points</Label>
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                                    <Input
                                        type="number"
                                        {...register("points", { valueAsNumber: true })}
                                        className="h-9 rounded-lg border border-border"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">Time Limit (sec)</Label>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-primary shrink-0" />
                                    <Input
                                        type="number"
                                        {...register("timeLimit", { valueAsNumber: true })}
                                        className="h-9 rounded-lg border border-border"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 px-4 py-3 border-b border-border">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Linked Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                {indicators.map(ind => (
                                    <div
                                        key={ind.id}
                                        onClick={() => toggleIndicator(ind.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${selectedIndicatorIds.includes(ind.id) ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                                            }`}
                                    >
                                        <Checkbox checked={selectedIndicatorIds.includes(ind.id)} className="mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-foreground leading-tight">{ind.text}</p>
                                            <Badge variant="secondary" className="text-[9px] mt-1">{ind.level}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" className="flex-1 h-10 rounded-lg border-border" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                            Save Question
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};
