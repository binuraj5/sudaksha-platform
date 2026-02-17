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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EditRoleDialog } from "@/components/admin/EditRoleDialog";
import { useRoleCompetencyPermissions } from "@/hooks/useRoleCompetencyPermissions";

/**
 * Shared roles list UI for both /assessments/admin/roles and /assessments/clients/[clientId]/roles.
 * Data is scoped by the same API (/api/admin/roles) using RLS based on session.
 */
export function RolesPageContent() {
    const router = useRouter();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const permissions = useRoleCompetencyPermissions();

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch("/api/admin/roles");
            if (!response.ok) throw new Error("Failed to fetch roles");
            const data = await response.json();
            setRoles(data.roles || []);
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
            const response = await fetch(`/api/admin/roles/${roleId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete role");
            toast.success("Role deleted successfully");
            fetchRoles();
        } catch (error) {
            toast.error("Failed to delete role");
            console.error(error);
        }
    };

    const visibleTabs = [
        { value: "all", label: "All Roles" },
        { value: "GLOBAL", label: "Global", show: true },
        { value: "ORGANIZATION", label: "My Organization", show: permissions.visibleScopes.includes("ORGANIZATION") },
        { value: "DEPARTMENT", label: "My Department", show: permissions.visibleScopes.includes("DEPARTMENT") },
        { value: "TEAM", label: "My Team", show: permissions.visibleScopes.includes("TEAM") },
        { value: "CLASS", label: "My Class", show: permissions.visibleScopes.includes("CLASS") },
        { value: "pending_review", label: "⏳ Pending Review", show: permissions.canApproveGlobal },
    ].filter((t) => t.show !== false);

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
                {permissions.canCreate && (
                    <Link href="/assessments/admin/roles/create">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create {permissions.creatableScope === "GLOBAL" ? "Global " : ""}Role
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search roles..." className="pl-10" />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    {visibleTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                </TabsList>
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
                                {roles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                            No roles found. Click &quot;Create New Role&quot; to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles
                                        .filter((r) =>
                                            activeTab === "all"
                                                ? true
                                                : activeTab === "pending_review"
                                                  ? r.globalSubmissionStatus === "PENDING"
                                                  : r.scope === activeTab
                                        )
                                        .map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col gap-1">
                                                        <span>{role.name}</span>
                                                        <span className="text-xs text-slate-400">{role.code}</span>
                                                        <ScopeBadge scope={role.scope} />
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
                                                            <DropdownMenuItem onClick={() => router.push(`/assessments/admin/roles/${role.id}`)}>
                                                                <Target className="w-4 h-4 mr-2" /> View Details
                                                            </DropdownMenuItem>
                                                            {role._canEdit && (
                                                                <EditRoleDialog
                                                                    role={role}
                                                                    onSuccess={fetchRoles}
                                                                    trigger={
                                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                            <Edit className="w-4 h-4 mr-2" /> Edit Details
                                                                        </DropdownMenuItem>
                                                                    }
                                                                />
                                                            )}
                                                            {role._canSubmitGlobal && permissions.canSubmitForGlobal && (
                                                                <DropdownMenuItem onClick={() => handleSubmitGlobal(role)} className="text-blue-600">
                                                                    <Globe className="w-4 h-4 mr-2" /> 🌐 Go Global
                                                                </DropdownMenuItem>
                                                            )}
                                                            {permissions.canApproveGlobal && role.globalSubmissionStatus === "PENDING" && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleApprove(role)} className="text-green-600">
                                                                        <UserCheck className="w-4 h-4 mr-2" /> ✓ Approve
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleReject(role)} className="text-red-600">
                                                                        <Trash2 className="w-4 h-4 mr-2" /> ✗ Reject
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {role._canDelete && (
                                                                <DropdownMenuItem onClick={() => handleDelete(role.id, role.name)} className="text-red-600 focus:text-red-600">
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Role
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
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
