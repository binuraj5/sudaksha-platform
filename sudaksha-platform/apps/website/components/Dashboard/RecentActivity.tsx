"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, UserPlus, FileText, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    id: string;
    action: string;
    entityName: string;
    userName: string;
    createdAt: string;
    details?: any;
}

const ACTION_UI: Record<string, { icon: any, color: string, bg: string }> = {
    'CREATE': { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
    'UPDATE': { icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    'DELETE': { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    'COMPLETE': { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    'DEFAULT': { icon: FileText, color: "text-gray-600", bg: "bg-gray-50" }
};

export function RecentActivity({ clientId }: { clientId: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch(`/api/clients/${clientId}/dashboard/activity`);
                if (res.ok) {
                    setActivities(await res.json());
                }
            } catch (e) {
                console.error("Failed to fetch activities", e);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
        const interval = setInterval(fetchActivities, 60000);
        return () => clearInterval(interval);
    }, [clientId]);

    if (loading) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your organization</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map((activity) => {
                            const config = ACTION_UI[activity.action] ||
                                (activity.action.includes('CREATE') ? ACTION_UI.CREATE :
                                    activity.action.includes('UPDATE') ? ACTION_UI.UPDATE :
                                        activity.action.includes('DELETE') ? ACTION_UI.DELETE :
                                            activity.action.includes('COMPLETE') ? ACTION_UI.COMPLETE :
                                                ACTION_UI.DEFAULT);

                            return (
                                <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className={`p-2 rounded-full ${config.bg} mr-3 mt-1`}>
                                        <config.icon className={`h-4 w-4 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {activity.userName} {activity.action.toLowerCase()}d {activity.entityName}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
