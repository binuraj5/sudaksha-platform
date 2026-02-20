import React from 'react';
import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import {
    Shield,
    LayoutDashboard,
    Building2,
    GraduationCap,
    Users,
    Settings,
    LogOut,
    BarChart3,
    BookOpen,
    FileText,
    Box,
    CheckCircle,
    Briefcase
} from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getApiSession();

    const role = (session?.user as any)?.role;
    const userType = (session?.user as any)?.userType;
    const isSuperAdmin = role === 'SUPER_ADMIN' || userType === 'SUPER_ADMIN';
    if (!session || !isSuperAdmin) {
        redirect("/assessments/auth/admin/login");
    }

    const navItems = [
        { label: "Global Overview", href: "/assessments/admin/dashboard", icon: LayoutDashboard },
        { label: "Tenants (Corporate)", href: "/assessments/admin/tenants", icon: Building2 },
        { label: "Institutions", href: "/assessments/admin/institutions", icon: GraduationCap },
        { label: "User Management", href: "/assessments/admin/users", icon: Users },
        { label: "Approval Queue", href: "/assessments/admin/approvals", icon: CheckCircle },
        { label: "Role Matrix", href: "/assessments/admin/roles", icon: Briefcase },
        { label: "Skill Library", href: "/assessments/admin/competencies", icon: BookOpen },
        { label: "Assessment Models", href: "/assessments/admin/models", icon: FileText },
        { label: "Competency Library", href: "/assessments/admin/components", icon: Box },
        { label: "Reporting Hub", href: "/assessments/admin/reports", icon: BarChart3 },
        { label: "System Config", href: "/assessments/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background flex antialiased">
            {/* Admin Sidebar - light Sudaksha soft */}
            <aside className="w-60 lg:w-64 bg-card border-r border-border flex flex-col fixed inset-y-0 z-50 overflow-y-auto shadow-sm">
                <div className="p-5 pb-6 flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-base font-semibold text-foreground tracking-tight block truncate">SudAssess</span>
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-none mt-0.5">Super Admin</p>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-0.5 pb-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group text-muted-foreground hover:text-foreground"
                        >
                            <item.icon className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm font-medium truncate">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-border bg-card/50">
                    <div className="flex items-center gap-2.5 px-2 py-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                            {session.user.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{session.user.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
                        </div>
                    </div>
                    <Link href="/api/auth/signout?callbackUrl=/assessments">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3 py-2 text-xs font-medium">
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>Sign out</span>
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-60 lg:ml-64 min-h-screen flex flex-col">
                {/* Top Header Bar */}
                <header className="h-16 bg-white border-b border-border sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Sudaksha" className="h-10 w-auto max-w-[120px] object-contain" />
                        <div className="h-5 w-px bg-border mx-1" />
                        <div>
                            <p className="text-sm font-semibold text-foreground leading-none">Super Admin Panel</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Sudaksha Intelligence Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-foreground leading-none">{session.user.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{session.user.email}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                            {session.user.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="p-6 lg:p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
