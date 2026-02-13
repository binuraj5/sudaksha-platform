import { ClientAnalytics } from "@/components/Analytics/ClientAnalytics";

export default async function ClientAnalyticsPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <ClientAnalytics clientId={clientId} />
        </div>
    );
}
