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
        <div className="max-w-3xl mx-auto py-6">
            {/* Step Progress */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="flex items-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                            step === s ? "bg-primary text-primary-foreground ring-2 ring-primary/30" :
                            step > s ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                        }`}>
                            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </div>
                        {s < 4 && <div className={`w-16 h-0.5 mx-2 rounded-full ${step > s ? "bg-green-600" : "bg-muted"}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Download */}
            {step === 1 && (
                <Card className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto">
                            <Download className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold tracking-tight text-foreground">Download Template</h2>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Get the CSV template to ensure your questions import correctly.</p>
                        </div>
                        <Button variant="outline" className="h-10 px-6 rounded-lg border-border gap-2" asChild>
                            <a href="/templates/questions-template.csv" download>
                                <Download className="w-4 h-4" /> Download CSV Template
                            </a>
                        </Button>
                        <div className="pt-2">
                            <Button className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2" onClick={() => setStep(2)}>
                                Next Step <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Upload */}
            {step === 2 && (
                <Card className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <CardContent className="p-8 space-y-6">
                        <div className="text-center space-y-1">
                            <h2 className="text-lg font-bold tracking-tight text-foreground">Upload Your File</h2>
                            <p className="text-sm text-muted-foreground">Drag & drop your filled CSV template here.</p>
                        </div>

                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                                isDragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-muted-foreground/30"
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="space-y-3">
                                <div className="w-14 h-14 bg-card border border-border rounded-lg flex items-center justify-center mx-auto text-primary">
                                    <Upload className="w-7 h-7" />
                                </div>
                                {file ? (
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Select a CSV file to continue</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-border shrink-0" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
                                onClick={handleUpload}
                                disabled={!file || loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validate & Review"}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Review */}
            {step === 3 && results && (
                <Card className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-tight text-foreground">Review Import</h2>
                            <div className="flex gap-2">
                                <Badge className="bg-green-600 text-white">{results.valid.length} Valid</Badge>
                                <Badge variant={results.invalid.length > 0 ? "destructive" : "secondary"}>
                                    {results.invalid.length} Errors
                                </Badge>
                            </div>
                        </div>

                        <ScrollArea className="h-[350px] rounded-lg border border-border bg-muted/20 p-4">
                            {results.invalid.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="p-3 bg-destructive/10 rounded-lg flex items-center gap-3 text-destructive">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p className="text-sm font-medium">Errors found! Fix the following rows in your CSV and re-upload.</p>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {results.invalid.map((inv, idx) => (
                                            <div key={idx} className="py-3 flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-semibold text-muted-foreground text-sm shrink-0">
                                                    {inv.row}
                                                </div>
                                                <div className="space-y-0.5">
                                                    {inv.errors.map((err, ei) => (
                                                        <p key={ei} className="text-xs text-destructive">{err}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-green-500/10 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-400">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        <p className="text-sm font-medium">All questions are valid! Ready to import.</p>
                                    </div>
                                    <div className="space-y-2">
                                        {results.valid.map((v, idx) => (
                                            <div key={idx} className="p-3 rounded-lg bg-card border border-border flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                                                    <p className="text-sm font-medium truncate">{v.questionText}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs shrink-0">{v.questionType}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ScrollArea>

                        <div className="flex gap-3">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-border shrink-0" onClick={() => setStep(2)}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            {results.invalid.length > 0 ? (
                                <Button className="flex-1 h-10 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium gap-2" onClick={() => setStep(2)}>
                                    Fix & Try Again <Upload className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1 h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
                                    onClick={handleImport}
                                    disabled={importing}
                                >
                                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Import"}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
                <Card className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <CardContent className="p-10 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">Success!</h2>
                            <p className="text-sm text-muted-foreground">
                                Successfully imported <span className="font-semibold text-foreground">{results?.valid.length}</span> questions.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Button className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2" onClick={onComplete}>
                                View Questions <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
