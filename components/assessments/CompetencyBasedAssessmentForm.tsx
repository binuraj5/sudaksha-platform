"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, Target, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { getAccessibleCompetencies, createCompetencyBasedAssessment } from "@/app/actions/assessments/competency-based";

export function CompetencyBasedAssessmentForm({ basePath, clientId }: { basePath: string, clientId?: string }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetLevel, setTargetLevel] = useState("MIDDLE");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [competencies, setCompetencies] = useState<any[]>([]);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [weights, setWeights] = useState<Record<string, number>>({});

    useEffect(() => {
        async function fetchInitial() {
            setLoading(true);
            const res = await getAccessibleCompetencies(clientId);
            if (res.error) {
                toast.error(res.error);
            } else if (res.data) {
                setCompetencies(res.data);
            }
            setLoading(false);
        }
        fetchInitial();
    }, [clientId]);

    const toggleCompetency = (compId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(compId)) {
                next.delete(compId);
                const w = { ...weights };
                delete w[compId];
                setWeights(w);
            } else {
                next.add(compId);
                // default equal weight recalculation handled gracefully if needed
                setWeights({ ...weights, [compId]: 10 });
            }
            return next;
        });
    };

    const selectedCompetencies = competencies.filter(c => selectedIds.has(c.id));
    const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
    const weightsValid = Math.abs(totalWeight - 100) <= 0.5;

    const normalizeWeights = () => {
        if (totalWeight <= 0) return;
        const next: Record<string, number> = { ...weights };
        selectedCompetencies.forEach((c) => {
            next[c.id] = Math.round(((weights[c.id] || 0) / totalWeight) * 1000) / 10;
        });
        setWeights(next);
    };

    const handleCreate = async () => {
        if (selectedIds.size === 0) return toast.error("Select at least one competency.");
        if (!weightsValid) return toast.error("Weights must add up to 100%.");

        setCreating(true);

        try {
            // Save state required by the Wizard to session storage
            sessionStorage.setItem("assessment-wizard-competency-weights", JSON.stringify(weights));

            const compIds = Array.from(selectedIds).join(",");
            const parts = basePath.split("/create");
            const buildUrl = `${parts[0]}/build?competencyIds=${compIds}&level=${targetLevel}`;

            toast.success("Competencies prepared! Transitioning to Structural Builder...");

            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 600));
            router.push(buildUrl);

        } catch (e) {
            toast.error("Failed to construct routing payload");
            setCreating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Competency Builder</h1>
                    <p className="text-gray-500 text-sm mt-1">Construct an assessment independently by picking competencies directly.</p>
                </div>
                <Button variant="outline" onClick={() => router.push(basePath)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Assessment Configuration</CardTitle>
                    <CardDescription>Setup the overarching details before selecting individual competencies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Universal Leadership Evaluation" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Target Proficiency Level</Label>
                            <Select value={targetLevel} onValueChange={setTargetLevel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JUNIOR">Junior / Beginner</SelectItem>
                                    <SelectItem value="MIDDLE">Middle / Intermediate</SelectItem>
                                    <SelectItem value="SENIOR">Senior / Advanced</SelectItem>
                                    <SelectItem value="EXPERT">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Elaborate on the purpose of this assessment..." />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center pr-2">
                        <div>
                            <CardTitle>Competency Selection</CardTitle>
                            <CardDescription>Browse and attach competencies. Weights must total 100%.</CardDescription>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1"><Target className="w-4 h-4 mr-2" /> {selectedIds.size} Selected</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : competencies.length === 0 ? (
                        <div className="min-h-[150px] flex items-center justify-center border-2 border-dashed rounded-lg bg-gray-50/50">
                            <p className="text-gray-400 text-sm">No competencies available for your scope.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {competencies.map((comp) => {
                                const isSelected = selectedIds.has(comp.id);
                                const val = weights[comp.id] ?? 0;
                                return (
                                    <div
                                        key={comp.id}
                                        className={`p-4 rounded-lg border transition-colors ${isSelected ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/30"}`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className="flex items-start sm:items-center gap-3 flex-1 pt-1 sm:pt-0">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleCompetency(comp.id)}
                                                    className="mt-1 sm:mt-0"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{comp.name}</span>
                                                        <Badge variant="outline" className="text-[10px] py-0">{comp.scope}</Badge>
                                                    </div>
                                                    {comp.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{comp.description}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="flex items-center gap-3 sm:w-64">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={0.5}
                                                        value={val === 0 ? "" : val}
                                                        onChange={(e) => {
                                                            const num = parseFloat(e.target.value);
                                                            if (!Number.isNaN(num)) {
                                                                setWeights({ ...weights, [comp.id]: Math.min(100, Math.max(0, num)) });
                                                            } else {
                                                                setWeights({ ...weights, [comp.id]: 0 });
                                                            }
                                                        }}
                                                        className="h-8 w-20 text-right text-xs"
                                                    />
                                                    <span className="text-xs text-muted-foreground">%</span>
                                                    <Slider
                                                        value={[val]}
                                                        max={100}
                                                        step={0.5}
                                                        onValueChange={([v]) => setWeights({ ...weights, [comp.id]: v })}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {selectedIds.size > 0 && (
                                <div className="flex items-center justify-between pt-4 mt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Total Weight:</span>
                                        <Badge variant={weightsValid ? "default" : totalWeight > 100 ? "destructive" : "secondary"}>
                                            {totalWeight.toFixed(1)}%
                                        </Badge>
                                        {weightsValid && <Check className="w-4 h-4 text-green-500 ml-1" />}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={normalizeWeights}>
                                        Auto-balance Constraints
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end mt-8 pt-4 border-t gap-3">
                        <Button
                            onClick={handleCreate}
                            disabled={creating || selectedIds.size === 0 || !weightsValid}
                            className="w-full sm:w-auto"
                        >
                            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Build Structure <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
