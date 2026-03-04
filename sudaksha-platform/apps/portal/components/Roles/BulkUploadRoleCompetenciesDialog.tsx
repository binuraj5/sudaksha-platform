"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, FileJson, CheckCircle2, XCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UploadResult {
    created: number;
    skipped: number;
    errors: number;
    details: { name: string; status: "created" | "skipped" | "error"; reason?: string }[];
}

interface BulkUploadRoleCompetenciesDialogProps {
    roleId: string;
    roleName: string;
    onSuccess?: () => void;
}

const JSON_TEMPLATE = [
    {
        name: "Problem Solving",
        category: "BEHAVIORAL",
        description: "Identifies and resolves complex issues efficiently",
        requiredLevel: "MIDDLE",
        weight: 1.0,
        indicators: [
            { text: "Identifies root cause of issues independently", level: "JUNIOR", type: "POSITIVE" },
            { text: "Struggles to identify root cause without guidance", level: "JUNIOR", type: "NEGATIVE" },
            { text: "Proposes multiple solutions with trade-offs", level: "MIDDLE", type: "POSITIVE" },
            { text: "Escalates problems without attempting resolution", level: "MIDDLE", type: "NEGATIVE" },
            { text: "Leads problem resolution across teams", level: "SENIOR", type: "POSITIVE" },
            { text: "Applies blame rather than resolution strategies", level: "SENIOR", type: "NEGATIVE" },
        ],
    },
    {
        name: "Technical Communication",
        category: "TECHNICAL",
        description: "Communicates technical concepts clearly to diverse audiences",
        requiredLevel: "JUNIOR",
        weight: 0.8,
        indicators: [
            { text: "Documents work clearly for team reference", level: "JUNIOR", type: "POSITIVE" },
            { text: "Uses jargon without considering audience understanding", level: "JUNIOR", type: "NEGATIVE" },
        ],
    },
];

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function BulkUploadRoleCompetenciesDialog({
    roleId,
    roleName,
    onSuccess,
}: BulkUploadRoleCompetenciesDialogProps) {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[] | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const reset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setUploading(false);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) reset();
    };

    const handleFile = useCallback((f: File) => {
        if (!f.name.endsWith(".json") && !f.name.endsWith(".csv")) {
            toast.error("Please upload a JSON or CSV file");
            return;
        }
        setFile(f);
        setResult(null);

        if (f.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target?.result as string);
                    setPreview(Array.isArray(parsed) ? parsed.slice(0, 2) : [parsed]);
                } catch {
                    toast.error("Invalid JSON file");
                }
            };
            reader.readAsText(f);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFile(dropped);
        },
        [handleFile]
    );

    const handleDownloadJsonTemplate = () => {
        downloadBlob(
            new Blob([JSON.stringify(JSON_TEMPLATE, null, 2)], { type: "application/json" }),
            `role_competencies_template_${roleName.replace(/\s+/g, "_")}.json`
        );
        toast.success("JSON template downloaded");
    };

    const handleDownloadCsvTemplate = () => {
        const csv = [
            "name,category,description,requiredLevel,weight,indicators",
            `"Problem Solving",BEHAVIORAL,"Identifies and resolves complex issues",MIDDLE,1.0,"[{""text"":""Identifies root cause"",""level"":""JUNIOR"",""type"":""POSITIVE""},{""text"":""Avoids accountability"",""level"":""JUNIOR"",""type"":""NEGATIVE""}]"`,
            `"Technical Communication",TECHNICAL,"Communicates technical concepts clearly",JUNIOR,0.8,""`,
        ].join("\n");
        downloadBlob(new Blob([csv], { type: "text/csv" }), `role_competencies_template.csv`);
        toast.success("CSV template downloaded");
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            let payload: any[];

            if (file.name.endsWith(".json")) {
                const text = await file.text();
                payload = JSON.parse(text);
            } else {
                // Parse CSV
                const text = await file.text();
                const lines = text.trim().split("\n");
                const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
                payload = lines.slice(1).map((line) => {
                    // Handle CSV with quoted JSON in indicators column
                    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        const val = (cols[i] || "").trim().replace(/^"|"$/g, "");
                        if (h === "indicators") {
                            try {
                                obj[h] = val ? JSON.parse(val.replace(/""/g, '"')) : [];
                            } catch {
                                obj[h] = [];
                            }
                        } else if (h === "weight") {
                            obj[h] = parseFloat(val) || 1.0;
                        } else {
                            obj[h] = val;
                        }
                    });
                    return obj;
                });
            }

            const res = await fetch(`/api/admin/roles/${roleId}/competencies/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Upload failed");
                return;
            }

            setResult(data);
            if (data.created > 0) {
                toast.success(`${data.created} competency(s) mapped to ${roleName}`);
                onSuccess?.();
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Upload Competencies
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-blue-600" />
                        Bulk Upload Competencies
                    </DialogTitle>
                    <DialogDescription>
                        Upload competencies with positive &amp; negative behavioral indicators. They will be automatically mapped to <strong>{roleName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Templates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border rounded-lg bg-gray-50">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">JSON Format</p>
                            <p className="text-[10px] text-gray-500 mb-2">Array with name, category, indicators (POSITIVE/NEGATIVE per level).</p>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleDownloadJsonTemplate}>
                                <Download className="mr-1.5 h-3.5 w-3.5" /> Download JSON Template
                            </Button>
                        </div>
                        <div className="p-3 border rounded-lg bg-gray-50">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CSV Format</p>
                            <p className="text-[10px] text-gray-500 mb-2">Columns: name, category, description, requiredLevel, weight, indicators (JSON string).</p>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleDownloadCsvTemplate}>
                                <Download className="mr-1.5 h-3.5 w-3.5" /> Download CSV Template
                            </Button>
                        </div>
                    </div>

                    {!result && (
                        <>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${dragActive ? "border-blue-500 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400"
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,.csv"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                                />
                                {file ? (
                                    <div className="space-y-1">
                                        {file.name.endsWith(".json") ? (
                                            <FileJson className="mx-auto h-8 w-8 text-green-600" />
                                        ) : (
                                            <FileSpreadsheet className="mx-auto h-8 w-8 text-green-600" />
                                        )}
                                        <p className="font-medium text-green-800">{file.name}</p>
                                        <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="text-sm text-gray-600">Drag &amp; drop or <span className="text-blue-600 font-medium">browse</span></p>
                                        <p className="text-xs text-gray-400">JSON or CSV files</p>
                                    </div>
                                )}
                            </div>

                            {preview && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview (first 2)</p>
                                    <ScrollArea className="h-24 rounded border bg-gray-50 p-2">
                                        <pre className="text-[10px] text-gray-600">{JSON.stringify(preview, null, 2)}</pre>
                                    </ScrollArea>
                                </div>
                            )}

                            {file && (
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => { setFile(null); setPreview(null); }}>
                                        <X className="mr-2 h-4 w-4" /> Remove File
                                    </Button>
                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleUpload} disabled={uploading}>
                                        {uploading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...</> : <><Upload className="mr-2 h-4 w-4" /> Upload &amp; Map</>}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    {result && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                                    <div className="text-2xl font-bold text-green-700">{result.created}</div>
                                    <div className="text-xs text-green-600">Mapped</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <div className="text-2xl font-bold text-amber-700">{result.skipped}</div>
                                    <div className="text-xs text-amber-600">Skipped</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                                    <div className="text-2xl font-bold text-red-700">{result.errors}</div>
                                    <div className="text-xs text-red-600">Errors</div>
                                </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto rounded-lg border">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Competency</th>
                                            <th className="px-3 py-2 text-left">Status</th>
                                            <th className="px-3 py-2 text-left">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {result.details.map((d, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-3 py-1.5 font-medium">{d.name}</td>
                                                <td className="px-3 py-1.5">
                                                    {d.status === "created" && <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> Mapped</span>}
                                                    {d.status === "skipped" && <span className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3 w-3" /> Skipped</span>}
                                                    {d.status === "error" && <span className="inline-flex items-center gap-1 text-red-700"><XCircle className="h-3 w-3" /> Error</span>}
                                                </td>
                                                <td className="px-3 py-1.5 text-gray-500">{d.reason || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Button variant="outline" className="w-full" onClick={reset}>Upload Another File</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
