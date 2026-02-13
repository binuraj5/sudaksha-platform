"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    ArrowLeft,
    ExternalLink,
    Users,
    FolderKanban,
    LayoutGrid,
    Mail,
    Globe,
    Settings,
    Loader2,
} from "lucide-react";

export default function TenantDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/admin/clients/${id}`);
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setError(data.error || "Failed to load tenant");
                    return;
                }
                const data = await res.json();
                if (data.type !== "CORPORATE") {
                    setError("Not a corporate tenant");
                    return;
                }
                setTenant(data);
            } catch {
                setError("An error occurred");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="space-y-4">
                <Link
                    href="/assessments/admin/tenants"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tenants
                </Link>
                <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">{error || "Tenant not found"}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const membersCount = tenant._count?.members ?? 0;
    const activitiesCount = tenant._count?.activities ?? 0;
    const orgUnitsCount = tenant._count?.orgUnits ?? 0;
    const rolesCount = tenant._count?.roles ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/assessments/admin/tenants"
                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">{tenant.name}</h1>
                            <p className="text-sm text-muted-foreground">/{tenant.slug} · Corporate</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="default" size="sm">
                        <Link href={`/assessments/clients/${tenant.id}/dashboard`} target="_blank">
                            Open dashboard
                            <ExternalLink className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/assessments/clients/${tenant.id}/settings`} target="_blank">
                            Settings
                            <Settings className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-foreground">{membersCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FolderKanban className="w-4 h-4" />
                            Activities / Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-foreground">{activitiesCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4" />
                            Departments / Teams
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-foreground">{orgUnitsCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-foreground">{rolesCount}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Details</CardTitle>
                    <CardDescription>Tenant information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Email:</span>
                        <a href={`mailto:${tenant.email}`} className="text-primary hover:underline">
                            {tenant.email}
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Slug:</span>
                        <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">/{tenant.slug}</code>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={tenant.isActive ? "default" : "secondary"}>
                            {tenant.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
