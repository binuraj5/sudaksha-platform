"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getLabelsForTenant } from "@/lib/tenant-labels";
import type { TenantType } from "@/lib/tenant-labels";

function parseCSV(text: string) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    return lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
        return obj;
    });
}

export function BulkUploadDepartmentsDialog({
    clientId,
    tenantType,
    onSuccess,
}: {
    clientId: string;
    tenantType?: "CORPORATE" | "INSTITUTION" | "SYSTEM";
    onSuccess?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<{ name: string; code?: string; description?: string }[]>([]);
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const labels = getLabelsForTenant((tenantType || "CORPORATE") as TenantType);
    const isInstitution = tenantType === "INSTITUTION";

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const f = e.target.files[0];
        setFile(f);
        const text = await f.text();
        const data = parseCSV(text);
        const mapped = data.map((row: Record<string, string>) => ({
            name: row.name || row.faculty_name || row.department_name || "",
            code: row.code || row.faculty_code || row.department_code || undefined,
            description: row.description || undefined,
        })).filter((r) => r.name);
        setParsedData(mapped);
        setStep(2);
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            toast.error("No valid rows to upload");
            return;
        }
        setUploading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/departments/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ departments: parsedData }),
            });
            const result = await res.json();
            if (res.ok) {
                const count = result.count ?? 0;
                toast.success(`Imported ${count} ${labels.orgUnitPlural.toLowerCase()}`);
                setOpen(false);
                setStep(1);
                setParsedData([]);
                setFile(null);
                router.refresh();
                onSuccess?.();
            } else {
                toast.error(result.error || "Upload failed");
            }
        } catch (e) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = isInstitution ? "name,code,description" : "name,code,description";
        const sample = isInstitution
            ? "Faculty of Engineering,ENG,Engineering programs\nFaculty of Science,SCI,Science programs"
            : "Engineering,ENG,Engineering department\nHuman Resources,HR,HR department";
        const csvContent = `${headers}\n${sample}`;
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = isInstitution ? "faculty_upload_template.csv" : "department_upload_template.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const reset = () => {
        setStep(1);
        setParsedData([]);
        setFile(null);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Upload {labels.orgUnitPlural} from CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Bulk Upload {labels.orgUnitPlural}</DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="p-4 border border-dashed rounded-lg bg-gray-50 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <label htmlFor="dept-file-upload" className="block text-sm font-medium text-gray-700 cursor-pointer hover:text-indigo-600">
                                <span>Choose CSV file</span>
                                <Input
                                    id="dept-file-upload"
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            CSV columns: <code>name</code>, <code>code</code> (optional), <code>description</code> (optional)
                        </p>
                        <div className="text-center">
                            <Button type="button" variant="link" onClick={downloadTemplate} className="text-sm">
                                Download template
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 py-4">
                        <h3 className="font-medium">Preview ({parsedData.length} rows)</h3>
                        <div className="max-h-64 overflow-auto border rounded text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Code</th>
                                        <th className="p-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 20).map((row, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2">{row.name}</td>
                                            <td className="p-2">{row.code || "—"}</td>
                                            <td className="p-2 truncate max-w-[120px]">{row.description || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {parsedData.length > 20 && (
                            <p className="text-xs text-gray-500">Showing first 20 of {parsedData.length}</p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={reset}>
                                Back
                            </Button>
                            <Button onClick={handleUpload} disabled={uploading}>
                                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Import {parsedData.length} {labels.orgUnitPlural.toLowerCase()}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
