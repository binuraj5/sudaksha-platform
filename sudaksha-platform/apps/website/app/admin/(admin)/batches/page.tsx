'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Filter, Calendar, Users, Clock, MapPin, Loader2, Eye, UserPlus, X, ChevronDown, ChevronUp, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  maxStudents: number;
  currentStudents: number;
  schedule: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  location?: string;
  course: { id: string; name: string; duration: number };
  trainer: { id: string; name: string; email: string };
}

interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  amountPaid: number | null;
  enrollmentDate: string;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [studentsMap, setStudentsMap] = useState<Record<string, Student[]>>({});
  const [loadingStudents, setLoadingStudents] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/batches');
      const data = await response.json();
      setBatches(data.batches || []);
    } catch {
      toast.error('Failed to load batches');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.trainer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      const res = await fetch(`/api/admin/batches/${batchId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Batch deleted');
      await fetchBatches();
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const toggleStudents = async (batchId: string) => {
    if (expandedBatch === batchId) { setExpandedBatch(null); return; }
    setExpandedBatch(batchId);
    if (studentsMap[batchId]) return; // already loaded
    setLoadingStudents(batchId);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/students`);
      const data = await res.json();
      setStudentsMap(prev => ({ ...prev, [batchId]: data.students || [] }));
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(null);
    }
  };

  const handleRemoveStudent = async (batchId: string, enrollmentId: string) => {
    if (!confirm('Remove this student from the batch?')) return;
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/students/${enrollmentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Student removed');
      setStudentsMap(prev => ({ ...prev, [batchId]: (prev[batchId] || []).filter(s => s.id !== enrollmentId) }));
      await fetchBatches();
    } catch {
      toast.error('Failed to remove student');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'default';
      case 'IN_PROGRESS': return 'secondary';
      case 'COMPLETED': return 'outline';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ONLINE': return '🌐';
      case 'OFFLINE': return '🏢';
      case 'HYBRID': return '🔄';
      default: return '📍';
    }
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{editingBatch ? 'Edit Batch' : 'Add New Batch'}</h1>
            <p className="text-gray-600 mt-1">{editingBatch ? 'Update batch information' : 'Create a new batch'}</p>
          </div>
          <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingBatch(null); }}>
            Back to Batches
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <BatchForm
              batch={editingBatch}
              onSave={async (data) => {
                try {
                  const url = editingBatch ? `/api/admin/batches/${editingBatch.id}` : '/api/admin/batches';
                  const method = editingBatch ? 'PUT' : 'POST';
                  const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) throw new Error();
                  toast.success(editingBatch ? 'Batch updated' : 'Batch created');
                  setShowAddForm(false);
                  setEditingBatch(null);
                  await fetchBatches();
                } catch {
                  toast.error('Failed to save batch');
                }
              }}
              onCancel={() => { setShowAddForm(false); setEditingBatch(null); }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Batches Management</h1>
          <p className="text-gray-600 mt-1">Manage course batches and schedules</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Total Batches</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{batches.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Upcoming</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{batches.filter(b => b.status === 'UPCOMING').length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">In Progress</p>
          <p className="text-xl font-bold text-green-600 mt-1">{batches.filter(b => b.status === 'IN_PROGRESS').length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Total Students</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{batches.reduce((sum, b) => sum + b.currentStudents, 0)}</p>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Batches</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Batch Name</th>
                    <th className="text-left p-2">Course</th>
                    <th className="text-left p-2">Trainer</th>
                    <th className="text-left p-2">Schedule</th>
                    <th className="text-left p-2">Mode</th>
                    <th className="text-left p-2">Students</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map((batch) => (
                    <React.Fragment key={batch.id}>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{batch.name}</div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-sm">{batch.course.name}</div>
                          <div className="text-xs text-gray-500">{batch.course.duration}h</div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm font-medium">{batch.trainer.name}</div>
                          <div className="text-xs text-gray-500">{batch.trainer.email}</div>
                        </td>
                        <td className="p-2">
                          <div className="text-xs">
                            <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-400" />{batch.startDate}</div>
                            <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" />{batch.schedule}</div>
                            {batch.location && <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" />{batch.location}</div>}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span>{getModeIcon(batch.mode)}</span>
                            <Badge variant="outline">{batch.mode}</Badge>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm">{batch.currentStudents}/{batch.maxStudents}</div>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(batch.currentStudents / batch.maxStudents) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={getStatusColor(batch.status)}>{batch.status}</Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" title="Manage Students" onClick={() => toggleStudents(batch.id)}>
                              {expandedBatch === batch.id ? <ChevronUp className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingBatch(batch); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteBatch(batch.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                      {expandedBatch === batch.id && (
                        <tr>
                          <td colSpan={8} className="bg-indigo-50 border-b p-0">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-indigo-600" />
                                  Students in {batch.name}
                                  {studentsMap[batch.id] && (
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{studentsMap[batch.id].length}</span>
                                  )}
                                </h4>
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddStudent(showAddStudent === batch.id ? null : batch.id)}>
                                  <UserPlus className="h-4 w-4 mr-1" /> Add Student
                                </Button>
                              </div>

                              {showAddStudent === batch.id && (
                                <AddStudentForm
                                  batchId={batch.id}
                                  onAdded={(student) => {
                                    setStudentsMap(prev => ({ ...prev, [batch.id]: [...(prev[batch.id] || []), student] }));
                                    setShowAddStudent(null);
                                    fetchBatches();
                                  }}
                                  onCancel={() => setShowAddStudent(null)}
                                />
                              )}

                              {loadingStudents === batch.id ? (
                                <div className="flex items-center gap-2 text-gray-500 text-sm py-4 justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin" /> Loading students...
                                </div>
                              ) : !studentsMap[batch.id] || studentsMap[batch.id].length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No students enrolled yet.</p>
                              ) : (
                                <table className="w-full bg-white rounded-lg overflow-hidden text-sm">
                                  <thead>
                                    <tr className="border-b bg-gray-50">
                                      <th className="text-left p-2 text-xs font-medium text-gray-600">Name</th>
                                      <th className="text-left p-2 text-xs font-medium text-gray-600">Email</th>
                                      <th className="text-left p-2 text-xs font-medium text-gray-600">Status</th>
                                      <th className="text-left p-2 text-xs font-medium text-gray-600">Amount Paid</th>
                                      <th className="text-left p-2 text-xs font-medium text-gray-600">Enrolled</th>
                                      <th className="text-right p-2 text-xs font-medium text-gray-600">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {studentsMap[batch.id].map((student) => (
                                      <tr key={student.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{student.name}</td>
                                        <td className="p-2 text-gray-600">{student.email}</td>
                                        <td className="p-2">
                                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            student.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            student.status === 'WAITLIST' ? 'bg-yellow-100 text-yellow-700' :
                                            student.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-600'
                                          }`}>{student.status}</span>
                                        </td>
                                        <td className="p-2 text-gray-600">{student.amountPaid != null ? `₹${student.amountPaid}` : '—'}</td>
                                        <td className="p-2 text-gray-500 text-xs">{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                                        <td className="p-2 text-right">
                                          <Button size="sm" variant="outline" className="h-7 px-2 text-red-600 hover:bg-red-50" onClick={() => handleRemoveStudent(batch.id, student.id)}>
                                            <Trash className="h-3 w-3" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

function BatchForm({ batch, onSave, onCancel }: { batch: Batch | null; onSave: (data: Partial<Batch>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    courseId: (batch as any)?.course?.id || (batch as any)?.courseId || '',
    batchName: batch?.name || '',
    startDate: batch?.startDate || '',
    endDate: batch?.endDate || '',
    status: batch?.status || 'UPCOMING',
    totalSeats: batch?.maxStudents || 30,
    sessionTimings: batch?.schedule || '',
    platform: batch?.mode || 'ONLINE',
    city: (batch as any)?.city || '',
    timezone: 'IST',
  });
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);

  useState(() => {
    fetch('/api/admin/courses?pageSize=200')
      .then(r => r.json())
      .then(d => { if (d.courses) setCourses(d.courses); })
      .catch(() => {});
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData as any); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
          <select value={formData.courseId} onChange={(e) => setFormData(p => ({ ...p, courseId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" required>
            <option value="">Select a course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
          <input type="text" value={formData.batchName} onChange={(e) => setFormData(p => ({ ...p, batchName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Batch 01 - March 2026" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="UPCOMING">Upcoming</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
          <input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
          <input type="number" value={formData.totalSeats} onChange={(e) => setFormData(p => ({ ...p, totalSeats: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <select value={formData.platform} onChange={(e) => setFormData(p => ({ ...p, platform: e.target.value as 'ONLINE' | 'OFFLINE' | 'HYBRID' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timings</label>
          <input type="text" value={formData.sessionTimings} onChange={(e) => setFormData(p => ({ ...p, sessionTimings: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Mon-Wed-Fri 6:00 PM IST" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City (for offline/hybrid)</label>
          <input type="text" value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Mumbai" />
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{batch ? 'Update Batch' : 'Create Batch'}</Button>
      </div>
    </form>
  );
}

function AddStudentForm({ batchId, onAdded, onCancel }: {
  batchId: string;
  onAdded: (student: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', amountPaid: '', status: 'CONFIRMED' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to add student');
        return;
      }
      toast.success(`${form.name} added to batch`);
      onAdded({ id: data.enrollment.id, userId: data.enrollment.userId, name: form.name, email: form.email, status: form.status, amountPaid: form.amountPaid || null, enrollmentDate: new Date().toISOString() });
    } catch {
      toast.error('Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-indigo-200 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" placeholder="Jane Doe" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" placeholder="jane@example.com" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Amount Paid (₹)</label>
        <input type="number" value={form.amountPaid} onChange={e => setForm(p => ({ ...p, amountPaid: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded" placeholder="0" min="0" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white">
          <option value="CONFIRMED">Confirmed</option>
          <option value="WAITLIST">Waitlist</option>
        </select>
      </div>
      <div className="md:col-span-4 flex gap-2 justify-end">
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
          Add Student
        </Button>
      </div>
    </form>
  );
}
