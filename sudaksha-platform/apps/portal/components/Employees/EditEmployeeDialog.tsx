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
        email: employee?.email || "",
        designation: employee?.designation || "",
        orgUnitId: employee?.orgUnitId || "none",
        reportingToId: employee?.reportingToId || "none"
    });

    // Load departments and supervisors on mount
    useEffect(() => {
        if (!open) return;
        loadOptions();
    }, [open]);

    const loadOptions = async () => {
        try {
            // Load org units with hierarchy info (polymorphic: TEAM, DEPARTMENT, etc.)
            const orgUnitsRes = await fetch(
                `/api/clients/${clientId}/org-units?includeHierarchy=true&assignable=true`
            );
            if (orgUnitsRes.ok) {
                const units = await orgUnitsRes.json();
                setDepartments(units);
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
        setLoading(true);
        try {
            const response = await fetch(`/api/clients/${clientId}/employees/${employee.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    designation: formData.designation,
                    orgUnitId: formData.orgUnitId === "none" ? null : formData.orgUnitId,
                    reportingToId: formData.reportingToId === "none" ? null : formData.reportingToId
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
                    <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <Input
                            value={`${formData.firstName} ${formData.lastName}`.trim()}
                            readOnly
                            className="bg-gray-100 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Name cannot be edited</p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                            value={formData.email}
                            readOnly
                            className="bg-gray-100 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be edited</p>
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
                        <Label className="text-sm font-medium">Department / Team / Unit</Label>
                        <Select
                            value={formData.orgUnitId}
                            onValueChange={(value) => setFormData({ ...formData, orgUnitId: value })}
                            disabled={loading || departments.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select organizational unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Independent Role (No Unit)</SelectItem>
                                {/* Group units by type for better UX */}
                                {departments.length > 0 && (
                                    <>
                                        {/* Departments */}
                                        {departments.filter((d: any) => d.type === 'DEPARTMENT').map((dept: any) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                📁 {dept.name}
                                            </SelectItem>
                                        ))}
                                        {/* Teams (nested under departments) */}
                                        {departments.filter((d: any) => d.type === 'TEAM').map((team: any) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                └─ 👥 {team.name} {team.parent ? `(${team.parent.name})` : ''}
                                            </SelectItem>
                                        ))}
                                        {/* Classes (for institutions) */}
                                        {departments.filter((d: any) => d.type === 'CLASS').map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                └─ 🏫 {cls.name} {cls.parent ? `(${cls.parent.name})` : ''}
                                            </SelectItem>
                                        ))}
                                        {/* Other unit types */}
                                        {departments.filter((d: any) => !['DEPARTMENT', 'TEAM', 'CLASS'].includes(d.type)).map((unit: any) => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                • {unit.name} ({unit.type.toLowerCase()})
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">Supports polymorphic assignment: Departments, Teams, Classes, or Independent roles</p>
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
                                <SelectItem value="none">No Supervisor</SelectItem>
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
