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
    Upload,
    FileSpreadsheet,
    X,
    Pencil,
    ChevronLeft,
    Save,
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

interface SavedCompetency {
    id: string;
    name: string;
    category: string;
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

    // Bulk upload state
    const [mode, setMode] = useState<"single" | "bulk">("single");
    const [bulkStep, setBulkStep] = useState<"upload" | "review">("upload");
    const [bulkRows, setBulkRows] = useState<{ name: string; category: string; description: string }[]>([]);
    const [bulkError, setBulkError] = useState("");
    const [savedCompetencies, setSavedCompetencies] = useState<SavedCompetency[]>([]);
    const [editingCompId, setEditingCompId] = useState<string | null>(null);
    const [editComp, setEditComp] = useState({ name: "", category: "TECHNICAL", description: "" });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Draft state — persisted to localStorage
    const [savedIndicators, setSavedIndicators] = useState<Indicator[]>([]);
    const [savedDefinition, setSavedDefinition] = useState("");
    const draftKey = request ? `draft-${request.id}` : null;

    // Restore draft on dialog open
    useEffect(() => {
        if (request && open) {
            setView("review");
            setMode("single");
            setBulkStep("upload");
            setSavedCompetencies([]);
            setEditingCompId(null);
            setName(request.name);
            const od = request.originalData;
            setCategory(od?.category || "TECHNICAL");
            setLevel(od?.level || "JUNIOR");
            setNewPosIndicator("");
            setNewNegIndicator("");
            setBulkRows([]);
            setBulkError("");
            // Restore draft from localStorage
            const key = `draft-${request.id}`;
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    const draft = JSON.parse(stored);
                    const draftIndicators: Indicator[] = draft.indicators || [];
                    const draftDefinition: string =
                        draft.definition !== undefined ? draft.definition : (request.description || "");
                    setIndicators(draftIndicators);
                    setSavedIndicators(draftIndicators);
                    setDefinition(draftDefinition);
                    setSavedDefinition(draftDefinition);
                    const hadChanges =
                        draftIndicators.length > 0 ||
                        draftDefinition !== (request.description || "");
                    if (hadChanges) {
                        toast.info(
                            `Restored draft${draftIndicators.length > 0 ? ` (${draftIndicators.length} indicators)` : ""}`
                        );
                    }
                } else {
                    setIndicators([]);
                    setSavedIndicators([]);
                    setDefinition(request.description || "");
                    setSavedDefinition(request.description || "");
                }
            } catch {
                setIndicators([]);
                setSavedIndicators([]);
                setDefinition(request.description || "");
                setSavedDefinition(request.description || "");
            }
        }
    }, [request, open]);

    // Auto-save definition to localStorage (debounced 1.5 s)
    useEffect(() => {
        if (!draftKey || !open) return;
        const timer = setTimeout(() => {
            try {
                const existing = localStorage.getItem(draftKey);
                const current = existing ? JSON.parse(existing) : {};
                localStorage.setItem(draftKey, JSON.stringify({ ...current, definition }));
                setSavedDefinition(definition);
            } catch {
                /* ignore */
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [definition, draftKey, open]);

    if (!request) return null;

    const od = request.originalData;
    const originalDefinition = request.description || "";

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

    // ── Draft helpers ─────────────────────────────────────────
    const saveDraft = (currentDefinition: string, currentIndicators: Indicator[]) => {
        if (!draftKey) return;
        try {
            localStorage.setItem(
                draftKey,
                JSON.stringify({ definition: currentDefinition, indicators: currentIndicators })
            );
            setSavedIndicators(currentIndicators);
            setSavedDefinition(currentDefinition);
            const parts: string[] = [];
            if (currentIndicators.length > 0)
                parts.push(`${currentIndicators.length} indicator${currentIndicators.length !== 1 ? "s" : ""}`);
            toast.success(`Draft saved${parts.length > 0 ? ` (${parts.join(", ")})` : ""} ✓`);
        } catch {
            toast.error("Failed to save draft");
        }
    };

    const clearDraft = () => {
        if (draftKey) localStorage.removeItem(draftKey);
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

    // ── Bulk CSV parse ────────────────────────────────────────
    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            parseCSV(text);
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const parseCSV = (text: string) => {
        setBulkError("");
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { setBulkError("CSV must have a header row and at least one data row."); return; }
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        const nameIdx = headers.indexOf("name");
        const catIdx = headers.indexOf("category");
        const descIdx = headers.indexOf("description");
        if (nameIdx === -1) { setBulkError("CSV must have a 'name' column."); return; }
        const rows = lines.slice(1).map(line => {
            const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
            return {
                name: cols[nameIdx] || "",
                category: catIdx !== -1 ? (cols[catIdx] || "TECHNICAL").toUpperCase() : "TECHNICAL",
                description: descIdx !== -1 ? (cols[descIdx] || "") : "",
            };
        }).filter(r => r.name);
        if (rows.length === 0) { setBulkError("No valid rows found."); return; }
        setBulkRows(rows);
    };

    // ── Bulk: Step 1 — Save competencies ─────────────────────
    const handleSaveCompetencies = async () => {
        if (bulkRows.length === 0) { toast.error("Upload a CSV first"); return; }
        setIsProcessing(true);
        const created: SavedCompetency[] = [];
        const failedNames: string[] = [];
        try {
            for (const row of bulkRows) {
                try {
                    const res = await fetch("/api/admin/competencies", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: row.name,
                            category: row.category,
                            description: row.description,
                            allowedLevels: ["JUNIOR", "MIDDLE", "SENIOR", "EXPERT"],
                        }),
                    });
                    if (res.ok) {
                        const c = await res.json();
                        created.push({ id: c.id, name: row.name, category: row.category, description: row.description });
                    } else {
                        failedNames.push(row.name);
                    }
                } catch {
                    failedNames.push(row.name);
                }
            }
            if (created.length === 0) throw new Error("All competency creations failed");
            setSavedCompetencies(created);
            setBulkStep("review");
            if (failedNames.length > 0) {
                toast.warning(
                    `${created.length} saved, ${failedNames.length} failed${failedNames.length <= 3 ? ": " + failedNames.join(", ") : ""}`
                );
            } else {
                toast.success(`${created.length} competencies saved — review before approving`);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save competencies");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Bulk: Step 2 — Delete a competency ───────────────────
    const handleDeleteBulkCompetency = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/competencies/${id}`, { method: "DELETE" });
            if (res.ok || res.status === 204) {
                setSavedCompetencies(prev => prev.filter(c => c.id !== id));
                if (editingCompId === id) setEditingCompId(null);
                toast.success("Competency removed");
            } else {
                toast.error("Failed to delete competency");
            }
        } catch {
            toast.error("Failed to delete competency");
        } finally {
            setDeletingId(null);
        }
    };

    // ── Bulk: Step 2 — Edit a competency ─────────────────────
    const startEditComp = (comp: SavedCompetency) => {
        setEditingCompId(comp.id);
        setEditComp({ name: comp.name, category: comp.category, description: comp.description });
    };

    const handleUpdateBulkCompetency = async (id: string) => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/competencies/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editComp.name, category: editComp.category, description: editComp.description }),
            });
            if (res.ok) {
                setSavedCompetencies(prev =>
                    prev.map(c => c.id === id ? { ...c, ...editComp } : c)
                );
                setEditingCompId(null);
                toast.success("Competency updated");
            } else {
                toast.error("Failed to update competency");
            }
        } catch {
            toast.error("Failed to update competency");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Bulk: Step 2 — Approve ───────────────────────────────
    const handleBulkApprove = async () => {
        if (savedCompetencies.length === 0) { toast.error("No competencies to approve"); return; }
        setIsProcessing(true);
        try {
            const approveRes = await fetch(`/api/admin/competency-requests/${request!.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED", competencyId: savedCompetencies[0].id }),
            });
            if (!approveRes.ok) throw new Error("Failed to approve request");
            clearDraft();
            toast.success(`Request approved — ${savedCompetencies.length} competencies assigned to user ✓`);
            onOpenChange(false);
            onProcessed();
        } catch (err: any) {
            toast.error(err.message || "Approval failed");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Single mode: Approve & Create ────────────────────────
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

            // 2. Save indicators (best-effort)
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

            // 3. Approve request & link competency → assigns to user's career data
            const approveRes = await fetch(`/api/admin/competency-requests/${request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED", competencyId: createdComp.id }),
            });
            if (!approveRes.ok) throw new Error("Failed to approve request");

            clearDraft();
            toast.success("Competency created and assigned to user ✓");
            onOpenChange(false);
            onProcessed();
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Template download ─────────────────────────────────────
    const downloadTemplate = () => {
        const rows = [
            ["name", "category", "description"],
            ["Strategic Planning", "LEADERSHIP", "Ability to create and execute long-term organizational strategies"],
            ["Data Analysis", "TECHNICAL", "Ability to interpret and derive insights from complex datasets"],
            ["Stakeholder Management", "BEHAVIORAL", "Skill in managing relationships with key stakeholders"],
        ];
        const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "competencies-template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const positiveIndicators = indicators.filter(i => i.type === "POSITIVE");
    const negativeIndicators = indicators.filter(i => i.type === "NEGATIVE");
    const isDraftSaved =
        indicators.length > 0 &&
        JSON.stringify(indicators) === JSON.stringify(savedIndicators);
    const definitionAutoSaved = definition === savedDefinition && definition !== originalDefinition;
    const definitionPendingSave = definition !== savedDefinition;

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
                                    <div className="flex items-center gap-2">
                                        {mode === "single" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5 text-xs"
                                                onClick={handleAIGenerate}
                                                disabled={isGenerating || isProcessing}
                                            >
                                                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                                                {isGenerating ? "Generating..." : "AI Generate"}
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant={mode === "bulk" ? "default" : "outline"}
                                            className={mode === "bulk"
                                                ? "bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs"
                                                : "border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1.5 text-xs"}
                                            onClick={() => {
                                                setMode(m => m === "bulk" ? "single" : "bulk");
                                                setBulkRows([]);
                                                setBulkError("");
                                                setBulkStep("upload");
                                                setSavedCompetencies([]);
                                                setEditingCompId(null);
                                            }}
                                            disabled={isProcessing}
                                        >
                                            {mode === "bulk" ? <X className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                                            {mode === "bulk" ? "Single Mode" : "Bulk Upload"}
                                        </Button>
                                    </div>
                                </div>

                                {/* ── Bulk Upload Mode ── */}
                                {mode === "bulk" && (
                                    <div className="space-y-4">

                                        {/* Step 1: Upload & preview */}
                                        {bulkStep === "upload" && (<>
                                            <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center space-y-3">
                                                <FileSpreadsheet className="w-8 h-8 text-indigo-400 mx-auto" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Upload a CSV file</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Required: <code className="bg-gray-100 px-1 rounded">name</code>&nbsp;
                                                        Optional: <code className="bg-gray-100 px-1 rounded">category</code>,{" "}
                                                        <code className="bg-gray-100 px-1 rounded">description</code>
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                                    <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                                                        <Upload className="w-3.5 h-3.5" />
                                                        Choose CSV File
                                                        <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVUpload} />
                                                    </label>
                                                    <button
                                                        onClick={downloadTemplate}
                                                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 underline underline-offset-2 transition-colors"
                                                        type="button"
                                                    >
                                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                                        Download Template
                                                    </button>
                                                </div>
                                            </div>

                                            {bulkError && (
                                                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{bulkError}</p>
                                            )}

                                            {bulkRows.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-gray-600">{bulkRows.length} competencies ready to save:</p>
                                                    <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                                                        {bulkRows.map((row, i) => (
                                                            <div key={i} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-medium text-gray-900 truncate">{row.name}</p>
                                                                    {row.description && (
                                                                        <p className="text-[10px] text-gray-500 truncate">{row.description}</p>
                                                                    )}
                                                                </div>
                                                                <Badge variant="outline" className="text-[9px] ml-2 shrink-0 uppercase">{row.category}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

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
                                                    onClick={handleSaveCompetencies}
                                                    disabled={isProcessing || bulkRows.length === 0}
                                                    className="bg-indigo-600 hover:bg-indigo-700"
                                                >
                                                    {isProcessing
                                                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        : <Save className="w-4 h-4 mr-2" />}
                                                    Save {bulkRows.length > 0 ? `${bulkRows.length} ` : ""}Competencies
                                                </Button>
                                            </div>
                                        </>)}

                                        {/* Step 2: Review saved competencies */}
                                        {bulkStep === "review" && (<>
                                            <div className="flex items-center gap-2 pb-1">
                                                <button
                                                    onClick={() => setBulkStep("upload")}
                                                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                                                    type="button"
                                                >
                                                    <ChevronLeft className="w-3.5 h-3.5" />
                                                    Back to upload
                                                </button>
                                                <span className="text-xs text-gray-300">|</span>
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {savedCompetencies.length} competencies saved
                                                    <span className="ml-1 text-green-600 font-normal">— review &amp; edit before approving</span>
                                                </span>
                                            </div>

                                            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                                                {savedCompetencies.map((comp) => (
                                                    <div key={comp.id} className="p-3 hover:bg-gray-50/70">
                                                        {editingCompId === comp.id ? (
                                                            /* Inline edit form */
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="col-span-2 space-y-0.5">
                                                                        <Label className="text-[10px] text-gray-500">Name</Label>
                                                                        <Input
                                                                            value={editComp.name}
                                                                            onChange={e => setEditComp(p => ({ ...p, name: e.target.value }))}
                                                                            className="h-7 text-xs"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <Label className="text-[10px] text-gray-500">Category</Label>
                                                                        <Select
                                                                            value={editComp.category}
                                                                            onValueChange={v => setEditComp(p => ({ ...p, category: v }))}
                                                                        >
                                                                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {COMPETENCY_CATEGORY_OPTIONS.map(o => (
                                                                                    <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="col-span-2 space-y-0.5">
                                                                        <Label className="text-[10px] text-gray-500">Description</Label>
                                                                        <Textarea
                                                                            value={editComp.description}
                                                                            onChange={e => setEditComp(p => ({ ...p, description: e.target.value }))}
                                                                            className="text-xs min-h-[56px] resize-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 text-xs px-2"
                                                                        onClick={() => setEditingCompId(null)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-6 text-xs px-2 bg-indigo-600 hover:bg-indigo-700"
                                                                        onClick={() => handleUpdateBulkCompetency(comp.id)}
                                                                        disabled={isProcessing}
                                                                    >
                                                                        {isProcessing && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                                                        Save
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Read view */
                                                            <div className="flex items-start gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="text-xs font-semibold text-gray-900">{comp.name}</p>
                                                                        <Badge variant="outline" className="text-[9px] uppercase shrink-0">{comp.category}</Badge>
                                                                    </div>
                                                                    {comp.description && (
                                                                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{comp.description}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                                                    <button
                                                                        onClick={() => startEditComp(comp)}
                                                                        className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteBulkCompetency(comp.id)}
                                                                        disabled={deletingId === comp.id}
                                                                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-50"
                                                                        title="Delete"
                                                                    >
                                                                        {deletingId === comp.id
                                                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                            : <Trash2 className="w-3 h-3" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {savedCompetencies.length === 0 && (
                                                    <div className="py-6 text-center text-xs text-gray-400">All competencies removed</div>
                                                )}
                                            </div>

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
                                                    onClick={handleBulkApprove}
                                                    disabled={isProcessing || savedCompetencies.length === 0}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {isProcessing
                                                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                                    Approve &amp; Assign to User
                                                </Button>
                                            </div>
                                        </>)}
                                    </div>
                                )}

                                {/* ── Single Mode ── */}
                                {mode === "single" && (<>

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
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Definition</Label>
                                            {definitionPendingSave && (
                                                <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5">
                                                    auto-saving...
                                                </span>
                                            )}
                                            {!definitionPendingSave && definitionAutoSaved && (
                                                <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 rounded px-1.5 py-0.5">
                                                    draft saved
                                                </span>
                                            )}
                                        </div>
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
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-red-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Indicators ({indicators.length})
                                            </span>
                                            {isDraftSaved && (
                                                <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 rounded px-1.5 py-0.5">draft saved</span>
                                            )}
                                        </div>
                                        {indicators.length > 0 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs px-2 border-amber-200 text-amber-700 hover:bg-amber-50 gap-1"
                                                onClick={() => saveDraft(definition, indicators)}
                                                disabled={isProcessing}
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                Save Draft
                                            </Button>
                                        )}
                                    </div>

                                    {/* Positive */}
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] font-semibold text-green-700">✅ Positive Indicators</p>
                                        {positiveIndicators.map((ind, i) => (
                                            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-100">
                                                <span className="text-xs text-green-800 flex-1">
                                                    <Badge variant="outline" className="mr-1.5 text-[9px] uppercase border-green-200 bg-green-100/50 text-green-700">{ind.level}</Badge>
                                                    {ind.description}
                                                </span>
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
                                                <span className="text-xs text-red-800 flex-1">
                                                    <Badge variant="outline" className="mr-1.5 text-[9px] uppercase border-red-200 bg-red-100/50 text-red-700">{ind.level}</Badge>
                                                    {ind.description}
                                                </span>
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
                                </>)}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
