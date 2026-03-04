"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Layers,
    Box
} from "lucide-react";

export function AdminSideNav() {
    const pathname = usePathname();

    const links = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/admin"
        },
        {
            href: "/admin/assessments/dashboard",
            label: "Assessments (Old)",
            icon: FileText,
            active: pathname.startsWith("/admin/assessments")
        },
        {
            href: "/admin/assessment-components",
            label: "Component Library",
            icon: Box,
            active: pathname.startsWith("/admin/assessment-components")
        },
        {
            href: "/admin/assessment-models",
            label: "Assessment Models",
            icon: Layers,
            active: pathname.startsWith("/admin/assessment-models")
        },
        {
            href: "/admin/users",
            label: "Users & Roles",
            icon: Users,
            active: pathname.startsWith("/admin/users")
        },
        {
            href: "/admin/settings",
            label: "Settings",
            icon: Settings,
            active: pathname.startsWith("/admin/settings")
        }
    ];

    return (
        <nav className="space-y-1">
            {links.map((link) => {
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
        </nav>
    );
}
