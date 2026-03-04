"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface OrgUnitNode {
    id: string;
    name: string;
    type: "TENANT" | "DEPARTMENT" | "TEAM" | "CLASS";
    head?: { name: string; role: string; avatar?: string };
    children?: OrgUnitNode[];
    members?: { name: string; role: string; isCurrentUser?: boolean; avatar?: string }[];
}

// Mock Data Structure
const mockOrgData: OrgUnitNode = {
    id: "org-1",
    name: "TechCorp Inc.",
    type: "TENANT",
    children: [
        {
            id: "dept-1",
            name: "Engineering",
            type: "DEPARTMENT",
            head: { name: "Sarah Connor", role: "VP of Engineering" },
            children: [
                {
                    id: "team-1",
                    name: "Frontend Team",
                    type: "TEAM",
                    head: { name: "Mike Ross", role: "Team Lead" },
                    members: [
                        { name: "John Doe", role: "Senior Developer", isCurrentUser: true },
                        { name: "Alice Smith", role: "Developer" },
                        { name: "Bob Jones", role: "Junior Developer" },
                    ]
                },
                {
                    id: "team-2",
                    name: "Backend Team",
                    type: "TEAM",
                    head: { name: "Harvey Specter", role: "Team Lead" },
                    members: [
                        { name: "Louis Litt", role: "Senior Architect" },
                    ]
                }
            ]
        }
    ]
};

const NodeCard = ({ node, level = 0 }: { node: OrgUnitNode, level?: number }) => {
    return (
        <div className={`flex flex-col items-center relative ${level > 0 ? "mt-8" : ""}`}>
            {level > 0 && <div className="absolute -top-8 w-px h-8 bg-border" />}

            <Card className="w-64 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px]">{node.type}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{node.name}</CardTitle>
                    {node.head && (
                        <CardDescription className="text-xs mt-1 flex items-center gap-2">
                            <span className="font-semibold text-primary">Head:</span> {node.head.name}
                        </CardDescription>
                    )}
                </CardHeader>
                {node.members && node.members.length > 0 && (
                    <CardContent className="p-4 pt-2">
                        <div className="space-y-2 mt-2">
                            {node.members.map((member, idx) => (
                                <div key={idx} className={`flex items-center gap-2 p-1.5 rounded-md ${member.isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"}`}>
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <div className="text-sm font-medium truncate">
                                            {member.name} {member.isCurrentUser && "(You)"}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate">{member.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {node.children && node.children.length > 0 && (
                <div className="relative mt-8 flex justify-center gap-8">
                    {/* Connecting lines */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                    <div className="absolute -top-4 left-0 right-0 h-px bg-border mx-32" /> {/* Horizontal connector */}

                    {node.children.map((child) => (
                        <NodeCard key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export function OrgChart() {
    return (
        <div className="overflow-auto p-8 min-h-[500px] flex justify-center">
            <div className="min-w-max">
                <NodeCard node={mockOrgData} />
            </div>
        </div>
    );
}
