"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantLabels } from "@/hooks/useTenantLabels";

export function EditTeamDialog({ clientId, team }: { clientId: string, team: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const labels = useTenantLabels();
    const [employees, setEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: team.name || "",
        description: team.description || "",
        managerId: team.managerId || ""
    });

    const router = useRouter();

    useEffect(() => {
        if (open && team.parentId) {
            fetch(`/api/clients/${clientId}/employees?simple=true&dept=${team.parentId}`)
                .then(r => r.json())
                .then(data => setEmployees(Array.isArray(data) ? data : []));
        }
    }, [open, clientId, team.parentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/teams/${team.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`${labels.subUnit} updated successfully`);
                setOpen(false);
                router.refresh();
            } else {
                toast.error(`Failed to update ${labels.subUnit.toLowerCase()}`);
            }
        } catch (error) {
            toast.error("Error updating team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit {labels.subUnit}</DialogTitle>
                        <DialogDescription>Update the details of this {labels.subUnit.toLowerCase()}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>{labels.subUnit} Name <span className="text-red-500">*</span></Label>
                            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="grid gap-2">
                            <Label>{labels.subUnit} Lead (Optional)</Label>
                            <Select value={formData.managerId || "unassigned"} onValueChange={v => setFormData({ ...formData, managerId: v === "unassigned" ? "" : v })} disabled={!team.parentId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={team.parentId ? `Select Lead` : `Parent ${labels.orgUnit} required`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                                    {employees.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
