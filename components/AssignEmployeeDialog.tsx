"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AssignEmployeeDialogProps {
    clientId: string;
    employee: {
        id: string;
        name: string;
        projectId?: string | null;
        departmentId?: string | null;
    };
    onSuccess?: () => void;
}

export function AssignEmployeeDialog({ clientId, employee, onSuccess }: AssignEmployeeDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const router = useRouter();

    const [selection, setSelection] = useState({
        projectId: employee.projectId || "none",
        departmentId: employee.departmentId || "none"
    });

    useEffect(() => {
        if (open) {
            fetchProjects();
        }
    }, [open]);

    useEffect(() => {
        if (selection.projectId && selection.projectId !== "none") {
            fetchDepartments(selection.projectId);
        } else {
            setDepartments([]);
            setSelection(s => ({ ...s, departmentId: "none" }));
        }
    }, [selection.projectId]);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`/api/clients/${clientId}/projects`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Fetch projects failed", error);
        }
    };

    const fetchDepartments = async (projectId: string) => {
        try {
            const res = await fetch(`/api/clients/${clientId}/projects/${projectId}/departments`);
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error("Fetch departments failed", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/clients/${clientId}/employees/${employee.id}/assign`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selection.projectId === "none" ? null : selection.projectId,
                    departmentId: selection.departmentId === "none" ? null : selection.departmentId
                })
            });

            if (!response.ok) {
                throw new Error("Failed to assign employee");
            }

            toast.success("Assignment updated");
            setOpen(false);
            router.refresh();
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Organization Unit</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                        <p className="text-xs text-gray-500">Employee ID: {employee.id}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Project / Business Unit</Label>
                            <Select
                                value={selection.projectId}
                                onValueChange={v => setSelection({ ...selection, projectId: v, departmentId: "none" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Department / Team</Label>
                            <Select
                                value={selection.departmentId}
                                onValueChange={v => setSelection({ ...selection, departmentId: v })}
                                disabled={!selection.projectId || selection.projectId === "none"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Assignment"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
