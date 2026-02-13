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
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteFacultyDialogProps {
    faculty: { id: string; name: string };
    clientId: string;
    slug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DeleteFacultyDialog({
    faculty,
    clientId,
    slug,
    open,
    onOpenChange,
    onSuccess,
}: DeleteFacultyDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/employees/${faculty.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Faculty deactivated");
                onOpenChange(false);
                onSuccess?.();
                router.refresh();
            } else {
                toast.error("Failed to deactivate");
            }
        } catch {
            toast.error("Failed to deactivate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Deactivate Faculty
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to deactivate <strong>{faculty.name}</strong>? They will no longer be able to
                    sign in or assign assessments. This can be reversed by activating them again.
                </p>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Deactivate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
