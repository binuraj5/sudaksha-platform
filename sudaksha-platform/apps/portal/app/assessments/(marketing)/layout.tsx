import React from 'react';
import PublicShell from '@/src/components/layout/PublicShell';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PublicShell header={<Header />} footer={<Footer />}>
            {children}
        </PublicShell>
    );
}
