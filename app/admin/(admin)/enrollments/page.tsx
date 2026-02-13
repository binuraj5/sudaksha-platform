'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Eye,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
} from 'lucide-react';

interface Submission {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  crmWebhookStatus: string;
  crmLeadId?: string;
  course?: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

interface EnrollmentData {
  data: Submission[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    byType: {
      enrollment: number;
      demo_request: number;
      counselor_inquiry: number;
    };
    byStatus: {
      new: number;
      contacted: number;
      converted: number;
      spam: number;
    };
    crmSyncPending: number;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-yellow-100 text-yellow-800';
    case 'contacted':
      return 'bg-blue-100 text-blue-800';
    case 'converted':
      return 'bg-green-100 text-green-800';
    case 'spam':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    enrollment: 'Enrollment',
    demo_request: 'Demo Request',
    counselor_inquiry: 'Counselor Inquiry',
  };
  return labels[type] || type;
};

const defaultSummary = {
  total: 0,
  byType: { enrollment: 0, demo_request: 0, counselor_inquiry: 0 },
  byStatus: { new: 0, contacted: 0, converted: 0, spam: 0 },
  crmSyncPending: 0,
};

const defaultPagination = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1,
};

export default function EnrollmentsPage() {
  const [data, setData] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    id: string;
    currentStatus: string;
  } | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/admin/enrollments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData({
        data: [],
        pagination: defaultPagination,
        summary: defaultSummary,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [page, searchTerm, statusFilter, typeFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: id,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      setStatusUpdateModal(null);
      fetchEnrollments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRows.size === 0) return;

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          submissionIds: Array.from(selectedRows),
        }),
      });

      if (!response.ok) throw new Error('Bulk action failed');
      setSelectedRows(new Set());
      fetchEnrollments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    }
  };

  const summary = data?.summary ?? defaultSummary;
  const pagination = data?.pagination ?? defaultPagination;
  const list = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enrollments & Submissions</h1>
        <p className="text-gray-600">Manage form submissions and enrollments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: summary.total, icon: CheckCircle },
          { label: 'New Submissions', value: summary.byStatus.new, icon: Clock },
          { label: 'CRM Pending', value: summary.crmSyncPending, color: 'text-orange-600' },
          {
            label: 'Conversion Rate',
            value: summary.total ? Math.round((summary.byStatus.converted / summary.total) * 100) + '%' : '0%',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search email, name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            <option value="enrollment">Enrollments</option>
            <option value="demo_request">Demo Requests</option>
            <option value="counselor_inquiry">Counselor Inquiries</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="spam">Spam</option>
          </select>

          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-900">{selectedRows.size} selected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleBulkAction('mark-contacted')}
              className="px-3 py-1.5 rounded text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
            >
              Mark Contacted
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction('mark-converted')}
              className="px-3 py-1.5 rounded text-sm font-medium bg-green-500 text-white hover:bg-green-600"
            >
              Mark Converted
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction('mark-spam')}
              className="px-3 py-1.5 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600"
            >
              Mark Spam
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No submissions found. API /api/admin/enrollments may not be implemented yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(new Set(list.map((s) => s.id)));
                          } else {
                            setSelectedRows(new Set());
                          }
                        }}
                        checked={selectedRows.size === list.length && list.length > 0}
                      />
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Contact</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">CRM Sync</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((submission) => (
                    <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(submission.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedRows);
                            if (e.target.checked) {
                              newSet.add(submission.id);
                            } else {
                              newSet.delete(submission.id);
                            }
                            setSelectedRows(newSet);
                          }}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {submission.firstName} {submission.lastName}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {submission.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {submission.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {getTypeLabel(submission.type)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            submission.crmWebhookStatus === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : submission.crmWebhookStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {submission.crmWebhookStatus ?? 'pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() =>
                            setStatusUpdateModal({
                              id: submission.id,
                              currentStatus: submission.status,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Previous
                </button>
                <p className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </p>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {statusUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="space-y-3">
              {['new', 'contacted', 'converted', 'spam'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusUpdate(statusUpdateModal.id, status)}
                  className={`w-full text-left px-4 py-2 rounded border transition ${
                    statusUpdateModal.currentStatus === status
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStatusUpdateModal(null)}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
