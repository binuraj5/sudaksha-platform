import React from 'react';
import PublicShell from '@/src/components/layout/PublicShell'
import Header from '@/src/components/layout/Header'
import Footer from '@/src/components/layout/Footer'
import WhatsAppFAB from '@/src/components/common/WhatsAppFAB'
import SudhaChatbot from '@/src/components/common/SudhaChatbot'
import ExitIntentPopup from '@/src/components/common/ExitIntentPopup'
import StickyNavCTA from '@/src/components/common/StickyNavCTA'
import { CTAModalProvider } from '@/context/CTAModalContext'
import { CTAModal } from '@/components/universal/CTAModal'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CTAModalProvider>
            <PublicShell
                header={<Header />}
                footer={<Footer />}
            >
                {children}
                <WhatsAppFAB />
                <SudhaChatbot />
                <ExitIntentPopup />
                <StickyNavCTA />
                <CTAModal />
            </PublicShell>
        </CTAModalProvider>
    );
}
