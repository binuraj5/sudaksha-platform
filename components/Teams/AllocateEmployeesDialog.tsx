"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AllocateEmployeesDialog({ clientId, teamId, deptId }: { clientId: string, teamId: string, deptId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const router = useRouter();

    useEffect(() => {
        if (open) {
            // Fetch employees in the parent Department
            // Ideally we filter those NOT yet in a team?
            // For now, listing all in Dept. If they are in another team in same Dept, they will be moved.
            // If they are in another Department, they won't show up here (correct).
            fetch(`/api/clients/${clientId}/employees?simple=true&dept=${deptId}`).then(r => r.json()).then(setEmployees);
        }
    }, [open, clientId, deptId]);

    const handleAllocate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/teams/${teamId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberIds: selectedIds })
            });

            if (res.ok) {
                toast.success("Members allocated");
                setOpen(false);
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error("Failed to allocate");
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
                <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Members
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Add Members to Team</DialogTitle>
                    <DialogDescription>Select employees from the department.</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[300px] overflow-y-auto space-y-2">
                    {employees.map(emp => (
                        <div key={emp.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                                id={emp.id}
                                checked={selectedIds.includes(emp.id)}
                                onCheckedChange={(checked) => {
                                    if (checked) setSelectedIds([...selectedIds, emp.id]);
                                    else setSelectedIds(selectedIds.filter(id => id !== emp.id));
                                }}
                            />
                            <Label htmlFor={emp.id} className="cursor-pointer flex-1">{emp.name}</Label>
                        </div>
                    ))}
                    {employees.length === 0 && <div className="text-gray-500 text-sm text-center">No available employees found in this department.</div>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAllocate} disabled={loading || selectedIds.length === 0}>
                        {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Allocate ({selectedIds.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
