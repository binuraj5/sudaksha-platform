'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, Users } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BulkUploadEmployeesDialogProps {
    clientId: string;
    onSuccess?: () => void;
    /** When provided, dialog is controlled externally (e.g. from a parent button) */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function BulkUploadEmployeesDialog({ clientId, onSuccess, open: controlledOpen, onOpenChange: controlledOnOpenChange }: BulkUploadEmployeesDialogProps) {
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;
    const [format, setFormat] = useState<'csv' | 'json'>('csv');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[] | null>(null);
    const [uploading, setUploading] = useState(false);

    // Simple CSV Parser
    const parseCSV = (text: string) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\s_]+/g, ''));
        // Expected headers: name, email, employeeid, department, designation

        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            if (currentLine.length !== headers.length) {
                // Basic check, might fail on commas in values. 
                // Ideally use regex for quoted CSV values, but assume simple for now.
                continue;
            }

            const obj: any = {};
            headers.forEach((header, index) => {
                // Map common header variations
                let key = header;
                if (key === 'fullname') key = 'name';
                if (key === 'id') key = 'employeeId';
                obj[key] = currentLine[index]?.trim();
            });
            result.push(obj);
        }
        return result;
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: format === 'csv' ? { 'text/csv': ['.csv'] } : { 'application/json': ['.json'] },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            setFile(file);
            setParsedData(null);

            const text = await file.text();
            let data = [];

            try {
                if (format === 'csv') {
                    data = parseCSV(text);
                } else {
                    data = JSON.parse(text);
                }

                // Basic Frontend Validation
                const validData = data.filter((row: any) => row.name && row.email && row.employeeId);
                if (validData.length === 0) {
                    toast.error("No valid records found. Ensure headers: Name, Email, EmployeeID");
                    return;
                }

                setParsedData(validData);
                toast.success(`Parsed ${validData.length} valid records.`);

            } catch (e: any) {
                toast.error("Error parsing file: " + e.message);
            }
        }
    });

    const handleUpload = async () => {
        if (!parsedData || parsedData.length === 0) return;
        setUploading(true);

        try {
            const response = await fetch(
                `/api/clients/${clientId}/employees/bulk-upload`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsedData)
                }
            );

            const result = await response.json();

            if (result.success) {
                toast.success(`Successfully added ${result.success} employees.`);
                if (result.failed > 0) {
                    toast.warning(`${result.failed} failed. Check console/logs.`);
                }
                setOpen(false);
                setFile(null);
                setParsedData(null);
                router.refresh();
                onSuccess?.();
            } else {
                toast.error('Upload failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error: any) {
            toast.error('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvTemplate = `name,email,employeeId,department,designation
John Doe,john@example.com,EMP001,Engineering,Software Engineer
Jane Smith,jane@example.com,EMP002,HR,Manager`;

        const blob = new Blob([csvTemplate], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Users className="mr-2 h-4 w-4" />
                        Upload Employees
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Employees</DialogTitle>
                </DialogHeader>

                <Tabs value={format} onValueChange={(v) => { setFormat(v as 'csv' | 'json'); setFile(null); setParsedData(null); }}>
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
                            <p className="mt-2 text-sm text-gray-600">Drop JSON file here</p>
                            {file && <p className="mt-2 text-sm font-semibold text-blue-600">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>}
                        </div>
                    </TabsContent>
                </Tabs>

                {parsedData && (
                    <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                        <p className="text-sm text-green-700">
                            Ready to upload <strong>{parsedData.length}</strong> employees.
                        </p>
                    </div>
                )}

                <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!parsedData || uploading}>
                        {uploading ? 'Uploading...' : 'Upload Employees'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
