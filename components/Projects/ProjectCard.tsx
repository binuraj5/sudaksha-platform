"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MoreVertical, Paperclip, Pencil, ArrowUpCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useTenantLabels } from "@/hooks/useTenantLabels";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    name: string;
    code: string;
    status: string;
    startDate: string;
    endDate?: string;
    owner?: { name: string; avatar?: string };
    stats: {
        members: number;
        assessments: number;
        progress: number;
    };
    departments: { id: string; name: string }[];
    teamData: { id: string; name: string }[];
}

const statusColors: any = {
    PLANNED: "bg-gray-100 text-gray-700",
    ACTIVE: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-red-50 text-red-500"
};

export function ProjectCard({ project, clientId, basePath }: { project: Project; clientId: string; basePath?: string }) {
    const labels = useTenantLabels();
    const router = useRouter();
    const base = basePath ?? `/assessments/clients/${clientId}`;
    const projectUrl = `${base}/projects/${project.id}`;
    const canPushToNext = project.status === "PLANNED" || project.status === "DRAFT";

    const handlePushToNext = async () => {
        try {
            const res = await fetch(`/api/clients/${clientId}/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACTIVE" }),
            });
            if (res.ok) router.refresh();
        } catch (_) {}
    };

    const handleDelete = async () => {
        if (!confirm("Archive this project? You can restore it later if needed.")) return;
        try {
            const res = await fetch(`/api/clients/${clientId}/projects/${project.id}`, { method: "DELETE" });
            if (res.ok) router.refresh();
        } catch (_) {}
    };

    return (
        <Card className="hover:shadow-md transition-all border-t-4 border-t-transparent hover:border-t-indigo-500">
            <CardHeader className="p-4 pb-2 space-y-0">
                <div className="flex justify-between items-start">
                    <Badge className={`mb-2 hover:bg-opacity-80 border-0 ${statusColors[project.status] || 'bg-gray-100'}`}>
                        {project.status.replace('_', ' ')}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 -mr-2" onClick={(e) => e.preventDefault()}>
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={projectUrl} className="flex items-center gap-2">
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            {canPushToNext && (
                                <DropdownMenuItem onClick={handlePushToNext} className="flex items-center gap-2">
                                    <ArrowUpCircle className="h-4 w-4" /> Push to next level
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 flex items-center gap-2" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardTitle className="text-base font-bold line-clamp-1">
                    <Link href={projectUrl} className="hover:underline">
                        {project.name}
                    </Link>
                </CardTitle>
                <div className="text-xs text-gray-500 font-mono mt-1">{project.code}</div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.startDate).toLocaleDateString()}
                    {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                </div>

                <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{project.stats.progress}%</span>
                    </div>
                    <Progress value={project.stats.progress} className="h-1.5" />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {project.teamData.map((m, i) => (
                            <Avatar key={m.id} className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                                    {m.name[0]}
                                </AvatarFallback>
                            </Avatar>
                        )).slice(0, 3)}
                        {project.stats.members > 3 && (
                            <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-medium">
                                +{project.stats.members - 3}
                            </div>
                        )}
                    </div>
                    {project.stats.assessments > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                            <Paperclip className="h-3 w-3 mr-1" /> {project.stats.assessments}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
