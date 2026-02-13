"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

interface Indicator {
    level: "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
    type: "POSITIVE" | "NEGATIVE";
    description?: string;
    text: string;
}

interface AIGenerateIndicatorsDialogProps {
    competencyId: string;
    competencyName: string;
    competencyCategory: string;
}

export function AIGenerateIndicatorsDialog({
    competencyId,
    competencyName,
    competencyCategory
}: AIGenerateIndicatorsDialogProps) {
    const [open, setOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const router = useRouter();

    const generateBenchmarks = async () => {
        setGenerating(true);
        try {
            const response = await fetch("/api/admin/competencies/ai-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: competencyName,
                    category: competencyCategory
                }),
            });

            if (!response.ok) throw new Error("Failed to generate Indicators");

            const data = await response.json();
            setIndicators(data.indicators);
            toast.success("AI Indicators generated!");
        } catch (error) {
            toast.error("Generation failed. Please try again.");
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    const saveIndicators = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/competencies/${competencyId}/indicators`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(indicators),
            });

            if (!res.ok) throw new Error("Failed to save indicators");

            const result = await res.json();
            toast.success(`Successfully saved ${result.count || indicators.length} indicators!`);
            router.refresh();
            setOpen(false);
        } catch (error) {
            toast.error("Failed to save indicators");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all">
                    <Sparkles className="mr-2 h-4 w-4 fill-current" />
                    AI Generate Indicators
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        AI Indicator Generator
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
                    {!indicators.length && !generating ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-blue-50 rounded-full">
                                <Sparkles className="h-10 w-10 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Define Indicators with AI</h3>
                                <p className="text-sm text-gray-500 max-w-[320px] mx-auto mt-1">
                                    We'll generate 5 positive and 5 negative indicators for each proficiency level (Beginner to Expert) based on the competency definition.
                                </p>
                            </div>
                            <Button onClick={generateBenchmarks} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
                                Start Generation
                            </Button>
                        </div>
                    ) : generating ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <div className="text-center">
                                <h3 className="font-medium text-gray-900">Analyzing Competency...</h3>
                                <p className="text-sm text-gray-500">Crafting behavioral indicators for {competencyName}</p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 -mx-2 px-2">
                            <div className="space-y-6 pb-4">
                                {["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"].map((level) => (
                                    <div key={level} className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{level}</h4>
                                        <div className="grid gap-2">
                                            {indicators.filter(i => i.level === level).map((indicator, idx) => (
                                                <div key={idx} className="p-3 border rounded-lg bg-gray-50 flex gap-3 items-start">
                                                    {indicator.type === 'POSITIVE' ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                                    )}
                                                    <p className="text-sm text-gray-700">{indicator.text || indicator.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {indicators.length > 0 && !generating && (
                    <DialogFooter className="p-4 border-t bg-gray-50 rounded-b-lg">
                        <Button variant="ghost" onClick={generateBenchmarks} disabled={saving}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                        </Button>
                        <Button onClick={saveIndicators} className="bg-green-600 hover:bg-green-700 text-white" disabled={saving}>
                            {saving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save All Indicators
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
