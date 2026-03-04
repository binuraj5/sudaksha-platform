"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Settings2, Target } from "lucide-react";
import { format } from "date-fns";
import { CompetencyRequestReviewDialog } from "@/components/admin/CompetencyRequestReviewDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function UserCompetencyRequestsTab() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("PENDING");

    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/competency-requests?status=${statusFilter}`);
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            toast.error("Failed to fetch competency requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const filteredRequests = requests.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by skill name or requester..."
                        className="pl-10 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">Pending Approval</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchRequests} disabled={loading} className="shrink-0 gap-2">
                    <Settings2 className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[30%]">Requested Skill</TableHead>
                                <TableHead>Requester</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="font-bold text-gray-900">{req.name}</div>
                                        {req.description && (
                                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{req.description}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-gray-800">{req.user.name}</div>
                                        <div className="text-xs text-gray-500">{req.user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-gray-600">
                                            {format(new Date(req.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={
                                            req.status === "PENDING" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                                                req.status === "APPROVED" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                                    "bg-red-100 text-red-700 hover:bg-red-100"
                                        }>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant={req.status === "PENDING" ? "default" : "outline"}
                                            className={req.status === "PENDING" ? "bg-red-600 hover:bg-red-700" : ""}
                                            onClick={() => setSelectedRequest(req)}
                                        >
                                            {req.status === "PENDING" ? "Review" : "View"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Target className="h-10 w-10 text-gray-200 mb-2" />
                                            <p className="font-medium">No {statusFilter.toLowerCase()} skill requests found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <CompetencyRequestReviewDialog
                request={selectedRequest}
                open={!!selectedRequest}
                onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}
                onProcessed={() => {
                    setSelectedRequest(null);
                    fetchRequests();
                }}
            />
        </div>
    );
}
