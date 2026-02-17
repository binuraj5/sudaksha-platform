"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Target, Briefcase, ChevronRight, BrainCircuit, Loader2, Globe, Building, Users, UserCheck } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CreateCompetencyDialog } from "@/components/admin/CreateCompetencyDialog";
import { CreateRoleDialog } from "@/components/admin/CreateRoleDialog";
import { BulkUploadCompetenciesDialog } from "@/components/admin/BulkUploadCompetenciesDialog";
import { AIGenerateCompetencyDialog } from "@/components/admin/AIGenerateCompetencyDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRoleCompetencyPermissions } from "@/hooks/useRoleCompetencyPermissions";

const SCOPE_CONFIG: Record<string, { label: string; className: string; icon: typeof Globe }> = {
    GLOBAL: { label: "Global", className: "bg-blue-100 text-blue-700", icon: Globe },
    ORGANIZATION: { label: "My Org", className: "bg-green-100 text-green-700", icon: Building },
    DEPARTMENT: { label: "My Dept", className: "bg-yellow-100 text-yellow-700", icon: Users },
    TEAM: { label: "My Team", className: "bg-purple-100 text-purple-700", icon: UserCheck },
    CLASS: { label: "My Class", className: "bg-indigo-100 text-indigo-700", icon: UserCheck },
};

function ScopeBadge({ scope }: { scope: string }) {
    const config = SCOPE_CONFIG[scope] || SCOPE_CONFIG.GLOBAL;
    const Icon = config.icon;
    return (
        <Badge variant="secondary" className={`${config.className} border-none text-[10px] px-1.5 py-0`}>
            <Icon className="w-3 h-3 mr-0.5" />
            {config.label}
        </Badge>
    );
}

/**
 * Shared competencies + roles UI for both /assessments/admin/competencies and /assessments/clients/[clientId]/competencies.
 * Data is scoped by /api/admin/competencies and /api/admin/roles (RLS) based on session.
 */
export function CompetenciesPageContent() {
    const { data: session, status } = useSession();
    const permissions = useRoleCompetencyPermissions();
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [compSearch, setCompSearch] = useState("");
    const [compCategory, setCompCategory] = useState("all");
    const [roleSearch, setRoleSearch] = useState("");
    const [roleIndustry, setRoleIndustry] = useState("all");

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/assessments/login");
        }
        if (status === "authenticated") {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [compRes, rolesRes] = await Promise.all([
                fetch("/api/admin/competencies"),
                fetch("/api/admin/roles"),
            ]);
            if (compRes.ok) {
                const compData = await compRes.json();
                const list = compData?.competencies ?? (Array.isArray(compData) ? compData : []);
                setCompetencies(Array.isArray(list) ? list : []);
            }
            if (rolesRes.ok) {
                const rolesData = await rolesRes.json();
                const list = rolesData?.roles ?? (Array.isArray(rolesData) ? rolesData : []);
                setRoles(Array.isArray(list) ? list : []);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-red-600" />
                <p className="text-gray-500 font-medium italic">Loading management library...</p>
            </div>
        );
    }

    const filteredCompetencies = competencies.filter((comp) => {
        const matchesSearch =
            comp.name.toLowerCase().includes(compSearch.toLowerCase()) ||
            comp.description?.toLowerCase().includes(compSearch.toLowerCase());
        const matchesCategory = compCategory === "all" || comp.category === compCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredRoles = roles.filter((role) => {
        const matchesSearch =
            role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
            role.description?.toLowerCase().includes(roleSearch.toLowerCase());
        const matchesIndustry = roleIndustry === "all" || (role as any).industry === roleIndustry;
        return matchesSearch && matchesIndustry;
    });

    const categories = Array.from(new Set(competencies.map((c) => c.category))).filter(Boolean);
    const industries = Array.from(new Set(roles.map((r) => (r as any).industry))).filter(Boolean);

    return (
        <div className="space-y-8 mt-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-red-600" />
                        Competency Management
                    </h1>
                    <p className="text-gray-500 mt-1 italic font-serif">
                        Define professional standards, roles, and behavioral benchmarks.
                    </p>
                    {permissions.isInstitution && (
                        <div className="flex items-center gap-2 px-4 py-3 mt-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                            <span aria-hidden>⚠️</span>
                            <span>
                                <strong>Institution mode:</strong> Showing Junior/Fresher roles and competencies only.
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 flex-wrap">
                    {permissions.isSuperAdmin && (
                        <>
                            <BulkUploadCompetenciesDialog />
                            <AIGenerateCompetencyDialog />
                        </>
                    )}
                    {permissions.canCreate && (
                        <>
                            <CreateRoleDialog />
                            <CreateCompetencyDialog />
                        </>
                    )}
                </div>
            </header>

            <Tabs defaultValue="competencies" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl h-12">
                    <TabsTrigger value="competencies" className="px-6 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                        <Target className="h-4 w-4 mr-2" />
                        Competency Library
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="px-6 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Role Frameworks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="competencies" className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search competencies by name or description..."
                                className="pl-10"
                                value={compSearch}
                                onChange={(e) => setCompSearch(e.target.value)}
                            />
                        </div>
                        <Select value={compCategory} onValueChange={setCompCategory}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={String(cat)} value={String(cat)}>
                                        {String(cat)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[280px]">Competency Name</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-center">Indicators</TableHead>
                                    <TableHead className="text-center">Usage</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCompetencies.map((comp) => (
                                    <TableRow key={comp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{comp.name}</span>
                                                <span className="text-xs text-gray-500 line-clamp-1">{comp.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ScopeBadge scope={comp.scope ?? "GLOBAL"} />
                                            {comp.globalSubmissionStatus === "PENDING" && (
                                                <Badge className="ml-1 bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none px-2 py-0 text-[10px] uppercase whitespace-nowrap">
                                                {comp.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-red-50 text-red-700 border-none text-[10px] font-bold">
                                                {comp._count?.indicators ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-[10px] text-gray-500 font-mono uppercase">
                                                {comp._count?.roleLinks ?? 0} Roles
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild className="hover:text-red-600 h-8 px-3">
                                                <Link href={`/assessments/admin/competencies/${comp.id}`}>
                                                    Manage <ChevronRight className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredCompetencies.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Target className="h-10 w-10 text-gray-200 mb-2" />
                                                <p className="font-medium">No competencies match your search</p>
                                                <p className="text-xs mt-1">Try adjusting your filters or adding a new competency.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search roles by title or description..."
                                className="pl-10"
                                value={roleSearch}
                                onChange={(e) => setRoleSearch(e.target.value)}
                            />
                        </div>
                        <Select value={roleIndustry} onValueChange={setRoleIndustry}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="All Industries" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Industries</SelectItem>
                                {industries.map((ind) => (
                                    <SelectItem key={String(ind)} value={String(ind)}>
                                        {String(ind)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="w-[260px]">Role Framework</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead className="text-center">Skill Mappings</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRoles.map((role) => (
                                    <TableRow key={role.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{role.name}</span>
                                                <span className="text-xs text-gray-500 line-clamp-1">{role.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <ScopeBadge scope={role.scope ?? "GLOBAL"} />
                                            {role.globalSubmissionStatus === "PENDING" && (
                                                <Badge className="ml-1 bg-amber-100 text-amber-700 text-[10px]">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none px-2 py-0 text-[10px] uppercase whitespace-nowrap">
                                                {(role as any).industry || "General"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className="bg-blue-50 text-blue-700 border-none text-[10px] font-bold">
                                                {role._count?.competencies ?? 0} Skills
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild className="hover:text-red-600 h-8 px-3">
                                                <Link href={`/assessments/admin/roles/${role.id}`}>
                                                    Manage <ChevronRight className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRoles.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Briefcase className="h-10 w-10 text-gray-200 mb-2" />
                                                <p className="font-medium">No roles match your search</p>
                                                <p className="text-xs mt-1">Try a different search term or add a new role.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
