"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTenantLabels } from "@/hooks/useTenantLabels";

// Simple CSV Parser for MVP
function parseCSV(text: string) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]?.trim());
        return obj;
    });
}

export function BulkUploadDialog({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview/Validate, 3: Result
    const [uploading, setUploading] = useState(false);
    const labels = useTenantLabels();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            const text = await f.text();
            const data = parseCSV(text);
            // Basic Map to schema
            const mapped = data.map((row: any) => ({
                firstName: row['First Name'] || row['first_name'] || row['firstname'],
                lastName: row['Last Name'] || row['last_name'] || row['lastname'],
                email: row['Email'] || row['email'],
                phone: row['Phone'] || row['phone'],
                designation: row['Designation'] || row['designation'],
                employeeId: row['Employee ID'] || row['employee_id'] || row['memberCode'] || row['member_code'],
                departmentCode: row['Department Code'] || row['department_code']
            }));

            setParsedData(mapped);
            setStep(2);
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/employees/bulk-upload`, {
                method: 'POST',
                body: JSON.stringify({ employees: parsedData })
            });
            if (res.ok) {
                const result = await res.json();
                toast.success(`Imported ${result.count} ${labels.memberPlural.toLowerCase()}`);
                setStep(3);
                // Reload page logic or callback could go here
            } else {
                toast.error("Upload failed");
            }
        } catch (e) {
            toast.error("Error");
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "first_name,last_name,email,phone,designation,employee_id,department_code\nJohn,Doe,john@example.com,1234567890,Developer,EMP001,IT";

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "employee_template.csv";
        a.click();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Bulk Upload {labels.memberPlural}</DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="p-4 border border-dashed rounded-lg bg-gray-50 text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 cursor-pointer hover:text-indigo-600">
                                <span>Upload CSV</span>
                                <Input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div className="text-center">
                            <Button variant="link" onClick={downloadTemplate} className="text-sm">Download Template</Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 py-4">
                        <h3 className="font-medium">Preview ({parsedData.length} rows)</h3>
                        <div className="max-h-64 overflow-auto border rounded">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">{row.firstName} {row.lastName}</td>
                                            <td className="p-2">{row.email}</td>
                                            <td className="p-2">{row.designation || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {parsedData.length > 10 && <div className="p-2 text-center text-gray-500 italic">...and {parsedData.length - 10} more</div>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => { setStep(1); setFile(null); }}>Back</Button>
                            <Button onClick={handleUpload} disabled={uploading}>
                                {uploading && <Loader2 className="mr-2 animate-spin" />} Import
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-6">
                        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium">Import Complete</h3>
                        <p className="text-gray-500 mb-6">{labels.memberPlural} have been queued for invitation.</p>
                        <Button onClick={() => { setOpen(false); setStep(1); setFile(null); }}>Close</Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
