import { redirect } from "next/navigation";

export default async function ClientsRedirect({
    params,
}: {
    params: Promise<{ clientId: string; path?: string[] }>;
}) {
    const { clientId, path } = await params;
    const pathSegments = path && path.length > 0 ? path.join("/") : "dashboard";
    redirect(`/assessments/clients/${clientId}/${pathSegments}`);
}
