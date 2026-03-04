"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
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
import { QuestionType } from "@sudaksha/db-core";
import { CheckCircle2, Trash2, Plus } from "lucide-react";

const questionSchema = z.object({
    questionText: z.string().min(10, "Question must be at least 10 characters"),
    questionType: z.nativeEnum(QuestionType),
    points: z.number().min(1).max(10),
    timeLimit: z.number().min(10).max(600).nullable(),
    explanation: z.string().optional(),
    correctAnswer: z.string().optional().nullable(),
});

interface QuestionEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: any;
    indicators: { id: string; text: string; level: string }[];
    onSave: (updatedQuestion: any) => void;
}

export const QuestionEditDialog: React.FC<QuestionEditDialogProps> = ({
    open,
    onOpenChange,
    question,
    indicators,
    onSave
}) => {
    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
        resolver: zodResolver(questionSchema)
    });

    const type = watch("questionType");
    const [options, setOptions] = React.useState<any[]>([]);

    useEffect(() => {
        if (question) {
            reset({
                questionText: question.questionText,
                questionType: question.questionType,
                points: question.points,
                timeLimit: question.timeLimit,
                explanation: question.explanation,
                correctAnswer: question.correctAnswer
            });
            setOptions(question.options || []);
        }
    }, [question, reset]);

    const handleAddOption = () => {
        setOptions([...options, { text: "", isCorrect: false, order: options.length }]);
    };

    const handleRemoveOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
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

    const onSubmit = (data: any) => {
        onSave({
            ...question,
            ...data,
            options: data.questionType === "MULTIPLE_CHOICE" ? options : []
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
                <DialogHeader className="bg-indigo-600 text-white p-8">
                    <DialogTitle className="text-2xl font-black italic">Edit Question</DialogTitle>
                    <DialogDescription className="text-indigo-100 font-medium">
                        Fine-tune the question text, options, and metadata.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-black uppercase tracking-widest text-indigo-600">Question Content</Label>
                            <Select
                                value={type}
                                onValueChange={(v) => setValue("questionType", v as any)}
                            >
                                <SelectTrigger className="w-[180px] h-10 rounded-xl border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                                    <SelectItem value="FILL_IN_BLANK">Short Answer</SelectItem>
                                    <SelectItem value="ESSAY">Essay</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Textarea
                            {...register("questionText")}
                            className="min-h-[120px] rounded-2xl border-2 p-4 font-bold text-gray-800"
                        />
                        {errors.questionText && <p className="text-red-500 text-xs font-bold">{String(errors.questionText.message)}</p>}
                    </div>

                    {type === "MULTIPLE_CHOICE" && (
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Answer Options</Label>
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <div
                                        onClick={() => handleToggleCorrect(idx)}
                                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${opt.isCorrect ? "bg-green-500 border-green-500 text-white" : "border-slate-100 text-slate-200"
                                            }`}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <Input
                                        value={opt.text}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        className="h-10 rounded-xl border-2 font-bold"
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500" onClick={() => handleRemoveOption(idx)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full h-10 border-dashed border-2 rounded-xl text-slate-400 font-bold" onClick={handleAddOption}>
                                <Plus className="w-4 h-4 mr-2" /> Add Option
                            </Button>
                        </div>
                    )}

                    {type === "TRUE_FALSE" && (
                        <div className="flex gap-4">
                            {["true", "false"].map(val => (
                                <Button
                                    key={val}
                                    type="button"
                                    variant={watch("correctAnswer") === val ? "default" : "outline"}
                                    className={`flex-1 h-12 rounded-xl font-black ${watch("correctAnswer") === val ? "bg-indigo-600 text-white" : ""}`}
                                    onClick={() => setValue("correctAnswer", val)}
                                >
                                    {val.toUpperCase()}
                                </Button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Points</Label>
                            <Input type="number" {...register("points", { valueAsNumber: true })} className="h-10 rounded-xl border-2 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Limit (s)</Label>
                            <Input type="number" {...register("timeLimit", { valueAsNumber: true })} className="h-10 rounded-xl border-2 font-bold" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explanation</Label>
                        <Textarea {...register("explanation")} className="rounded-xl border-2 p-3 text-xs" />
                    </div>
                </form>

                <DialogFooter className="p-8 bg-slate-50 flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100" onClick={handleSubmit(onSubmit)}>
                        Update Question
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
