"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, CheckCircle2, MoreHorizontal, Plus, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamDashboardProps {
    clientId: string;
    teamId: string;
}

export function TeamDashboard({ clientId, teamId }: TeamDashboardProps) {
    // Mock Data
    const teamInfo = {
        name: "Frontend Alpha",
        department: "Engineering",
        lead: "Mike Ross",
        description: "Responsible for all client-facing interfaces and UX implementation.",
        members: [
            { id: 1, name: "John Doe", role: "Senior Developer", status: "Active", utilization: 80 },
            { id: 2, name: "Alice Smith", role: "Developer", status: "Active", utilization: 60 },
            { id: 3, name: "Bob Jones", role: "Junior Developer", status: "On Leave", utilization: 0 },
            { id: 4, name: "Eve Black", role: "Designer", status: "Active", utilization: 45 },
        ],
        projects: [
            { id: 1, name: "Portal Redesign", progress: 75, status: "On Track" },
            { id: 2, name: "Mobile App Upgrade", progress: 30, status: "At Risk" },
        ]
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{teamInfo.department}</Badge>
                        <h2 className="text-3xl font-bold tracking-tight">{teamInfo.name}</h2>
                    </div>
                    <p className="text-muted-foreground">{teamInfo.description}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" /> Team Settings
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Member
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Team Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamInfo.members.length} Members</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamInfo.projects.length} Projects</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">65%</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="members" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="members">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>Manage allocation and view status of team members.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            {teamInfo.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium leading-none">{member.name}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-32">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Utilization</span>
                                                <span>{member.utilization}%</span>
                                            </div>
                                            <Progress value={member.utilization} className="h-2" />
                                        </div>
                                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'} className={member.status === 'Active' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25' : ''}>
                                            {member.status}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>Reassign Team</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Remove from Team</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {teamInfo.projects.map((proj) => (
                                <div key={proj.id} className="mb-4 last:mb-0 p-4 border rounded-lg">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-semibold">{proj.name}</h4>
                                        <Badge variant={proj.status === 'On Track' ? 'default' : 'destructive'}>{proj.status}</Badge>
                                    </div>
                                    <Progress value={proj.progress} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-2">{proj.progress}% Complete</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
