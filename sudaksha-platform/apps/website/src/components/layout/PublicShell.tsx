
'use client';

import { usePathname } from 'next/navigation';

interface PublicShellProps {
    children: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
}

export default function PublicShell({ children, header, footer }: PublicShellProps) {
    const pathname = usePathname();
    // Clear demarcation: Internal Admin and Portals (Dashboards) should NOT have public header/footer
    const isDashboard = pathname === '/assessments' ||
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/assessments/admin') ||
        pathname?.startsWith('/assessments/dashboard') ||
        pathname?.startsWith('/assessments/login') ||
        pathname?.startsWith('/assessments/take') ||
        pathname?.startsWith('/assessments/results') ||
        pathname?.startsWith('/clients');

    if (isDashboard) {
        return <>{children}</>;
    }

    return (
        <>
            {header}
            <main className="w-full">
                {children}
            </main>
            {footer}
        </>
    );
}
