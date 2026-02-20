"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
    roleId: string;
    clientId: string;
    slug: string;
    initialName: string;
    initialDescription: string;
    initialLevel: string;
    isOrgOwned: boolean;
}

export function OrgEditRolePanel({
    roleId,
    clientId,
    slug,
    initialName,
    initialDescription,
    initialLevel,
    isOrgOwned,
}: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [level, setLevel] = useState(initialLevel);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/roles/${roleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), description, overallLevel: level }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to update role");
                return;
            }
            toast.success("Role updated");
            setEditing(false);
            router.refresh();
        } catch {
            toast.error("Failed to update role");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/roles/${roleId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to delete role");
                return;
            }
            toast.success("Role deleted");
            setDeleteOpen(false);
            router.push(`/assessments/org/${slug}/roles`);
        } catch {
            toast.error("Failed to delete role");
        } finally {
            setDeleting(false);
        }
    };

    if (!isOrgOwned) return null;

    return (
        <div className="pt-4 border-t space-y-3">
            {!editing ? (
                <div className="flex flex-col gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="h-3.5 w-3.5" /> Edit Role
                    </Button>

                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Delete Role
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this role?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will deactivate the role <strong>{name}</strong>. Existing assessment models
                                    using this role will not be affected.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 h-8 text-sm"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 h-8 text-sm"
                            placeholder="Brief description..."
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Level</Label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger className="mt-1 h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="JUNIOR">Junior</SelectItem>
                                <SelectItem value="MIDDLE">Middle</SelectItem>
                                <SelectItem value="SENIOR">Senior</SelectItem>
                                <SelectItem value="EXPERT">Expert</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                                setEditing(false);
                                setName(initialName);
                                setDescription(initialDescription);
                                setLevel(initialLevel);
                            }}
                            disabled={saving}
                        >
                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="flex-1"
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                        >
                            {saving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : (
                                <Save className="h-3.5 w-3.5 mr-1" />
                            )}
                            Save
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
