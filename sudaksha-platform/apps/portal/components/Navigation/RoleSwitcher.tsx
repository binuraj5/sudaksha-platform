"use client";

import { useState } from "react";
import { Building2, User, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "ADMIN" | "PERSONAL";

interface RoleSwitcherProps {
    currentRole: string;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function RoleSwitcher({ currentRole, viewMode, onViewModeChange }: RoleSwitcherProps) {

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'TENANT_ADMIN':
            case 'CLIENT_ADMIN': return 'Corporate Admin';
            case 'DEPARTMENT_HEAD':
            case 'DEPT_HEAD': return 'Department Head';
            case 'TEAM_LEAD': return 'Team Lead';
            case 'CLASS_TEACHER': return 'Class Teacher';
            default: return 'Management';
        }
    };

    const roleLabel = getRoleLabel(currentRole);

    return (
        <div className="px-4 py-2 mb-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-between h-auto py-3 px-3 border-dashed border-2",
                            viewMode === "ADMIN" ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-1.5 rounded-md",
                                viewMode === "ADMIN" ? "bg-indigo-200 text-indigo-700" : "bg-gray-200 text-gray-700"
                            )}>
                                {viewMode === "ADMIN" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Viewing as</span>
                                <span className="text-sm font-bold">
                                    {viewMode === "ADMIN" ? roleLabel : "My Personal Page"}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                    <DropdownMenuItem
                        className="gap-2 p-3 cursor-pointer"
                        onSelect={() => onViewModeChange("ADMIN")}
                        disabled={viewMode === "ADMIN"}
                    >
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">{roleLabel}</span>
                            <span className="text-xs text-gray-500">Manage your organization</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="gap-2 p-3 cursor-pointer"
                        onSelect={() => onViewModeChange("PERSONAL")}
                        disabled={viewMode === "PERSONAL"}
                    >
                        <div className="p-1.5 bg-gray-100 text-gray-600 rounded-md">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">My Personal Page</span>
                            <span className="text-xs text-gray-500">Access your tasks & profile</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
