"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantLabels } from "@/hooks/useTenantLabels";
import { getLabelsForTenant } from "@/lib/tenant-labels";

// Simplified Employee type for dropdown
interface Employee {
    id: string;
    name: string;
}

export function CreateDepartmentDialog({ clientId, tenantType }: { clientId: string; tenantType?: 'CORPORATE' | 'INSTITUTION' | 'SYSTEM' }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const hookLabels = useTenantLabels();
    const labels = tenantType ? getLabelsForTenant(tenantType) : hookLabels;

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        managerId: ""
    });

    const router = useRouter();

    // Fetch potential HoDs (all employees for now)
    useEffect(() => {
        if (open) {
            fetch(`/api/clients/${clientId}/employees?simple=true`) // Assuming an endpoint exists or we reuse one
                .then(res => res.ok ? res.json() : [])
                .then(data => setEmployees(data))
                .catch(err => console.error(err));
        }
    }, [open, clientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/clients/${clientId}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`${labels.orgUnit} created successfully`);
                setOpen(false);
                setFormData({ name: "", code: "", description: "", managerId: "" });
                router.refresh();
            } else {
                toast.error("Failed to create department");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {labels.orgUnit}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create {labels.orgUnit}</DialogTitle>
                        <DialogDescription>
                            Add a new {labels.orgUnit.toLowerCase()} to your organization structure.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code (Optional)</Label>
                            <Input
                                id="code"
                                placeholder="Auto-generated if empty"
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="manager">Head of {labels.orgUnit}</Label>
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
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea
                                id="desc"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
