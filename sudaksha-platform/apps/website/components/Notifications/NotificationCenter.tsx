"use client";

import React, { useState } from 'react';
import {
    Bell,
    Check,
    FileText,
    AlertCircle,
    Clock,
    MoreVertical,
    CheckCircle2
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    type: 'ASSESSMENT' | 'SURVEY' | 'SYSTEM' | 'FEEDBACK';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            type: "ASSESSMENT",
            title: "New Assessment Assigned",
            message: "You have been assigned 'Advanced React Patterns' by your manager.",
            timestamp: "2 mins ago",
            read: false
        },
        {
            id: "2",
            type: "SURVEY",
            title: "Engagement Survey",
            message: "Please complete the Q1 Team Engagement survey.",
            timestamp: "1 hour ago",
            read: false
        },
        {
            id: "3",
            type: "SYSTEM",
            title: "Profile Updated",
            message: "Your department change has been approved by HR.",
            timestamp: "5 hours ago",
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'ASSESSMENT': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'SURVEY': return <ClipboardList className="h-4 w-4 text-purple-500" />;
            case 'SYSTEM': return <AlertCircle className="h-4 w-4 text-slate-500" />;
            case 'FEEDBACK': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            default: return <Bell className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-4 w-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-2xl overflow-hidden border-slate-200">
                <div className="flex items-center justify-between p-4 border-b bg-slate-50/50">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-[10px] h-7 px-2 font-bold uppercase tracking-wider text-muted-foreground hover:text-primary">
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group",
                                        !n.read && "bg-blue-50/30"
                                    )}
                                    onClick={() => markAsRead(n.id)}
                                >
                                    <div className="mt-1 h-8 w-8 rounded-full bg-background border flex items-center justify-center shrink-0 shadow-sm group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                                        {getTypeIcon(n.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <p className={cn("text-sm leading-none", !n.read ? "font-bold text-slate-900" : "font-medium text-slate-600")}>
                                                {n.title}
                                            </p>
                                            {!n.read && <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                                            <Clock className="h-3 w-3" />
                                            {n.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center space-y-2">
                            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 opacity-50">
                                <Bell className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-600">All caught up!</p>
                            <p className="text-xs text-slate-400">No new notifications for you right now.</p>
                        </div>
                    )}
                </div>

                <div className="p-2 border-t bg-slate-50/50">
                    <Button variant="ghost" className="w-full text-xs font-bold" size="sm">
                        View all activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Sub-component Helper
const ClipboardList = ({ className }: { className: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
);
