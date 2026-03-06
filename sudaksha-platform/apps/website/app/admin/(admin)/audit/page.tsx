'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Download, Eye, Filter, Calendar, User, Shield, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  category: 'AUTH' | 'USER' | 'COURSE' | 'BATCH' | 'PAYMENT' | 'SYSTEM' | 'CONTENT';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  actor: string;
  actorRole: string;
  targetEntity?: string;
  targetId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, string>;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
}

const MOCK_LOGS: AuditLog[] = [
  { id: '1', action: 'USER_LOGIN', category: 'AUTH', severity: 'INFO', actor: 'admin@sudaksha.com', actorRole: 'ADMIN', description: 'Admin logged in successfully', ipAddress: '192.168.1.1', timestamp: '2026-03-05T10:30:00', status: 'SUCCESS' },
  { id: '2', action: 'COURSE_PUBLISHED', category: 'COURSE', severity: 'INFO', actor: 'admin@sudaksha.com', actorRole: 'ADMIN', targetEntity: 'Course', targetId: 'c1', description: 'Published course "Advanced React Patterns"', ipAddress: '192.168.1.1', timestamp: '2026-03-05T10:45:00', status: 'SUCCESS' },
  { id: '3', action: 'USER_SUSPENDED', category: 'USER', severity: 'WARNING', actor: 'admin@sudaksha.com', actorRole: 'ADMIN', targetEntity: 'User', targetId: 'u5', description: 'Suspended user account: john.doe@example.com', ipAddress: '192.168.1.1', timestamp: '2026-03-05T11:00:00', status: 'SUCCESS' },
  { id: '4', action: 'PAYMENT_REFUND', category: 'PAYMENT', severity: 'WARNING', actor: 'admin@sudaksha.com', actorRole: 'ADMIN', targetEntity: 'Payment', targetId: 'p12', description: 'Processed refund of ₹4,999 for order #ORD-2026-0145', ipAddress: '192.168.1.1', timestamp: '2026-03-05T11:15:00', status: 'SUCCESS' },
  { id: '5', action: 'BATCH_DELETED', category: 'BATCH', severity: 'ERROR', actor: 'trainer@sudaksha.com', actorRole: 'TRAINER', targetEntity: 'Batch', targetId: 'b3', description: 'Attempted to delete active batch "Python Basics Batch C"', ipAddress: '10.0.0.5', timestamp: '2026-03-05T11:30:00', status: 'FAILED' },
  { id: '6', action: 'SYSTEM_BACKUP', category: 'SYSTEM', severity: 'INFO', actor: 'system', actorRole: 'SYSTEM', description: 'Automated daily backup completed', timestamp: '2026-03-05T02:00:00', status: 'SUCCESS' },
  { id: '7', action: 'LOGIN_FAILED', category: 'AUTH', severity: 'WARNING', actor: 'unknown', actorRole: 'UNKNOWN', description: 'Failed login attempt for admin@sudaksha.com (3 attempts)', ipAddress: '203.45.67.89', timestamp: '2026-03-04T22:15:00', status: 'FAILED' },
  { id: '8', action: 'CONTENT_BULK_DELETE', category: 'CONTENT', severity: 'CRITICAL', actor: 'admin@sudaksha.com', actorRole: 'ADMIN', description: 'Bulk delete of 12 blog posts initiated', ipAddress: '192.168.1.1', timestamp: '2026-03-04T15:00:00', status: 'PARTIAL' },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/audit');
        const data = await response.json();
        setLogs(data.logs || MOCK_LOGS);
      } catch {
        setLogs(MOCK_LOGS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesDateFrom = !dateFrom || new Date(log.timestamp) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(log.timestamp) <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Category', 'Severity', 'Actor', 'Description', 'Status', 'IP'];
    const rows = filteredLogs.map(log => [
      log.id, log.timestamp, log.action, log.category, log.severity,
      log.actor, `"${log.description}"`, log.status, log.ipAddress || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'ERROR': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'ERROR': return 'destructive';
      case 'WARNING': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'default';
      case 'FAILED': return 'destructive';
      case 'PARTIAL': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      AUTH: 'bg-blue-100 text-blue-700',
      USER: 'bg-purple-100 text-purple-700',
      COURSE: 'bg-green-100 text-green-700',
      BATCH: 'bg-teal-100 text-teal-700',
      PAYMENT: 'bg-yellow-100 text-yellow-700',
      SYSTEM: 'bg-gray-100 text-gray-700',
      CONTENT: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Audit Log Details</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500">Action</p><p className="font-medium">{selectedLog.action}</p></div>
                <div><p className="text-xs text-gray-500">Category</p><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(selectedLog.category)}`}>{selectedLog.category}</span></div>
                <div><p className="text-xs text-gray-500">Severity</p><Badge variant={getSeverityColor(selectedLog.severity)}>{selectedLog.severity}</Badge></div>
                <div><p className="text-xs text-gray-500">Status</p><Badge variant={getStatusColor(selectedLog.status)}>{selectedLog.status}</Badge></div>
                <div><p className="text-xs text-gray-500">Actor</p><p className="font-medium">{selectedLog.actor}</p></div>
                <div><p className="text-xs text-gray-500">Role</p><p>{selectedLog.actorRole}</p></div>
                {selectedLog.ipAddress && <div><p className="text-xs text-gray-500">IP Address</p><p className="font-mono text-xs">{selectedLog.ipAddress}</p></div>}
                <div><p className="text-xs text-gray-500">Timestamp</p><p className="text-xs">{new Date(selectedLog.timestamp).toLocaleString()}</p></div>
              </div>
              <div><p className="text-xs text-gray-500 mb-1">Description</p><p className="text-sm bg-gray-50 p-2 rounded">{selectedLog.description}</p></div>
              {selectedLog.targetEntity && (
                <div><p className="text-xs text-gray-500 mb-1">Target</p><p className="text-sm">{selectedLog.targetEntity} #{selectedLog.targetId}</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-gray-600 mt-1">Track all system activity and administrative actions</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Logs</p><p className="text-xl font-bold text-indigo-600 mt-1">{logs.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Critical/Error</p><p className="text-xl font-bold text-red-600 mt-1">{logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'ERROR').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Warnings</p><p className="text-xl font-bold text-yellow-600 mt-1">{logs.filter(l => l.severity === 'WARNING').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Failed Actions</p><p className="text-xl font-bold text-orange-600 mt-1">{logs.filter(l => l.status === 'FAILED').length}</p></Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Categories</option>
          <option value="AUTH">Auth</option>
          <option value="USER">User</option>
          <option value="COURSE">Course</option>
          <option value="BATCH">Batch</option>
          <option value="PAYMENT">Payment</option>
          <option value="SYSTEM">System</option>
          <option value="CONTENT">Content</option>
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="ERROR">Error</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="PARTIAL">Partial</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" title="From date" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" title="To date" />
      </div>

      <Card>
        <CardHeader><CardTitle>Activity Logs ({filteredLogs.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading audit logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Severity</th>
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Actor</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{getSeverityIcon(log.severity)}</td>
                      <td className="p-2"><span className="text-xs font-mono font-medium text-gray-700">{log.action}</span></td>
                      <td className="p-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(log.category)}`}>{log.category}</span></td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <div>
                            <div className="text-xs font-medium">{log.actor}</div>
                            <div className="text-xs text-gray-500">{log.actorRole}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2"><p className="text-xs text-gray-600 max-w-xs truncate">{log.description}</p></td>
                      <td className="p-2"><Badge variant={getStatusColor(log.status)} className="text-xs">{log.status}</Badge></td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
