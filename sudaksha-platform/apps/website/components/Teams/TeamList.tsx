"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MoreHorizontal, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Team {
    id: string;
    name: string;
    department: string;
    lead: string;
    members: number;
    activeProjects: number;
    status: "Active" | "Archived";
}

const MOCK_TEAMS: Team[] = [
    { id: "t1", name: "Frontend Alpha", department: "Engineering", lead: "Mike Ross", members: 8, activeProjects: 2, status: "Active" },
    { id: "t2", name: "Backend Gamma", department: "Engineering", lead: "Harvey Specter", members: 12, activeProjects: 4, status: "Active" },
    { id: "t3", name: "UX Research", department: "Product Design", lead: "Donna Paulsen", members: 4, activeProjects: 1, status: "Active" },
    { id: "t4", name: "Recruitment", department: "Human Resources", lead: "Louis Litt", members: 5, activeProjects: 2, status: "Active" },
];

interface TeamListProps {
    clientId: string;
}

export function TeamList({ clientId }: TeamListProps) {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Teams</CardTitle>
                    <CardDescription>Manage your cross-functional or departmental teams.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search teams..." className="pl-8" />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Team
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Team Lead</TableHead>
                            <TableHead className="text-center">Members</TableHead>
                            <TableHead className="text-center">Active Projects</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_TEAMS.map((team) => (
                            <TableRow key={team.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/clients/${clientId}/teams/${team.id}`)}>
                                <TableCell className="font-medium">
                                    {team.name}
                                </TableCell>
                                <TableCell>{team.department}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                                            {team.lead.charAt(0)}
                                        </div>
                                        {team.lead}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{team.members}</TableCell>
                                <TableCell className="text-center">{team.activeProjects}</TableCell>
                                <TableCell>
                                    <Badge variant={team.status === 'Active' ? 'default' : 'secondary'}>
                                        {team.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/clients/${clientId}/teams/${team.id}`)}>
                                                View Dashboard
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Archive Team</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
