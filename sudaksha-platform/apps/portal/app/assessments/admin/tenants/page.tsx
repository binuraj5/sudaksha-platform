"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Users, FolderKanban, ExternalLink, Mail, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DeleteTenantDialog } from "@/components/admin/DeleteTenantDialog";

export default function TenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: string } | null>(null);

    const fetchTenants = async () => {
        try {
            const res = await fetch("/api/admin/clients");
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setTenants(data.filter((t: any) => t.type === "CORPORATE"));
            } else {
                toast.error(data.error || "Failed to fetch tenants");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const filtered = tenants.filter(
        (t) =>
            (t.name && t.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.slug && t.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const countMembers = (t: any) => t._count?.members ?? t._count?.users ?? 0;
    const countActivities = (t: any) => t._count?.activities ?? t._count?.projects ?? 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">Tenants (Corporate)</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage corporate B2B tenants on the SudAssess platform.</p>
            </div>

            <div className="flex items-center gap-4 bg-card p-3 rounded-lg border border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    placeholder="Search by name, email, or slug..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-lg border border-border">
                    <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">No corporate tenants found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Tenants will appear here once registered.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((tenant) => (
                        <Card key={tenant.id} className="overflow-hidden">
                            <div className="h-1 bg-primary" />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="p-2 rounded-lg bg-primary/10 w-fit">
                                        <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <Badge variant="secondary" className="text-xs font-medium shrink-0">
                                        {tenant.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base font-semibold text-foreground mt-2">{tenant.name}</CardTitle>
                                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                    <Mail className="h-3 w-3 mr-1 shrink-0" />
                                    <span className="truncate">{tenant.email}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-muted/50 p-2 rounded-md">
                                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Members</div>
                                        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                                            <Users className="h-3 w-3" />
                                            {countMembers(tenant)}
                                        </div>
                                    </div>
                                    <div className="bg-muted/50 p-2 rounded-md">
                                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Activities</div>
                                        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                                            <FolderKanban className="h-3 w-3" />
                                            {countActivities(tenant)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] text-muted-foreground font-mono truncate">/{tenant.slug}</div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 border-t flex flex-wrap gap-2 p-2">
                                <Button asChild variant="default" size="sm" className="text-xs h-7 px-2">
                                    <Link href={`/assessments/clients/${tenant.id}/dashboard`} target="_blank">
                                        Dashboard
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="text-xs h-7 px-2">
                                    <Link href={`/assessments/login?callbackUrl=${encodeURIComponent(`/assessments/clients/${tenant.id}/dashboard`)}`} target="_blank">
                                        Client login
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                                    onClick={() => setDeleteTarget({ id: tenant.id, name: tenant.name, type: tenant.type })}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {deleteTarget && (
                <DeleteTenantDialog
                    tenant={deleteTarget}
                    open={!!deleteTarget}
                    onOpenChange={(open) => !open && setDeleteTarget(null)}
                    onSuccess={() => {
                        setDeleteTarget(null);
                        fetchTenants();
                    }}
                />
            )}
        </div>
    );
}
