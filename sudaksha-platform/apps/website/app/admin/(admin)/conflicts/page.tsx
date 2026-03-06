'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, CheckCircle, XCircle, Clock, User, Calendar, BookOpen, Filter } from 'lucide-react';

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

const MOCK_CONFLICTS: Conflict[] = [
  {
    id: '1', type: 'TRAINER', severity: 'HIGH', status: 'OPEN',
    title: 'Trainer Double-Booked',
    description: 'Dr. Rajesh Kumar is scheduled for two sessions simultaneously on March 20, 2026.',
    affectedItems: ['Cloud Computing Batch A', 'DevOps Fundamentals Batch B'],
    detectedAt: '2026-03-05T10:30:00', courseId: 'c1', courseName: 'Cloud Computing',
    batchId: 'b1', batchName: 'Batch A',
  },
  {
    id: '2', type: 'SCHEDULE', severity: 'MEDIUM', status: 'OPEN',
    title: 'Overlapping Batch Schedules',
    description: 'Two batches have overlapping time slots in the same virtual classroom.',
    affectedItems: ['Python Basics - Batch C', 'Data Science - Batch D'],
    detectedAt: '2026-03-05T11:00:00', batchId: 'b2', batchName: 'Batch C',
  },
  {
    id: '3', type: 'ENROLLMENT', severity: 'LOW', status: 'OPEN',
    title: 'Over-enrollment Detected',
    description: 'React Masterclass batch has exceeded max capacity by 5 students.',
    affectedItems: ['React Masterclass - Batch E'],
    detectedAt: '2026-03-04T14:20:00', courseName: 'React Masterclass',
  },
  {
    id: '4', type: 'RESOURCE', severity: 'CRITICAL', status: 'ESCALATED',
    title: 'Missing Course Materials',
    description: 'AWS Certification course is missing 3 required modules before batch start date.',
    affectedItems: ['AWS Certification - Batch F'],
    detectedAt: '2026-03-03T09:15:00', courseName: 'AWS Certification',
  },
  {
    id: '5', type: 'SCHEDULE', severity: 'LOW', status: 'RESOLVED',
    title: 'Holiday Schedule Conflict',
    description: 'Session scheduled on a national holiday. Batch rescheduled successfully.',
    affectedItems: ['Java Enterprise - Batch G'],
    detectedAt: '2026-03-01T08:00:00', resolvedAt: '2026-03-02T10:00:00', resolvedBy: 'Admin',
  },
];

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const response = await fetch('/api/admin/conflicts');
        const data = await response.json();
        setConflicts(data.conflicts || MOCK_CONFLICTS);
      } catch {
        setConflicts(MOCK_CONFLICTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConflicts();
  }, []);

  const filteredConflicts = conflicts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const handleResolve = (id: string) => {
    setConflicts(prev => prev.map(c => c.id === id
      ? { ...c, status: 'RESOLVED', resolvedAt: new Date().toISOString(), resolvedBy: 'Admin' }
      : c
    ));
    if (selectedConflict?.id === id) setSelectedConflict(null);
  };

  const handleDismiss = (id: string) => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, status: 'DISMISSED' } : c));
    if (selectedConflict?.id === id) setSelectedConflict(null);
  };

  const handleEscalate = (id: string) => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, status: 'ESCALATED' } : c));
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
        <Button variant="outline" onClick={() => setConflicts([...MOCK_CONFLICTS])}>
          Refresh
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
        <div className="text-center py-8 text-gray-500">Loading conflicts...</div>
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
