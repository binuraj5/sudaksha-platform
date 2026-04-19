'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface SuccessStory {
  id: string;
  headline: string;
  company: string;
  results: any;
  fullStory: string;
  imageUrl: string | null;
  featured: boolean;
  status: string;
  createdAt: string;
}

export default function SuccessStoriesAdmin() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    headline: '',
    company: '',
    fullStory: '',
    imageUrl: '',
    featured: false,
    status: 'DRAFT',
    results: {},
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/success-stories');
      const data = await res.json();
      if (data.success) {
        setStories(data.stories || []);
      }
    } catch (e) {
      toast.error('Failed to load success stories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.headline.trim() || !formData.company.trim() || !formData.fullStory.trim()) {
      toast.error('Headline, company, and story are required');
      return;
    }

    try {
      const url = editingId ? `/api/admin/success-stories/${editingId}` : '/api/admin/success-stories';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Story updated' : 'Story created');
        resetForm();
        fetchStories();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this story?')) return;

    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchStories();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (res.ok) {
        toast.success('Updated');
        fetchStories();
      }
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      headline: '',
      company: '',
      fullStory: '',
      imageUrl: '',
      featured: false,
      status: 'DRAFT',
      results: {},
    });
  };

  const startEdit = (story: SuccessStory) => {
    setEditingId(story.id);
    setFormData({
      headline: story.headline,
      company: story.company,
      fullStory: story.fullStory,
      imageUrl: story.imageUrl || '',
      featured: story.featured,
      status: story.status,
      results: story.results,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Success Stories</h1>
          <p className="text-gray-500">Manage and showcase success stories</p>
        </div>
        <Button onClick={() => { resetForm(); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Story
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">{editingId ? 'Edit' : 'Create'} Story</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Headline *</label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Success story headline..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Company *</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Full Story *</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  value={formData.fullStory}
                  onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                  placeholder="Write the complete story..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Image URL</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Status</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span className="text-sm font-medium">Featured</span>
              </label>

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
              <CardTitle className="text-lg">All Stories ({stories.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[800px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : stories.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No stories yet</div>
                ) : (
                  stories.map((story) => (
                    <div key={story.id} className={`p-4 hover:bg-gray-50 ${editingId === story.id ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{story.headline}</h3>
                          <p className="text-sm text-gray-600">{story.company}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{story.fullStory}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={story.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
                          {story.status}
                        </Badge>
                        {story.featured && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">⭐ Featured</Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(story)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(story.id, story.featured)}
                        >
                          {story.featured ? (
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 ml-auto"
                          onClick={() => handleDelete(story.id)}
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
