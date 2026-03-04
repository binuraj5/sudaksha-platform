import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Building2,
    ShieldCheck,
    Activity,
    ExternalLink,
    TrendingUp
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';

export default async function GlobalAdminDashboard() {
    const [tenantCount, userCount, assessmentCount] = await Promise.all([
        prisma.tenant.count(),
        prisma.user.count(),
        (prisma as any).userAssessmentModel?.count() || Promise.resolve(0)
    ]);

    const stats = [
        { label: "Total Tenants", value: tenantCount, change: "+2", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Active Users", value: userCount, change: "+12%", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Assessments", value: assessmentCount, change: "+840", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "System Health", value: "99.9%", icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    const recentTenants = await prisma.tenant.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true, type: true, slug: true }
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Global Overview</h1>
                <p className="text-sm text-muted-foreground">Real-time health and growth metrics across the entire ecosystem.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
                            <div className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-foreground tracking-tight mb-1">{stat.value}</div>
                            {stat.change && (
                                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                    <TrendingUp className="h-3 w-3" /> {stat.change}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main section */}
                <div className="md:col-span-8 space-y-6">
                    <Card className="rounded-xl border border-border shadow-sm px-4">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <CardTitle className="text-lg font-semibold text-foreground tracking-tight">Recent Onboarding</CardTitle>
                            <CardDescription className="text-muted-foreground text-sm">Latest organizations to join the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-3">
                                {recentTenants.map((tenant) => (
                                    <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                                                <p className="text-xs text-muted-foreground">/{tenant.slug}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs font-medium">
                                                {tenant.type}
                                            </Badge>
                                            <Link href={`/assessments/admin/tenants`}>
                                                <Button size="icon" variant="ghost" className="rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar section */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="rounded-xl bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                        <CardHeader className="relative z-10 pb-2">
                            <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Node Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium uppercase tracking-wider opacity-80">
                                    <span>Database Latency</span>
                                    <span>12ms</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[15%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium uppercase tracking-wider opacity-80">
                                    <span>Storage Capacity</span>
                                    <span>0.4%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[5%]" />
                                </div>
                            </div>
                            <Button className="w-full bg-white text-primary hover:bg-white/90 font-medium text-sm h-10 rounded-lg mt-2">
                                Global Config
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
