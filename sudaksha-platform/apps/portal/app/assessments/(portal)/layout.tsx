import PortalLayout from "@/components/layout/PortalLayout";

export default function AssessmentPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Note: PortalLayout is a Server Component, so we don't need "use client" here anymore
    // unless we have other client logic.
    // However, PortalLayout handles everything.

    return (
        <PortalLayout>
            {children}
        </PortalLayout>
    );
}
