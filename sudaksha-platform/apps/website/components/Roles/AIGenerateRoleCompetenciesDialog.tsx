"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Save, RefreshCw, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { COMPETENCY_CATEGORY_OPTIONS } from "@/lib/competency-categories";
import { Checkbox } from "@/components/ui/checkbox";

interface Indicator {
    level: "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
    type: "POSITIVE" | "NEGATIVE";
    text: string;
}

interface GeneratedCompetency {
    name: string;
    category: string;
    description: string;
    indicators: Indicator[];
    selected: boolean;
    expanded: boolean;
}

interface AIGenerateRoleCompetenciesDialogProps {
    roleId: string;
    roleName: string;
    roleLevel?: string;
    onSuccess?: () => void;
}

export function AIGenerateRoleCompetenciesDialog({
    roleId,
    roleName,
    roleLevel,
    onSuccess,
}: AIGenerateRoleCompetenciesDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<"input" | "generating" | "review">("input");
    const [count, setCount] = useState(5);
    const [focusArea, setFocusArea] = useState("");
    const [category, setCategory] = useState("ALL");
    const [competencies, setCompetencies] = useState<GeneratedCompetency[]>([]);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const reset = () => {
        setStep("input");
        setCount(5);
        setFocusArea("");
        setCategory("ALL");
        setCompetencies([]);
        setSaving(false);
    };

    const handleGenerate = async () => {
        setStep("generating");

        // Build the list of competency topics to generate
        const topicPrompt = focusArea
            ? `Generate ${count} key competencies for a "${roleName}" role with a focus on ${focusArea}.`
            : `Generate ${count} key competencies critical for a "${roleName}" role.`;

        const categoryFilter = category !== "ALL" ? category : undefined;

        try {
            // Step 1: Generate competency topics using a prompt to the AI
            const topicsRes = await fetch("/api/admin/competencies/ai-generate-topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleName, roleLevel, count, focusArea, category: categoryFilter }),
            });

            let topics: Array<{ name: string; category: string; description: string }>;

            if (!topicsRes.ok) {
                // Fallback: use static competency names derived from the role
                topics = Array.from({ length: count }, (_, i) => ({
                    name: focusArea ? `${focusArea} - Competency ${i + 1}` : `${roleName} Core Competency ${i + 1}`,
                    category: categoryFilter || "BEHAVIORAL",
                    description: `Essential competency for the ${roleName} role.`,
                }));
            } else {
                topics = await topicsRes.json();
            }

            // Step 2: For each topic, generate positive/negative indicators
            const generated: GeneratedCompetency[] = [];

            for (const topic of topics.slice(0, count)) {
                const indRes = await fetch("/api/admin/competencies/ai-generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: topic.name,
                        category: topic.category || categoryFilter || "BEHAVIORAL",
                        roleContext: roleName,
                    }),
                });

                if (indRes.ok) {
                    const data = await indRes.json();
                    generated.push({
                        name: topic.name,
                        category: topic.category || categoryFilter || "BEHAVIORAL",
                        description: topic.description || "",
                        indicators: data.indicators || [],
                        selected: true,
                        expanded: false,
                    });
                }
            }

            if (generated.length === 0) {
                toast.error("AI generation failed. Please try again.");
                setStep("input");
                return;
            }

            setCompetencies(generated);
            setStep("review");
            toast.success(`Generated ${generated.length} competencies with indicators`);
        } catch {
            toast.error("Generation failed. Please check your AI configuration.");
            setStep("input");
        }
    };

    const toggleSelected = (index: number) => {
        setCompetencies((prev) =>
            prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
        );
    };

    const toggleExpanded = (index: number) => {
        setCompetencies((prev) =>
            prev.map((c, i) => (i === index ? { ...c, expanded: !c.expanded } : c))
        );
    };

    const handleSave = async () => {
        const selected = competencies.filter((c) => c.selected);
        if (selected.length === 0) {
            toast.error("Select at least one competency to save");
            return;
        }

        setSaving(true);
        try {
            const payload = selected.map((c) => ({
                name: c.name,
                category: c.category,
                description: c.description,
                requiredLevel: roleLevel || "MIDDLE",
                weight: 1.0,
                indicators: c.indicators,
            }));

            const res = await fetch(`/api/admin/roles/${roleId}/competencies/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to save competencies");
                return;
            }

            toast.success(`${data.created} competency(s) mapped to ${roleName}${data.skipped > 0 ? ` (${data.skipped} already existed)` : ""}`);
            onSuccess?.();
            router.refresh();
            setOpen(false);
            reset();
        } catch {
            toast.error("Failed to save competencies");
        } finally {
            setSaving(false);
        }
    };

    const selectedCount = competencies.filter((c) => c.selected).length;

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                    <Sparkles className="mr-2 h-4 w-4 fill-current" /> AI Generate Competencies
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px] h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        AI Competency Generator
                    </DialogTitle>
                    <DialogDescription>
                        Generate competencies with positive &amp; negative indicators for <strong>{roleName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
                    {step === "input" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Number of Competencies</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={count}
                                        onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 5)))}
                                    />
                                    <p className="text-xs text-gray-400">Max 10 at a time</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category Focus</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Categories</SelectItem>
                                            {COMPETENCY_CATEGORY_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Focus Area <span className="text-gray-400 font-normal">(optional)</span></Label>
                                <Input
                                    placeholder={`e.g. "Cloud Infrastructure", "Team Leadership", "Data Analysis"...`}
                                    value={focusArea}
                                    onChange={(e) => setFocusArea(e.target.value)}
                                />
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                                <p>AI will generate <strong>{count} competencies</strong> for <strong>{roleName}</strong>, each with 5 positive + 5 negative indicators per proficiency level (Junior → Expert).</p>
                            </div>
                        </div>
                    )}

                    {step === "generating" && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <div className="text-center">
                                <h3 className="font-medium text-gray-900">Generating Competency Framework...</h3>
                                <p className="text-sm text-gray-500 mt-1">Crafting {count} competencies with behavioral indicators for {roleName}</p>
                            </div>
                        </div>
                    )}

                    {step === "review" && (
                        <ScrollArea className="flex-1 -mx-1 px-1">
                            <div className="space-y-3 pb-4">
                                <p className="text-xs text-gray-500">
                                    <strong>{selectedCount}</strong> of {competencies.length} selected for mapping
                                </p>
                                {competencies.map((comp, i) => (
                                    <div key={i} className={`border rounded-lg ${comp.selected ? "border-blue-200 bg-blue-50/30" : "border-gray-200 bg-gray-50/50"}`}>
                                        <div className="flex items-center gap-3 p-3">
                                            <Checkbox
                                                checked={comp.selected}
                                                onCheckedChange={() => toggleSelected(i)}
                                                id={`comp-${i}`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <label htmlFor={`comp-${i}`} className="font-medium text-gray-900 cursor-pointer">{comp.name}</label>
                                                    <Badge variant="secondary" className="text-[10px]">{comp.category}</Badge>
                                                    <span className="text-xs text-gray-400">{comp.indicators.length} indicators</span>
                                                </div>
                                                {comp.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{comp.description}</p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 shrink-0"
                                                onClick={() => toggleExpanded(i)}
                                            >
                                                {comp.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        </div>

                                        {comp.expanded && (
                                            <div className="border-t px-3 pb-3 pt-2 space-y-2">
                                                {(["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"] as const).map((level) => {
                                                    const levelInds = comp.indicators.filter((ind) => ind.level === level);
                                                    if (!levelInds.length) return null;
                                                    return (
                                                        <div key={level}>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{level}</p>
                                                            <div className="space-y-1">
                                                                {levelInds.map((ind, j) => (
                                                                    <div key={j} className="flex items-start gap-2 text-xs text-gray-700">
                                                                        {ind.type === "POSITIVE" ? (
                                                                            <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                                                                        ) : (
                                                                            <AlertCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                                                                        )}
                                                                        <span>{ind.text}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-gray-50 rounded-b-lg shrink-0">
                    {step === "input" && (
                        <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                            <Sparkles className="mr-2 h-4 w-4" /> Generate Competencies
                        </Button>
                    )}
                    {step === "review" && (
                        <>
                            <Button variant="ghost" onClick={() => setStep("input")} disabled={saving}>
                                <RefreshCw className="mr-2 h-3 w-3" /> Regenerate
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={saving || selectedCount === 0}
                            >
                                {saving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Save {selectedCount} Competenc{selectedCount === 1 ? "y" : "ies"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
