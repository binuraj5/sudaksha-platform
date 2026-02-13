'use client';

import { useState, useEffect } from 'react';
import {
  History,
  User,
  Calendar,
  Clock,
  FileText,
  RotateCcw,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entityType: 'course' | 'batch' | 'trainer' | 'student' | 'user' | 'system';
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  oldValue?: any;
  newValue?: any;
  metadata?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    [key: string]: any;
  };
  severity: 'info' | 'warning' | 'error' | 'success';
  category: 'create' | 'update' | 'delete' | 'login' | 'system';
}

interface VersionControlProps {
  entityId: string;
  entityType: string;
  onRestore: (versionId: string) => void;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; type: string; name: string } | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [searchQuery, filterEntity, filterAction, filterSeverity, filterCategory]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterEntity !== 'all') params.append('entityType', filterEntity);
      if (filterAction !== 'all') params.append('action', filterAction);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity.toUpperCase());

      const response = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        const mappedLogs = data.logs.map((log: any) => ({
          id: log.idEntity,
          action: log.action,
          entityType: (log.entityType?.toLowerCase() || 'system') as any,
          entityId: log.entityId || '',
          entityName: log.entityName || 'System',
          userId: log.userId || 'system',
          userName: log.userName || 'System',
          userEmail: '', // Not in log schema currently
          timestamp: log.createdAt,
          oldValue: log.details?.oldValues,
          newValue: log.details?.newValues,
          metadata: {
            ip: log.ipAddress,
            userAgent: log.userAgent
          },
          severity: log.severity.toLowerCase() as any,
          category: log.action.toLowerCase().includes('create') ? 'create' :
            log.action.toLowerCase().includes('update') ? 'update' :
              log.action.toLowerCase().includes('delete') ? 'delete' : 'system'
        }));
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs; // Filtering now happens server-side via API

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'course': return <FileText className="w-4 h-4" />;
      case 'batch': return <Calendar className="w-4 h-4" />;
      case 'trainer': return <User className="w-4 h-4" />;
      case 'student': return <User className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleViewVersionHistory = (log: AuditLog) => {
    setSelectedEntity({ id: log.entityId, type: log.entityType, name: log.entityName });
    setShowVersionControl(true);
  };

  const handleExportLogs = () => {
    console.log('Exporting audit logs...');
    // In real app, this would generate and download a CSV/Excel file
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading audit logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs & Version Control</h2>
          <p className="text-gray-600 mt-1">Track all changes and restore previous versions</p>
        </div>
        <button
          onClick={handleExportLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Entities</option>
            <option value="course">Courses</option>
            <option value="batch">Batches</option>
            <option value="trainer">Trainers</option>
            <option value="student">Students</option>
            <option value="user">Users</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="system">System</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getEntityIcon(log.entityType)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.entityName}</div>
                        <div className="text-xs text-gray-500">{log.entityType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">{log.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                      <span className="ml-1">{log.severity}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(log.action === 'Updated' || log.action === 'Deleted') && (
                        <button
                          onClick={() => handleViewVersionHistory(log)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="text-sm text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entity</label>
                  <p className="text-sm text-gray-900">{selectedLog.entityName} ({selectedLog.entityType})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedLog.userName}</p>
                </div>
              </div>

              {selectedLog.oldValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Value</label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Value</label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version Control Modal */}
      {showVersionControl && selectedEntity && (
        <VersionControlModal
          entity={selectedEntity}
          onClose={() => setShowVersionControl(false)}
          onRestore={(versionId) => {
            console.log('Restoring version:', versionId);
            setShowVersionControl(false);
          }}
        />
      )}
    </div>
  );
}

// Version Control Modal Component
function VersionControlModal({
  entity,
  onClose,
  onRestore
}: {
  entity: { id: string; type: string; name: string };
  onClose: () => void;
  onRestore: (versionId: string) => void;
}) {
  const [versions, setVersions] = useState([
    {
      id: 'v1',
      timestamp: '2024-01-15T10:30:00Z',
      author: 'Admin User',
      changes: 'Initial creation',
      data: { name: 'AI/ML Engineering', price: 55000, duration: 16 }
    },
    {
      id: 'v2',
      timestamp: '2024-01-15T14:20:00Z',
      author: 'Admin User',
      changes: 'Updated price from 50000 to 55000',
      data: { name: 'AI/ML Engineering', price: 55000, duration: 16 }
    },
    {
      id: 'v3',
      timestamp: '2024-01-16T09:15:00Z',
      author: 'Admin User',
      changes: 'Updated duration from 12 to 16 weeks',
      data: { name: 'AI/ML Engineering', price: 55000, duration: 16 }
    }
  ]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
            <p className="text-sm text-gray-600">{entity.name} ({entity.type})</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${index === 0 ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                    {versions.length - index}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Version {version.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(version.timestamp).toLocaleString()} by {version.author}
                    </div>
                  </div>
                </div>
                {index > 0 && (
                  <button
                    onClick={() => onRestore(version.id)}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-600 mb-2">{version.changes}</div>
              <div className="bg-gray-50 p-3 rounded">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(version.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
