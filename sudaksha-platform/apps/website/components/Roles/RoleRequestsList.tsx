"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileQuestion } from "lucide-react";

export function RoleRequestsList({ clientId }: { clientId: string }) {
    const [requests, setRequests] = useState<Array<{
        id: string;
        status: string;
        requestedName: string;
        roleName?: string;
        createdAt: string;
        reviewedAt?: string;
        rejectionReason?: string;
        tenantName?: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/clients/${clientId}/roles/my-requests`)
            .then((r) => r.json())
            .then((data) => {
                setRequests(Array.isArray(data?.requests) ? data.requests : []);
            })
            .catch(() => setRequests([]))
            .finally(() => setLoading(false));
    }, [clientId]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <Card className="border-none shadow-sm bg-white mt-4">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <FileQuestion className="h-14 w-14 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">No requests yet</h2>
                    <p className="text-gray-500 mt-2 max-w-sm">
                        Submit a new role definition request to see it here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 mt-4">
            {requests.map((r) => (
                <Card key={r.id} className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                                <CardTitle className="text-lg">{r.requestedName}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                    Submitted {new Date(r.createdAt).toLocaleDateString()}
                                    {r.reviewedAt && ` · Reviewed ${new Date(r.reviewedAt).toLocaleDateString()}`}
                                </CardDescription>
                            </div>
                            <Badge
                                variant="secondary"
                                className={
                                    r.status === "APPROVED"
                                        ? "bg-green-100 text-green-700"
                                        : r.status === "REJECTED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-amber-100 text-amber-700"
                                }
                            >
                                {r.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    {r.rejectionReason && (
                        <CardContent className="pt-0">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason: </span>
                                {r.rejectionReason}
                            </p>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    );
}
