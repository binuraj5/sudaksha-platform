"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, CheckSquare, Square } from "lucide-react";
import { generateCompetenciesForRole, GeneratedCompetency } from "@/lib/actions/ai-competency";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface AICompetencyGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (competencies: GeneratedCompetency[]) => void;
    roleContext: {
        name: string;
        description: string;
        level: string;
        industry: string[];
    };
}

export function AICompetencyGenerator({
    isOpen,
    onClose,
    onSelect,
    roleContext
}: AICompetencyGeneratorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<GeneratedCompetency[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const res = await generateCompetenciesForRole(
                roleContext.name,
                roleContext.description || `Role for ${roleContext.level} level`,
                roleContext.industry.length > 0 ? roleContext.industry : ["General Technology"],
                roleContext.level
            );

            if (res.success && res.data) {
                setResults(res.data);
                // Auto-select all by default
                setSelectedIndices(res.data.map((_, i) => i));
            } else {
                setError(res.error || "Failed to generate competencies.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (index: number) => {
        if (selectedIndices.includes(index)) {
            setSelectedIndices(selectedIndices.filter(i => i !== index));
        } else {
            setSelectedIndices([...selectedIndices, index]);
        }
    };

    const handleConfirm = () => {
        const selected = results.filter((_, i) => selectedIndices.includes(i));
        onSelect(selected);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Competency Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate tailored competencies based on the role profile: <strong>{roleContext.name}</strong> ({roleContext.level})
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {results.length === 0 && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="p-4 bg-purple-50 rounded-full">
                                <Sparkles className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-medium">Ready to generate?</p>
                                <p className="text-sm text-slate-500 max-w-sm mt-1">
                                    Gemini AI will analyze the role details and suggest 5-7 relevant competencies with behavioral indicators.
                                </p>
                            </div>
                            <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700">
                                Start Generation
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <p className="text-sm text-slate-500 animate-pulse">Analyzing role requirements...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm text-center">
                            {error}
                            <Button variant="link" onClick={handleGenerate} className="ml-2">Try Again</Button>
                        </div>
                    )}

                    {results.length > 0 && (
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {results.map((comp, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 border rounded-lg transition-colors cursor-pointer ${selectedIndices.includes(idx) ? 'bg-purple-50 border-purple-200' : 'hover:bg-slate-50 border-slate-200'
                                            }`}
                                        onClick={() => toggleSelection(idx)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedIndices.includes(idx)}
                                                onCheckedChange={() => toggleSelection(idx)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-slate-900">{comp.name}</h4>
                                                    <Badge variant="secondary" className="text-xs">{comp.category}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{comp.description}</p>

                                                <div className="mt-3 text-xs bg-white p-2 rounded border border-slate-100">
                                                    <span className="font-medium text-slate-500 block mb-1">Indicators for {roleContext.level}:</span>
                                                    <div className="space-y-2">
                                                        {/* Positive */}
                                                        {comp.indicators
                                                            .filter(i => i.level === roleContext.level && i.type === "POSITIVE")
                                                            .map((ind, i) => (
                                                                <div key={`pos-${i}`} className="flex items-start gap-1">
                                                                    <span className="text-green-600 font-bold">•</span>
                                                                    <span className="text-slate-700">{ind.text}</span>
                                                                </div>
                                                            ))}
                                                        {/* Negative */}
                                                        {comp.indicators
                                                            .filter(i => i.level === roleContext.level && i.type === "NEGATIVE")
                                                            .map((ind, i) => (
                                                                <div key={`neg-${i}`} className="flex items-start gap-1">
                                                                    <span className="text-red-500 font-bold">•</span>
                                                                    <span className="text-slate-500 italic">{ind.text}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={results.length === 0 || selectedIndices.length === 0}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Add Selected ({selectedIndices.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
