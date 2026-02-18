"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteTenantDialogProps {
    tenant: { id: string; name: string; type: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const typeLabel = (type: string) =>
    type === "INSTITUTION" ? "institution" : "organization";

export function DeleteTenantDialog({
    tenant,
    open,
    onOpenChange,
    onSuccess,
}: DeleteTenantDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/clients/${tenant.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${tenant.name} deleted successfully`);
                onOpenChange(false);
                onSuccess?.();
            } else {
                setError(data.error?.message || data.error || "Failed to delete");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const label = typeLabel(tenant.type);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {label}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>{tenant.name}</strong>?
                        This will permanently remove the {label}, all members, departments,
                        activities, and related data. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <AlertDialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
