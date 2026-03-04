
"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    Settings,
    ChevronLeft,
    LogOut,
    Bell,
    Building2,
    GraduationCap,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface PortalLayoutProps {
    children: React.ReactNode;
    tenant: {
        name: string;
        logo?: string;
        type: 'CORPORATE' | 'INSTITUTION' | 'SYSTEM';
    };
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children, tenant, user }) => {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Assessments', icon: ClipboardList, href: '/assessments' },
        { label: tenant.type === 'CORPORATE' ? 'Employees' : 'Students', icon: Users, href: '/members' },
        { label: 'Reports', icon: LayoutDashboard, href: '/reports' },
        { label: 'Settings', icon: Settings, href: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Logo Section */}
                <div className="p-6 h-20 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        {tenant.type === 'INSTITUTION' ? <GraduationCap className="text-white" /> : <Building2 className="text-white" />}
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-xl truncate text-gray-900">{tenant.name}</span>
                    )}
                </div>

                <Separator />

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group ${collapsed ? 'justify-center' : ''}`}
                        >
                            <item.icon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" />
                            {!collapsed && <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{item.label}</span>}
                        </a>
                    ))}
                </nav>

                {/* Footer Controls */}
                <Separator />
                <div className="p-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-3"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                        {!collapsed && <span>Collapse</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Portal</span>
                        <ChevronLeft className="h-4 w-4 text-gray-300 rotate-180" />
                        <span className="font-semibold text-gray-700">Dashboard Overview</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-gray-500" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 pl-4 border-l focus:outline-none group">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                        <p className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
                                    </div>
                                    <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-indigo-100 transition-all">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-700"><UserCircle /></AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                                <DropdownMenuItem>Subscriptions</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    {children}
                </div>
            </main>
        </div>
    );
};
