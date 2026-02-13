"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function DashboardStats() {
    const { data, isLoading } = useQuery({
        queryKey: ["assessment-stats"],
        queryFn: async () => {
            const res = await fetch("/api/admin/assessments/stats");
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    const stats = data?.stats || {
        total: 0,
        completed: 0,
        inProgress: 0,
        pendingReviews: 0,
    };

    const statCards = [
        {
            title: "Total Assessments",
            value: stats.total,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "In Progress",
            value: stats.inProgress,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100",
        },
        {
            title: "Pending Review",
            value: stats.pendingReviews,
            icon: AlertCircle,
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {stat.value}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
