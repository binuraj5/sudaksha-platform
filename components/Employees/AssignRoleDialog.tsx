"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const MEMBER_ROLES = [
    { value: "EMPLOYEE", label: "Employee" },
    { value: "MANAGER", label: "Manager" },
    { value: "ASSESSOR", label: "Assessor" },
    { value: "DEPT_HEAD", label: "Department Head" },
    { value: "TEAM_LEAD", label: "Team Lead" },
    { value: "TENANT_ADMIN", label: "Tenant Admin" },
] as const;

export function AssignRoleDialog({
    open,
    onOpenChange,
    clientId,
    employee,
    onAssigned,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
    employee: { id: string; name: string; role?: string };
    onAssigned?: () => void;
}) {
    const [role, setRole] = useState(employee?.role || "EMPLOYEE");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && employee) setRole(employee.role || "EMPLOYEE");
    }, [open, employee]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/employees/${employee.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to update role");
            }
            toast.success("Role updated successfully");
            onOpenChange(false);
            onAssigned?.();
        } catch (e: any) {
            toast.error(e.message || "Failed to assign role");
        } finally {
            setSubmitting(false);
        }
    };

    if (!employee) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Assign Role</DialogTitle>
                    <DialogDescription>
                        Assign a role to {employee.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {MEMBER_ROLES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
