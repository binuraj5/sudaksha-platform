"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, UserPlus, FileText, AlertCircle } from "lucide-react";

// Mock data generator for MVP
// In M2+, this should fetch from AuditLog or Activity Feed API
const ACTIVITIES = [
    { id: 1, type: 'assessment', message: "John Doe completed 'Java Fundamentals'", time: "2 hours ago", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { id: 2, type: 'onboarding', message: "Sarah Smith joined Engineering Team", time: "4 hours ago", icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 3, type: 'assignment', message: "New Project 'Q3 Training' assigned", time: "1 day ago", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    { id: 4, type: 'alert', message: "5 licenses expiring soon", time: "2 days ago", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
];

export function RecentActivity() {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your organization</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {ACTIVITIES.map((activity) => (
                        <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className={`p-2 rounded-full ${activity.bg} mr-3 mt-1`}>
                                <activity.icon className={`h-4 w-4 ${activity.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
