
import { RoleRequestForm } from "@/components/Roles/RoleRequestForm";
import { FilePlus } from "lucide-react";

export default async function RoleRequestPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    return (
        <div className="space-y-6 pt-6 pb-12">
            <div className="flex items-center gap-2 max-w-2xl mx-auto px-6">
                <FilePlus className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Role Request Workflow</h2>
            </div>

            <RoleRequestForm clientId={clientId} />
        </div>
    );
}
