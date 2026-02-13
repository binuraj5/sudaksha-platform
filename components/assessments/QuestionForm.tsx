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
import { QuestionType } from "@prisma/client";

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
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
    componentId,
    indicators,
    onSave,
    onCancel
}) => {
    const [type, setType] = useState<QuestionType>("MULTIPLE_CHOICE");
    const [options, setOptions] = useState([
        { text: "", isCorrect: true, order: 0 },
        { text: "", isCorrect: false, order: 1 }
    ]);
    const [selectedIndicatorIds, setSelectedIndicatorIds] = useState<string[]>([]);

    const { register, watch, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            questionText: "",
            questionType: "MULTIPLE_CHOICE" as QuestionType,
            points: 2,
            timeLimit: 120,
            explanation: "",
            correctAnswer: ""
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
                            <Label className="text-sm font-black uppercase tracking-widest text-indigo-600">Question Content</Label>
                            <Select
                                value={type}
                                onValueChange={(val: QuestionType) => {
                                    setType(val);
                                    setValue("questionType", val);
                                }}
                            >
                                <SelectTrigger className="w-[200px] h-10 rounded-xl border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-2xl">
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
                                className="min-h-[150px] rounded-2xl border-2 text-lg font-medium p-6 focus:ring-indigo-500/20"
                            />
                            {errors.questionText && <p className="text-red-500 text-xs font-bold">{errors.questionText.message}</p>}
                        </div>
                    </div>

                    {/* Question Type Specific Fields */}
                    {type === "MULTIPLE_CHOICE" && (
                        <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Answer Options</Label>
                            <div className="space-y-3">
                                {options.map((option, idx) => (
                                    <div key={idx} className="flex gap-3 group">
                                        <div
                                            onClick={() => handleToggleCorrect(idx)}
                                            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${option.isCorrect ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-100" : "bg-white border-slate-200 text-slate-300 hover:border-slate-400"
                                                }`}
                                        >
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <Input
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${idx + 1}`}
                                            className="h-12 rounded-xl border-2 focus:border-indigo-500 transition-all text-sm font-bold"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleRemoveOption(idx)}
                                            disabled={options.length <= 2}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 rounded-xl border-2 border-slate-200 border-dashed text-slate-500 hover:bg-white hover:border-indigo-500 hover:text-indigo-600 font-bold gap-2"
                                onClick={handleAddOption}
                                disabled={options.length >= 6}
                            >
                                <Plus className="w-4 h-4" /> Add Option
                            </Button>
                        </div>
                    )}

                    {type === "TRUE_FALSE" && (
                        <div className="flex gap-4 p-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            {["true", "false"].map(val => (
                                <Button
                                    key={val}
                                    type="button"
                                    variant={watch("correctAnswer") === val ? "default" : "outline"}
                                    className={`flex-1 h-16 rounded-2xl text-lg font-black italic shadow-xl transition-all ${watch("correctAnswer") === val ? "bg-indigo-600" : "bg-white"
                                        }`}
                                    onClick={() => setValue("correctAnswer", val)}
                                >
                                    {val.toUpperCase()}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-indigo-600">Explanation (Optional)</Label>
                        <Textarea
                            {...register("explanation")}
                            placeholder="Explain why the answer is correct..."
                            className="rounded-2xl border-2 min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl ring-1 ring-gray-100 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-indigo-600 text-white p-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5" /> Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Difficulty Points</Label>
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    <Input
                                        type="number"
                                        {...register("points", { valueAsNumber: true })}
                                        className="h-10 rounded-xl border-2 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time Limit (Seconds)</Label>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    <Input
                                        type="number"
                                        {...register("timeLimit", { valueAsNumber: true })}
                                        className="h-10 rounded-xl border-2 font-bold"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl ring-1 ring-gray-100 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-800 text-white p-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Linked Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {indicators.map(ind => (
                                    <div
                                        key={ind.id}
                                        onClick={() => toggleIndicator(ind.id)}
                                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${selectedIndicatorIds.includes(ind.id) ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200"
                                            }`}
                                    >
                                        <Checkbox checked={selectedIndicatorIds.includes(ind.id)} className="mt-1" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-700 leading-tight">{ind.text}</p>
                                            <Badge variant="secondary" className="text-[9px] mt-1 bg-white border border-slate-100">{ind.level}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black italic shadow-xl shadow-indigo-100">
                            Save Question
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};
