import { RolesPageContent } from "@/components/Roles/RolesPageContent";

/**
 * Client roles page: same UI as admin roles. Data is scoped by /api/admin/roles (RLS) based on session.
 */
export default async function ClientRolesPage({ params }: { params: Promise<{ clientId: string }> }) {
    await params; // satisfy dynamic route
    return <RolesPageContent />;
}
