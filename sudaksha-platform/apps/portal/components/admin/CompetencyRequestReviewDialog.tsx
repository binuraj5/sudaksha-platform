"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CheckCircle2,
    XCircle,
    User,
    Loader2,
    Target,
    Sparkles,
    Plus,
    Trash2,
    BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { COMPETENCY_CATEGORY_OPTIONS } from "@/lib/competency-categories";
import { COMPETENCY_LEVEL_OPTIONS } from "@/lib/competency-levels";

interface Indicator {
    type: "POSITIVE" | "NEGATIVE";
    level: string;
    description: string;
}

interface CompetencyRequest {
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: string;
    user: { id: string; name: string; email: string };
    tenant: { id: string; name: string; slug: string | null } | null;
    /** populated from ApprovalRequest.originalData */
    originalData?: {
        category?: string;
        level?: string;
        roleBenefit?: string;
        description?: string;
    } | null;
}

export function CompetencyRequestReviewDialog({
    request,
    open,
    onOpenChange,
    onProcessed,
}: {
    request: CompetencyRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProcessed: () => void;
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [view, setView] = useState<"review" | "reject">("review");

    // Create & Approve form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState("TECHNICAL");
    const [level, setLevel] = useState("JUNIOR");
    const [definition, setDefinition] = useState("");
    const [indicators, setIndicators] = useState<Indicator[]>([]);

    // AI generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [newPosIndicator, setNewPosIndicator] = useState("");
    const [newNegIndicator, setNewNegIndicator] = useState("");

    useEffect(() => {
        if (request && open) {
            setView("review");
            setName(request.name);
            const od = request.originalData;
            setCategory(od?.category || "TECHNICAL");
            setLevel(od?.level || "JUNIOR");
            setDefinition(request.description || "");
            setIndicators([]);
            setNewPosIndicator("");
            setNewNegIndicator("");
        }
    }, [request, open]);

    if (!request) return null;

    const od = request.originalData;

    // ── AI Generate ──────────────────────────────────────────
    const handleAIGenerate = async () => {
        if (!name.trim()) { toast.error("Enter a competency name first"); return; }
        setIsGenerating(true);
        try {
            const res = await fetch("/api/admin/competencies/ai-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, category }),
            });
            if (!res.ok) throw new Error("AI generation failed");
            const data = await res.json();
            const aiIndicators: Indicator[] = (data.indicators || []).map((ind: any) => ({
                type: ind.type === "NEGATIVE" ? "NEGATIVE" : "POSITIVE",
                level: ind.level || "JUNIOR",
                description: ind.description || ind.text,
            }));
            setIndicators(aiIndicators);
            if (data.description) setDefinition(data.description);
            toast.success(`Generated ${aiIndicators.length} indicators`);
        } catch {
            toast.error("AI generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const addIndicator = (type: "POSITIVE" | "NEGATIVE") => {
        const text = type === "POSITIVE" ? newPosIndicator.trim() : newNegIndicator.trim();
        if (!text) return;
        setIndicators(prev => [...prev, { type, level, description: text }]);
        if (type === "POSITIVE") setNewPosIndicator(""); else setNewNegIndicator("");
    };

    const removeIndicator = (idx: number) => {
        setIndicators(prev => prev.filter((_, i) => i !== idx));
    };

    // ── Reject ───────────────────────────────────────────────
    const handleReject = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/competency-requests/${request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" }),
            });
            if (!res.ok) throw new Error("Failed to reject");
            toast.success("Request rejected");
            onOpenChange(false);
            onProcessed();
        } catch {
            toast.error("Failed to reject request");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Approve & Create ──────────────────────────────────────
    const handleApproveAndCreate = async () => {
        if (!name.trim()) { toast.error("Competency name is required"); return; }
        setIsProcessing(true);
        try {
            // 1. Create competency
            const createRes = await fetch("/api/admin/competencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    category,
                    description: definition,
                    allowedLevels: ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"],
                }),
            });
            if (!createRes.ok) {
                const d = await createRes.json();
                throw new Error(d.error || "Failed to create competency");
            }
            const createdComp = await createRes.json();

            // 2. Save indicators (best-effort — non-blocking individually)
            const savedCount = { ok: 0, fail: 0 };
            for (const ind of indicators) {
                try {
                    const ir = await fetch(`/api/admin/competencies/${createdComp.id}/indicators`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(ind),
                    });
                    if (ir.ok) savedCount.ok++; else savedCount.fail++;
                } catch { savedCount.fail++; }
            }
            if (savedCount.fail > 0) {
                toast.warning(`${savedCount.ok} indicators saved, ${savedCount.fail} failed`);
            }

            // 3. Approve request & link competency → assigns to user's careerFormData
            const approveRes = await fetch(`/api/admin/competency-requests/${request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED", competencyId: createdComp.id }),
            });
            if (!approveRes.ok) throw new Error("Failed to approve request");

            toast.success("Competency created and assigned to user ✓");
            onOpenChange(false);
            onProcessed();
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const positiveIndicators = indicators.filter(i => i.type === "POSITIVE");
    const negativeIndicators = indicators.filter(i => i.type === "NEGATIVE");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Target className="w-5 h-5 text-red-600" />
                        Review Skill Request
                    </DialogTitle>
                    <DialogDescription>
                        A user requested to develop a skill. Review the request and create the competency below.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-2">
                    {/* ── Left: Request Info (2/5) ─────────── */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1">
                                <User className="w-4 h-4" /> Requester
                            </h4>
                            <p className="font-medium text-gray-900">{request.user.name}</p>
                            <p className="text-sm text-gray-600">{request.user.email}</p>
                            {request.tenant && (
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{request.tenant.name}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                                Requested on {format(new Date(request.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-red-50/60 border border-red-100 space-y-2">
                            <h4 className="text-sm font-bold text-red-800">Requested Skill</h4>
                            <p className="font-semibold text-lg text-red-900">{request.name}</p>
                            {od?.category && (
                                <Badge variant="outline" className="text-[10px] text-red-700 border-red-200 capitalize">
                                    {od.category.toLowerCase()}
                                </Badge>
                            )}
                            {od?.level && (
                                <Badge variant="outline" className="text-[10px] text-indigo-700 border-indigo-200 ml-1">
                                    {od.level}
                                </Badge>
                            )}
                            {request.description && (
                                <p className="text-sm text-red-800/80 italic mt-1">&ldquo;{request.description}&rdquo;</p>
                            )}
                            {od?.roleBenefit && (
                                <div className="mt-2 pt-2 border-t border-red-100">
                                    <p className="text-xs font-semibold text-red-700 mb-1">Why it benefits their role:</p>
                                    <p className="text-xs text-red-700/80 italic">{od.roleBenefit}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right: Create & Approve (3/5) ────── */}
                    <div className="md:col-span-3 border-l pl-6">
                        {view === "reject" ? (
                            <div className="space-y-4 h-full flex flex-col justify-center">
                                <h3 className="font-bold text-lg text-gray-900">Confirm Rejection</h3>
                                <p className="text-sm text-gray-500">
                                    Reject &ldquo;{request.name}&rdquo;? The user will not be assigned this skill.
                                </p>
                                <div className="flex gap-2 mt-4 pt-4">
                                    <Button variant="outline" onClick={() => setView("review")} disabled={isProcessing}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                        Reject Request
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-gray-900">Create &amp; Approve</h3>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 text-xs"
                                        onClick={handleAIGenerate}
                                        disabled={isGenerating || isProcessing}
                                    >
                                        {isGenerating
                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                            : <BrainCircuit className="w-3 h-3" />}
                                        {isGenerating ? "Generating..." : "AI Generate"}
                                    </Button>
                                </div>

                                {/* Core fields */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs">Name</Label>
                                        <Input value={name} onChange={e => setName(e.target.value)} disabled={isProcessing} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Category</Label>
                                        <Select value={category} onValueChange={setCategory} disabled={isProcessing}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {COMPETENCY_CATEGORY_OPTIONS.map(o => (
                                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Level</Label>
                                        <Select value={level} onValueChange={setLevel} disabled={isProcessing}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {COMPETENCY_LEVEL_OPTIONS.map(o => (
                                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs">Definition</Label>
                                        <Textarea
                                            value={definition}
                                            onChange={e => setDefinition(e.target.value)}
                                            disabled={isProcessing}
                                            className="min-h-[72px] resize-none text-sm"
                                            placeholder="Standardized definition for the global library..."
                                        />
                                    </div>
                                </div>

                                {/* Indicators */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-red-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            Indicators ({indicators.length})
                                        </span>
                                    </div>

                                    {/* Positive */}
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] font-semibold text-green-700">✅ Positive Indicators</p>
                                        {positiveIndicators.map((ind, i) => (
                                            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-100">
                                                <p className="text-xs text-green-800 flex-1">
                                                    <Badge variant="outline" className="mr-1.5 text-[9px] uppercase border-green-200 bg-green-100/50 text-green-700">{ind.level}</Badge>
                                                    {ind.description}
                                                </p>
                                                <button onClick={() => removeIndicator(indicators.indexOf(ind))} className="text-green-400 hover:text-red-500 flex-shrink-0 mt-0.5">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add positive indicator..."
                                                value={newPosIndicator}
                                                onChange={e => setNewPosIndicator(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && addIndicator("POSITIVE")}
                                                className="text-xs h-8"
                                                disabled={isProcessing}
                                            />
                                            <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => addIndicator("POSITIVE")} disabled={isProcessing}>
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Negative */}
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] font-semibold text-red-700">❌ Negative Indicators</p>
                                        {negativeIndicators.map((ind, i) => (
                                            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
                                                <p className="text-xs text-red-800 flex-1">
                                                    <Badge variant="outline" className="mr-1.5 text-[9px] uppercase border-red-200 bg-red-100/50 text-red-700">{ind.level}</Badge>
                                                    {ind.description}
                                                </p>
                                                <button onClick={() => removeIndicator(indicators.indexOf(ind))} className="text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add negative indicator..."
                                                value={newNegIndicator}
                                                onChange={e => setNewNegIndicator(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && addIndicator("NEGATIVE")}
                                                className="text-xs h-8"
                                                disabled={isProcessing}
                                            />
                                            <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => addIndicator("NEGATIVE")} disabled={isProcessing}>
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <Button
                                        variant="ghost"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => setView("reject")}
                                        disabled={isProcessing}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={handleApproveAndCreate}
                                        disabled={isProcessing || !name.trim()}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {isProcessing
                                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        Approve &amp; Create
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
