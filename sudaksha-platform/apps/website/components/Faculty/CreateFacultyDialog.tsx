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
import { useTenantLabels } from "@/hooks/useTenantLabels";

interface CreateFacultyDialogProps {
    clientId: string;
    slug: string;
    defaultDepartmentId?: string;
}

interface Dept {
    id: string;
    name: string;
    code?: string;
}

export function CreateFacultyDialog({
    clientId,
    slug,
    defaultDepartmentId,
}: CreateFacultyDialogProps) {
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Dept[]>([]);
    const labels = useTenantLabels();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        orgUnitId: defaultDepartmentId || "",
        designation: "",
        role: "EMPLOYEE",
        facultyType: "__none__",
    });

    const router = useRouter();

    useEffect(() => {
        fetch(`/api/clients/${clientId}/departments?status=active`)
            .then((r) => (r.ok ? r.json() : []))
            .then((data: Dept[]) => {
                setDepartments(data);
                if (defaultDepartmentId && !formData.orgUnitId) {
                    setFormData((f) => ({ ...f, orgUnitId: defaultDepartmentId }));
                }
            })
            .catch(() => setDepartments([]));
    }, [clientId, defaultDepartmentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/employees`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    type: "EMPLOYEE",
                    facultyType: formData.facultyType === "__none__" ? undefined : formData.facultyType,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`${labels.faculty || "Faculty"} invited successfully`);
                router.push(`/assessments/org/${slug}/faculty`);
                router.refresh();
            } else {
                toast.error(data.error || "Failed to create faculty");
            }
        } catch (e) {
            toast.error("Error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => router.push(`/assessments/org/${slug}/faculty`)}>
            <DialogContent className="flex max-h-[90dvh] min-h-0 w-[calc(100vw-2rem)] max-w-[500px] flex-col overflow-hidden sm:max-h-[85dvh] sm:w-full">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Add {labels.faculty || "Faculty"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>First Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData((f) => ({ ...f, firstName: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData((f) => ({ ...f, lastName: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email <span className="text-red-500">*</span></Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select
                            value={formData.orgUnitId || "__none__"}
                            onValueChange={(v) => setFormData((f) => ({ ...f, orgUnitId: v === "__none__" ? "" : v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name} {d.code ? `(${d.code})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Designation</Label>
                        <Input
                            value={formData.designation}
                            onChange={(e) => setFormData((f) => ({ ...f, designation: e.target.value }))}
                            placeholder="e.g. Professor, HoD"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Faculty Type</Label>
                        <Select
                            value={formData.facultyType}
                            onValueChange={(v) => setFormData((f) => ({ ...f, facultyType: v }))}
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
                            Faculty type determines ability to assign assessments to students based on curriculum.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(v) => setFormData((f) => ({ ...f, role: v }))}
                        >
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
                        <p className="text-sm text-muted-foreground">
                            User will receive an email invitation to set their password.
                        </p>
                    </div>
                    <DialogFooter className="shrink-0 gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/assessments/org/${slug}/faculty`)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
