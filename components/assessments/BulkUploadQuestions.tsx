"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    Download,
    Upload,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    FileSpreadsheet,
    Loader2,
    X,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvalidRow {
    row: number;
    errors: string[];
}

interface BulkUploadProps {
    componentId: string;
    onComplete: () => void;
}

export const BulkUploadQuestions: React.FC<BulkUploadProps> = ({ componentId, onComplete }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ valid: any[], invalid: InvalidRow[] } | null>(null);
    const [importing, setImporting] = useState(false);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        multiple: false
    });

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`/api/assessments/admin/components/${componentId}/questions/bulk`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data);
                setStep(3);
            } else {
                toast.error("Failed to upload file");
            }
        } catch (error) {
            toast.error("An error occurred during upload");
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file || !results || results.invalid.length > 0) return;

        setImporting(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("confirm", "true");

        try {
            const res = await fetch(`/api/assessments/admin/components/${componentId}/questions/bulk`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                toast.success("Import successful!");
                setStep(4);
            } else {
                toast.error("Import failed");
            }
        } catch (error) {
            toast.error("An error occurred during import");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Step Progress */}
            <div className="flex items-center justify-between mb-12 px-12">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === s ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
                                step > s ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                            }`}>
                            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                        </div>
                        {s < 4 && <div className={`w-20 h-1 mx-2 rounded-full ${step > s ? "bg-green-500" : "bg-gray-200"}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Download */}
            {step === 1 && (
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 text-center space-y-8">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
                            <Download className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tight text-gray-900">Download Template</h2>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">Get the correctly structured CSV template to ensure your questions import perfectly.</p>
                        </div>
                        <Button
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-2 text-lg font-bold gap-3 hover:bg-slate-50"
                            asChild
                        >
                            <a href="/templates/questions-template.csv" download>
                                <Download className="w-5 h-5" /> Download CSV Template
                            </a>
                        </Button>
                        <div className="pt-4">
                            <Button className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-xl shadow-indigo-100 gap-3" onClick={() => setStep(2)}>
                                Next Step <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Upload */}
            {step === 2 && (
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-12 space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tight text-gray-900">Upload Your File</h2>
                            <p className="text-gray-500 font-medium">Drag & drop your filled CSV template here.</p>
                        </div>

                        <div
                            {...getRootProps()}
                            className={`border-4 border-dashed rounded-[2rem] p-16 text-center transition-all cursor-pointer ${isDragActive ? "border-indigo-500 bg-indigo-50/50 scale-102" : "border-slate-100 bg-slate-50/30 hover:border-slate-200"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-white shadow-xl rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                                    <Upload className="w-10 h-10" />
                                </div>
                                {file ? (
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-400 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 font-bold">Select a CSV file to continue</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" className="h-16 w-16 p-0 rounded-2xl border-2" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                className="flex-1 h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-xl shadow-indigo-100 gap-3"
                                onClick={handleUpload}
                                disabled={!file || loading}
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Validate & Review"}
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && results && (
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black italic tracking-tight text-gray-900">Review Import</h2>
                            <div className="flex gap-2">
                                <Badge className="bg-green-500 px-4 py-1 rounded-full">{results.valid.length} Valid</Badge>
                                <Badge className={`${results.invalid.length > 0 ? "bg-red-500" : "bg-gray-200 text-gray-500"} px-4 py-1 rounded-full`}>
                                    {results.invalid.length} Errors
                                </Badge>
                            </div>
                        </div>

                        <ScrollArea className="h-[400px] rounded-3xl border-2 border-slate-100 bg-white p-6">
                            {results.invalid.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-600">
                                        <AlertCircle className="w-6 h-6" />
                                        <p className="font-bold">Errors found! Please fix the following rows in your CSV and re-upload.</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {results.invalid.map((inv, idx) => (
                                            <div key={idx} className="py-4 flex gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 shrink-0">
                                                    {inv.row}
                                                </div>
                                                <div className="space-y-1">
                                                    {inv.errors.map((err, ei) => (
                                                        <p key={ei} className="text-sm font-bold text-red-500">{err}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-3 text-green-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <p className="font-bold">All questions are valid! Ready to import.</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {results.valid.map((v, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                                                    <p className="text-sm font-bold truncate max-w-[400px]">{v.questionText}</p>
                                                </div>
                                                <Badge variant="outline" className="bg-white">{v.questionType}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <div className="flex gap-4">
                            <Button variant="ghost" className="h-16 w-16 p-0 rounded-2xl border-2" onClick={() => setStep(2)}>
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            {results.invalid.length > 0 ? (
                                <Button
                                    className="flex-1 h-16 rounded-[1.5rem] bg-slate-800 hover:bg-slate-900 text-xl font-black italic shadow-xl gap-3"
                                    onClick={() => setStep(2)}
                                >
                                    Fix & Try Again <Upload className="w-6 h-6" />
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1 h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-xl shadow-indigo-100 gap-3"
                                    onClick={handleImport}
                                    disabled={importing}
                                >
                                    {importing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Import"}
                                    <ArrowRight className="w-6 h-6" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-16 text-center space-y-8">
                        <div className="w-32 h-32 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-100">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tight text-gray-900">Success!</h2>
                            <p className="text-gray-500 font-medium text-lg">
                                Successfully imported <span className="text-indigo-600 font-black">{results?.valid.length}</span> questions.
                            </p>
                        </div>
                        <div className="pt-8">
                            <Button
                                className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-xl font-black italic shadow-xl shadow-indigo-100 gap-3"
                                onClick={onComplete}
                            >
                                View Questions <Eye className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
