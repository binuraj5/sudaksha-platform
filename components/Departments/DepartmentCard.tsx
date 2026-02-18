"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Users, FolderTree, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTenantLabels } from "@/hooks/useTenantLabels";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
    manager?: {
        name: string;
        avatar?: string;
    } | null;
    stats: {
        teams: number;
        employees: number;
        projects: number;
    };
}

export function DepartmentCard({ dept, clientId, basePath }: { dept: Department; clientId: string; basePath?: string }) {
    const linkBase = basePath ?? `/assessments/clients/${clientId}`;
    const labels = useTenantLabels();
    const router = useRouter();
    return (
        <Card className={`hover:shadow-md transition-all ${!dept.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 text-white font-bold flex items-center justify-center rounded-lg ${dept.isActive ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                        {dept.code.substring(0, 2)}
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold">{dept.name}</CardTitle>
                        <div className="text-xs text-gray-500 font-mono">{dept.code}</div>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`${linkBase}/departments/${dept.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit {labels.orgUnit}</DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onSelect={async (e) => {
                                e.preventDefault();
                                if (window.confirm(`Are you sure you want to delete this ${labels.orgUnit.toLowerCase()}? This action cannot be undone.`)) {
                                    try {
                                        const res = await fetch(`/api/v1/org-units/${dept.id}`, {
                                            method: 'DELETE',
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            toast.success(`${labels.orgUnit} deleted successfully`);
                                            router.refresh();
                                        } else {
                                            toast.error(data.error?.message || `Failed to delete ${labels.orgUnit.toLowerCase()}`);
                                        }
                                    } catch (err) {
                                        toast.error("An unexpected error occurred");
                                    }
                                }
                            }}
                        >
                            Delete {labels.orgUnit}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mt-4 text-sm">
                    <div className="flex flex-col items-center text-gray-700">
                        <FolderTree className="h-4 w-4 mb-1 text-blue-600" />
                        <span className="font-bold text-gray-900">{dept.stats.teams}</span>
                        <span className="text-[10px] uppercase font-medium text-gray-600">{labels.subUnitPlural}</span>
                    </div>
                    <div className="flex flex-col items-center text-gray-700">
                        <Users className="h-4 w-4 mb-1 text-green-600" />
                        <span className="font-bold text-gray-900">{dept.stats.employees}</span>
                        <span className="text-[10px] uppercase font-medium text-gray-600">{labels.memberPlural}</span>
                    </div>
                    <div className="flex flex-col items-center text-gray-700">
                        <Briefcase className="h-4 w-4 mb-1 text-purple-600" />
                        <span className="font-bold text-gray-900">{dept.stats.projects}</span>
                        <span className="text-[10px] uppercase font-medium text-gray-600">{labels.activityPlural}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t bg-gray-50 flex justify-between items-center">
                <div className="flex items-center text-xs text-gray-600">
                    <span className="mr-2">Head:</span>
                    {dept.manager ? (
                        <div className="flex items-center">
                            <Avatar className="h-5 w-5 mr-1">
                                <AvatarImage src={dept.manager.avatar} />
                                <AvatarFallback>{dept.manager.name.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-800">{dept.manager.name}</span>
                        </div>
                    ) : (
                        <Badge variant="outline" className="text-gray-500 font-normal border-gray-300">Unassigned</Badge>
                    )}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs text-gray-700 border-gray-300 hover:bg-gray-100" asChild>
                    <Link href={`${linkBase}/departments/${dept.id}`}>Manage</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
