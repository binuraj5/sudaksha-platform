"use client";

import { Users, Building, FolderKanban, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenantLabels } from "@/lib/tenant-labels";

export interface DashboardStats {
    employees: {
        total: number;
        active: number;
        inactive: number;
        trend: number;
    };
    departments: {
        total: number;
        avgEmployeesPerDept: number;
    };
    projects: {
        total: number;
        active: number;
        completed: number;
    };
    performance: {
        overall: number;
    };
}

export function StatsGrid({ stats, labels }: { stats: DashboardStats | null; labels?: TenantLabels | null }) {
    if (!stats) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>)}
    </div>;

    const m = labels?.memberPlural ?? "Employees";
    const mDept = labels?.orgUnitPlural ?? "Departments";
    const mActivity = labels?.activityPlural ?? "Projects";

    const items = [
        {
            title: `Total ${m}`,
            value: stats.employees.total,
            subValue: `${stats.employees.active} active`,
            icon: Users,
            trend: stats.employees.trend,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: mDept,
            value: stats.departments.total,
            subValue: `~${stats.departments.avgEmployeesPerDept} per unit`,
            icon: Building,
            trend: 0,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: `Active ${mActivity}`,
            value: stats.projects.active,
            subValue: `${stats.projects.completed} completed`,
            icon: FolderKanban,
            trend: 12, // Mock positive trend for projects
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Avg Performance",
            value: `${Math.round(stats.performance.overall)}%`,
            subValue: " across all assessments",
            icon: TrendingUp,
            trend: 5.4,
            color: "text-green-600",
            bg: "bg-green-50"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => (
                <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {item.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${item.bg}`}>
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">{item.subValue}</p>
                            {item.trend !== 0 && (
                                <div className={`flex items-center text-xs font-medium ${item.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {Math.abs(Math.round(item.trend))}%
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
