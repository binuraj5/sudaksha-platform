"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeptSummary {
    id: string;
    name: string;
}

export function DeleteDepartmentDialog({
    clientId,
    deptId,
    deptName,
    activeProjectsCount
}: {
    clientId: string;
    deptId: string;
    deptName: string;
    activeProjectsCount: number;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<DeptSummary[]>([]);
    const [reassignTo, setReassignTo] = useState<string>("");

    const router = useRouter();

    useEffect(() => {
        if (open) {
            // Fetch other departments for reassignment
            fetch(`/api/clients/${clientId}/departments?status=active`)
                .then(res => res.json())
                .then((data: DeptSummary[]) => {
                    setDepartments(data.filter(d => d.id !== deptId));
                })
                .catch(err => console.error(err));
        }
    }, [open, clientId, deptId]);

    const handleDelete = async () => {
        setLoading(true);
        try {
            let url = `/api/clients/${clientId}/departments/${deptId}`;
            if (reassignTo) {
                url += `?reassignTo=${reassignTo}`;
            }

            const res = await fetch(url, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success("Department active status removed");
                setOpen(false);
                router.push(`/clients/${clientId}/departments`);
                router.refresh();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const hasBlockers = activeProjectsCount > 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-red-600">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Delete Department
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to deactivate <strong>{deptName}</strong>?
                    </DialogDescription>
                </DialogHeader>

                {hasBlockers ? (
                    <div className="p-4 bg-red-50 text-red-800 text-sm rounded-md">
                        Cannot delete department with {activeProjectsCount} active projects. Please reassign or close projects first.
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Reassign Employees & Teams To (Optional)</Label>
                            <Select value={reassignTo} onValueChange={setReassignTo}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                If you don't select a destination, employees will become unassigned.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading || hasBlockers}>
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Deactivate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
