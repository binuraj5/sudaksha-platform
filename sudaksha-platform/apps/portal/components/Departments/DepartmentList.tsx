"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Briefcase, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock Data Interface
interface Department {
    id: string;
    name: string;
    headName: string;
    employeeCount: number;
    teamCount: number;
    projectCount: number;
    status: "Active" | "Inactive";
}

// Mock Data
const MOCK_DEPARTMENTS: Department[] = [
    { id: "dept-1", name: "Engineering", headName: "Sarah Connor", employeeCount: 45, teamCount: 4, projectCount: 12, status: "Active" },
    { id: "dept-2", name: "Product Design", headName: "Tony Stark", employeeCount: 12, teamCount: 2, projectCount: 5, status: "Active" },
    { id: "dept-3", name: "Human Resources", headName: "Pam Beesly", employeeCount: 5, teamCount: 1, projectCount: 2, status: "Active" },
    { id: "dept-4", name: "Marketing", headName: "Don Draper", employeeCount: 18, teamCount: 3, projectCount: 8, status: "Active" },
];

interface DepartmentListProps {
    clientId: string;
}

export function DepartmentList({ clientId }: DepartmentListProps) {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Departments</CardTitle>
                    <CardDescription>Manage your organization's internal structure.</CardDescription>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Department Name</TableHead>
                            <TableHead>Head of Dept</TableHead>
                            <TableHead className="text-center">Employees</TableHead>
                            <TableHead className="text-center">Teams</TableHead>
                            <TableHead className="text-center">Projects</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_DEPARTMENTS.map((dept) => (
                            <TableRow key={dept.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/clients/${clientId}/departments/${dept.id}`)}>
                                <TableCell className="font-medium">{dept.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                            {dept.headName.charAt(0)}
                                        </div>
                                        {dept.headName}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="font-normal">
                                        {dept.employeeCount}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">{dept.teamCount}</TableCell>
                                <TableCell className="text-center">{dept.projectCount}</TableCell>
                                <TableCell>
                                    <Badge variant={dept.status === 'Active' ? 'default' : 'secondary'} className={dept.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                        {dept.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
