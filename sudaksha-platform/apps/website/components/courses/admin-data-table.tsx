'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronUp, ChevronDown, MoreHorizontal, Eye, Edit, Trash2,
  Search, Filter, Download, Check, X, Upload, Archive
} from 'lucide-react';
import { Course } from '@/types/course';

interface AdminDataTableProps {
  courses: Course[];
  loading?: boolean;
  onView?: (course: Course) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onStatusChange?: (courseId: string, newStatus: string) => void;
  onBulkDelete?: (courseIds: string[]) => void;
  onExport?: (courses: Course[]) => void;
  className?: string;
}

type SortField = 'name' | 'category' | 'price' | 'durationHours' | 'rating' | 'enrolledCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function AdminDataTable({
  courses,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onBulkDelete,
  onExport,
  className = ''
}: AdminDataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'createdAt') {
      aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    }

    // Ensure dates are strings, not Date objects
    if (aValue instanceof Date) aValue = aValue.toISOString();
    if (bValue instanceof Date) bValue = bValue.toISOString();

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowSelection = (courseId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === sortedCourses.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedCourses.map(course => course.id)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-purple-100 text-purple-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>

            {selectedRows.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedRows.size} selected
                </span>
                <button
                  onClick={() => onExport?.(sortedCourses.filter(c => selectedRows.has(c.id)))}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Export Selected
                </button>
                <button
                  onClick={() => {
                    onBulkDelete?.(Array.from(selectedRows));
                    setSelectedRows(new Set());
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onExport?.(sortedCourses)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      {/* Table - Desktop Only */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedCourses.length && sortedCourses.length > 0}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 font-medium text-gray-900 hover:text-gray-700"
                >
                  Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>

              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1 font-medium text-gray-900 hover:text-gray-700"
                >
                  Category
                  {sortField === 'category' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>

              <th className="px-6 py-3 text-left font-medium text-gray-900">Domain</th>
              <th className="px-6 py-3 text-left font-medium text-gray-900">Industry</th>
              <th className="px-6 py-3 text-left font-medium text-gray-900">Level</th>
              <th className="px-6 py-3 text-left font-medium text-gray-900">Type</th>
              <th className="px-6 py-3 text-left font-medium text-gray-900">Mode</th>

              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('durationHours')}
                  className="flex items-center gap-1 font-medium text-gray-900 hover:text-gray-700"
                >
                  Duration
                  {sortField === 'durationHours' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>

              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 font-medium text-gray-900 hover:text-gray-700"
                >
                  Price
                  {sortField === 'price' && (
                    sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </th>

              <th className="px-6 py-3 text-left font-medium text-gray-900">Status</th>
              <th className="px-6 py-3 text-left font-medium text-gray-900">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sortedCourses.map((course, index) => (
              <motion.tr
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(course.id)}
                    onChange={() => toggleRowSelection(course.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {course.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {course.category}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {course.category}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${course.domain === 'IT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {course.domain}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {course.industry}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.audienceLevel)}`}>
                    {course.audienceLevel}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {course.courseType}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {course.deliveryMode}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {course.durationHours} hours
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-blue-600">
                    ₹{course.price.toLocaleString('en-IN')}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView?.(course)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(course)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {/* Quick Publish/Archive Actions */}
                    {course.status === 'DRAFT' && (
                      <button
                        onClick={() => onStatusChange?.(course.id, 'PUBLISHED')}
                        className="p-1 text-gray-600 hover:text-green-600"
                        title="Publish Course"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                    {course.status === 'PUBLISHED' && (
                      <button
                        onClick={() => onStatusChange?.(course.id, 'ARCHIVED')}
                        className="p-1 text-gray-600 hover:text-orange-600"
                        title="Archive Course"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete?.(course)}
                      className="p-1 text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sortedCourses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 line-clamp-1">{course.name}</h3>
                <p className="text-sm text-gray-600">{course.category}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                course.status === 'ARCHIVED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                {course.status}
              </span>
            </div>

            {/* Course Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-1 font-medium">{course.durationHours} hours</span>
              </div>
              <div>
                <span className="text-gray-500">Price:</span>
                <span className="ml-1 font-medium">₹{course.price.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Domain:</span>
                <span className="ml-1 font-medium">{course.domain}</span>
              </div>
              <div>
                <span className="text-gray-500">Level:</span>
                <span className="ml-1 font-medium">{course.audienceLevel}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <input
                type="checkbox"
                checked={selectedRows.has(course.id)}
                onChange={() => toggleRowSelection(course.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView?.(course)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit?.(course)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete?.(course)}
                  className="p-2 text-gray-600 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {sortedCourses.length === 0 && !loading && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No courses available'}
          </p>
        </div>
      )}
    </div>
  );
}
