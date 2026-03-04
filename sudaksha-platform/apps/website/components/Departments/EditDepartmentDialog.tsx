"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantLabels } from "@/hooks/useTenantLabels";

interface Employee {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
    manager?: { id?: string; name: string } | null;
}

export function EditDepartmentDialog({
    clientId,
    department,
    open,
    onOpenChange
}: {
    clientId: string;
    department: Department;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const labels = useTenantLabels();

    // Form State
    const [formData, setFormData] = useState({
        name: department.name || "",
        code: department.code || "",
        description: department.description || "",
        managerId: department.manager?.id || ""
    });

    const router = useRouter();

    useEffect(() => {
        setFormData({
            name: department.name || "",
            code: department.code || "",
            description: department.description || "",
            managerId: department.manager?.id || ""
        });
    }, [department, open]);

    // Fetch potential HoDs (all employees for now)
    useEffect(() => {
        if (open) {
            fetch(`/api/clients/${clientId}/employees?simple=true`)
                .then(res => res.ok ? res.json() : [])
                .then(data => setEmployees(data))
                .catch(err => console.error(err));
        }
    }, [open, clientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/v1/org-units/${department.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`${labels.orgUnit} updated successfully`);
                onOpenChange(false);
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error?.message || `Failed to update ${labels.orgUnit.toLowerCase()}`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit {labels.orgUnit}</DialogTitle>
                        <DialogDescription>
                            Update the details of this {labels.orgUnit.toLowerCase()}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-code">Code</Label>
                            <Input
                                id="edit-code"
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-manager">Head of {labels.orgUnit}</Label>
                            <Select
                                value={formData.managerId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, managerId: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select Head`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                    {employees.length === 0 && <SelectItem value="_disabled" disabled>Loading...</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-desc">Description</Label>
                            <Textarea
                                id="edit-desc"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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
