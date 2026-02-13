"use client";

import React from "react";
import {
    MoreVertical,
    Trash2,
    Edit2,
    Copy,
    Eye,
    GripVertical,
    CheckCircle2,
    Clock,
    Trophy,
    BookOpen
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface Question {
    id: string;
    questionText: string;
    questionType: string;
    points: number;
    timeLimit: number | null;
    linkedIndicators: string[];
}

interface QuestionListProps {
    questions: Question[];
    indicators: { id: string; text: string }[];
    onEdit: (q: Question) => void;
    onDelete: (id: string) => void;
    onDuplicate: (q: Question) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
    questions,
    indicators,
    onEdit,
    onDelete,
    onDuplicate
}) => {
    // Group questions by their first indicator (fallback to "Uncategorized")
    const groupedQuestions = questions.reduce((acc, q) => {
        const firstIndId = q.linkedIndicators[0] || "uncategorized";
        const indName = indicators.find(i => i.id === firstIndId)?.text || "Uncategorized";

        if (!acc[indName]) acc[indName] = [];
        acc[indName].push(q);
        return acc;
    }, {} as Record<string, Question[]>);

    return (
        <div className="space-y-4">
            {Object.entries(groupedQuestions).map(([groupName, groupQuestions]) => (
                <div key={groupName} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-4 bg-sudaksha-orange-400 rounded-full" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-sudaksha-navy-700 flex items-center gap-2">
                            {groupName}
                            <Badge variant="secondary" className="bg-sudaksha-blue-100 text-sudaksha-blue-700 font-medium text-[10px] px-1.5 py-0">
                                {groupQuestions.length}
                            </Badge>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {groupQuestions.map((q, idx) => (
                            <Card key={q.id} className="group border border-sudaksha-blue-100 shadow-sm hover:border-sudaksha-blue-200 transition-all rounded-md overflow-hidden bg-white">
                                <div className="flex items-center p-3 gap-3">
                                    <div className="cursor-grab text-muted-foreground/50 group-hover:text-sudaksha-blue-400 transition-colors">
                                        <GripVertical className="w-4 h-4" />
                                    </div>

                                    <div className="shrink-0 w-6 h-6 rounded-md bg-sudaksha-blue-50 flex items-center justify-center font-semibold text-xs text-sudaksha-blue-600">
                                        {idx + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider bg-sudaksha-orange-50 border-sudaksha-orange-200 text-sudaksha-orange-700 px-1.5 py-0">
                                                {q.questionType.replace("_", " ")}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-sudaksha-navy-500">
                                                <div className="flex items-center gap-1 text-[10px] font-medium">
                                                    <Trophy className="w-3 h-3 text-sudaksha-warning-500" /> {q.points} pts
                                                </div>
                                                {q.timeLimit && (
                                                    <div className="flex items-center gap-1 text-[10px] font-medium">
                                                        <Clock className="w-3 h-3 text-sudaksha-blue-500" /> {q.timeLimit}s
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-medium text-sudaksha-navy-800 truncate">{q.questionText}</h4>
                                    </div>

                                    <div className="flex items-center gap-0.5">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md text-muted-foreground hover:text-sudaksha-blue-600 hover:bg-sudaksha-blue-50" onClick={() => onEdit(q)}>
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-sudaksha-navy-800 text-white border-none rounded-md text-xs">Edit</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-sudaksha-navy-500 hover:text-sudaksha-navy-700 hover:bg-sudaksha-blue-50">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44 rounded-lg border border-sudaksha-blue-200 shadow-lg p-1.5 bg-white">
                                                <DropdownMenuItem className="rounded-md font-medium text-xs gap-2 py-2.5 cursor-pointer" onClick={() => onDuplicate(q)}>
                                                    <Copy className="w-3.5 h-3.5 text-sudaksha-success-500" /> Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-md font-medium text-xs gap-2 py-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => onDelete(q.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {questions.length === 0 && (
                <div className="text-center py-12 bg-sudaksha-blue-50/50 rounded-xl border border-dashed border-sudaksha-blue-200">
                    <div className="w-14 h-14 bg-sudaksha-orange-50 rounded-xl flex items-center justify-center mx-auto text-sudaksha-orange-300 mb-4">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-semibold text-sudaksha-navy-700">No questions yet</h3>
                    <p className="text-xs text-sudaksha-navy-500 mt-1">Add manually, upload a file, or use AI to generate.</p>
                </div>
            )}
        </div>
    );
};
