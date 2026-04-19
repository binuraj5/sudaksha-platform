'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  jobType: string;
  salary: string | null;
  requirements: any;
  postedAt: string;
  expiresAt: string | null;
  status: string;
  featured: boolean;
}

export default function JobPostingsAdmin() {
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salary: '',
    requirements: '',
    expiresAt: '',
    status: 'ACTIVE',
    featured: false,
  });

  useEffect(() => {
    fetchPostings();
  }, []);

  const fetchPostings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/job-postings');
      const data = await res.json();
      if (data.success) {
        setPostings(data.postings || []);
      }
    } catch (e) {
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      toast.error('Title, company, and description are required');
      return;
    }

    try {
      const url = editingId ? `/api/admin/job-postings/${editingId}` : '/api/admin/job-postings';
      const method = editingId ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        requirements: formData.requirements ? formData.requirements.split(',').map((s: string) => s.trim()) : [],
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Posting updated' : 'Posting created');
        resetForm();
        fetchPostings();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;

    try {
      const res = await fetch(`/api/admin/job-postings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchPostings();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/job-postings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (res.ok) {
        toast.success('Updated');
        fetchPostings();
      }
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      company: '',
      description: '',
      location: '',
      jobType: 'Full-time',
      salary: '',
      requirements: '',
      expiresAt: '',
      status: 'ACTIVE',
      featured: false,
    });
  };

  const startEdit = (posting: JobPosting) => {
    setEditingId(posting.id);
    setFormData({
      title: posting.title,
      company: posting.company,
      description: posting.description,
      location: posting.location,
      jobType: posting.jobType,
      salary: posting.salary || '',
      requirements: Array.isArray(posting.requirements) ? posting.requirements.join(', ') : '',
      expiresAt: posting.expiresAt ? new Date(posting.expiresAt).toISOString().split('T')[0] : '',
      status: posting.status,
      featured: posting.featured,
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500">Manage and publish job opportunities</p>
        </div>
        <Button onClick={() => { resetForm(); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Job Posting
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">{editingId ? 'Edit' : 'Create'} Job Posting</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Job Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Developer"
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
                <label className="text-sm font-medium block mb-1.5">Description *</label>
                <textarea
                  className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Job description..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Location *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Bangalore, India"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Job Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Salary Range (Optional)</label>
                <Input
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g., ₹8-12 LPA"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Requirements (comma-separated)</label>
                <Input
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="e.g., React, Node.js, PostgreSQL"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Expires At</label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
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
              <CardTitle className="text-lg">All Job Postings ({postings.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[800px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : postings.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No job postings yet</div>
                ) : (
                  postings.map((posting) => (
                    <div key={posting.id} className={`p-4 hover:bg-gray-50 ${editingId === posting.id ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{posting.title}</h3>
                          <p className="text-sm text-gray-600">{posting.company} • {posting.location}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-2 line-clamp-1">{posting.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{posting.jobType}</Badge>
                        {posting.salary && <Badge variant="outline" className="text-xs">{posting.salary}</Badge>}
                        {isExpired(posting.expiresAt) && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Expired</Badge>
                        )}
                        {posting.featured && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">⭐ Featured</Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(posting)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(posting.id, posting.featured)}
                        >
                          {posting.featured ? (
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 ml-auto"
                          onClick={() => handleDelete(posting.id)}
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
