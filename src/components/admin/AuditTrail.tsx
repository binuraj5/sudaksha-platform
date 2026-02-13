'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Plus, 
  Download,
  Filter,
  Search,
  Calendar,
  Eye,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: {
    type: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export';
    entity: string;
    entityId: string;
    description: string;
  };
  details: {
    [key: string]: any;
    oldValues?: { [key: string]: any };
    newValues?: { [key: string]: any };
    ip?: string;
    userAgent?: string;
  };
  severity: 'info' | 'warning' | 'error';
  category: 'user_management' | 'course_management' | 'batch_management' | 'system' | 'security';
}

interface AuditTrailProps {
  logs: AuditLog[];
  onExportLogs: () => void;
  onRestorePoint: (logId: string) => void;
}

export default function AuditTrail({ 
  logs, 
  onExportLogs, 
  onRestorePoint 
}: AuditTrailProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-01-08T10:30:00Z',
      user: {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@sudaksha.com',
        role: 'Administrator'
      },
      action: {
        type: 'create',
        entity: 'Course',
        entityId: 'course-123',
        description: 'Created new course "AI/ML Engineering"'
      },
      details: {
        newValues: {
          name: 'AI/ML Engineering',
          category: 'software_development',
          duration: 12,
          price: 45000,
          description: 'Comprehensive AI and Machine Learning course'
        },
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      severity: 'info',
      category: 'course_management'
    },
    {
      id: '2',
      timestamp: '2024-01-08T09:45:00Z',
      user: {
        id: 'user-2',
        name: 'John Doe',
        email: 'john@sudaksha.com',
        role: 'Trainer'
      },
      action: {
        type: 'update',
        entity: 'Batch',
        entityId: 'batch-456',
        description: 'Updated batch schedule for "MERN Stack - Batch A"'
      },
      details: {
        oldValues: {
          startDate: '2024-01-15',
          schedule: 'weekday_morning'
        },
        newValues: {
          startDate: '2024-01-16',
          schedule: 'weekday_evening'
        },
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      severity: 'info',
      category: 'batch_management'
    },
    {
      id: '3',
      timestamp: '2024-01-08T08:20:00Z',
      user: {
        id: 'user-3',
        name: 'Jane Smith',
        email: 'jane@sudaksha.com',
        role: 'Administrator'
      },
      action: {
        type: 'delete',
        entity: 'Student',
        entityId: 'student-789',
        description: 'Deleted student record "Rahul Kumar"'
      },
      details: {
        oldValues: {
          name: 'Rahul Kumar',
          email: 'rahul@example.com',
          phone: '+91 98765 43210',
          enrolledCourse: 'Data Science'
        },
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      severity: 'warning',
      category: 'user_management'
    },
    {
      id: '4',
      timestamp: '2024-01-07T16:15:00Z',
      user: {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@sudaksha.com',
        role: 'Administrator'
      },
      action: {
        type: 'export',
        entity: 'Reports',
        entityId: 'report-all',
        description: 'Exported monthly analytics report'
      },
      details: {
        reportType: 'monthly_analytics',
        dateRange: '2024-01-01 to 2024-01-31',
        format: 'PDF',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      severity: 'info',
      category: 'system'
    },
    {
      id: '5',
      timestamp: '2024-01-07T14:30:00Z',
      user: {
        id: 'user-4',
        name: 'System',
        email: 'system@sudaksha.com',
        role: 'System'
      },
      action: {
        type: 'login',
        entity: 'Security',
        entityId: 'security-alert',
        description: 'Failed login attempt detected'
      },
      details: {
        attemptedEmail: 'hacker@malicious.com',
        ip: '185.220.101.182',
        userAgent: 'Mozilla/5.0 (compatible; scanner/1.0)',
        reason: 'Invalid credentials',
        attempts: 5
      },
      severity: 'error',
      category: 'security'
    }
  ];

  const displayLogs = logs.length > 0 ? logs : mockLogs;

  const filteredLogs = displayLogs.filter(log => {
    const searchMatch = 
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.entity.toLowerCase().includes(searchQuery.toLowerCase());
    
    const actionMatch = filterAction === 'all' || log.action.type === filterAction;
    const userMatch = filterUser === 'all' || log.user.id === filterUser;
    const categoryMatch = filterCategory === 'all' || log.category === filterCategory;
    
    return searchMatch && actionMatch && userMatch && categoryMatch;
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'create': return <Plus className="w-4 h-4 text-green-600" />;
      case 'update': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-600" />;
      case 'export': return <Download className="w-4 h-4 text-orange-600" />;
      case 'login': return <User className="w-4 h-4 text-gray-600" />;
      case 'logout': return <User className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueUsers = Array.from(new Set(displayLogs.map(log => log.user.id))).map(id => 
    displayLogs.find(log => log.user.id === id)?.user
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-blue-600" />
          Audit Trail
        </h2>
        <button
          onClick={onExportLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
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

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="export">Export</option>
            <option value="login">Login</option>
          </select>

          {/* User Filter */}
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user?.id} value={user?.id}>
                {user?.name} ({user?.role})
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="user_management">User Management</option>
            <option value="course_management">Course Management</option>
            <option value="batch_management">Batch Management</option>
            <option value="system">System</option>
            <option value="security">Security</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Logs Found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Action Icon */}
                  <div className="mt-1">
                    {getActionIcon(log.action.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{log.action.description}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{log.user.name} ({log.user.role})</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        <span>{log.action.entity} - {log.action.type}</span>
                      </div>
                    </div>

                    {/* Details */}
                    {log.details && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Details:</div>
                        
                        {/* IP and User Agent */}
                        {(log.details.ip || log.details.userAgent) && (
                          <div className="text-sm text-gray-600 mb-2">
                            {log.details.ip && <span><strong>IP:</strong> {log.details.ip}</span>}
                            {log.details.ip && log.details.userAgent && <span> • </span>}
                            {log.details.userAgent && <span><strong>User Agent:</strong> {log.details.userAgent.substring(0, 50)}...</span>}
                          </div>
                        )}

                        {/* Old vs New Values */}
                        {(log.details.oldValues || log.details.newValues) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {log.details.oldValues && (
                              <div>
                                <div className="text-sm font-medium text-red-600 mb-1">Previous Values:</div>
                                {Object.entries(log.details.oldValues).map(([key, value]) => (
                                  <div key={key} className="text-sm text-gray-600">
                                    <strong className="capitalize">{key}:</strong> {String(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                            {log.details.newValues && (
                              <div>
                                <div className="text-sm font-medium text-green-600 mb-1">New Values:</div>
                                {Object.entries(log.details.newValues).map(([key, value]) => (
                                  <div key={key} className="text-sm text-gray-600">
                                    <strong className="capitalize">{key}:</strong> {String(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Other Details */}
                        {Object.entries(log.details)
                          .filter(([key]) => !['oldValues', 'newValues', 'ip', 'userAgent'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="text-sm text-gray-600">
                              <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {String(value)}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {(log.action.type === 'update' || log.action.type === 'delete') && (
                    <button
                      onClick={() => onRestorePoint(log.id)}
                      className="p-2 text-orange-600 hover:text-orange-700 transition-colors"
                      title="Restore Point"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <strong>Action:</strong> {selectedLog.action.description}
                </div>
                <div>
                  <strong>User:</strong> {selectedLog.user.name} ({selectedLog.user.email})
                </div>
                <div>
                  <strong>Timestamp:</strong> {formatDate(selectedLog.timestamp)}
                </div>
                <div>
                  <strong>Entity:</strong> {selectedLog.action.entity} ({selectedLog.action.entityId})
                </div>
                <div>
                  <strong>Category:</strong> {selectedLog.category}
                </div>
                <div>
                  <strong>Severity:</strong> {selectedLog.severity}
                </div>
                <div>
                  <strong>Details:</strong>
                  <pre className="mt-2 bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
