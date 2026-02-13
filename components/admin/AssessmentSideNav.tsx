"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    Layers,
    Box,
    Building2,
    Settings,
    PieChart,
    User,
    Trophy,
    BrainCircuit,
    Users,
    FolderKanban
} from "lucide-react";
import { useSession } from "next-auth/react";

export function AssessmentSideNav() {
    const pathname = usePathname();
    const params = useParams();
    const { data: session } = useSession();

    const role = (session?.user as { role?: string } | undefined)?.role;
    const effectiveRole = role === 'DEPT_HEAD' ? 'DEPARTMENT_HEAD' : role;
    const slug = (params?.slug as string) ?? (session?.user as any)?.tenantSlug;
    const clientId = (session?.user as any)?.clientId ?? (session?.user as any)?.tenantId ?? (params?.clientId as string);
    const base = slug ? `/assessments/org/${slug}` : (clientId ? `/assessments/clients/${clientId}` : '');

    const superAdminLinks = [
        {
            href: "/assessments/admin/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/assessments/admin/dashboard"
        },
        {
            href: "/assessments/admin/companies",
            label: "Companies (B2B)",
            icon: Building2,
            active: pathname.startsWith("/assessments/admin/companies")
        },
        {
            href: "/assessments/admin/components",
            label: "Component Library",
            icon: Box,
            active: pathname.startsWith("/assessments/admin/components")
        },
        {
            href: "/assessments/admin/models",
            label: "Assessment Models",
            icon: Layers,
            active: pathname.startsWith("/assessments/admin/models")
        },
        {
            href: "/assessments/admin/templates",
            label: "Templates",
            icon: FileText,
            active: pathname.startsWith("/assessments/admin/templates")
        },
        {
            href: "/assessments/admin/competencies",
            label: "Competencies & Roles",
            icon: BrainCircuit,
            active: pathname.startsWith("/assessments/admin/competencies")
        },
        {
            href: "/assessments/admin/analytics",
            label: "Analytics",
            icon: PieChart,
            active: pathname.startsWith("/assessments/admin/analytics")
        },
        {
            href: "/assessments/admin/settings",
            label: "Settings",
            icon: Settings,
            active: pathname.startsWith("/assessments/admin/settings")
        }
    ];

    const clientAdminLinks = base ? [
        { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard, active: pathname === `${base}/dashboard` },
        { href: `${base}/settings`, label: "Organization Setup", icon: Settings, active: pathname.startsWith(`${base}/settings`) },
        { href: `${base}/departments`, label: "Department", icon: Building2, active: pathname.startsWith(`${base}/departments`) },
        { href: `${base}/employees`, label: "Employees", icon: Users, active: pathname.startsWith(`${base}/employees`) },
        { href: `${base}/projects`, label: "Projects", icon: FolderKanban, active: pathname.startsWith(`${base}/projects`) },
        { href: `${base}/teams`, label: "Teams", icon: Users, active: pathname.startsWith(`${base}/teams`) },
        { href: `${base}/roles`, label: "Roles", icon: FileText, active: pathname.startsWith(`${base}/roles`) },
        { href: `${base}/assessments`, label: "Assessments", icon: FileText, active: pathname.startsWith(`${base}/assessments`) },
        { href: `${base}/reports`, label: "Reports", icon: PieChart, active: pathname.startsWith(`${base}/reports`) },
        { href: `${base}/surveys`, label: "Survey", icon: FileText, active: pathname.startsWith(`${base}/surveys`) }
    ] : [];

    const myProfileLinks = [
        { href: "/assessments/profile", label: "My Details", icon: User, active: pathname.startsWith("/assessments/profile") },
        { href: "/assessments/hierarchy", label: "My Hierarchy", icon: Users, active: pathname.startsWith("/assessments/hierarchy") },
        { href: "/assessments/dashboard", label: "My Projects", icon: FolderKanban, active: pathname === "/assessments/dashboard" },
        { href: "/assessments/career", label: "My Career", icon: Trophy, active: pathname.startsWith("/assessments/career") },
        { href: "/assessments/dashboard", label: "My Assessments", icon: FileText, active: pathname.startsWith("/assessments/dashboard") },
        { href: "/assessments/dashboard", label: "Take Survey", icon: FileText, active: false }
    ];

    const employeeLinks = [
        {
            href: "/assessments/dashboard",
            label: "My Assessments",
            icon: LayoutDashboard,
            active: pathname === "/assessments/dashboard"
        },
        {
            href: "/assessments/results",
            label: "My Results",
            icon: Trophy,
            active: pathname.startsWith("/assessments/results")
        },
        {
            href: "/assessments/profile",
            label: "My Profile",
            icon: User,
            active: pathname.startsWith("/assessments/profile")
        }
    ];

    const studentOrTeacherOrgLinks = base ? [
        { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard, active: pathname === `${base}/dashboard` },
        { href: `${base}/assessments`, label: "My Assessments", icon: FileText, active: pathname.startsWith(`${base}/assessments`) },
        { href: "/assessments/results", label: "My Results", icon: Trophy, active: pathname.startsWith("/assessments/results") },
        { href: "/assessments/profile", label: "My Profile", icon: User, active: pathname.startsWith("/assessments/profile") }
    ] : employeeLinks;

    const isAdminPath = pathname.startsWith("/assessments/admin");
    const isClientPath = pathname.startsWith("/assessments/clients/") || pathname.startsWith("/assessments/org/");
    const isPublicDashboard = pathname === "/assessments/dashboard" || pathname.startsWith("/assessments/results") || pathname.startsWith("/assessments/take");

    const adminRoles = ["TENANT_ADMIN", "DEPARTMENT_HEAD", "TEAM_LEAD"];
    let mainLinks = employeeLinks;
    if (isAdminPath || role === "SUPER_ADMIN" || role === "ADMIN") {
        mainLinks = superAdminLinks;
    } else if ((isClientPath || adminRoles.includes(effectiveRole)) && clientAdminLinks.length > 0 && adminRoles.includes(effectiveRole)) {
        mainLinks = clientAdminLinks;
    } else if ((effectiveRole === "STUDENT" || effectiveRole === "CLASS_TEACHER") && base) {
        mainLinks = studentOrTeacherOrgLinks;
    } else if (isPublicDashboard) {
        mainLinks = employeeLinks;
    }

    const showMyProfile = (isClientPath || effectiveRole === "TENANT_ADMIN" || effectiveRole === "DEPARTMENT_HEAD" || effectiveRole === "TEAM_LEAD" || role === "EMPLOYEE") && clientAdminLinks.length > 0;

    return (
        <nav className="space-y-4">
            <div className="space-y-1">
            {mainLinks.map((link) => {
                const Icon = link.icon;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                            link.active
                                ? "bg-red-50 text-red-700"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <Icon className={cn("mr-3 h-5 w-5", link.active ? "text-red-700" : "text-gray-400")} />
                        {link.label}
                    </Link>
                );
            })}
            </div>
            {showMyProfile && (
                <div className="space-y-1 border-t pt-4">
                    <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Profile</p>
                    {myProfileLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href + link.label}
                                href={link.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    link.active ? "bg-red-50 text-red-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn("mr-3 h-5 w-5", link.active ? "text-red-700" : "text-gray-400")} />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
