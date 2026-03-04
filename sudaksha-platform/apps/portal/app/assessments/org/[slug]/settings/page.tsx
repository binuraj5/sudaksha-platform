import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationForm } from "@/components/Settings/OrganizationForm";
import { BrandingSettings } from "@/components/Settings/BrandingSettings";

export default async function OrgSettingsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const role = (session.user as any).role;
    const canManageOrg = ["SUPER_ADMIN", "TENANT_ADMIN", "CLIENT_ADMIN"].includes(role);
    if (!canManageOrg) {
        redirect("/assessments/login");
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const clientId = tenant.id;

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
            <header>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    Organization Setup
                </h1>
                <p className="text-gray-500 font-medium">Manage organization profile, branding, and billing</p>
            </header>

            <Tabs defaultValue="organization" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="organization">Organization</TabsTrigger>
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="organization" className="space-y-6">
                    <OrganizationForm clientId={clientId} />
                </TabsContent>

                <TabsContent value="branding" className="space-y-6">
                    <BrandingSettings clientId={clientId} />
                </TabsContent>

                <TabsContent value="billing">
                    <div className="p-12 text-center border-2 border-dashed rounded-lg bg-gray-50 text-gray-400">
                        Billing features coming soon in M1-3 Phase 2
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
