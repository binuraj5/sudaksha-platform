"use client";

import { CheckCircle2, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompletedSection {
    name: string;
    componentType: string;
    score: number | null;
    percentage: number | null;
    timeSpentSeconds?: number | null;
}

interface NextSection {
    name: string;
    componentType: string;
    estimatedMinutes?: number;
}

interface SectionCheckpointProps {
    completedSection: CompletedSection;
    nextSection: NextSection | null;
    sectionNumber: number;
    totalSections: number;
    onContinue: () => void;
    onReview: () => void;
    loading?: boolean;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function typeLabel(type: string): string {
    const map: Record<string, string> = {
        MCQ: "Multiple Choice",
        SITUATIONAL: "Situational",
        ADAPTIVE_AI: "Adaptive AI",
        VOICE: "Voice Interview",
        VIDEO: "Video Interview",
        PANEL: "Panel Interview",
        CODE: "Coding Challenge",
    };
    return map[type] ?? type;
}

export function SectionCheckpoint({
    completedSection,
    nextSection,
    sectionNumber,
    totalSections,
    onContinue,
    onReview,
    loading = false,
}: SectionCheckpointProps) {
    const pct = completedSection.percentage ?? null;
    const isLast = sectionNumber >= totalSections;

    return (
        <div className="max-w-2xl mx-auto py-16 px-4 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                    <CheckCircle2 className="h-9 w-9 text-green-600" />
                </div>
                <div>
                    <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 mb-2">
                        Section {sectionNumber} of {totalSections} Complete
                    </Badge>
                    <h2 className="text-2xl font-bold text-gray-900">{completedSection.name}</h2>
                    <p className="text-sm text-gray-500">{typeLabel(completedSection.componentType)}</p>
                </div>
            </div>

            {/* Stats */}
            <Card className="bg-white border-gray-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl text-center">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Score</p>
                            {pct !== null ? (
                                <p className={`text-2xl font-bold ${pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                    {Math.round(pct)}%
                                </p>
                            ) : (
                                <p className="text-2xl font-bold text-gray-300">—</p>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl text-center">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p>
                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span className="text-sm font-semibold text-green-700">Submitted</span>
                            </div>
                        </div>
                    </div>

                    {completedSection.timeSpentSeconds != null && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Time taken: {formatTime(completedSection.timeSpentSeconds)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Next section info */}
            {!isLast && nextSection && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 space-y-1">
                        <p className="font-semibold">Next: {nextSection.name}</p>
                        <p className="text-blue-700">
                            {typeLabel(nextSection.componentType)}
                            {nextSection.estimatedMinutes ? ` · ~${nextSection.estimatedMinutes} min` : ""}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            ⚠ The previous section has been submitted and cannot be changed.
                        </p>
                    </div>
                </div>
            )}

            {isLast && (
                <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-800 text-center">
                    🎉 You have completed all sections! Submit to see your results.
                </div>
            )}

            {/* Actions */}
            <Card className="border-gray-100 shadow-sm">
                <CardFooter className="p-6 flex flex-col sm:flex-row gap-3">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                        onClick={onContinue}
                        disabled={loading}
                    >
                        {isLast ? "Submit Assessment" : (
                            <>Continue to Section {sectionNumber + 1} <ChevronRight className="ml-2 h-5 w-5" /></>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
