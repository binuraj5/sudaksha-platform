"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Trash2, Save, ArrowLeft } from "lucide-react";
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
    const [isLoading, setIsLoading] = useState(false);

    // Mock initial data
    const [data, setData] = useState({
        name: "Engineering",
        description: "Software development and engineering operations",
        headEmail: "sarah.connor@techcorp.com",
    });

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Department settings updated");
        setIsLoading(false);
    };

    const handleDelete = async () => {
        // Simulate API call
        toast.success("Department deleted");
        router.push(`/clients/${clientId}/departments`);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Settings: {data.name}</h2>
                    <p className="text-muted-foreground">Manage department details and configurations.</p>
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
                        <Label htmlFor="deptName">Department Name</Label>
                        <Input
                            id="deptName"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Leadership</CardTitle>
                    <CardDescription>
                        Assign the Head of Department (HoD) who acts as the primary administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="headEmail">Head of Department (Email)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="headEmail"
                                value={data.headEmail}
                                onChange={(e) => setData({ ...data, headEmail: e.target.value })}
                            />
                            <Button variant="outline">Verify User</Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        Save Leadership
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
                                This will permanently remove the department and unassign all teams/members.
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
                                        <strong> {data.name} </strong> department and remove associated data.
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
