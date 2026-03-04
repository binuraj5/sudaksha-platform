"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Mail, Search, UserCircle, Building2 } from "lucide-react";
import { toast } from "sonner";

type MemberRow = {
  id: string;
  name: string;
  email: string;
  externalId: string | null;
  role: string;
  type?: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  tenantId: string | null;
  tenant?: { name: string; type: string } | null;
};

export default function AdminUsersPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/users?limit=200");
        const result = await res.json();
        if (!res.ok) {
          toast.error(result.error || "Failed to fetch users");
          return;
        }
        if (result.success && Array.isArray(result.data)) {
          setMembers(result.data);
        } else {
          toast.error("Invalid response from server");
        }
      } catch {
        toast.error("An error occurred");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = members.filter(
    (m) =>
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.externalId && m.externalId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const labelForTenant = (m: MemberRow) => {
    if (!m.tenantId) return "B2C Individual";
    return m.tenant?.name ?? `Tenant ${m.tenantId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all platform users including B2C individuals and tenant members.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-card p-3 rounded-lg border border-border">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Search by name, email, or external ID..."
          className="border-0 bg-transparent focus-visible:ring-0 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No users found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm ? "Try a different search." : "Users will appear here once registered."}
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-foreground">
              All users ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Name</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Email</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Type / Tenant</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Role</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <UserCircle className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[160px]" title={m.name}>
                            {m.name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3 shrink-0" />
                          <span className="truncate max-w-[200px]" title={m.email}>
                            {m.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {!m.tenantId ? (
                          <Badge variant="secondary" className="text-xs font-medium">
                            B2C Individual
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Building2 className="h-3.5 w-3 shrink-0" />
                            <span className="truncate max-w-[140px]" title={labelForTenant(m)}>
                              {labelForTenant(m)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.role ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={m.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                          {m.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
