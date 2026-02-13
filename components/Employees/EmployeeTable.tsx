"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, User, Eye, UserMinus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTenantLabels } from "@/hooks/useTenantLabels";
import { AssignRoleDialog } from "./AssignRoleDialog";

export function EmployeeTable({ employees, clientId, basePath }: { employees: any[]; clientId: string; basePath?: string }) {
    const router = useRouter();
    const labels = useTenantLabels();
    const [assignEmployee, setAssignEmployee] = useState<any | null>(null);

    const handleDeactivate = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/clients/${clientId}/employees/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: false }) });
            toast.success("Deactivated");
            router.refresh();
        } catch (e) {
            toast.error("Error");
        }
    };

    const handleRoleAssigned = () => {
        setAssignEmployee(null);
        router.refresh();
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead>{labels.member}</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>{labels.orgUnit}</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((emp) => (
                        <TableRow key={emp.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium">
                                            {emp.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-sm">{emp.name}</div>
                                        <div className="text-xs text-gray-500">{emp.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">{emp.designation || 'Staff'}</div>
                                <div className="text-xs text-gray-500 capitalize">{emp.role?.toLowerCase().replace('_', ' ') || 'Employee'}</div>
                            </TableCell>
                            <TableCell>
                                {emp.orgUnit ? (
                                    <Badge variant="outline" className="font-normal">
                                        {emp.orgUnit.name}
                                    </Badge>
                                ) : (
                                    <span className="text-gray-400 text-sm">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={emp.isActive ? "default" : "secondary"} className={emp.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}>
                                    {emp.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setAssignEmployee(emp)}>
                                            <User className="mr-2 h-4 w-4" /> Assign Role
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`${basePath ?? `/assessments/clients/${clientId}`}/employees/${emp.id}`}>
                                                <Eye className="mr-2 h-4 w-4" /> View Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeactivate(emp.id)} disabled={!emp.isActive}>
                                            <UserMinus className="mr-2 h-4 w-4" /> Deactivate
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {employees.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No {labels.memberPlural.toLowerCase()} found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {assignEmployee && (
                <AssignRoleDialog
                    open={!!assignEmployee}
                    onOpenChange={(open) => !open && setAssignEmployee(null)}
                    clientId={clientId}
                    employee={assignEmployee}
                    onAssigned={handleRoleAssigned}
                />
            )}
        </div>
    );
}
