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
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BulkUploadCoursesDialog({
  slug,
  onSuccess,
  trigger,
}: {
  slug: string;
  departmentId?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a CSV file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch(`/api/org/${slug}/courses/bulk`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        const created = result.created ?? result.success ?? 0;
        const errs = result.errors ?? 0;
        if (errs > 0) {
          toast.warning(`Created ${created} courses. ${errs} row(s) failed.`);
        } else {
          toast.success(`Imported ${created} courses`);
        }
        setOpen(false);
        setFile(null);
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
    const csv =
      "name,code,department_code,year_begin,year_end,division,semester_count,year_count,description\n" +
      "B.Tech Computer Science Engineering,BTECH-CSE,IT,2023,2027,BOTH,8,4,4-year undergraduate\n" +
      "MBA,MBA,BM,2024,2026,SEMESTER,4,,2-year postgraduate";
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "courses-template.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload Courses
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload courses from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            CSV columns: name, code, department_code, year_begin, year_end, division (SEMESTER|YEAR|BOTH),
            semester_count (optional), year_count (optional), description (optional).
          </p>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              className="text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Download template
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
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
