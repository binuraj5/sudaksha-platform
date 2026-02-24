"use client";

import Link from "next/link";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Target, Globe, Building, Users, UserCheck, AlertCircle, XCircle, RefreshCw } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
    const [rejectDialog, setRejectDialog] = useState<{ role: any } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectLoading, setRejectLoading] = useState(false);

    const permissions = useRoleCompetencyPermissions();

    useEffect(() => {
        fetchRoles();
    }, [clientId]);

    const fetchRoles = async () => {
        try {
            const endpoint = clientId
                ? `/api/clients/${clientId}/roles`
                : "/api/admin/roles";
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Failed to fetch roles");
            const data = await response.json();
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

    const handleReject = (role: any) => {
        setRejectReason("");
        setRejectDialog({ role });
    };

    const confirmReject = async () => {
        if (!rejectDialog) return;
        setRejectLoading(true);
        try {
            const response = await fetch(`/api/admin/roles/${rejectDialog.role.id}/approve-global`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision: "REJECT", notes: rejectReason || "Rejected by Super Admin" }),
            });
            if (!response.ok) throw new Error("Failed to reject role");
            toast.success("Role rejected");
            setRejectDialog(null);
            fetchRoles();
        } catch (error) {
            toast.error("Failed to reject role");
            console.error(error);
        } finally {
            setRejectLoading(false);
        }
    };

    const handleDelete = async (roleId: string, roleName: string) => {
        if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) return;
        try {
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

    const handleResubmit = async (role: any) => {
        try {
            const res = await fetch(`/api/admin/roles/${role.id}/submit-global`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to resubmit");
            toast.success("Role resubmitted for global review");
            fetchRoles();
        } catch {
            toast.error("Failed to resubmit role");
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

    const finalRoles = roles.filter((role) => {
        if (searchQuery && !role.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !role.code?.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (levelFilter !== "ALL" && role.overallLevel !== levelFilter) {
            return false;
        }
        if (statusFilter !== "ALL") {
            if (statusFilter === "ACTIVE" && role.status !== "APPROVED") return false;
            if (statusFilter === "DRAFT" && role.status !== "DRAFT") return false;
        }
        if (deptFilter !== "ALL" && role.department !== deptFilter) {
            return false;
        }
        return true;
    });

    const uniqueDepartments = Array.from(new Set(roles.map(r => r.department).filter(Boolean))) as string[];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Loading roles...</div>
            </div>
        );
    }

    return (
        <>
            {/* Reject Reason Dialog */}
            <Dialog open={!!rejectDialog} onOpenChange={(open) => !open && setRejectDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Role: {rejectDialog?.role.name}</DialogTitle>
                        <DialogDescription>
                            Please provide a clear reason for rejecting this role. The author will see this message.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        className="mt-2"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmReject}
                            disabled={rejectLoading}
                        >
                            {rejectLoading ? "Rejecting..." : "Confirm Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                                onResubmit={handleResubmit}
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
        </>
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
    onResubmit,
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
    onResubmit: (r: any) => void;
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
                onResubmit={onResubmit}
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
    onResubmit,
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
    onResubmit: (r: any) => void;
    clientId?: string;
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex flex-col gap-0.5">
                    <span>{role.name}</span>
                    <span className="text-xs text-slate-400">{role.code}</span>
                    <div className="flex items-center gap-1 flex-wrap">
                        <ScopeBadge scope={role.scope} />
                        <GlobalStatusBadge status={role.globalSubmissionStatus} />
                    </div>
                    <RejectionAlert role={role} onResubmit={onResubmit} permissions={permissions} />
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
                                    <Trash2 className="w-4 h-4 mr-2" /> Reject with Reason
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

function GlobalStatusBadge({ status }: { status: string | null | undefined }) {
    if (!status || status === "APPROVED") return null;
    if (status === "PENDING")
        return <Badge className="ml-1 bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">⏳ Pending Review</Badge>;
    // REJECTED and CHANGES_REQUESTED are shown via the RejectionAlert panel below the title
    return null;
}

export function RejectionAlert({
    role,
    onResubmit,
    permissions,
}: {
    role: any;
    onResubmit?: (role: any) => void;
    permissions: any;
}) {
    const status = role.globalSubmissionStatus;
    const reason = role.globalRejectionReason;
    if (status !== "REJECTED" && status !== "CHANGES_REQUESTED") return null;
    const isRejected = status === "REJECTED";
    return (
        <div className={`mt-1.5 flex flex-col gap-1 rounded-md border px-3 py-2 text-xs ${isRejected ? "border-red-200 bg-red-50 text-red-800" : "border-orange-200 bg-orange-50 text-orange-800"
            }`}>
            <div className="flex items-center gap-1.5 font-semibold">
                {isRejected ? <XCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {isRejected ? "Rejected by Super Admin" : "Changes Requested"}
            </div>
            {reason && <p className="text-[11px] leading-snug opacity-80">&ldquo;{reason}&rdquo;</p>}
            {onResubmit && (role._canSubmitGlobal || role._canEdit) && permissions.canSubmitForGlobal && (
                <button
                    onClick={() => onResubmit(role)}
                    className={`mt-0.5 inline-flex items-center gap-1 self-start rounded px-2 py-0.5 text-[11px] font-semibold hover:opacity-80 ${isRejected ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                        }`}
                >
                    <RefreshCw className="w-3 h-3" /> Resubmit
                </button>
            )}
        </div>
    );
}
