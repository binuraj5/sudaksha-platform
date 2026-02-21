"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Target, Globe, Building, Users, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EditRoleDialog } from "@/components/admin/EditRoleDialog";
import { useRoleCompetencyPermissions } from "@/hooks/useRoleCompetencyPermissions";
import { RoleRequestForm } from "./RoleRequestForm";
import { RoleRequestsList } from "./RoleRequestsList";

/**
 * Shared roles list UI for both /assessments/admin/roles and /assessments/clients/[clientId]/roles.
 * Data is scoped by the same API (/api/admin/roles) using RLS based on session.
 */
interface RolesPageContentProps {
    extraActions?: ReactNode;
    baseUrl?: string;
    /** When provided, fetches from the tenant-scoped API instead of the super-admin one */
    clientId?: string;
}

export function RolesPageContent({ extraActions, baseUrl = "/assessments/admin/roles", clientId }: RolesPageContentProps = {}) {
    const router = useRouter();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState("ALL");
    const [deptFilter, setDeptFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const permissions = useRoleCompetencyPermissions();

    useEffect(() => {
        fetchRoles();
    }, [clientId]);

    const fetchRoles = async () => {
        try {
            // Use tenant-scoped endpoint when clientId is provided (org portal)
            const endpoint = clientId
                ? `/api/clients/${clientId}/roles`
                : "/api/admin/roles";
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Failed to fetch roles");
            const data = await response.json();
            // /api/admin/roles returns { roles: [] }, tenant endpoint returns [] directly
            setRoles(Array.isArray(data) ? data : (data.roles || []));
        } catch (error) {
            toast.error("Failed to load roles");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitGlobal = async (role: any) => {
        try {
            const response = await fetch(`/api/admin/roles/${role.id}/submit-global`, { method: "POST" });
            if (!response.ok) throw new Error("Failed to submit for global review");
            toast.success("Role submitted for global review");
            fetchRoles();
        } catch (error) {
            toast.error("Failed to submit role for global review");
            console.error(error);
        }
    };

    const handleApprove = async (role: any) => {
        try {
            const response = await fetch(`/api/admin/roles/${role.id}/approve-global`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision: "APPROVE", notes: "Approved by Super Admin" }),
            });
            if (!response.ok) throw new Error("Failed to approve role");
            toast.success("Role approved globally");
            fetchRoles();
        } catch (error) {
            toast.error("Failed to approve role");
            console.error(error);
        }
    };

    const handleReject = async (role: any) => {
        try {
            const response = await fetch(`/api/admin/roles/${role.id}/approve-global`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision: "REJECT", notes: "Rejected by Super Admin" }),
            });
            if (!response.ok) throw new Error("Failed to reject role");
            toast.success("Role rejected");
            fetchRoles();
        } catch (error) {
            toast.error("Failed to reject role");
            console.error(error);
        }
    };

    const handleDelete = async (roleId: string, roleName: string) => {
        if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) return;
        try {
            // Use tenant-scoped endpoint when clientId is provided, otherwise use admin endpoint
            const endpoint = clientId
                ? `/api/clients/${clientId}/roles/${roleId}`
                : `/api/admin/roles/${roleId}`;
            const response = await fetch(endpoint, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete role");
            toast.success("Role deleted successfully");
            fetchRoles();
        } catch (error) {
            toast.error("Failed to delete role");
            console.error(error);
        }
    };

    const isSuperAdmin = permissions.canApproveGlobal;
    const visibleTabs = [
        { value: "all", label: "All Roles" },
        { value: "GLOBAL", label: "Global", show: true },
        { value: "ORGANIZATION", label: isSuperAdmin ? "By Organization" : "My Organization", show: !!clientId || permissions.visibleScopes.includes("ORGANIZATION") },
        { value: "DEPARTMENT", label: "My Department", show: permissions.visibleScopes.includes("DEPARTMENT") && !isSuperAdmin },
        { value: "TEAM", label: "My Team", show: permissions.visibleScopes.includes("TEAM") && !isSuperAdmin },
        { value: "CLASS", label: "My Class", show: permissions.visibleScopes.includes("CLASS") && !isSuperAdmin },
        { value: "pending_review", label: "⏳ Pending Review", show: isSuperAdmin },
        { value: "request_role", label: "Request Role", show: !!clientId },
        { value: "my_requests", label: "My Requests", show: !!clientId },
    ].filter((t) => t.show !== false);

    // Filter Logic
    const finalRoles = roles.filter((role) => {
        // 1. Search Query (Title/Code)
        if (searchQuery && !role.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !role.code?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        // 2. Level Filter
        if (levelFilter !== "ALL" && role.overallLevel !== levelFilter) {
            return false;
        }
        // 3. Status Filter
        if (statusFilter !== "ALL") {
            if (statusFilter === "ACTIVE" && role.status !== "APPROVED") return false;
            if (statusFilter === "DRAFT" && role.status !== "DRAFT") return false;
            // Add other status matches as needed
        }
        // 4. Department Filter (Optional if role has department mapping)
        if (deptFilter !== "ALL" && role.department !== deptFilter) {
            return false;
        }

        return true;
    });

    // Extract unique departments for the filter dropdown
    const uniqueDepartments = Array.from(new Set(roles.map(r => r.department).filter(Boolean))) as string[];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading roles...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Job Roles</h1>
                    <p className="text-slate-500">Manage definitions and competency profiles for job roles.</p>
                    {permissions.isInstitution && (
                        <p className="text-sm text-amber-600 mt-1">⚠️ Showing Junior/Fresher roles only (institution mode)</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {extraActions}
                    {permissions.canCreate && (
                        <Link href={`${baseUrl}/create`}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create {permissions.creatableScope === "GLOBAL" ? "Global " : ""}Role
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search roles by title..."
                        className="pl-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <select
                        className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                    >
                        <option value="ALL">All Levels</option>
                        <option value="JUNIOR">Junior</option>
                        <option value="MIDDLE">Middle</option>
                        <option value="SENIOR">Senior</option>
                        <option value="EXPERT">Expert</option>
                    </select>

                    <select
                        className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active / Approved</option>
                        <option value="DRAFT">Draft</option>
                    </select>

                    {uniqueDepartments.length > 0 && (
                        <select
                            className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="ALL">All Departments</option>
                            {uniqueDepartments.map((deptName) => (
                                <option key={deptName} value={deptName}>{deptName}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {visibleTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>
                {activeTab !== "request_role" && activeTab !== "my_requests" && (
                    <TabsContent value={activeTab}>
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Title</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Competencies</TableHead>
                                        <TableHead>Models</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {finalRoles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                No roles found matching the selected filters. Click &quot;Create New Role&quot; or adjust your search to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <FilteredRoleRows
                                            roles={finalRoles}
                                            activeTab={activeTab}
                                            isSuperAdmin={isSuperAdmin}
                                            permissions={permissions}
                                            router={router}
                                            onSubmitGlobal={handleSubmitGlobal}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            onDelete={handleDelete}
                                            onEditSuccess={fetchRoles}
                                            baseUrl={baseUrl}
                                            clientId={clientId}
                                        />
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                )}

                {clientId && (
                    <TabsContent value="request_role">
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <h2 className="text-xl font-bold mb-4">Request New Role</h2>
                            <RoleRequestForm clientId={clientId} />
                        </div>
                    </TabsContent>
                )}

                {clientId && (
                    <TabsContent value="my_requests">
                        <RoleRequestsList clientId={clientId} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function FilteredRoleRows({
    roles,
    activeTab,
    isSuperAdmin,
    permissions,
    router,
    onSubmitGlobal,
    onApprove,
    onReject,
    onDelete,
    onEditSuccess,
    baseUrl,
    clientId,
}: {
    roles: any[];
    activeTab: string;
    isSuperAdmin: boolean;
    permissions: any;
    router: any;
    onSubmitGlobal: (r: any) => void;
    onApprove: (r: any) => void;
    onReject: (r: any) => void;
    onDelete: (id: string, name: string) => void;
    onEditSuccess: () => void;
    baseUrl: string;
    clientId?: string;
}) {
    const filtered = roles.filter((r) => {
        if (activeTab === "all") return true;
        if (activeTab === "pending_review") return r.globalSubmissionStatus === "PENDING";
        if (activeTab === "ORGANIZATION" && isSuperAdmin) return r.scope !== "GLOBAL";
        return r.scope === activeTab;
    });

    if (filtered.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No roles found in this category.
                </TableCell>
            </TableRow>
        );
    }

    const showOrgGrouping = activeTab === "ORGANIZATION" && isSuperAdmin;
    const sortedRoles = showOrgGrouping
        ? [...filtered].sort((a, b) => (a.tenant?.name || "").localeCompare(b.tenant?.name || ""))
        : filtered;

    const rows: ReactNode[] = [];
    let lastTenantName = "";

    for (const role of sortedRoles) {
        if (showOrgGrouping) {
            const tenantName = role.tenant?.name || "Unassigned";
            if (tenantName !== lastTenantName) {
                lastTenantName = tenantName;
                rows.push(
                    <TableRow key={`org-header-${tenantName}`} className="bg-slate-50 hover:bg-slate-50">
                        <TableCell colSpan={7} className="py-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <Building className="w-4 h-4" />
                                {tenantName}
                            </div>
                        </TableCell>
                    </TableRow>
                );
            }
        }
        rows.push(
            <RoleTableRow
                key={role.id}
                role={role}
                permissions={permissions}
                isSuperAdmin={isSuperAdmin}
                onViewDetails={(r) => router.push(`${baseUrl}/${r.id}`)}
                onSubmitGlobal={onSubmitGlobal}
                onApprove={onApprove}
                onReject={onReject}
                onDelete={onDelete}
                onEditSuccess={onEditSuccess}
                clientId={clientId}
            />
        );
    }

    return <>{rows}</>;
}

function RoleTableRow({
    role,
    permissions,
    isSuperAdmin,
    onViewDetails,
    onSubmitGlobal,
    onApprove,
    onReject,
    onDelete,
    onEditSuccess,
    clientId,
}: {
    role: any;
    permissions: any;
    isSuperAdmin: boolean;
    onViewDetails: (r: any) => void;
    onSubmitGlobal: (r: any) => void;
    onApprove: (r: any) => void;
    onReject: (r: any) => void;
    onDelete: (id: string, name: string) => void;
    onEditSuccess: () => void;
    clientId?: string;
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex flex-col gap-1">
                    <span>{role.name}</span>
                    <span className="text-xs text-slate-400">{role.code}</span>
                    <div className="flex items-center gap-1 flex-wrap">
                        <ScopeBadge scope={role.scope} />
                        <GlobalStatusBadge status={role.globalSubmissionStatus} notes={role.globalReviewNotes} />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    {role.overallLevel}
                </Badge>
            </TableCell>
            <TableCell>{role._count?.competencies || 0}</TableCell>
            <TableCell>{role._count?.assessmentModels || 0}</TableCell>
            <TableCell>{role.department || "-"}</TableCell>
            <TableCell>
                {role.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                ) : (
                    <Badge variant="outline" className="text-slate-500">Draft</Badge>
                )}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDetails(role)}>
                            <Target className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {role._canEdit && (
                            <EditRoleDialog
                                role={role}
                                onSuccess={onEditSuccess}
                                clientId={clientId}
                                trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit Details
                                    </DropdownMenuItem>
                                }
                            />
                        )}
                        {role._canSubmitGlobal && permissions.canSubmitForGlobal && (
                            <DropdownMenuItem onClick={() => onSubmitGlobal(role)} className="text-blue-600">
                                <Globe className="w-4 h-4 mr-2" /> {role.globalSubmissionStatus ? "Resubmit Global" : "Go Global"}
                            </DropdownMenuItem>
                        )}
                        {isSuperAdmin && role.globalSubmissionStatus === "PENDING" && (
                            <>
                                <DropdownMenuItem onClick={() => onApprove(role)} className="text-green-600">
                                    <UserCheck className="w-4 h-4 mr-2" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onReject(role)} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Reject
                                </DropdownMenuItem>
                            </>
                        )}
                        {role._canDelete && (
                            <DropdownMenuItem onClick={() => onDelete(role.id, role.name)} className="text-red-600 focus:text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Role
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function ScopeBadge({ scope }: { scope: string }) {
    const scopeConfig: Record<string, { label: string; color: string; icon: typeof Globe }> = {
        GLOBAL: { label: "Global", color: "bg-blue-100 text-blue-700", icon: Globe },
        ORGANIZATION: { label: "My Org", color: "bg-green-100 text-green-700", icon: Building },
        DEPARTMENT: { label: "My Dept", color: "bg-yellow-100 text-yellow-700", icon: Users },
        TEAM: { label: "My Team", color: "bg-purple-100 text-purple-700", icon: UserCheck },
        CLASS: { label: "My Class", color: "bg-indigo-100 text-indigo-700", icon: UserCheck },
    };
    const config = scopeConfig[scope] || scopeConfig.GLOBAL;
    const Icon = config.icon;
    return (
        <Badge className={`${config.color} text-xs`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </Badge>
    );
}

function GlobalStatusBadge({ status, notes }: { status: string | null | undefined, notes?: string | null }) {
    if (!status || status === "APPROVED") return null;
    if (status === "PENDING")
        return <Badge className="ml-1 bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]" title={notes || "Pending Review"}>Pending</Badge>;
    if (status === "CHANGES_REQUESTED")
        return <Badge className="ml-1 bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px]" title={notes || "Changes requested"}>Changes requested</Badge>;
    if (status === "REJECTED")
        return <Badge className="ml-1 bg-red-100 text-red-700 hover:bg-red-100 text-[10px]" title={notes || "Rejected"}>Rejected</Badge>;
    return null;
}
