"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RemoveMemberButton({ clientId, teamId, memberId }: { clientId: string, teamId: string, memberId: string }) {
    const router = useRouter();

    const handleRemove = async () => {
        if (!confirm("Remove member from team?")) return;
        try {
            const res = await fetch(`/api/clients/${clientId}/teams/${teamId}/members/${memberId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Member removed");
                router.refresh();
            } else {
                toast.error("Failed");
            }
        } catch (e) {
            toast.error("Error");
        }
    };

    return (
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500" onClick={handleRemove}>
            <X className="h-4 w-4" />
        </Button>
    );
}
