'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Eye, Calendar, User, AlertTriangle, Info, CheckCircle, X, Loader2, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  category: string;
  severity: string;
  actor: string;
  actorRole: string;
  targetEntity?: string;
  targetId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  status: string;
}

interface Summary { total: number; critical: number; warnings: number; failed: number; }

const CATEGORY_COLORS: Record<string, string> = {
  BUTTON: 'bg-blue-100 text-blue-700',
  AUTH: 'bg-purple-100 text-purple-700',
  COURSE: 'bg-green-100 text-green-700',
  BATCH: 'bg-teal-100 text-teal-700',
  USER: 'bg-pink-100 text-pink-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
  CONFLICT: 'bg-orange-100 text-orange-700',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, critical: 0, warnings: 0, failed: 0 });
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (severityFilter !== 'ALL') params.set('severity', severityFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('limit', '100');

      const res = await fetch(`/api/admin/audit?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
        setSummary(data.summary ?? { total: 0, critical: 0, warnings: 0, failed: 0 });
      }
    } catch { /* silently fail */ }
    finally { setIsLoading(false); }
  }, [searchTerm, severityFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Category', 'Severity', 'Actor', 'Description', 'Status', 'IP'];
    const rows = logs.map(l => [
      l.timestamp, l.action, l.category, l.severity,
      l.actor, `"${l.description}"`, l.status, l.ipAddress ?? '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const severityIcon = (s: string) => {
    if (s === 'CRITICAL' || s === 'ERROR') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (s === 'WARNING') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const severityBadge = (s: string) => {
    if (s === 'CRITICAL') return 'bg-red-100 text-red-700';
    if (s === 'ERROR') return 'bg-orange-100 text-orange-700';
    if (s === 'WARNING') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  const statusBadge = (s: string) => {
    if (s === 'SUCCESS') return 'bg-green-100 text-green-700';
    if (s === 'FAILED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Audit Log Detail</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400">Action</p><p className="font-mono font-medium text-xs">{selectedLog.action}</p></div>
                <div><p className="text-xs text-gray-400">Category</p><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[selectedLog.category] ?? 'bg-gray-100 text-gray-700'}`}>{selectedLog.category}</span></div>
                <div><p className="text-xs text-gray-400">Severity</p><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge(selectedLog.severity)}`}>{selectedLog.severity}</span></div>
                <div><p className="text-xs text-gray-400">Status</p><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(selectedLog.status)}`}>{selectedLog.status}</span></div>
                <div><p className="text-xs text-gray-400">Actor</p><p className="font-medium">{selectedLog.actor}</p></div>
                <div><p className="text-xs text-gray-400">Timestamp</p><p className="text-xs">{new Date(selectedLog.timestamp).toLocaleString()}</p></div>
                {selectedLog.ipAddress && <div><p className="text-xs text-gray-400">IP Address</p><p className="font-mono text-xs">{selectedLog.ipAddress}</p></div>}
                {selectedLog.targetEntity && <div><p className="text-xs text-gray-400">Target</p><p className="text-xs">{selectedLog.targetEntity} {selectedLog.targetId ? `#${selectedLog.targetId.slice(-8)}` : ''}</p></div>}
              </div>
              <div><p className="text-xs text-gray-400 mb-1">Description</p><p className="bg-gray-50 rounded p-2 text-sm">{selectedLog.description}</p></div>
              {selectedLog.userAgent && <div><p className="text-xs text-gray-400 mb-1">User Agent</p><p className="text-xs text-gray-500 truncate">{selectedLog.userAgent}</p></div>}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Metadata</p>
                  <pre className="text-xs bg-gray-50 rounded p-2 overflow-auto max-h-32">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-gray-600 mt-1">All system activity logged from the database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Total Logs</p><p className="text-xl font-bold text-indigo-600 mt-1">{summary.total}</p></div>
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Critical / Error</p><p className="text-xl font-bold text-red-600 mt-1">{summary.critical}</p></div>
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Warnings</p><p className="text-xl font-bold text-yellow-600 mt-1">{summary.warnings}</p></div>
        <div className="bg-white rounded-lg border p-3"><p className="text-xs text-gray-500">Failed Actions</p><p className="text-xl font-bold text-orange-600 mt-1">{summary.failed}</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search action, actor, entity..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="ERROR">Error</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" title="From" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" title="To" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Activity Logs ({total} total, showing {logs.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              No audit logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2 text-xs font-medium text-gray-500">Sev</th>
                    <th className="p-2 text-xs font-medium text-gray-500">Action</th>
                    <th className="p-2 text-xs font-medium text-gray-500">Category</th>
                    <th className="p-2 text-xs font-medium text-gray-500">Actor</th>
                    <th className="p-2 text-xs font-medium text-gray-500">Description</th>
                    <th className="p-2 text-xs font-medium text-gray-500">Status</th>
                    <th className="p-2 text-xs font-medium text-gray-500">Time</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{severityIcon(log.severity)}</td>
                      <td className="p-2"><span className="text-xs font-mono font-medium text-gray-700">{log.action}</span></td>
                      <td className="p-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[log.category] ?? 'bg-gray-100 text-gray-700'}`}>{log.category}</span></td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="text-xs font-medium truncate max-w-24">{log.actor}</span>
                        </div>
                      </td>
                      <td className="p-2"><p className="text-xs text-gray-600 max-w-xs truncate">{log.description}</p></td>
                      <td className="p-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(log.status)}`}>{log.status}</span></td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-3 w-3" />
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
