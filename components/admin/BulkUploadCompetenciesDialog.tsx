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
import { Upload, FileJson, FileSpreadsheet, Loader2, X, Download } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

const JSON_TEMPLATE = [
    {
        name: "Problem Solving",
        category: "BEHAVIORAL",
        description: "Ability to identify and resolve complex issues",
        indicators: [
            { text: "Identifies root cause of issues", level: "JUNIOR", type: "POSITIVE" },
            { text: "Proposes multiple solutions", level: "MIDDLE", type: "POSITIVE" },
            { text: "Leads problem resolution across teams", level: "SENIOR", type: "POSITIVE" }
        ]
    },
    {
        name: "Technical Communication",
        category: "TECHNICAL",
        description: "Clear communication of technical concepts",
        indicators: []
    }
];

const CSV_TEMPLATE = `name,category,description,indicators
"Problem Solving",BEHAVIORAL,"Ability to identify and resolve complex issues","[{""text"":""Identifies root cause"",""level"":""JUNIOR"",""type"":""POSITIVE""}]"
"Technical Communication",TECHNICAL,"Clear communication of technical concepts",""
"Team Collaboration",BEHAVIORAL,"Works effectively with others to achieve goals",""
`;

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function BulkUploadCompetenciesDialog() {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[] | null>(null);
    const router = useRouter();

    const handleDownloadJsonTemplate = () => {
        const blob = new Blob([JSON.stringify(JSON_TEMPLATE, null, 2)], { type: "application/json" });
        downloadBlob(blob, "competencies-template.json");
        toast.success("JSON template downloaded");
    };

    const handleDownloadCsvTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
        downloadBlob(blob, "competencies-template.csv");
        toast.success("CSV template downloaded");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Basic preview for JSON
            if (selectedFile.type === "application/json") {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const json = JSON.parse(event.target?.result as string);
                        setPreview(Array.isArray(json) ? json.slice(0, 3) : [json]);
                    } catch (err) {
                        toast.error("Invalid JSON file");
                    }
                };
                reader.readAsText(selectedFile);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/admin/competencies/bulk-upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }

            const result = await response.json();
            toast.success(`Successfully uploaded ${result.count} competencies!`);
            setOpen(false);
            setFile(null);
            setPreview(null);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Competencies</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or JSON file containing competency definitions and behavioral indicators.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!file ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 hover:border-red-300 transition-colors bg-gray-50/50">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <Upload className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500">JSON or CSV (max. 5MB)</p>
                            </div>
                            <input
                                type="file"
                                accept=".json,.csv"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="p-4 border rounded-xl bg-white space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        {file.name.endsWith('.json') ? (
                                            <FileJson className="h-5 w-5 text-red-600" />
                                        ) : (
                                            <FileSpreadsheet className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); }}>
                                    <X className="h-4 w-4 text-gray-400" />
                                </Button>
                            </div>

                            {preview && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview (Top 3)</p>
                                    <ScrollArea className="h-24 rounded border bg-gray-50 p-2">
                                        <pre className="text-[10px] text-gray-600">
                                            {JSON.stringify(preview, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg bg-gray-50">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">JSON Format</h4>
                            <p className="text-[10px] text-gray-500 mb-2">Array of objects with name, category, description, and optional indicators.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs h-8 border-gray-200"
                                onClick={handleDownloadJsonTemplate}
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Download JSON Template
                            </Button>
                        </div>
                        <div className="p-3 border rounded-lg bg-gray-50">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">CSV Format</h4>
                            <p className="text-[10px] text-gray-500 mb-2">Columns: name, category, description, indicators (JSON string).</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs h-8 border-gray-200"
                                onClick={handleDownloadCsvTemplate}
                            >
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Download CSV Template
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={uploading}>Cancel</Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Start Upload"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
