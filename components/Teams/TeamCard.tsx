"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTenantLabels } from "@/hooks/useTenantLabels";

interface Team {
    id: string;
    name: string;
    code: string;
    department?: { name: string };
    manager?: { name: string; avatar?: string };
    memberCount: number;
    performance: number;
}

export function TeamCard({ team, clientId, basePath }: { team: Team; clientId: string; basePath?: string }) {
    const labels = useTenantLabels();
    const base = basePath ?? `/assessments/clients/${clientId}`;
    return (
        <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center rounded-lg">
                        {team.code.substring(0, 2)}
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold">{team.name}</CardTitle>
                        <div className="text-xs text-gray-500">{team.department?.name || 'No Dept'}</div>
                    </div>
                </div>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-bold">{team.memberCount}</span>
                        <span className="text-xs uppercase text-gray-400">{labels.memberPlural}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Avg Perf</div>
                        <div className="font-bold text-green-600">{team.performance}%</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-2">Lead:</span>
                    {team.manager ? (
                        <div className="flex items-center">
                            <Avatar className="h-5 w-5 mr-1">
                                <AvatarImage src={team.manager.avatar} />
                                <AvatarFallback>{team.manager.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-700 truncate max-w-[100px]">{team.manager.name}</span>
                        </div>
                    ) : (
                        <span className="italic">Unassigned</span>
                    )}
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                    <Link href={`${base}/teams/${team.id}`}>View</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
