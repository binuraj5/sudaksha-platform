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

interface Dept { id: string; name: string; }
interface Emp { id: string; name: string; }
interface Subject { id: string; name: string; }

export function CreateProjectDialog({ clientId, defaultOpen, redirectBase }: { clientId: string; defaultOpen?: boolean; redirectBase?: string }) {
    const [open, setOpen] = useState(!!defaultOpen);
    const [loading, setLoading] = useState(false);
    const labels = useTenantLabels();

    const [departments, setDepartments] = useState<Dept[]>([]);
    const [managers, setManagers] = useState<Emp[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [tenantType, setTenantType] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "PLANNED",
        ownerId: "",
        departmentIds: [] as string[],
        budget: "",
        priority: "MEDIUM",
        curriculumNodeId: ""
    });

    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetch(`/api/clients/${clientId}/departments?status=active`).then(r => r.json()).then(data => setDepartments(Array.isArray(data) ? data : []));
            fetch(`/api/clients/${clientId}/employees?simple=true`).then(r => r.json()).then(data => setManagers(Array.isArray(data) ? data : []));

            fetch(`/api/clients/${clientId}`).then(r => r.json()).then(data => {
                setTenantType(data.type);
                if (data?.type === 'INSTITUTION') {
                    fetch(`/api/clients/${clientId}/curriculum?type=SUBJECT`).then(r => r.json()).then(data => setSubjects(Array.isArray(data) ? data : []));
                }
            });
        }
    }, [open, clientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`${labels.activity} created`);
                setOpen(false);
                if (defaultOpen) router.push(redirectBase ? `${redirectBase}/projects` : `/assessments/clients/${clientId}/projects`);
                router.refresh();
            } else {
                toast.error("Failed to create");
            }
        } catch (error) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!defaultOpen && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create {labels.activity}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New {labels.activity}</DialogTitle>
                        <DialogDescription>Define {labels.activity.toLowerCase()} scope, timeline and team.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>{labels.activity} Name <span className="text-red-500">*</span></Label>
                            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNED">Planned</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Priority</Label>
                                <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="LOW">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date <span className="text-red-500">*</span></Label>
                                <Input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date</Label>
                                <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>{labels.activity} Manager</Label>
                            <Select value={formData.ownerId} onValueChange={v => setFormData({ ...formData, ownerId: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Owner" /></SelectTrigger>
                                <SelectContent>
                                    {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {tenantType === 'INSTITUTION' && (
                            <div className="grid gap-2">
                                <Label>Subject / Course Module</Label>
                                <Select value={formData.curriculumNodeId} onValueChange={v => setFormData({ ...formData, curriculumNodeId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Link to Curriculum Subject" /></SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>{labels.orgUnitPlural}</Label>
                            <Select onValueChange={v => {
                                if (!formData.departmentIds.includes(v))
                                    setFormData({ ...formData, departmentIds: [...formData.departmentIds, v] })
                            }}>
                                <SelectTrigger><SelectValue placeholder={`Add ${labels.orgUnitPlural}...`} /></SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {formData.departmentIds.map(id => {
                                    const d = departments.find(x => x.id === id);
                                    return d ? <span key={id} className="bg-indigo-100 text-indigo-700 px-2 py-1 text-xs rounded-full">{d.name}</span> : null
                                })}
                            </div>
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
