'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Filter, Calendar, Users, Clock, Video } from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
  slug: string;
  description: string;
  speaker: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  registeredCount: number;
  maxAttendees: number;
  category: string;
  featured: boolean;
  recordingUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const MOCK_WEBINARS: Webinar[] = [
  {
    id: '1', title: 'Introduction to Cloud Computing', slug: 'intro-cloud-computing',
    description: 'Learn the fundamentals of cloud computing and major cloud platforms.',
    speaker: 'Dr. Rajesh Kumar', date: '2026-03-20', time: '15:00', duration: 120,
    timezone: 'IST', status: 'UPCOMING', registeredCount: 156, maxAttendees: 200,
    category: 'Technology', featured: true, createdAt: '2026-01-20', updatedAt: '2026-01-20',
  },
  {
    id: '2', title: 'Career Growth in IT Industry', slug: 'career-growth-it',
    description: 'Strategies for career advancement in the IT sector.',
    speaker: 'Priya Sharma', date: '2026-03-25', time: '18:00', duration: 60,
    timezone: 'IST', status: 'UPCOMING', registeredCount: 234, maxAttendees: 300,
    category: 'Career', featured: false, createdAt: '2026-01-25', updatedAt: '2026-01-25',
  },
];

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const response = await fetch('/api/webinars');
        const data = await response.json();
        setWebinars(data.webinars || MOCK_WEBINARS);
      } catch {
        setWebinars(MOCK_WEBINARS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWebinars();
  }, []);

  const filteredWebinars = webinars.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.speaker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteWebinar = (id: string) => {
    if (confirm('Delete this webinar?')) setWebinars(prev => prev.filter(w => w.id !== id));
  };

  const handleSave = (data: Partial<Webinar>) => {
    if (editingWebinar) {
      setWebinars(prev => prev.map(w => w.id === editingWebinar.id ? { ...w, ...data } : w));
    } else {
      setWebinars(prev => [...prev, { id: Date.now().toString(), ...data } as Webinar]);
    }
    setShowAddForm(false);
    setEditingWebinar(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'default'; case 'LIVE': return 'destructive';
      case 'COMPLETED': return 'secondary'; case 'CANCELLED': return 'outline'; default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UPCOMING': return '📅'; case 'LIVE': return '🔴';
      case 'COMPLETED': return '✅'; case 'CANCELLED': return '❌'; default: return '📅';
    }
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{editingWebinar ? 'Edit Webinar' : 'Schedule New Webinar'}</h1>
          <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingWebinar(null); }}>Back to Webinars</Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <WebinarForm webinar={editingWebinar} onSave={handleSave} onCancel={() => { setShowAddForm(false); setEditingWebinar(null); }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Webinars Management</h1>
          <p className="text-gray-600 mt-1">Schedule and manage online webinars</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />Schedule New Webinar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Webinars</p><p className="text-xl font-bold text-indigo-600 mt-1">{webinars.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Upcoming</p><p className="text-xl font-bold text-blue-600 mt-1">{webinars.filter(w => w.status === 'UPCOMING').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Completed</p><p className="text-xl font-bold text-green-600 mt-1">{webinars.filter(w => w.status === 'COMPLETED').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Registrations</p><p className="text-xl font-bold text-blue-600 mt-1">{webinars.reduce((sum, w) => sum + w.registeredCount, 0)}</p></Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search webinars..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filters</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Webinars</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading webinars...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Speaker</th>
                    <th className="text-left p-2">Date & Time</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Registrations</th>
                    <th className="text-left p-2">Duration</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWebinars.map((webinar) => (
                    <tr key={webinar.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{webinar.title}</div>
                        <div className="text-xs text-gray-500">{webinar.category}</div>
                        {webinar.featured && <Badge variant="outline" className="mt-1 text-xs">Featured</Badge>}
                      </td>
                      <td className="p-2">
                        <div className="text-sm font-medium">{webinar.speaker}</div>
                        <div className="text-xs text-gray-500">{webinar.timezone}</div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-400" />{webinar.date}</div>
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" />{webinar.time}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <span>{getStatusIcon(webinar.status)}</span>
                          <Badge variant={getStatusColor(webinar.status)}>{webinar.status}</Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm">{webinar.registeredCount}/{webinar.maxAttendees}</div>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(webinar.registeredCount / webinar.maxAttendees) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Video className="h-4 w-4 text-gray-400" />{webinar.duration} min
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingWebinar(webinar); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteWebinar(webinar.id)}><Trash2 className="h-4 w-4" /></Button>
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

function WebinarForm({ webinar, onSave, onCancel }: { webinar: Webinar | null; onSave: (data: Partial<Webinar>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: webinar?.title || '', slug: webinar?.slug || '', description: webinar?.description || '',
    speaker: webinar?.speaker || '', date: webinar?.date || '', time: webinar?.time || '',
    duration: webinar?.duration || 60, timezone: webinar?.timezone || 'IST',
    status: webinar?.status || 'UPCOMING', maxAttendees: webinar?.maxAttendees || 100,
    category: webinar?.category || '', featured: webinar?.featured || false,
    recordingUrl: webinar?.recordingUrl || '', imageUrl: webinar?.imageUrl || '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData as any); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Speaker *</label>
          <input type="text" value={formData.speaker} onChange={(e) => setFormData(p => ({ ...p, speaker: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <input type="text" value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="UPCOMING">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
          <input type="time" value={formData.time} onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
          <input type="number" value={formData.duration} onChange={(e) => setFormData(p => ({ ...p, duration: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="15" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
          <input type="number" value={formData.maxAttendees} onChange={(e) => setFormData(p => ({ ...p, maxAttendees: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="1" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{webinar ? 'Update Webinar' : 'Schedule Webinar'}</Button>
      </div>
    </form>
  );
}
