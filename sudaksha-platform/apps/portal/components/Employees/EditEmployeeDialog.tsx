"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditEmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
    employee: any;
    onUpdated: () => void;
}

export function EditEmployeeDialog({
    open,
    onOpenChange,
    clientId,
    employee,
    onUpdated
}: EditEmployeeDialogProps) {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [supervisors, setSupervisors] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        firstName: employee?.firstName || "",
        lastName: employee?.lastName || "",
        designation: employee?.designation || "",
        orgUnitId: employee?.orgUnitId || "",
        reportingToId: employee?.reportingToId || ""
    });

    // Load departments and supervisors on mount
    useEffect(() => {
        if (!open) return;
        loadOptions();
    }, [open]);

    const loadOptions = async () => {
        try {
            // Load departments
            const deptRes = await fetch(`/api/clients/${clientId}/departments`);
            if (deptRes.ok) {
                const depts = await deptRes.json();
                setDepartments(depts);
            }

            // Load all active members to use as supervisors (simple format)
            const membersRes = await fetch(`/api/clients/${clientId}/employees?simple=true&status=active`);
            if (membersRes.ok) {
                const allMembers = await membersRes.json();
                // Filter to exclude current employee
                const potentialSups = allMembers.filter((m: any) => m.id !== employee?.id);
                setSupervisors(potentialSups);
            }
        } catch (e) {
            console.error("Error loading options:", e);
        }
    };

    const handleUpdate = async () => {
        if (!formData.firstName.trim()) {
            toast.error("First name is required");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/clients/${clientId}/employees/${employee.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    designation: formData.designation,
                    orgUnitId: formData.orgUnitId || null,
                    reportingToId: formData.reportingToId || null
                })
            });

            if (response.ok) {
                toast.success("Employee updated successfully");
                onOpenChange(false);
                onUpdated();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to update employee");
            }
        } catch (error) {
            toast.error("Error updating employee");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">First Name</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="First name"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Last Name</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Last name"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Designation</Label>
                        <Input
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            placeholder="e.g., Developer, Manager"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Department</Label>
                        <Select
                            value={formData.orgUnitId}
                            onValueChange={(value) => setFormData({ ...formData, orgUnitId: value })}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">No Department</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Reporting Manager</Label>
                        <Select
                            value={formData.reportingToId}
                            onValueChange={(value) => setFormData({ ...formData, reportingToId: value })}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">No Supervisor</SelectItem>
                                {supervisors.map((sup) => (
                                    <SelectItem key={sup.id} value={sup.id}>
                                        {sup.name} ({sup.designation || sup.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
