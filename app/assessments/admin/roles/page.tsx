"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Target, FileText } from "lucide-react";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EditRoleDialog } from "@/components/admin/EditRoleDialog";

export default function RolesListPage() {
    const router = useRouter();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/admin/roles');
            if (!response.ok) throw new Error('Failed to fetch roles');
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            toast.error('Failed to load roles');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roleId: string, roleName: string) => {
        if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/roles/${roleId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete role');

            toast.success('Role deleted successfully');
            fetchRoles(); // Refresh the list
        } catch (error) {
            toast.error('Failed to delete role');
            console.error(error);
        }
    };

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
                </div>
                <Link href="/assessments/admin/roles/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Role
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search roles..." className="pl-10" />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            {/* Table */}
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
                                    No roles found. Click "Create New Role" to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{role.name}</span>
                                            <span className="text-xs text-slate-400">{role.code}</span>
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
                                                <EditRoleDialog
                                                    role={role}
                                                    onSuccess={fetchRoles}
                                                    trigger={
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                    }
                                                />
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/assessments/admin/roles/${role.id}`)}
                                                >
                                                    <Target className="w-4 h-4 mr-2" />
                                                    Manage Competencies
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/assessments/admin/roles/${role.id}?action=generate`)}
                                                >
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Generate Assessment
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(role.id, role.name)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Role
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
