'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, CheckCircle, Globe, AlertCircle, Save, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  type: 'INFO' | 'PROMOTIONAL' | 'URGENT' | 'SUCCESS';
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
}

const defaultFormData: Omit<Announcement, 'id' | 'createdAt'> = {
  message: 'New Full Stack Developer batch starting next Monday!',
  ctaLabel: 'Enroll Now',
  ctaUrl: '/courses',
  type: 'PROMOTIONAL',
  isActive: false,
  startsAt: new Date().toISOString().substring(0, 16),
  expiresAt: null,
};

function AnnouncementPreview({ data }: { data: Partial<Announcement> }) {
  const getStyle = () => {
    switch (data.type) {
      case 'URGENT': return 'bg-red-600 text-white';
      case 'SUCCESS': return 'bg-green-600 text-white';
      case 'PROMOTIONAL': return 'bg-indigo-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className={`w-full py-2.5 px-4 flex items-center justify-center text-sm font-medium ${getStyle()} rounded-md`}>
      <Megaphone className="w-4 h-4 mr-2 hidden sm:block" />
      <span className="truncate">{data.message || 'Announcement message goes here...'}</span>
      {data.ctaLabel && (
        <span className="ml-3 underline font-bold whitespace-nowrap cursor-pointer hover:text-white/80">
          {data.ctaLabel} &rarr;
        </span>
      )}
    </div>
  );
}

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>(defaultFormData);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (activateNow: boolean) => {
    try {
      if (!formData.message?.trim()) {
        toast.error('Message is required');
        return;
      }

      const payload = { 
        ...formData, 
        isActive: activateNow,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : new Date().toISOString(),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      };
      
      const url = editingId ? `/api/admin/homepage/announcements/${editingId}` : '/api/admin/homepage/announcements';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(activateNow ? 'Announcement activated!' : 'Draft saved');
        setEditingId(null);
        setFormData(defaultFormData);
        fetchAnnouncements();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/homepage/announcements/${id}/activate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Announcement set to live');
        fetchAnnouncements();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleDelete = async (id: string, currentlyActive: boolean) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const res = await fetch(`/api/admin/homepage/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        if (editingId === id) {
          setEditingId(null);
          setFormData(defaultFormData);
        }
        fetchAnnouncements();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({
      ...a,
      startsAt: new Date(a.startsAt).toISOString().substring(0, 16),
      expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().substring(0, 16) : null
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Announcements</h1>
          <p className="text-gray-500">Manage the top banner strip for urgent or promotional messages</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData(defaultFormData); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Saved Announcements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[700px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : announcements.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No announcements created yet.</div>
                ) : (
                  announcements.map(a => {
                    const isExpired = a.expiresAt && new Date(a.expiresAt) < new Date();
                    return (
                      <div key={a.id} className={`p-4 transition-colors hover:bg-slate-50 ${editingId === a.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 truncate pr-4">
                            {a.message.substring(0, 40)}{a.message.length > 40 ? '...' : ''}
                          </h3>
                          {a.isActive ? (
                            <Badge className="bg-green-100 text-green-700 shadow-none"><Globe className="w-3 h-3 mr-1"/> Live</Badge>
                          ) : isExpired ? (
                            <Badge variant="outline" className="text-gray-500">Expired</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">Draft</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-3 flex gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">{a.type}</Badge>
                          <span>Created {new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          {!a.isActive && !isExpired && (
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleActivate(a.id)}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Activate
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto" onClick={() => handleDelete(a.id, a.isActive)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Form + Preview */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4 border-b">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</span>
                {formData.isActive && <Badge className="bg-green-100 text-green-700">Currently Live</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Announcement Message *</label>
                  <Input 
                    value={formData.message || ''} 
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="E.g. We just launched our newest AI program!"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-gray-700">CTA Label (Optional)</label>
                    <Input 
                      value={formData.ctaLabel || ''} 
                      onChange={e => setFormData({ ...formData, ctaLabel: e.target.value })}
                      placeholder="E.g. Read More"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-gray-700">CTA URL (Optional)</label>
                    <Input 
                      value={formData.ctaUrl || ''} 
                      onChange={e => setFormData({ ...formData, ctaUrl: e.target.value })}
                      placeholder="/blog/latest-news"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-gray-700">Theme/Type</label>
                    <select 
                      className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={formData.type || 'INFO'}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="INFO">Info (Blue)</option>
                      <option value="PROMOTIONAL">Promo (Indigo)</option>
                      <option value="SUCCESS">Success (Green)</option>
                      <option value="URGENT">Urgent (Red)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-gray-700">Starts At</label>
                    <Input 
                      type="datetime-local"
                      value={formData.startsAt || ''} 
                      onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-gray-700">Expires At (Optional)</label>
                    <Input 
                      type="datetime-local"
                      value={formData.expiresAt || ''} 
                      onChange={e => setFormData({ ...formData, expiresAt: e.target.value || null })}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Panel */}
              <div className="pt-6 border-t">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-500" /> Strip Preview
                </h4>
                <div className="bg-gray-100 p-8 rounded-xl border border-dashed border-gray-300">
                  <AnnouncementPreview data={formData} />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => handleSave(false)}>
                  <Save className="w-4 h-4 mr-2" /> Save as Draft
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave(true)}>
                  <Globe className="w-4 h-4 mr-2" /> Publish Now
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
