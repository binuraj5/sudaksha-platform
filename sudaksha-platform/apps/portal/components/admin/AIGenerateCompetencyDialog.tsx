"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Save, RefreshCw, BrainCircuit, Target } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { COMPETENCY_CATEGORY_OPTIONS } from "@/lib/competency-categories";

export function AIGenerateCompetencyDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"input" | "generating" | "review">("input");
    const [topic, setTopic] = useState("");
    const [category, setCategory] = useState("TECHNICAL");
    const [generated, setGenerated] = useState<{
        name: string;
        description: string;
        indicators: any[];
    } | null>(null);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!topic) return;
        setStep("generating");
        try {
            // We'll use the existing API but we might need to update it to generate name/description too
            // For now, let's assume it can take a topic and return a full profile.
            // If the API only does indicators, we'll need a new endpoint or update it.

            const response = await fetch("/api/admin/competencies/ai-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: topic,
                    category,
                    generateFullProfile: true // Flag for the backend 
                }),
            });

            if (!response.ok) throw new Error("Failed to generate competency");

            const data = await response.json();
            setGenerated({
                name: topic,
                description: data.description || `Specialized competency in ${topic}`,
                indicators: data.indicators || []
            });
            setStep("review");
        } catch (error) {
            toast.error("AI generation failed");
            setStep("input");
        }
    };

    const handleSave = async () => {
        if (!generated) return;
        try {
            // 1. Create Competency
            const compRes = await fetch("/api/admin/competencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: generated.name,
                    category,
                    description: generated.description
                }),
            });

            if (!compRes.ok) {
                const err = await compRes.json().catch(() => ({}));
                toast.error(err.error || "Failed to create competency");
                return;
            }
            const newComp = await compRes.json();

            // 2. Save Indicators
            for (const indicator of generated.indicators) {
                await fetch(`/api/admin/competencies/${newComp.id}/indicators`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(indicator),
                });
            }

            toast.success("Competency created successfully!");
            setOpen(false);
            setStep("input");
            setTopic("");
            router.refresh();
        } catch (error) {
            toast.error("Error saving competency");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md transition-all">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Generate
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-red-600" />
                        AI Competency Architect
                    </DialogTitle>
                    <DialogDescription>
                        Generate a complete professional competency profile with behavioral benchmarks.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === "input" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Competency Topic</Label>
                                <Input
                                    placeholder="e.g. Cloud Infrastructure, Conflict Resolution..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMPETENCY_CATEGORY_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === "generating" && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
                            <div className="text-center">
                                <h3 className="font-medium">Architecting Competency...</h3>
                                <p className="text-sm text-gray-500">mapping behaviors and proficiency markers</p>
                            </div>
                        </div>
                    )}

                    {step === "review" && generated && (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900">{generated.name}</h4>
                                    <Badge variant="outline">{category}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                    {generated.description}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview: {generated.indicators.length} Indicators Generated</p>
                                <div className="space-y-2">
                                    {generated.indicators.slice(0, 3).map((ind, i) => (
                                        <div key={i} className="text-xs p-2 border rounded bg-white flex items-center gap-2">
                                            <Target className="h-3 w-3 text-red-400" />
                                            <span className="truncate">{ind.description}</span>
                                        </div>
                                    ))}
                                    {generated.indicators.length > 3 && (
                                        <p className="text-[10px] text-center text-gray-400"> + {generated.indicators.length - 3} more indicators</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === "input" && (
                        <Button onClick={handleGenerate} className="bg-red-600 hover:bg-red-700 text-white w-full" disabled={!topic}>
                            Generate Profile
                        </Button>
                    )}
                    {step === "review" && (
                        <>
                            <Button variant="ghost" onClick={() => setStep("input")}>
                                <RefreshCw className="mr-2 h-3 w-3" /> Start Over
                            </Button>
                            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                                <Save className="mr-2 h-4 w-4" /> Finalize & Save
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
