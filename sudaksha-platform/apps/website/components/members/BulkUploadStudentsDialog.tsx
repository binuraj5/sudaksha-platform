"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Download, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface BulkUploadStudentsDialogProps {
  slug: string;
  clientId: string;
  departmentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\s_]+/g, ""));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    if (values.length !== headers.length) continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function mapRow(row: Record<string, string>) {
  return {
    first_name: row.firstname ?? row["first_name"] ?? "",
    last_name: row.lastname ?? row["last_name"] ?? "",
    email: (row.email ?? "").trim(),
    enrollment_number: (row.enrollmentnumber ?? row["enrollment_number"] ?? "").trim(),
    class_code: (row.classcode ?? row["class_code"] ?? "").trim(),
  };
}

export function BulkUploadStudentsDialog({
  slug,
  clientId,
  departmentId,
  open,
  onOpenChange,
  onSuccess,
}: BulkUploadStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    count: number;
    failed: number;
    errors: { row: number; email?: string; class_code?: string; error: string }[];
  } | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDrop: (accepted) => {
      setFile(accepted[0] ?? null);
      setResult(null);
    },
    disabled: uploading,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a CSV file");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      const rows = parsed.map((r) => {
        const m = mapRow(r);
        return {
          firstName: m.first_name,
          lastName: m.last_name,
          email: m.email,
          enrollmentNumber: m.enrollment_number || undefined,
          class_code: m.class_code,
        };
      });
      if (rows.length === 0) {
        toast.error("No valid rows. CSV must have headers: first_name, last_name, email, enrollment_number, class_code");
        setUploading(false);
        return;
      }
      const res = await fetch(`/api/org/${slug}/members/bulk-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        setUploading(false);
        return;
      }
      setResult({ count: data.count ?? 0, failed: data.failed ?? 0, errors: data.errors ?? [] });
      if (data.count > 0) {
        toast.success(`${data.count} student(s) added.`);
        onSuccess?.();
      }
      if (data.failed > 0) {
        toast.warning(`${data.failed} row(s) failed. Download error report below.`);
      }
      if (data.count > 0 && data.failed === 0) {
        setFile(null);
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const STUDENT_CSV_TEMPLATE = "first_name,last_name,email,enrollment_number,class_code\nJohn,Doe,john@example.com,ENR001,CSE-A-2023\nJane,Smith,jane@example.com,ENR002,CSE-A-2023";

  const downloadTemplate = () => {
    const blob = new Blob([STUDENT_CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-upload-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadErrorReport = () => {
    if (!result?.errors?.length) return;
    const headers = ["row", "email", "class_code", "error"];
    const lines = [headers.join(","), ...result.errors.map((e) => [e.row, e.email ?? "", e.class_code ?? "", (e.error ?? "").replace(/,/g, ";")].join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-upload-errors-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Students (CSV)</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          CSV must have columns: <strong>first_name</strong>, <strong>last_name</strong>, <strong>email</strong>, <strong>enrollment_number</strong>, <strong>class_code</strong>
        </p>
        <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="mb-2">
          <Download className="h-4 w-4 mr-2" />
          Download template
        </Button>
        <div className="space-y-2">
          <Label>File</Label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/50"
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {file ? file.name : "Drop CSV here or click to select"}
          </div>
        </div>
        {result && (result.count > 0 || result.failed > 0) && (
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium text-green-600">{result.count} added</p>
            {result.failed > 0 && (
              <>
                <p className="font-medium text-amber-600">{result.failed} failed</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={downloadErrorReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download error report
                </Button>
              </>
            )}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
