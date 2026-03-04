"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileQuestion, ArrowLeft } from "lucide-react";

export default function MyRoleRequestsPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = use(params);
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

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        My Role Requests
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Track status of role definition requests you submitted for approval.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/assessments/clients/${clientId}/roles/request`}>
                            <FileQuestion className="h-4 w-4 mr-2" />
                            New Request
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/assessments/clients/${clientId}/roles`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Roles
                        </Link>
                    </Button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : requests.length === 0 ? (
                <Card className="border-none shadow-md bg-white">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <FileQuestion className="h-14 w-14 text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">No requests yet</h2>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            Submit a new role definition request to see it here.
                        </p>
                        <Button asChild className="mt-6">
                            <Link href={`/assessments/clients/${clientId}/roles/request`}>
                                Request New Role
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests.map((r) => (
                        <Card key={r.id} className="border-none shadow-md bg-white">
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
            )}
        </div>
    );
}
