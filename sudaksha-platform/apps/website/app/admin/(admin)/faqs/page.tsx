'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  featured: boolean;
  status: string;
  createdAt: string;
}

export default function FAQsAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    featured: false,
    status: 'PUBLISHED',
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs || []);
      }
    } catch (e) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    try {
      const url = editingId ? `/api/admin/faqs/${editingId}` : '/api/admin/faqs';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'FAQ updated' : 'FAQ created');
        resetForm();
        fetchFAQs();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchFAQs();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (res.ok) {
        toast.success('Updated');
        fetchFAQs();
      }
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      order: 0,
      featured: false,
      status: 'PUBLISHED',
    });
  };

  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      featured: faq.featured,
      status: faq.status,
    });
  };

  const categories = [...new Set(faqs.map(f => f.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="text-gray-500">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => { resetForm(); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New FAQ
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">{editingId ? 'Edit' : 'Create'} FAQ</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Question *</label>
                <textarea
                  className="w-full h-20 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter question..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Answer *</label>
                <textarea
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter answer..."
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., General, Pricing, Technical"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Display Order</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  placeholder="0"
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
              <CardTitle className="text-lg">All FAQs ({faqs.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[800px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : faqs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No FAQs yet</div>
                ) : (
                  faqs.map((faq) => (
                    <div key={faq.id} className={`p-4 hover:bg-gray-50 ${editingId === faq.id ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{faq.answer}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                        {faq.featured && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">⭐ Featured</Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(faq)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(faq.id, faq.featured)}
                        >
                          {faq.featured ? (
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 ml-auto"
                          onClick={() => handleDelete(faq.id)}
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
