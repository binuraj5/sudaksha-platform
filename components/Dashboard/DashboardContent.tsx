"use client";

import { useEffect, useState } from "react";
import { StatsGrid, DashboardStats } from "./StatsGrid";
import { GapAnalysisChart, GapData } from "./GapAnalysisChart";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";
import { Loader2 } from "lucide-react";
import type { TenantLabels } from "@/lib/tenant-labels";

export function DashboardContent({ clientId, labels, basePath }: { clientId: string; labels?: TenantLabels; basePath?: string }) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [gapData, setGapData] = useState<GapData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, gapRes] = await Promise.all([
                    fetch(`/api/clients/${clientId}/dashboard/stats`),
                    fetch(`/api/clients/${clientId}/dashboard/gap-analysis`)
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (gapRes.ok) setGapData(await gapRes.json());
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Optional: Set up interval for real-time
        const interval = setInterval(fetchData, 60000); // 1 min refresh
        return () => clearInterval(interval);
    }, [clientId]);

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="space-y-8">
            <StatsGrid stats={stats} labels={labels} />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                <GapAnalysisChart data={gapData} />
                <div className="space-y-6">
                    <RecentActivity />
                    <QuickActions clientId={clientId} basePath={basePath} />
                </div>
            </div>
        </div>
    );
}
