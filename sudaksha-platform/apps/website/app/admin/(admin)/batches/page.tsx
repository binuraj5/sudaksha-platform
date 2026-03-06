'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Filter, Calendar, Users, Clock, MapPin } from 'lucide-react';

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
  price?: number;
  course: { id: string; name: string; duration: number };
  trainer: { id: string; name: string; email: string };
}

const MOCK_BATCHES: Batch[] = [
  {
    id: '1', name: 'Full Stack Web Development - Batch 1',
    startDate: '2026-03-15', endDate: '2026-07-15',
    status: 'UPCOMING', maxStudents: 50, currentStudents: 32,
    schedule: 'Mon-Wed-Fri 6:00 PM - 8:00 PM IST', mode: 'ONLINE', price: 45000,
    course: { id: '1', name: 'Full Stack Web Development', duration: 120 },
    trainer: { id: '1', name: 'Dr. Rajesh Kumar', email: 'rajesh@sudaksha.com' },
  },
  {
    id: '2', name: 'Cloud Computing with AWS - Batch 2',
    startDate: '2026-02-10', endDate: '2026-05-10',
    status: 'IN_PROGRESS', maxStudents: 40, currentStudents: 38,
    schedule: 'Tue-Thu 7:00 PM - 9:00 PM IST', mode: 'HYBRID', location: 'Bangalore Office', price: 35000,
    course: { id: '2', name: 'Cloud Computing with AWS', duration: 80 },
    trainer: { id: '2', name: 'Priya Sharma', email: 'priya@sudaksha.com' },
  },
];

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/admin/batches');
      const data = await response.json();
      setBatches(data.success ? data.batches || [] : MOCK_BATCHES);
    } catch {
      setBatches(MOCK_BATCHES);
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
    setBatches(prev => prev.filter(b => b.id !== batchId));
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
              onSave={(data) => {
                if (editingBatch) {
                  setBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...data } : b));
                } else {
                  setBatches(prev => [...prev, { id: Date.now().toString(), ...data } as Batch]);
                }
                setShowAddForm(false);
                setEditingBatch(null);
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
            <div className="text-center py-8 text-gray-500">Loading batches...</div>
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
                    <tr key={batch.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{batch.name}</div>
                        {batch.price && <div className="text-sm text-gray-500">₹{batch.price.toLocaleString()}</div>}
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
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingBatch(batch); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteBatch(batch.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
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

function BatchForm({ batch, onSave, onCancel }: { batch: Batch | null; onSave: (data: Partial<Batch>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: batch?.name || '',
    startDate: batch?.startDate || '',
    endDate: batch?.endDate || '',
    status: batch?.status || 'UPCOMING',
    maxStudents: batch?.maxStudents || 30,
    currentStudents: batch?.currentStudents || 0,
    schedule: batch?.schedule || '',
    mode: batch?.mode || 'ONLINE',
    location: batch?.location || '',
    price: batch?.price || 0,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData as any); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
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
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
          <input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
          <input type="number" value={formData.maxStudents} onChange={(e) => setFormData(p => ({ ...p, maxStudents: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <select value={formData.mode} onChange={(e) => setFormData(p => ({ ...p, mode: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
          <input type="text" value={formData.schedule} onChange={(e) => setFormData(p => ({ ...p, schedule: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. Mon-Wed-Fri 6:00 PM IST" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input type="text" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="For offline/hybrid batches" />
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{batch ? 'Update Batch' : 'Create Batch'}</Button>
      </div>
    </form>
  );
}
