"use client";

import { useState, useRef, useCallback } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UploadResult {
    summary: { total: number; created: number; skipped: number; errors: number };
    details: { row: number; name: string; status: "created" | "skipped" | "error"; reason?: string }[];
}

export function BulkUploadRolesDialog({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const reset = () => {
        setSelectedFile(null);
        setResult(null);
        setUploading(false);
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) reset();
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await fetch(`/api/clients/${clientId}/roles/bulk-upload`);
            if (!res.ok) throw new Error("Failed to download template");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "roles_bulk_upload_template.csv";
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Template downloaded");
        } catch {
            toast.error("Failed to download template");
        }
    };

    const handleFile = useCallback((file: File) => {
        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file");
            return;
        }
        setSelectedFile(file);
        setResult(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const res = await fetch(`/api/clients/${clientId}/roles/bulk-upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Upload failed");
                setUploading(false);
                return;
            }
            setResult(data);
            if (data.summary.created > 0) {
                toast.success(`${data.summary.created} role(s) created successfully`);
                router.refresh();
            }
        } catch {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[620px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Roles</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to create multiple roles at once. Download the template for the correct format.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Template Download */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">CSV Template</p>
                                <p className="text-xs text-blue-600">Includes all columns with example rows</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                    </div>

                    {/* Column Reference */}
                    <details className="text-xs text-gray-500 border rounded-lg p-3">
                        <summary className="cursor-pointer font-medium text-gray-700 text-sm">Column Reference</summary>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                            <div><span className="font-mono text-red-600">name*</span> — Role name (required)</div>
                            <div><span className="font-mono">description</span> — Role description</div>
                            <div><span className="font-mono">overallLevel</span> — JUNIOR / MIDDLE / SENIOR / EXPERT</div>
                            <div><span className="font-mono">department</span> — Department name</div>
                            <div><span className="font-mono">industries</span> — Semicolon-separated list</div>
                            <div><span className="font-mono">keyResponsibilities</span> — Semicolon-separated</div>
                            <div><span className="font-mono">requiredExperience</span> — Experience needed</div>
                            <div><span className="font-mono">educationRequired</span> — Education needed</div>
                        </div>
                    </details>

                    {/* Drop Zone */}
                    {!result && (
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                dragActive
                                    ? "border-indigo-500 bg-indigo-50"
                                    : selectedFile
                                    ? "border-green-400 bg-green-50"
                                    : "border-gray-300 hover:border-gray-400"
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFile(f);
                                }}
                            />
                            {selectedFile ? (
                                <div className="space-y-1">
                                    <FileSpreadsheet className="mx-auto h-8 w-8 text-green-600" />
                                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                                    <p className="text-xs text-green-600">
                                        {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        Drag & drop your CSV file here, or <span className="text-indigo-600 font-medium">browse</span>
                                    </p>
                                    <p className="text-xs text-gray-400">Only .csv files are supported</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Button */}
                    {selectedFile && !result && (
                        <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                            {uploading ? (
                                <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Processing...</>
                            ) : (
                                <><Upload className="mr-2 h-4 w-4" /> Upload &amp; Create Roles</>
                            )}
                        </Button>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                                    <div className="text-2xl font-bold text-green-700">{result.summary.created}</div>
                                    <div className="text-xs text-green-600">Created</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <div className="text-2xl font-bold text-amber-700">{result.summary.skipped}</div>
                                    <div className="text-xs text-amber-600">Skipped</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                                    <div className="text-2xl font-bold text-red-700">{result.summary.errors}</div>
                                    <div className="text-xs text-red-600">Errors</div>
                                </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto rounded-lg border">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Row</th>
                                            <th className="px-3 py-2 text-left">Name</th>
                                            <th className="px-3 py-2 text-left">Status</th>
                                            <th className="px-3 py-2 text-left">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {result.details.map((d, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-3 py-1.5 text-gray-500">{d.row}</td>
                                                <td className="px-3 py-1.5 font-medium">{d.name}</td>
                                                <td className="px-3 py-1.5">
                                                    {d.status === "created" && <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="h-3 w-3" /> Created</span>}
                                                    {d.status === "skipped" && <span className="inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3 w-3" /> Skipped</span>}
                                                    {d.status === "error" && <span className="inline-flex items-center gap-1 text-red-700"><XCircle className="h-3 w-3" /> Error</span>}
                                                </td>
                                                <td className="px-3 py-1.5 text-gray-500">{d.reason || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <Button variant="outline" className="w-full" onClick={reset}>
                                Upload Another File
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
