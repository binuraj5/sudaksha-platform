'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Download, Upload, Tag, Briefcase, Layers, Star, Globe, BookOpen } from 'lucide-react';

type TabKey = 'categories' | 'industries' | 'levels' | 'skills' | 'domains' | 'courseTypes';

interface MasterItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  count?: number;
  createdAt: string;
}

const MOCK_DATA: Record<TabKey, MasterItem[]> = {
  categories: [
    { id: '1', name: 'Technology', slug: 'technology', description: 'Software, hardware, and IT courses', icon: '💻', color: '#6366f1', isActive: true, sortOrder: 1, count: 24, createdAt: '2026-01-01' },
    { id: '2', name: 'Business', slug: 'business', description: 'Management, finance, and entrepreneurship', icon: '📊', color: '#10b981', isActive: true, sortOrder: 2, count: 18, createdAt: '2026-01-01' },
    { id: '3', name: 'Design', slug: 'design', description: 'UI/UX, graphic design, and creative arts', icon: '🎨', color: '#f59e0b', isActive: true, sortOrder: 3, count: 12, createdAt: '2026-01-01' },
    { id: '4', name: 'Data Science', slug: 'data-science', description: 'Analytics, ML, and AI courses', icon: '📈', color: '#8b5cf6', isActive: true, sortOrder: 4, count: 15, createdAt: '2026-01-01' },
    { id: '5', name: 'Marketing', slug: 'marketing', description: 'Digital marketing, SEO, and content', icon: '📢', color: '#ef4444', isActive: false, sortOrder: 5, count: 8, createdAt: '2026-01-05' },
  ],
  industries: [
    { id: '1', name: 'Information Technology', slug: 'it', isActive: true, sortOrder: 1, count: 45, createdAt: '2026-01-01' },
    { id: '2', name: 'Healthcare', slug: 'healthcare', isActive: true, sortOrder: 2, count: 12, createdAt: '2026-01-01' },
    { id: '3', name: 'Finance & Banking', slug: 'finance', isActive: true, sortOrder: 3, count: 18, createdAt: '2026-01-01' },
    { id: '4', name: 'Manufacturing', slug: 'manufacturing', isActive: true, sortOrder: 4, count: 8, createdAt: '2026-01-01' },
    { id: '5', name: 'E-Commerce', slug: 'ecommerce', isActive: true, sortOrder: 5, count: 22, createdAt: '2026-01-01' },
  ],
  levels: [
    { id: '1', name: 'Beginner', slug: 'beginner', description: 'No prior experience needed', icon: '🌱', isActive: true, sortOrder: 1, count: 35, createdAt: '2026-01-01' },
    { id: '2', name: 'Intermediate', slug: 'intermediate', description: 'Some prior knowledge required', icon: '📚', isActive: true, sortOrder: 2, count: 42, createdAt: '2026-01-01' },
    { id: '3', name: 'Advanced', slug: 'advanced', description: 'Expert-level content', icon: '🚀', isActive: true, sortOrder: 3, count: 18, createdAt: '2026-01-01' },
    { id: '4', name: 'Expert', slug: 'expert', description: 'Professional and certification-level', icon: '🏆', isActive: true, sortOrder: 4, count: 9, createdAt: '2026-01-01' },
  ],
  skills: [
    { id: '1', name: 'Python', slug: 'python', isActive: true, sortOrder: 1, count: 12, createdAt: '2026-01-01' },
    { id: '2', name: 'React', slug: 'react', isActive: true, sortOrder: 2, count: 8, createdAt: '2026-01-01' },
    { id: '3', name: 'Machine Learning', slug: 'ml', isActive: true, sortOrder: 3, count: 6, createdAt: '2026-01-01' },
    { id: '4', name: 'AWS', slug: 'aws', isActive: true, sortOrder: 4, count: 10, createdAt: '2026-01-01' },
    { id: '5', name: 'SQL', slug: 'sql', isActive: true, sortOrder: 5, count: 9, createdAt: '2026-01-01' },
    { id: '6', name: 'Docker', slug: 'docker', isActive: false, sortOrder: 6, count: 4, createdAt: '2026-01-05' },
  ],
  domains: [
    { id: '1', name: 'Web Development', slug: 'web-dev', isActive: true, sortOrder: 1, count: 28, createdAt: '2026-01-01' },
    { id: '2', name: 'Mobile Development', slug: 'mobile-dev', isActive: true, sortOrder: 2, count: 14, createdAt: '2026-01-01' },
    { id: '3', name: 'Cloud Computing', slug: 'cloud', isActive: true, sortOrder: 3, count: 18, createdAt: '2026-01-01' },
    { id: '4', name: 'Cybersecurity', slug: 'cybersecurity', isActive: true, sortOrder: 4, count: 9, createdAt: '2026-01-01' },
    { id: '5', name: 'DevOps', slug: 'devops', isActive: true, sortOrder: 5, count: 11, createdAt: '2026-01-01' },
  ],
  courseTypes: [
    { id: '1', name: 'Self-Paced', slug: 'self-paced', description: 'Learn at your own pace with recorded content', isActive: true, sortOrder: 1, count: 48, createdAt: '2026-01-01' },
    { id: '2', name: 'Live Online', slug: 'live-online', description: 'Real-time instructor-led sessions', isActive: true, sortOrder: 2, count: 24, createdAt: '2026-01-01' },
    { id: '3', name: 'Hybrid', slug: 'hybrid', description: 'Mix of self-paced and live sessions', isActive: true, sortOrder: 3, count: 16, createdAt: '2026-01-01' },
    { id: '4', name: 'Bootcamp', slug: 'bootcamp', description: 'Intensive full-time programs', isActive: true, sortOrder: 4, count: 6, createdAt: '2026-01-01' },
  ],
};

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'industries', label: 'Industries', icon: Briefcase },
  { key: 'levels', label: 'Levels', icon: Layers },
  { key: 'skills', label: 'Skills', icon: Star },
  { key: 'domains', label: 'Domains', icon: Globe },
  { key: 'courseTypes', label: 'Course Types', icon: BookOpen },
];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [data, setData] = useState<Record<TabKey, MasterItem[]>>(MOCK_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/master-data');
        const result = await response.json();
        if (result.data) setData(result.data);
        else setData(MOCK_DATA);
      } catch {
        setData(MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentItems = data[activeTab].filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      setData(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(i => i.id !== id) }));
    }
  };

  const handleToggleActive = (id: string) => {
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(i => i.id === id ? { ...i, isActive: !i.isActive } : i),
    }));
  };

  const handleSave = (formData: Partial<MasterItem>) => {
    if (editingItem) {
      setData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(i => i.id === editingItem.id ? { ...i, ...formData } : i),
      }));
    } else {
      const newItem: MasterItem = {
        id: Date.now().toString(),
        name: formData.name || '',
        slug: (formData.name || '').toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || '',
        icon: formData.icon || '',
        color: formData.color || '#6366f1',
        isActive: true,
        sortOrder: data[activeTab].length + 1,
        count: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setData(prev => ({ ...prev, [activeTab]: [...prev[activeTab], newItem] }));
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleExportCSV = () => {
    const items = data[activeTab];
    const headers = ['ID', 'Name', 'Slug', 'Description', 'Active', 'Sort Order', 'Count'];
    const rows = items.map(i => [i.id, i.name, i.slug || '', `"${i.description || ''}"`, i.isActive, i.sortOrder, i.count || 0]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-data-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{editingItem ? 'Edit Item' : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}</h1>
          <Button variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>Back</Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <MasterDataForm
              item={editingItem}
              tab={activeTab}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingItem(null); }}
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
          <h1 className="text-2xl font-bold">Master Data</h1>
          <p className="text-gray-600 mt-1">Manage reference data used across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Import</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />Add New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
          <Card key={key} className={`p-3 cursor-pointer transition-colors ${activeTab === key ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`} onClick={() => { setActiveTab(key); setSearchTerm(''); }}>
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${activeTab === key ? 'text-indigo-600' : 'text-gray-500'}`} />
              <div>
                <p className={`text-xs font-medium ${activeTab === key ? 'text-indigo-700' : 'text-gray-700'}`}>{label}</p>
                <p className={`text-lg font-bold ${activeTab === key ? 'text-indigo-600' : 'text-gray-600'}`}>{data[key].length}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {TAB_CONFIG.find(t => t.key === activeTab)?.label}
            <Badge variant="secondary">{currentItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {activeTab === 'categories' && <th className="text-left p-2">Icon</th>}
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Slug</th>
                    {(activeTab === 'categories' || activeTab === 'levels' || activeTab === 'courseTypes') && <th className="text-left p-2">Description</th>}
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Order</th>
                    <th className="text-left p-2">Usage</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      {activeTab === 'categories' && (
                        <td className="p-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: item.color ? `${item.color}20` : '#f3f4f6' }}>
                            {item.icon || '📁'}
                          </div>
                        </td>
                      )}
                      <td className="p-2">
                        <div className="font-medium text-sm">{item.name}</div>
                      </td>
                      <td className="p-2">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{item.slug || '—'}</code>
                      </td>
                      {(activeTab === 'categories' || activeTab === 'levels' || activeTab === 'courseTypes') && (
                        <td className="p-2"><p className="text-xs text-gray-500 max-w-xs truncate">{item.description || '—'}</p></td>
                      )}
                      <td className="p-2">
                        <button onClick={() => handleToggleActive(item.id)}>
                          <Badge variant={item.isActive ? 'default' : 'secondary'} className="text-xs cursor-pointer">
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </td>
                      <td className="p-2"><span className="text-sm text-gray-600">{item.sortOrder}</span></td>
                      <td className="p-2">
                        <span className="text-sm font-medium">{item.count || 0}</span>
                        <span className="text-xs text-gray-500 ml-1">courses</span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingItem(item); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
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

function MasterDataForm({ item, tab, onSave, onCancel }: { item: MasterItem | null; tab: TabKey; onSave: (data: Partial<MasterItem>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    icon: item?.icon || '',
    color: item?.color || '#6366f1',
    sortOrder: item?.sortOrder || 1,
  });

  const showIcon = tab === 'categories' || tab === 'levels';
  const showColor = tab === 'categories';
  const showDescription = tab === 'categories' || tab === 'levels' || tab === 'courseTypes';

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
          <input type="number" value={formData.sortOrder} onChange={(e) => setFormData(p => ({ ...p, sortOrder: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="1" />
        </div>
        {showIcon && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon (emoji)</label>
            <input type="text" value={formData.icon} onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. 💻" />
          </div>
        )}
        {showColor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              <input type="color" value={formData.color} onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))} className="h-10 w-16 rounded border border-gray-300 cursor-pointer" />
              <input type="text" value={formData.color} onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
            </div>
          </div>
        )}
        {showDescription && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{item ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
