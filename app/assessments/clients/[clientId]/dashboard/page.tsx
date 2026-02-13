import { Suspense } from "react";
import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { resolveTenantLabels } from "@/lib/tenant-resolver";
import { StatsGrid } from "@/components/Dashboard/StatsGrid";
import { GapAnalysisChart } from "@/components/Dashboard/GapAnalysisChart";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { Loader2 } from "lucide-react";

// Fetch data directly in Server Component for initial load
async function getDashboardData(clientId: string) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    try {
        const [statsRes] = await Promise.all([
            fetch(`${baseUrl}/api/clients/${clientId}/dashboard/stats`, { cache: 'no-store', headers: { Cookie: `next-auth.session-token=${(await getApiSession())?.user?.email}` } }),
        ]);
        // Actually, calling local API from Server Component in Next.js is an anti-pattern due to auth headers and unnecessary network roundtrip.
        // However, to satisfy "Create API..." requirement and "Real-time" (likely meaning subsequent refreshes), I will use a Client Component wrapper if I strictly follow API usage.
        // OR: I will replicate the logic (or import it from a shared lib) for the initial render. 
        // For this task, I will stick to the components fetching data or being passed data.
        // Since I already wrote the API routes, I'll let the Client Components fetch data to ensure "Real-time" and separation.
        // Or better: Pass clientId to components and let them fetch.

        return { clientId }; // Just passing ID
    } catch (e) {
        return { clientId };
    }
}

export default async function ClientDashboardPage({
    params
}: {
    params: Promise<{ clientId: string }>
}) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session || !['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD'].includes((session.user as any).role)) {
        redirect("/assessments/login");
    }

    const labels = await resolveTenantLabels(clientId);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        {labels.dashboard}
                    </h1>
                    <p className="text-gray-500 font-medium">Talent Intelligence & Assessment Overview</p>
                </div>
            </header>

            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>}>
                <DashboardContent clientId={clientId} labels={labels} />
            </Suspense>
        </div>
    );
}

// Client Component Wrapper for data fetching
import { DashboardContent } from "@/components/Dashboard/DashboardContent";

