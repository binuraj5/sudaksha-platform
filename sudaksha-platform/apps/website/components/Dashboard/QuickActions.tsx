"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Layout, Settings, FilePlus } from "lucide-react";

export function QuickActions({ clientId, basePath }: { clientId: string; basePath?: string }) {
    const base = basePath ?? `/assessments/clients/${clientId}`;
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Link href={`${base}/employees/new`} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className="p-2 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors mr-3">
                        <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Add Employee</span>
                </Link>
                <Link href={`${base}/projects/new`} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className="p-2 bg-purple-50 rounded-md group-hover:bg-purple-100 transition-colors mr-3">
                        <Layout className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">New Project</span>
                </Link>
                <Link href={`${base}/assessments/assign`} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className="p-2 bg-green-50 rounded-md group-hover:bg-green-100 transition-colors mr-3">
                        <FilePlus className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Assign Assessment</span>
                </Link>
                <Link href={`${base}/settings`} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className="p-2 bg-gray-100 rounded-md group-hover:bg-gray-200 transition-colors mr-3">
                        <Settings className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Settings</span>
                </Link>
            </CardContent>
        </Card>
    );
}
