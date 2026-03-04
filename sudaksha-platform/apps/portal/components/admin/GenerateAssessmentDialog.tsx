"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Zap, Target, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
export function GenerateAssessmentDialog({ roleId, roleName, defaultOpen = false }: { roleId: string, roleName: string, defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    const [loading, setLoading] = useState(false);
    const [proposing, setProposing] = useState(false);
    const [proposal, setProposal] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        if (open && !proposal && !proposing) {
            handleGetProposal();
        }
    }, [open]);

    async function handleGetProposal() {
        setProposing(true);
        try {
            const response = await fetch(`/api/admin/roles/${roleId}/generate-assessment`, {
                method: "POST",
            });
            if (!response.ok) throw new Error("Failed to generate proposal");
            const data = await response.json();
            setProposal(data);
        } catch (error) {
            toast.error("Could not generate proposal");
        } finally {
            setProposing(false);
        }
    }

    async function handleCreateBundle() {
        if (!proposal) return;
        setLoading(true);
        try {
            // Build competencyWeights from proposal (weight 0-1, matches RoleCompetency)
            const competencyWeights: Record<string, number> = {};
            proposal.components?.forEach((c: { competencyId?: string; weight?: number }) => {
                if (c.competencyId) {
                    competencyWeights[c.competencyId] = c.weight ?? 1;
                }
            });

            const res = await fetch("/api/assessments/admin/models/from-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleId,
                    targetLevel: proposal.components?.[0]?.level || "SENIOR",
                    name: proposal.proposedModelName,
                    description: `Assessment built from ${roleName} role competencies.`,
                    competencyWeights
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || err.details || "Failed to create assessment");
            }

            const model = await res.json();
            toast.success(`Assessment "${model.name}" created successfully!`);
            setOpen(false);
            router.push(`/assessments/admin/models/${model.id}/questions`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create assessment");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => {
                    if (!proposal) handleGetProposal();
                }}>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Assessment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Smart Assessment Builder</DialogTitle>
                    <DialogDescription>
                        AI is analyzing the <strong>{roleName}</strong> framework to build a balanced evaluation.
                    </DialogDescription>
                </DialogHeader>

                {proposing ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-500 animate-pulse">Analyzing competency weights and categories...</p>
                    </div>
                ) : proposal ? (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Proposed Assessment Name</h4>
                            <p className="font-bold text-gray-900">{proposal.proposedModelName}</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                                <Target className="h-3 w-3" />
                                Proposed Components ({proposal.components.length})
                            </h4>
                            <div className="grid gap-2">
                                {proposal.components.map((c: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{c.type}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-none uppercase">
                                                {c.level}
                                            </Badge>
                                            <span className="text-sm font-black text-blue-600">{(c.weight * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                            <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                                This blueprint is derived from the roles mapped competencies.
                                Creating this bundle will add it to your <strong>Assessment Models</strong> library.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button className="bg-blue-600" onClick={handleCreateBundle} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Assessment Bundle
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-400 italic">
                        Failed to load proposal.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
