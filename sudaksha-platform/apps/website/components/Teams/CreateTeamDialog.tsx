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

export function CreateTeamDialog({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const labels = useTenantLabels();

    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parentId: "",
        managerId: ""
    });

    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetch(`/api/clients/${clientId}/departments?status=active`).then(r => r.json()).then(data => setDepartments(Array.isArray(data) ? data : []));
        }
    }, [open, clientId]);

    useEffect(() => {
        if (formData.parentId) {
            // Fetch employees in this dept to be lead
            // We use the 'dept' filter on employees API
            fetch(`/api/clients/${clientId}/employees?simple=true&dept=${formData.parentId}`).then(r => r.json()).then(data => setEmployees(Array.isArray(data) ? data : []));
        } else {
            setEmployees([]);
        }
    }, [formData.parentId, clientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`${labels.subUnit} created`);
                setOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to create team");
            }
        } catch (error) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create {labels.subUnit}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New {labels.subUnit}</DialogTitle>
                        <DialogDescription>Add a {labels.subUnit.toLowerCase()} to a {labels.orgUnit.toLowerCase()}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Parent {labels.orgUnit} <span className="text-red-500">*</span></Label>
                            <Select value={formData.parentId} onValueChange={v => setFormData({ ...formData, parentId: v })}>
                                <SelectTrigger><SelectValue placeholder={`Select ${labels.orgUnit}`} /></SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>{labels.subUnit} Name <span className="text-red-500">*</span></Label>
                            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="grid gap-2">
                            <Label>{labels.subUnit} Lead (Optional)</Label>
                            <Select value={formData.managerId} onValueChange={v => setFormData({ ...formData, managerId: v })} disabled={!formData.parentId}>
                                <SelectTrigger><SelectValue placeholder={formData.parentId ? "Select Lead" : `Select ${labels.orgUnit} First`} /></SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
