"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Search, MoreVertical, Eye, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { EditFacultyDialog } from "@/components/Faculty/EditFacultyDialog";
import { DeleteFacultyDialog } from "@/components/Faculty/DeleteFacultyDialog";

const basePath = (slug: string) => `/assessments/org/${slug}`;
const FACULTY_TYPE_LABELS: Record<string, string> = {
    PERMANENT: "Permanent",
    ADJUNCT: "Adjunct",
    VISITING: "Visiting",
};

interface FacultyMember {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    designation?: string | null;
    facultyType?: string | null;
    isActive: boolean;
    orgUnitId?: string | null;
    orgUnit?: { id: string; name: string; code: string; type: string } | null;
    memberCode?: string | null;
}

interface ClassWithParent {
    id: string;
    name: string;
    code: string;
    parent?: { name: string } | null;
}

interface FacultyPageContentProps {
    faculty: FacultyMember[];
    slug: string;
    clientId: string;
    departments: { id: string; name: string; code: string }[];
    classes: ClassWithParent[];
    total: number;
    pageNum: number;
    take: number;
    search?: string;
    effectiveDeptId: string | null;
    isDeptHead: boolean;
}

export function FacultyPageContent({
    faculty,
    slug,
    clientId,
    departments,
    classes,
    total,
    pageNum,
    take,
    search,
    effectiveDeptId,
    isDeptHead,
}: FacultyPageContentProps) {
    const router = useRouter();
    const [editFaculty, setEditFaculty] = useState<FacultyMember | null>(null);
    const [deleteFaculty, setDeleteFaculty] = useState<FacultyMember | null>(null);

    const orgUnits = [
        ...departments.map((d) => ({ ...d, type: "DEPARTMENT" as const })),
        ...classes.map((c) => ({ id: c.id, name: `${c.name} (${c.parent?.name || "Class"})`, code: c.code, type: "CLASS" as const })),
    ];

    const handleToggleActive = async (f: FacultyMember) => {
        try {
            const res = await fetch(`/api/clients/${clientId}/employees/${f.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !f.isActive }),
            });
            if (res.ok) {
                toast.success(f.isActive ? "Faculty deactivated" : "Faculty activated");
                router.refresh();
            } else {
                toast.error("Failed to update");
            }
        } catch {
            toast.error("Failed to update");
        }
    };

    const handleFilterChange = (deptId: string) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (deptId && deptId !== "all") params.set("dept", deptId);
        router.push(`${basePath(slug)}/faculty?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q = (form.elements.namedItem("search") as HTMLInputElement)?.value || "";
        const params = new URLSearchParams();
        if (q) params.set("search", q);
        if (effectiveDeptId) params.set("dept", effectiveDeptId);
        router.push(`${basePath(slug)}/faculty?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end rounded-lg border p-4 bg-muted/30">
                {!isDeptHead && (
                    <div className="space-y-2">
                        <Label className="text-xs">Department</Label>
                        <Select
                            value={effectiveDeptId || "all"}
                            onValueChange={handleFilterChange}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All departments</SelectItem>
                                {departments.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name} ({d.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name or email..."
                            className="pl-9 bg-background"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>
            </div>

            {faculty.length === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
                    <p className="font-medium">No faculty found</p>
                    <p className="text-sm mt-1">
                        Add faculty members (teachers, department heads) to get started.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href={`${basePath(slug)}/faculty/new`}>Add Faculty</Link>
                    </Button>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Department / Class</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {faculty.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
                                                    {f.name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{f.name}</div>
                                                {f.memberCode && (
                                                    <div className="text-xs text-muted-foreground font-mono">
                                                        {f.memberCode}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{f.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal capitalize">
                                            {f.role?.replace(/_/g, " ") || "Faculty"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {f.facultyType ? (
                                            <Badge variant="outline" className="font-normal">
                                                {FACULTY_TYPE_LABELS[f.facultyType] || f.facultyType}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {f.orgUnit ? (
                                            <Link
                                                href={
                                                    f.orgUnit.type === "DEPARTMENT"
                                                        ? `${basePath(slug)}/departments/${f.orgUnit.id}`
                                                        : `${basePath(slug)}/classes/${f.orgUnit.id}`
                                                }
                                                className="text-primary hover:underline text-sm"
                                            >
                                                {f.orgUnit.name}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={f.isActive}
                                                onCheckedChange={() => handleToggleActive(f)}
                                                aria-label={f.isActive ? "Deactivate" : "Activate"}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {f.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`${basePath(slug)}/faculty/${f.id}`} aria-label="View">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setEditFaculty(f)}
                                                aria-label="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditFaculty(f)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleActive(f)}
                                                    >
                                                        {f.isActive ? (
                                                            <><UserX className="mr-2 h-4 w-4" /> Deactivate</>
                                                        ) : (
                                                            <><UserCheck className="mr-2 h-4 w-4" /> Activate</>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setDeleteFaculty(f)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {editFaculty && (
                <EditFacultyDialog
                    faculty={{
                        id: editFaculty.id,
                        name: editFaculty.name,
                        email: editFaculty.email,
                        phone: null,
                        designation: editFaculty.designation,
                        role: editFaculty.role,
                        facultyType: editFaculty.facultyType,
                        orgUnitId: editFaculty.orgUnitId,
                    }}
                    clientId={clientId}
                    slug={slug}
                    departments={departments}
                    classes={classes}
                    open={!!editFaculty}
                    onOpenChange={(open) => !open && setEditFaculty(null)}
                    onSuccess={() => { setEditFaculty(null); router.refresh(); }}
                />
            )}
            {deleteFaculty && (
                <DeleteFacultyDialog
                    faculty={{ id: deleteFaculty.id, name: deleteFaculty.name }}
                    clientId={clientId}
                    slug={slug}
                    open={!!deleteFaculty}
                    onOpenChange={(open) => !open && setDeleteFaculty(null)}
                    onSuccess={() => { setDeleteFaculty(null); router.refresh(); }}
                />
            )}

            <div className="flex justify-center gap-2">
                {pageNum > 1 && (
                    <Button variant="outline" asChild>
                        <a
                            href={`${basePath(slug)}/faculty?page=${pageNum - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${effectiveDeptId ? `&dept=${effectiveDeptId}` : ""}`}
                        >
                            Previous
                        </a>
                    </Button>
                )}
                {total > pageNum * take && (
                    <Button variant="outline" asChild>
                        <a
                            href={`${basePath(slug)}/faculty?page=${pageNum + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${effectiveDeptId ? `&dept=${effectiveDeptId}` : ""}`}
                        >
                            Next
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
