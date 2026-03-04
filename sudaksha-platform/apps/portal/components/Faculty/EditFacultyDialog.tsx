"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditFacultyDialogProps {
    faculty: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
        designation?: string | null;
        role?: string | null;
        facultyType?: string | null;
        orgUnitId?: string | null;
    };
    clientId: string;
    slug: string;
    departments: { id: string; name: string; code: string }[];
    classes: { id: string; name: string; code: string; parent?: { name: string } | null }[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditFacultyDialog({
    faculty,
    clientId,
    slug,
    departments,
    classes,
    open,
    onOpenChange,
    onSuccess,
}: EditFacultyDialogProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: faculty.name?.split(" ")[0] || "",
        lastName: faculty.name?.split(" ").slice(1).join(" ") || "",
        phone: faculty.phone || "",
        designation: faculty.designation || "",
        role: faculty.role || "EMPLOYEE",
        facultyType: faculty.facultyType || "__none__",
        orgUnitId: faculty.orgUnitId || "__none__",
    });

    const router = useRouter();

    useEffect(() => {
        if (open) {
            const parts = faculty.name?.split(" ") || [];
            setForm({
                firstName: parts[0] || "",
                lastName: parts.slice(1).join(" ") || "",
                phone: faculty.phone || "",
                designation: faculty.designation || "",
                role: faculty.role || "EMPLOYEE",
                facultyType: faculty.facultyType || "__none__",
                orgUnitId: faculty.orgUnitId || "__none__",
            });
        }
    }, [open, faculty]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/employees/${faculty.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone || undefined,
                    designation: form.designation || undefined,
                    role: form.role,
                    facultyType: form.facultyType === "__none__" ? null : form.facultyType,
                    orgUnitId: form.orgUnitId === "__none__" ? null : form.orgUnitId,
                }),
            });
            if (res.ok) {
                toast.success("Faculty updated");
                onOpenChange(false);
                onSuccess?.();
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Faculty</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input
                                value={form.firstName}
                                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                                value={form.lastName}
                                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={faculty.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Designation</Label>
                        <Input
                            value={form.designation}
                            onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                            placeholder="e.g. Professor, HoD"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Faculty Type</Label>
                        <Select
                            value={form.facultyType}
                            onValueChange={(v) => setForm((f) => ({ ...f, facultyType: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">—</SelectItem>
                                <SelectItem value="PERMANENT">Permanent</SelectItem>
                                <SelectItem value="ADJUNCT">Adjunct</SelectItem>
                                <SelectItem value="VISITING">Visiting</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Permanent, Adjunct, and Visiting faculty can assign assessments to students based on curriculum.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Department / Class</Label>
                        <Select
                            value={form.orgUnitId}
                            onValueChange={(v) => setForm((f) => ({ ...f, orgUnitId: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name} ({d.code})
                                    </SelectItem>
                                ))}
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name} {c.parent ? ` — ${c.parent.name}` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EMPLOYEE">Faculty / Staff</SelectItem>
                                <SelectItem value="CLASS_TEACHER">Class Teacher</SelectItem>
                                <SelectItem value="DEPT_HEAD">Department Head (HoD)</SelectItem>
                                <SelectItem value="TENANT_ADMIN">Institution Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
