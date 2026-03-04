"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Upload,
    Download,
    UserPlus,
    Mail,
    Trash2,
    MoreHorizontal,
    Filter,
    Search,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export function UserManagement() {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Mock User Data
    const users = [
        { id: "1", name: "John Doe", email: "john@techcorp.com", role: "EMPLOYEE", dept: "Eng", status: "Active" },
        { id: "2", name: "Alice Smith", email: "alice@techcorp.com", role: "MANAGER", dept: "HR", status: "Active" },
        { id: "3", name: "Bob Johnson", email: "bob@techcorp.com", role: "EMPLOYEE", dept: "Sales", status: "Pending" },
    ];

    const handleBulkInvite = () => {
        toast.success(`Sent invitation emails to ${selectedUsers.length} users`);
        setSelectedUsers([]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setIsUploading(true);
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("CSV processed: 15 new users added successfully");
        setIsUploading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-sm text-muted-foreground">Manage organization members and authentication status.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="relative cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Bulk Import
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".csv"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </Button>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search users..." className="pl-9" />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <span className="text-sm font-medium mr-2">{selectedUsers.length} selected</span>
                            <Button size="sm" variant="secondary" onClick={handleBulkInvite}>
                                <Mail className="mr-2 h-3.5 w-3.5" /> Invite
                            </Button>
                            <Button size="sm" variant="destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Deactivate
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedUsers.length === users.length}
                                        onCheckedChange={(checked) => {
                                            setSelectedUsers(checked ? users.map(u => u.id) : []);
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUsers.includes(u.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedUsers(prev =>
                                                    checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                                                );
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{u.dept}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{u.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.status === 'Active' ? 'default' : 'secondary'}>
                                            {u.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                                <DropdownMenuItem>Send Password Reset</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Deactivate User</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {isUploading && (
                <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                    <Card className="w-80">
                        <CardHeader className="text-center">
                            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                            <CardTitle className="mt-4">Processing CSV</CardTitle>
                            <CardDescription>Validating user records and preparing invitations...</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </div>
    );
}
