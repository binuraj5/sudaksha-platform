"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BulkUploadIndicatorsDialogProps {
    competencyId: string;
}

export function BulkUploadIndicatorsDialog({ competencyId }: BulkUploadIndicatorsDialogProps) {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();

    const downloadTemplate = () => {
        const headers = ["text", "level", "type"];
        const exampleRow = ["Example behavior description", "JUNIOR", "POSITIVE"];
        const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "indicators_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/admin/competencies/${competencyId}/indicators/bulk-upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Upload failed");
            }

            const data = await res.json();
            toast.success(`Successfully uploaded ${data.count} indicators!`);
            router.refresh();
            setOpen(false);
            setFile(null);
        } catch (error: any) {
            toast.error(error.message);
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-blue-600" />
                        Bulk Upload Indicators
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                CSV Template
                            </h4>
                            <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-blue-700 hover:bg-blue-100">
                                <Download className="mr-2 h-4 w-4" />
                                Download Template
                            </Button>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Ensure your CSV has the following columns: <strong>text, level, type</strong>.
                            Levels: JUNIOR, MIDDLE, SENIOR, EXPERT.
                            Types: POSITIVE, NEGATIVE.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Select File (CSV or JSON)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors cursor-pointer relative">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                        {file ? file.name : "Upload a file"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    CSV or JSON files only
                                </p>
                            </div>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".csv,.json"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-600 hover:bg-blue-700">
                        {uploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                        ) : (
                            "Start Upload"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
