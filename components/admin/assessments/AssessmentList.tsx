"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, ChevronLeft, ChevronRight, Eye, FileOutput } from "lucide-react";
import Link from 'next/link';
import { bulkDeleteAssessments, bulkUpdateAssessmentStatus } from "@/lib/assessment-actions";
import { Trash2, CheckCircle, RefreshCcw } from "lucide-react";
// Removed missing UI components imports

export default function AssessmentList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [department, setDepartment] = useState("ALL");

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["assessments", page, search, status, department],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            });
            if (search) params.append("search", search);
            if (status !== "ALL") params.append("status", status);
            if (department !== "ALL") params.append("department", department);

            const res = await fetch(`/api/admin/assessments?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch assessments");
            return res.json();
        },
        placeholderData: (previousData) => previousData,
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
        setSelectedIds([]);
    };

    const assessments = data?.data || [];
    const pagination = data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    };

    // Bulk Actions Handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === assessments.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(assessments.map((a: any) => a.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} assessments?`)) return;
        setIsBulkLoading(true);
        const res = await bulkDeleteAssessments(selectedIds);
        setIsBulkLoading(false);
        if (res.success) {
            setSelectedIds([]);
            refetch();
        } else {
            alert("Failed to delete assessments");
        }
    };

    const handleBulkStatusChange = async (newStatus: string) => {
        setIsBulkLoading(true);
        const res = await bulkUpdateAssessmentStatus(selectedIds, newStatus);
        setIsBulkLoading(false);
        if (res.success) {
            setSelectedIds([]);
            refetch();
        } else {
            alert("Failed to update status");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 p-4 flex items-center justify-between border-b border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedIds.length} selectd
                    </span>
                    <div className="flex gap-2">
                        <div className="relative group">
                            <button className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Change Status
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 hidden group-hover:block z-10">
                                {['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleBulkStatusChange(s)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        Mark as {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkLoading}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center gap-2"
                        >
                            {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Filters Header (Hide if bulk selection active to avoid clutter? No, keep it) */}
            <div className={`p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 ${selectedIds.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or employee ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={department}
                        onChange={(e) => {
                            setDepartment(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="ALL">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 w-4">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={assessments.length > 0 && selectedIds.length === assessments.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progress
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                </td>
                            </tr>
                        ) : assessments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No assessments found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            assessments.map((assessment: any) => (
                                <tr key={assessment.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(assessment.id) ? 'bg-blue-50/30' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(assessment.id)}
                                            onChange={() => toggleSelect(assessment.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                {assessment.user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{assessment.user.name}</div>
                                                <div className="text-sm text-gray-500">{assessment.user.email}</div>
                                                <div className="text-xs text-gray-400">{assessment.user.employeeId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{assessment.user.department || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {assessment.assessmentType.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={assessment.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${assessment.completionPercentage}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{assessment.completionPercentage}%</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/assessments/${assessment.id}`} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded">
                                                <FileOutput className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>

                            {/* Simplified pagination numbers */}
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                Page {page} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        DRAFT: "bg-gray-100 text-gray-800",
        IN_PROGRESS: "bg-blue-100 text-blue-800",
        SUBMITTED: "bg-purple-100 text-purple-800",
        UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
        COMPLETED: "bg-green-100 text-green-800",
    };

    return (
        <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || "bg-gray-100 text-gray-800"
                }`}
        >
            {status.replace("_", " ")}
        </span>
    );
}
