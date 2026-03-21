"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTenantLabels } from "@/hooks/useTenantLabels";

export function DeleteTeamButton({ clientId, teamId }: { clientId: string, teamId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const labels = useTenantLabels();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this ${labels.subUnit.toLowerCase()}? All members will be reassigned to the parent ${labels.orgUnit.toLowerCase()}.`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/teams/${teamId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success(`${labels.subUnit} deleted successfully`);
                router.push(`/assessments/clients/${clientId}/teams`);
                router.refresh();
            } else {
                toast.error(`Failed to delete ${labels.subUnit.toLowerCase()}`);
            }
        } catch (error) {
            toast.error("Error deleting team");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} 
            Delete
        </Button>
    );
}
