"use client";

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTenant } from '@/hooks/useTenant';
import { useMeContext } from '@/hooks/useMeContext';
import { getNavigationConfig, filterNavigationByPermissions } from '@/lib/navigation-config';
import { NavigationItem } from './NavigationItem';
import { Menu, LogOut, Building2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function MobileNav() {
    const { data: session } = useSession();
    const { tenant } = useTenant();
    const meContext = useMeContext();
    const [open, setOpen] = useState(false);

    if (!session?.user) return null;

    const rawNavigation = getNavigationConfig(session.user as { role: string }, tenant);
    const permissions = (session.user as any).permissions as string[] | undefined;

    const navigation = filterNavigationByPermissions(
        rawNavigation,
        permissions || ['*']
    );

    return (
        <div className="md:hidden flex items-center justify-between p-3 bg-white border-b gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className="p-4 border-b text-left">
                        <div className="flex items-center gap-2">
                            {tenant?.logoUrl ? (
                                <img src={tenant.logoUrl} alt={tenant.name || "Logo"} className="h-7 w-7 rounded object-contain" />
                            ) : (
                                <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-indigo-600" />
                                </div>
                            )}
                            <SheetTitle className="text-base">{tenant?.name ?? "SudAssess"}</SheetTitle>
                        </div>
                    </SheetHeader>
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
                        {navigation.map(item => (
                            <NavigationItem key={item.id} item={item} />
                        ))}
                    </nav>
                    <div className="p-4 border-t space-y-2">
                        <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500">{(session.user as { role?: string }).role?.replace('_', ' ')}</p>
                            {meContext?.isCorporateOrInstitution && meContext?.hierarchyLabel && (
                                <p className="text-[11px] text-blue-600 mt-1 truncate">{meContext.hierarchyLabel}</p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/assessments" })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                {tenant?.logoUrl ? (
                    <img src={tenant.logoUrl} alt="" className="h-7 w-7 rounded object-contain flex-shrink-0" />
                ) : (
                    <div className="h-7 w-7 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                    </div>
                )}
                <span className="text-xs font-medium text-gray-700 truncate">{tenant?.name ?? "SudAssess"}</span>
                <span className="text-xs text-gray-500 truncate">· {session.user.name}</span>
            </div>
        </div>
    );
}
