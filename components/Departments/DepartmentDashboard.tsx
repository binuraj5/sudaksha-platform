"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Users, FolderKanban, Award, ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';

interface DepartmentDashboardProps {
    clientId: string;
    deptId: string;
}

export function DepartmentDashboard({ clientId, deptId }: DepartmentDashboardProps) {
    const router = useRouter();

    // Mock Data
    const deptInfo = {
        name: "Engineering",
        head: { name: "Sarah Connor", role: "VP Engineering", image: "" },
        stats: {
            employees: 45,
            teams: 4,
            projects: 12,
            budgetUtilized: 78
        },
        teams: [
            { id: "t1", name: "Frontend", lead: "Mike Ross", members: 12, projects: 4 },
            { id: "t2", name: "Backend", lead: "Harvey Specter", members: 15, projects: 5 },
            { id: "t3", name: "QA / Testing", lead: "Rachel Zane", members: 8, projects: 12 },
            { id: "t4", name: "DevOps", lead: "Louis Litt", members: 6, projects: 8 },
        ]
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{deptInfo.name}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-2">
                        Head of Department:
                        <span className="flex items-center gap-2 font-medium text-foreground">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback>SC</AvatarFallback>
                            </Avatar>
                            {deptInfo.head.name}
                        </span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/clients/${clientId}/departments/${deptId}/settings`)}>
                        <Settings className="mr-2 h-4 w-4" /> Settings
                    </Button>
                    <Button>
                        <Users className="mr-2 h-4 w-4" /> Manage Members
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deptInfo.stats.employees}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deptInfo.stats.teams}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deptInfo.stats.projects}</div>
                        <p className="text-xs text-muted-foreground">3 delivering soon</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Competency</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.8 / 5.0</div>
                        <p className="text-xs text-muted-foreground">Top 10% in Org</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="teams" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="teams">Teams</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="teams" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {deptInfo.teams.map((team) => (
                            <div key={team.id} onClick={() => router.push(`/clients/${clientId}/teams/${team.id}`)} className="cursor-pointer hover:shadow-md transition-shadow">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                                        <Badge variant="outline">Active</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 mt-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Team Lead:</span>
                                                <span className="font-medium">{team.lead}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Members:</span>
                                                <span className="font-medium">{team.members}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Projects:</span>
                                                <span className="font-medium">{team.projects}</span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" className="w-full mt-4 group">
                                            View Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                        <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
                            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center border shadow-sm mb-4">
                                <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">Create New Team</h3>
                            <p className="text-sm text-muted-foreground text-center mt-1">Add a new operational unit to {deptInfo.name}</p>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Projects</CardTitle>
                            <CardDescription>View all projects assigned to {deptInfo.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-[200px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                                Project list placeholder
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
