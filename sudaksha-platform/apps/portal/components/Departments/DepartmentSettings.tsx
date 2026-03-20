"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DepartmentSettingsProps {
    clientId: string;
    deptId: string;
}

export function DepartmentSettings({ clientId, deptId }: DepartmentSettingsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);

    const [data, setData] = useState({
        name: "",
        description: "",
        code: "",
        managerId: "none"
    });

    // Load department data and employees on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [deptRes, empRes] = await Promise.all([
                    fetch(`/api/clients/${clientId}/departments/${deptId}`),
                    fetch(`/api/clients/${clientId}/employees?simple=true&status=active`)
                ]);

                if (deptRes.ok) {
                    const dept = await deptRes.json();
                    setData({
                        name: dept.name || "",
                        description: dept.description || "",
                        code: dept.code || "",
                        managerId: dept.managerId || "none"
                    });
                } else {
                    toast.error("Failed to load department");
                }

                if (empRes.ok) {
                    const emps = await empRes.json();
                    setEmployees(emps || []);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Error loading department");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [clientId, deptId]);

    const handleSave = async () => {
        if (!data.name.trim()) {
            toast.error("Department name is required");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/clients/${clientId}/departments/${deptId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    description: data.description,
                    code: data.code,
                    managerId: data.managerId === "none" ? null : data.managerId
                })
            });

            if (response.ok) {
                toast.success("Department updated successfully");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to update department");
            }
        } catch (error) {
            console.error("Error updating department:", error);
            toast.error("Error updating department");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/clients/${clientId}/departments/${deptId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                toast.success("Department deleted");
                router.push(`/assessments/clients/${clientId}/departments`);
            } else {
                toast.error("Failed to delete department");
            }
        } catch (error) {
            toast.error("Error deleting department");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const currentManager = employees.find(e => e.id === data.managerId);

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Settings: {data.name}</h2>
                    <p className="text-muted-foreground">Manage department details and leadership.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>
                        Update the department's profile and basic details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="deptName">Department Name *</Label>
                        <Input
                            id="deptName"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deptCode">Department Code</Label>
                        <Input
                            id="deptCode"
                            value={data.code}
                            onChange={(e) => setData({ ...data, code: e.target.value })}
                            placeholder="e.g., IT, HR, SALES"
                            disabled={isSaving}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            placeholder="Department description"
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Department Leadership</CardTitle>
                    <CardDescription>
                        Assign the Head of Department (HoD) who acts as the primary administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="manager">Head of Department</Label>
                        <Select
                            value={data.managerId}
                            onValueChange={(value) => setData({ ...data, managerId: value })}
                            disabled={isSaving || employees.length === 0}
                        >
                            <SelectTrigger id="manager">
                                <SelectValue placeholder="Select department head" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Head Assigned</SelectItem>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {currentManager && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Current Head:</strong> {currentManager.name}
                                </p>
                                <p className="text-xs text-gray-500">{currentManager.email}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Leadership</>}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions. Tread carefully.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="space-y-1">
                            <h4 className="font-medium text-destructive">Delete Department</h4>
                            <p className="text-sm text-muted-foreground">
                                This will permanently remove the department and deactivate all associated teams.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Department</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the
                                        <strong> {data.name} </strong> department and deactivate associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
