'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, CheckCircle, XCircle, Clock, User, Calendar, BookOpen, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Conflict {
  id: string;
  type: 'SCHEDULE' | 'TRAINER' | 'ROOM' | 'ENROLLMENT' | 'RESOURCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED' | 'ESCALATED';
  title: string;
  description: string;
  affectedItems: string[];
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  assignedTo?: string;
  courseId?: string;
  courseName?: string;
  batchId?: string;
  batchName?: string;
}

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  useEffect(() => { loadConflicts(); }, []);

  const loadConflicts = async () => {
    setIsLoading(true);
    try {
      const [conflictsRes, actionsRes] = await Promise.all([
        fetch('/api/admin/conflicts'),
        fetch('/api/admin/conflicts/action'),
      ]);
      const [conflictsData, actionsData] = await Promise.all([conflictsRes.json(), actionsRes.json()]);
      const statusMap: Record<string, string> = actionsData.statusMap ?? {};
      const raw: Conflict[] = conflictsData.conflicts ?? [];
      // Overlay persisted statuses
      setConflicts(raw.map(c => statusMap[c.id] ? { ...c, status: statusMap[c.id] as Conflict['status'] } : c));
    } catch {
      toast.error('Failed to load conflicts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConflicts = conflicts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const persistAction = async (id: string, action: string, title: string) => {
    try {
      await fetch('/api/admin/conflicts/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflictId: id, action, title }),
      });
    } catch { /* best-effort */ }
  };

  const handleResolve = (id: string) => {
    const c = conflicts.find(x => x.id === id);
    setConflicts(prev => prev.map(c => c.id === id
      ? { ...c, status: 'RESOLVED', resolvedAt: new Date().toISOString(), resolvedBy: 'Admin' }
      : c
    ));
    persistAction(id, 'RESOLVED', c?.title ?? id);
    if (selectedConflict?.id === id) setSelectedConflict(null);
  };

  const handleDismiss = (id: string) => {
    const c = conflicts.find(x => x.id === id);
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, status: 'DISMISSED' } : c));
    persistAction(id, 'DISMISSED', c?.title ?? id);
    if (selectedConflict?.id === id) setSelectedConflict(null);
  };

  const handleEscalate = (id: string) => {
    const c = conflicts.find(x => x.id === id);
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, status: 'ESCALATED' } : c));
    persistAction(id, 'ESCALATED', c?.title ?? id);
    if (selectedConflict?.id === id) setSelectedConflict(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'border-l-4 border-red-600 bg-red-50';
      case 'HIGH': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'MEDIUM': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'LOW': return 'border-l-4 border-blue-400 bg-blue-50';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'destructive';
      case 'ESCALATED': return 'destructive';
      case 'RESOLVED': return 'default';
      case 'DISMISSED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRAINER': return <User className="h-4 w-4 text-purple-500" />;
      case 'SCHEDULE': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'ENROLLMENT': return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'RESOURCE': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const openCount = conflicts.filter(c => c.status === 'OPEN').length;
  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL' && c.status === 'OPEN').length;
  const escalatedCount = conflicts.filter(c => c.status === 'ESCALATED').length;
  const resolvedCount = conflicts.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Conflict Detection</h1>
          <p className="text-gray-600 mt-1">Monitor and resolve scheduling and resource conflicts</p>
        </div>
        <Button variant="outline" onClick={loadConflicts} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 border-red-200">
          <p className="text-xs font-medium text-gray-600">Open Conflicts</p>
          <p className="text-xl font-bold text-red-600 mt-1">{openCount}</p>
        </Card>
        <Card className="p-3 border-orange-200">
          <p className="text-xs font-medium text-gray-600">Critical</p>
          <p className="text-xl font-bold text-orange-600 mt-1">{criticalCount}</p>
        </Card>
        <Card className="p-3 border-yellow-200">
          <p className="text-xs font-medium text-gray-600">Escalated</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">{escalatedCount}</p>
        </Card>
        <Card className="p-3 border-green-200">
          <p className="text-xs font-medium text-gray-600">Resolved</p>
          <p className="text-xl font-bold text-green-600 mt-1">{resolvedCount}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search conflicts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="ESCALATED">Escalated</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Types</option>
          <option value="TRAINER">Trainer</option>
          <option value="SCHEDULE">Schedule</option>
          <option value="ENROLLMENT">Enrollment</option>
          <option value="RESOURCE">Resource</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
      ) : (
        <div className="space-y-3">
          {filteredConflicts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No conflicts found matching your filters.</p>
            </Card>
          ) : (
            filteredConflicts.map((conflict) => (
              <Card key={conflict.id} className={`overflow-hidden ${getSeverityBg(conflict.severity)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">{getTypeIcon(conflict.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{conflict.title}</span>
                          <Badge variant={getSeverityColor(conflict.severity)} className="text-xs">{conflict.severity}</Badge>
                          <Badge variant={getStatusColor(conflict.status)} className="text-xs">{conflict.status}</Badge>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{conflict.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{conflict.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {conflict.affectedItems.map((item, i) => (
                            <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">{item}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Detected: {new Date(conflict.detectedAt).toLocaleString()}</span>
                          {conflict.resolvedAt && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />Resolved: {new Date(conflict.resolvedAt).toLocaleString()}
                              {conflict.resolvedBy && ` by ${conflict.resolvedBy}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {(conflict.status === 'OPEN' || conflict.status === 'ESCALATED') && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleResolve(conflict.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />Resolve
                        </Button>
                        {conflict.status === 'OPEN' && (
                          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300" onClick={() => handleEscalate(conflict.id)}>
                            <AlertTriangle className="h-4 w-4 mr-1" />Escalate
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleDismiss(conflict.id)}>
                          <XCircle className="h-4 w-4 mr-1" />Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
