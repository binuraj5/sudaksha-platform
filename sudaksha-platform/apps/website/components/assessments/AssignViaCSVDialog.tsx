"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DownloadCloud, UploadCloud, AlertCircle } from "lucide-react";

interface AssignViaCSVDialogProps {
    open: boolean;
    onClose: () => void;
    assessmentModelId: string;
    orgSlug: string;
}

export function AssignViaCSVDialog({
    open,
    onClose,
    assessmentModelId,
    orgSlug
}: AssignViaCSVDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any>(null);

    async function handleUpload() {
        if (!file) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("assessmentModelId", assessmentModelId);
        if (dueDate) formData.append("dueDate", dueDate);

        try {
            const res = await fetch(`/api/org/${orgSlug}/assessments/assign-csv`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            setResults(data);
        } catch (e) {
            console.error(e);
            setResults({ error: "A network error occurred while uploading. Please try again." });
        } finally {
            setUploading(false);
        }
    }

    // Generate a dynamic local template for admins to reference
    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,enrollmentNumber,email\nSTU001,john@example.com\nSTU002,jane@example.com\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sudaksha_assignment_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="bg-gray-50 border-b p-6">
                    <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-indigo-600" /> Convert CSV to Assignments
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {!results ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-blue-800">
                                    <strong className="block mb-1">CSV Formatting Guidelines</strong>
                                    Include valid identifying columns for matching students: <code>enrollmentNumber</code> OR <code>email</code>. Additional columns are ignored.

                                    <Button variant="link" className="p-0 h-auto text-indigo-600 font-bold flex items-center gap-1 mt-2" onClick={handleDownloadTemplate}>
                                        <DownloadCloud className="w-4 h-4" /> Download Blank Template
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Select Document Data (.csv)</Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 transition-colors text-center cursor-pointer relative group">
                                    <Input
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        id="csv-upload"
                                    />
                                    <UploadCloud className="w-8 h-8 text-indigo-300 mx-auto mb-3 group-hover:text-indigo-400 transition-colors" />
                                    {file ? (
                                        <div className="text-sm font-medium text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-full">{file.name}</div>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            <span className="text-indigo-600 font-semibold">Click to browse</span> or drag and drop your CSV file here
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Optional Deadline Date</Label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="rounded-xl bg-gray-50 h-11 border-gray-200"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="ghost" onClick={onClose} className="rounded-xl font-semibold">Cancel</Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 gap-2 px-6"
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing Runtime...
                                        </span>
                                    ) : 'Queue Batch Upload'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {results.error ? (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium">
                                    {results.error}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                                            <div className="text-3xl font-black text-gray-900">{results.total}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Found Rows</div>
                                        </div>
                                        <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100 shrink-0">
                                            <div className="text-3xl font-black text-emerald-600">{results.assigned}</div>
                                            <div className="text-xs font-bold text-emerald-600/80 uppercase tracking-wider mt-1">Valid Assigned</div>
                                        </div>
                                        <div className={`p-4 rounded-xl text-center border ${results.failed > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
                                            <div className={`text-3xl font-black ${results.failed > 0 ? "text-red-600" : "text-gray-400"}`}>{results.failed}</div>
                                            <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${results.failed > 0 ? "text-red-600/80" : "text-gray-400"}`}>Failed Skips</div>
                                        </div>
                                    </div>

                                    {results.errors && results.errors.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-sm font-bold text-gray-900 border-b pb-2">Diagnostic Error Logs ({results.errors.length})</div>
                                            <div className="max-h-48 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-xs font-mono">
                                                {results.errors.map((err: string, i: number) => (
                                                    <div key={i} className="text-red-600 flex gap-2">
                                                        <span className="text-gray-400 shrink-0">[{i + 1}]</span> {err}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={() => { setResults(null); onClose(); }} className="rounded-xl px-8 font-bold bg-gray-900 text-white hover:bg-black">
                                    Finish Diagnostics
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
