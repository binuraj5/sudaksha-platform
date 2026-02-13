"use client";

import { useSession, signOut } from 'next-auth/react';
import { useTenant } from '@/hooks/useTenant';
import { useMeContext } from '@/hooks/useMeContext';
import { getNavigationConfig, filterNavigationByPermissions } from '@/lib/navigation-config';
import { NavigationItem } from './NavigationItem';
import { Loader2, User, LogOut, MoreVertical, Building2 } from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from 'react';
import { RoleSwitcher, ViewMode } from './RoleSwitcher';

export function Sidebar() {
    const { data: session, status } = useSession();
    const { tenant } = useTenant();
    const meContext = useMeContext();
    const [viewMode, setViewMode] = useState<ViewMode>("ADMIN");

    // Persist View Mode preference (optional)
    useEffect(() => {
        const storedMode = localStorage.getItem("sudassess-view-mode");
        if (storedMode === "ADMIN" || storedMode === "PERSONAL") {
            setViewMode(storedMode);
        }
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem("sudassess-view-mode", mode);
    };

    if (status === "loading") {
        return (
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-4 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </aside>
        );
    }

    if (!session?.user || !(session.user as any).role) return null;

    const user = session.user as { role: string; name?: string; email?: string; image?: string };

    // Determine if switching is applicable. My Personal Page works for everyone EXCEPT:
    // Institutions - Admin, Dept Head, Faculty, Class Teacher.
    const rolesWithSwitcher = ['TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'];
    const institutionRolesWithoutPersonalPage = ['TENANT_ADMIN', 'DEPT_HEAD', 'DEPARTMENT_HEAD', 'CLASS_TEACHER'];
    const isInstitutionRoleExcluded = tenant?.type === 'INSTITUTION' && institutionRolesWithoutPersonalPage.includes(user.role);
    const isSwitcherApplicable = rolesWithSwitcher.includes(user.role) && !isInstitutionRoleExcluded;

    // If not applicable (e.g., EMPLOYEE), force PERSONAL mode logic (or just default config)
    // But getNavigationConfig handles basic roles correctly.
    // We only filter if switcher is applicable.

    // Get navigation based on user role and tenant type
    const rawNavigation = getNavigationConfig(user, tenant);

    // Filter by user permissions first
    const permissions = (session.user as any).permissions as string[] | undefined;
    const permittedNavigation = filterNavigationByPermissions(
        rawNavigation,
        permissions || ['*']
    );

    let displayNavigation = permittedNavigation;

    if (isSwitcherApplicable) {
        if (viewMode === "ADMIN") {
            // ADMIN MODE: Show Admin Menu + My Profile (both)
            displayNavigation = permittedNavigation;
        } else {
            // PERSONAL MODE: Show ONLY My Profile items, promoted to top level
            const myPageSection = permittedNavigation.find(item => item.id === 'my-page-section');
            displayNavigation = myPageSection?.children || [];
        }
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col min-h-screen">
            {/* Company logo and name */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-3 min-w-0 flex-1">
                    {tenant?.logoUrl ? (
                        <img src={tenant.logoUrl} alt={tenant.name || "Logo"} className="h-8 w-8 flex-shrink-0 rounded object-contain" />
                    ) : (
                        <div className="h-8 w-8 flex-shrink-0 rounded bg-indigo-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-indigo-600" />
                        </div>
                    )}
                    <span className="font-semibold text-sm text-gray-800 truncate">{tenant?.name ?? "SudAssess"}</span>
                </Link>
            </div>

            {/* Role Switcher (Only for Admin/Leads) */}
            {isSwitcherApplicable && (
                <div className="mt-4">
                    <RoleSwitcher
                        currentRole={(session.user as { role?: string }).role ?? ''}
                        viewMode={viewMode}
                        onViewModeChange={handleViewModeChange}
                    />
                </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {displayNavigation.map(item => (
                    <NavigationItem key={item.id} item={item} />
                ))}
            </nav>

            {/* User Footer: who is logged in + hierarchy */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center w-full hover:bg-white p-2 rounded-lg transition-colors text-left outline-none">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold mr-3 flex-shrink-0">
                                {session.user.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">{session.user.name}</p>
                                <p className="truncate text-xs text-gray-500">{(session.user as { role?: string }).role?.replace('_', ' ')}</p>
                                {meContext?.isCorporateOrInstitution && meContext?.hierarchyLabel && (
                                    <p className="truncate text-[11px] text-blue-600 mt-0.5">{meContext.hierarchyLabel}</p>
                                )}
                            </div>
                            <MoreVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={10}>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={tenant?.slug ? `/assessments/org/${tenant.slug}/profile` : tenant ? `/assessments/clients/${tenant.id}/profile` : '/assessments/profile'} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => signOut({ callbackUrl: '/assessments' })}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
