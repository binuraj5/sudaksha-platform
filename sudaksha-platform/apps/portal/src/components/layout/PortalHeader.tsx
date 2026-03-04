"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PortalBranding {
    logoUrl?: string | null;
    primaryColor?: string | null;
    tenantName?: string;
    /** Hierarchy label for corporate/institutional (e.g. "Acme Corp → Engineering") shown in small blue. */
    hierarchyLabel?: string | null;
}

export default function PortalHeader({ branding, session }: { branding?: PortalBranding; session?: Session | null }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                    <Link href="/" className="flex items-center gap-3 min-w-0">
                        {branding?.logoUrl ? (
                            <img
                                src={branding.logoUrl}
                                alt={branding.tenantName || "Logo"}
                                className="h-12 w-auto max-w-[140px] flex-shrink-0 rounded object-contain"
                            />
                        ) : branding?.tenantName ? (
                            /* Tenant portal without a custom logo — show initial avatar */
                            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-700 font-bold text-lg">
                                    {branding.tenantName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        ) : (
                            /* Sudaksha admin portal — show Sudaksha logo */
                            <img
                                src="/logo.png"
                                alt="Sudaksha Logo"
                                className="h-12 w-auto max-w-[140px] flex-shrink-0 object-contain"
                            />
                        )}
                        {branding?.tenantName && (
                            <span className="font-semibold text-gray-700 hidden md:block border-l pl-3 border-gray-300 truncate">
                                {branding.tenantName}
                            </span>
                        )}
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {mounted && session?.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors outline-none">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: branding?.primaryColor || '#b91c1c' }}
                                >
                                    {session.user.name?.charAt(0) || "U"}
                                </div>
                                <div className="text-left hidden sm:block border-l pl-4 ml-2 border-gray-200 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 leading-none truncate">{session.user.name}</p>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{(session.user as { role?: string }).role?.replace('_', ' ')}</p>
                                        {branding?.tenantName && (
                                            <>
                                                <span className="text-gray-300">·</span>
                                                <p className="text-[10px] font-semibold text-indigo-600 truncate">{branding.tenantName}</p>
                                            </>
                                        )}
                                    </div>
                                    {branding?.hierarchyLabel && (
                                        <p className="text-[10px] text-blue-600 mt-0.5 truncate max-w-[180px]">{branding.hierarchyLabel}</p>
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/assessments/profile" className="flex items-center w-full cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => signOut({ callbackUrl: "/assessments" })}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
}
