'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  content: string;
  author: string;
  company: string | null;
  role: string | null;
  rating: number;
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'EMAIL_SCREENSHOT';
  mediaUrl: string | null;
  verified: boolean;
  featured: boolean;
  status: string;
  createdAt: string;
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    author: '',
    company: '',
    role: '',
    rating: 5,
    mediaType: 'TEXT' as const,
    mediaUrl: '',
    verified: false,
    featured: false,
    status: 'PUBLISHED',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials || []);
      }
    } catch (e) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.content.trim() || !formData.author.trim()) {
      toast.error('Content and author are required');
      return;
    }

    try {
      const url = editingId ? `/api/admin/testimonials/${editingId}` : '/api/admin/testimonials';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Testimonial updated' : 'Testimonial created');
        resetForm();
        fetchTestimonials();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchTestimonials();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (res.ok) {
        toast.success('Updated');
        fetchTestimonials();
      }
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      content: '',
      author: '',
      company: '',
      role: '',
      rating: 5,
      mediaType: 'TEXT',
      mediaUrl: '',
      verified: false,
      featured: false,
      status: 'PUBLISHED',
    });
  };

  const startEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      content: testimonial.content,
      author: testimonial.author,
      company: testimonial.company || '',
      role: testimonial.role || '',
      rating: testimonial.rating,
      mediaType: testimonial.mediaType,
      mediaUrl: testimonial.mediaUrl || '',
      verified: testimonial.verified,
      featured: testimonial.featured,
      status: testimonial.status,
    });
  };

  const mediaTypeLabels = {
    TEXT: 'Text Only',
    IMAGE: 'Text + Image',
    VIDEO: 'Text + Video',
    EMAIL_SCREENSHOT: 'Text + Email Screenshot',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500">Manage customer testimonials with media support</p>
        </div>
        <Button onClick={() => { resetForm(); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Testimonial
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">{editingId ? 'Edit' : 'Create'} Testimonial</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Content *</label>
                <textarea
                  className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Testimonial text..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Author Name *</label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Acme Corp"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Role/Title</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Senior Developer"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Rating (1-5)</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Media Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                >
                  <option value="TEXT">Text Only</option>
                  <option value="IMAGE">Text + Image</option>
                  <option value="VIDEO">Text + Video</option>
                  <option value="EMAIL_SCREENSHOT">Text + Email Screenshot</option>
                </select>
              </div>

              {formData.mediaType !== 'TEXT' && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    {formData.mediaType === 'VIDEO' ? 'Video URL' : 'Image/Screenshot URL'}
                  </label>
                  <Input
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    placeholder={formData.mediaType === 'VIDEO' ? 'https://youtube.com/...' : 'https://...'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Verified</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                {editingId && (
                  <Button onClick={resetForm} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">All Testimonials ({testimonials.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[800px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : testimonials.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No testimonials yet</div>
                ) : (
                  testimonials.map((t) => (
                    <div key={t.id} className={`p-4 hover:bg-gray-50 ${editingId === t.id ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.author}</h3>
                          <p className="text-sm text-gray-600">
                            {t.company} {t.role ? `• ${t.role}` : ''}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{t.content}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {mediaTypeLabels[t.mediaType as keyof typeof mediaTypeLabels]}
                        </Badge>
                        {t.verified && (
                          <Badge className="bg-green-100 text-green-700 text-xs">✓ Verified</Badge>
                        )}
                        {t.featured && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">⭐ Featured</Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(t)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(t.id, t.featured)}
                        >
                          {t.featured ? (
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 ml-auto"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
