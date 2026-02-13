'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnail?: string | null;
  durationHours: unknown;
  durationWeeks: unknown;
  baseFee: number;
  level: string;
  status: string;
  industry: { name: string; slug: string };
  trainingType: { name: string };
  batches: Array<{ id: string }>;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminCoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/courses?${params}`);
      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete course');
      setDeleteConfirm(null);
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const statusLower = (s: string) => s?.toLowerCase() ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600">Manage and create courses</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/courses/ai-generate"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            <Zap className="w-4 h-4" />
            AI Generate
          </Link>
          <Link
            href="/admin/courses/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Course
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <div className="flex items-center justify-end">
            {pagination && (
              <p className="text-sm text-gray-600">
                Showing {courses.length} of {pagination.total} courses
              </p>
            )}
          </div>
        </div>
      </div>

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
        ) : courses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No courses found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Course</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Industry</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Duration</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Fee</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Batches</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.trainingType?.name ?? '-'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {course.industry?.name ?? '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {course.durationWeeks != null && course.durationHours != null
                          ? `${course.durationWeeks}w (${course.durationHours}h)`
                          : '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatCurrency(Number(course.baseFee))}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                            statusLower(course.status) === 'published'
                              ? 'bg-green-100 text-green-800'
                              : statusLower(course.status) === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                          {course.batches?.length ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="p-1.5 hover:bg-gray-200 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(course.id)}
                            className="p-1.5 hover:bg-gray-200 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Course?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All related data will be deleted.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
