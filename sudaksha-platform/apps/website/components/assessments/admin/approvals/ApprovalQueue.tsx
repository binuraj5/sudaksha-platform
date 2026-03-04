
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";

export const ApprovalQueue: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [reviewComment, setReviewComment] = useState('');

    // Fetching requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/approvals');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            toast.error("Failed to load approval requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
        try {
            const res = await fetch('/api/admin/approvals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                    comments: reviewComment
                })
            });

            if (!res.ok) throw new Error('Failed to update');

            toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'}`);
            fetchRequests(); // Turn into optimistic update for better UX if needed
            setSelectedRequest(null);
            setReviewComment('');
        } catch (error) {
            toast.error("Failed to process request");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Approval Queue</h1>
                <p className="text-gray-500">Review and moderate role/competency submissions from tenants.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Items awaiting your review for platform-wide or tenant-specific activation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Entity Name</TableHead>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <Badge variant={req.type === 'ROLE' ? 'default' : 'secondary'}>
                                            {req.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{req.entityName}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                            {req.tenant.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>
                                                    <Eye className="h-4 w-4 mr-2" /> Review
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Review Submission</DialogTitle>
                                                    <DialogDescription>
                                                        Reviewing {req.type.toLowerCase()} "{req.entityName}" from {req.tenant.name}.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="py-4 space-y-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                                        <h4 className="font-semibold mb-2">Submission Details</h4>
                                                        <p className="text-sm text-gray-600">
                                                            This is where the detailed view of the {req.type.toLowerCase()} will be rendered.
                                                            (Indicators for Competency / Mappings for Role)
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold">Reviewer Comments</label>
                                                        <Textarea
                                                            placeholder="Add any feedback or reasons for rejection..."
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <DialogFooter className="flex justify-between sm:justify-between">
                                                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(req.id, 'REJECT')}>
                                                        <X className="h-4 w-4 mr-2" /> Reject
                                                    </Button>
                                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(req.id, 'APPROVE')}>
                                                        <Check className="h-4 w-4 mr-2" /> Approve
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {requests.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                        All clear! No pending approval requests.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
