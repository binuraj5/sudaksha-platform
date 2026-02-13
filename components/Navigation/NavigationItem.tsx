"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavigationItem as NavItemType } from '@/lib/navigation-config';
import { cn } from '@/lib/utils';

export function NavigationItem({ item }: { item: NavItemType }) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(!!item.defaultExpanded);
    const [badge, setBadge] = useState<number | null>(null);

    // Check if active: either exact match or subpath match (but ensure we don't match partial strings like /client vs /clients)
    const pathString = typeof item.path === 'string' ? item.path : '#';
    const isActive = pathString !== '#' && (pathname === pathString || pathname.startsWith(`${pathString}/`));

    // Load badge count if function provided
    useEffect(() => {
        if (item.badge) {
            item.badge().then(setBadge);
        }
    }, [item.badge]);

    // Has children (section header)
    if (item.children && item.children.length > 0) {
        // Check if any child is active to auto-expand
        const hasActiveChild = item.children.some(child => {
            const childPath = typeof child.path === 'string' ? child.path : '#';
            return childPath !== '#' && (pathname === childPath || pathname.startsWith(`${childPath}/`));
        });

        useEffect(() => {
            if (hasActiveChild) {
                setIsExpanded(true);
            }
        }, [hasActiveChild]);

        return (
            <div className="mb-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 rounded-lg transition-colors"
                >
                    <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                        <span>{typeof item.label === 'string' ? item.label : 'Menu'}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {isExpanded && (
                    <div className="mt-1 space-y-1 pl-4 border-l-2 border-gray-100 ml-4">
                        {item.children.map(child => (
                            <NavigationItem key={child.id} item={child} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Regular item
    return (
        <Link
            href={pathString}
            className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors group",
                isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
        >
            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-700" : "text-gray-400 group-hover:text-gray-500")} />
            <span>{typeof item.label === 'string' ? item.label : 'Item'}</span>
            {badge !== null && badge > 0 && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );
}
