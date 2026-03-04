'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface BulkUploadQuestionsDialogProps {
    componentId: string;
    onSuccess: () => void;
}

export function BulkUploadQuestionsDialog({ componentId, onSuccess }: BulkUploadQuestionsDialogProps) {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<'csv' | 'json'>('csv');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any | null>(null); // Use any for result struct
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: format === 'csv' ? { 'text/csv': ['.csv'] } : { 'application/json': ['.json'] },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            setFile(file);
            setPreview(null); // Reset preview

            const text = await file.text();

            try {
                const response = await fetch(
                    `/api/admin/assessment-components/${componentId}/questions/bulk-upload`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            format,
                            data: format === 'csv' ? text : JSON.parse(text),
                            validateOnly: true
                        })
                    }
                );

                const result = await response.json();
                setPreview(result);
                if (!result.valid && result.errors?.length > 0) {
                    toast.error(`Found ${result.errors.length} validation errors.`);
                } else {
                    toast.success("File validated successfully. Ready to upload.");
                }
            } catch (e: any) {
                toast.error("Error validating file: " + e.message);
            }
        }
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try {
            const text = await file.text();

            const response = await fetch(
                `/api/admin/assessment-components/${componentId}/questions/bulk-upload`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        format,
                        data: format === 'csv' ? text : JSON.parse(text),
                        validateOnly: false
                    })
                }
            );

            const result = await response.json();

            if (result.success) {
                toast.success(`Successfully uploaded ${result.summary.successfulUploads} questions`);
                setOpen(false);
                setFile(null);
                setPreview(null);
                onSuccess();
            } else {
                toast.error('Upload failed with errors');
            }
        } catch (error: any) {
            toast.error('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvTemplate = `question_text,question_type,points,options,correct_answer
"What is 2+2?",MULTIPLE_CHOICE,1,"2|3|4|5",4
"Python is compiled",TRUE_FALSE,1,"True|False",False`;

        const blob = new Blob([csvTemplate], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Upload Questions
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Questions</DialogTitle>
                </DialogHeader>

                <Tabs value={format} onValueChange={(v) => setFormat(v as 'csv' | 'json')}>
                    <TabsList>
                        <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                        <TabsTrigger value="json">JSON Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="csv" className="space-y-4">
                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Template
                            </Button>
                        </div>

                        <div
                            {...getRootProps()}
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <input {...getInputProps()} />
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-gray-600">Drop CSV file here or click to browse</p>
                            {file && <p className="mt-2 text-sm font-semibold text-blue-600">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="json" className="space-y-4">
                        <div
                            {...getRootProps()}
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <input {...getInputProps()} />
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-gray-600">Drop JSON file here or click to browse</p>
                            {file && <p className="mt-2 text-sm font-semibold text-blue-600">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>}
                        </div>
                    </TabsContent>
                </Tabs>

                {preview && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-md max-h-60 overflow-y-auto">
                        <h4 className="font-semibold text-sm mb-2">Pre-Check Results:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>Valid Rows: {preview.validCount}</div>
                            <div className="text-red-600">Invalid Rows: {preview.invalidCount}</div>
                        </div>
                        {preview.errors && preview.errors.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs font-bold text-red-500">Errors:</p>
                                <ul className="text-xs text-red-600 list-disc ml-4">
                                    {preview.errors.slice(0, 5).map((err: any, idx: number) => (
                                        <li key={idx}>Row {err.row}: {err.errors?.map((e: any) => e.message).join(', ')}</li>
                                    ))}
                                    {preview.errors.length > 5 && <li>...and {preview.errors.length - 5} more</li>}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || uploading || (preview && preview.invalidCount > 0)}>
                        {uploading ? 'Uploading...' : 'Upload Questions'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
