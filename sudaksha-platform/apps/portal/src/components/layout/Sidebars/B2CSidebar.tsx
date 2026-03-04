
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, BookOpen, User, Settings } from "lucide-react";

export function B2CSidebar() {
    const pathname = usePathname();

    const links = [
        { name: "My Dashboard", href: "/assessments/individuals/dashboard", icon: LayoutDashboard },
        { name: "Course Catalog", href: "/assessments/individuals/browse", icon: ShoppingBag },
        { name: "Profile", href: "/assessments/profile", icon: User },
        { name: "Settings", href: "/assessments/profile", icon: Settings },
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Menu
            </div>
            <nav className="flex flex-col gap-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? "bg-red-50 text-red-700"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <link.icon className={`h-5 w-5 ${isActive ? "text-red-700" : "text-gray-400"}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
