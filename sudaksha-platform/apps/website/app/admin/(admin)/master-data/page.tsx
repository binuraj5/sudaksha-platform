'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Check, X, Tag, Briefcase, Layers, Building2, Globe, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type TabKey = 'categories' | 'industries' | 'levels' | 'departments' | 'domains' | 'courseTypes';
type ApiType = 'category' | 'industry' | 'level' | 'department' | 'domain' | 'courseType';

interface MasterItem {
  id: string;
  name: string;
  isActive?: boolean;
}

const TAB_TO_API: Record<TabKey, ApiType> = {
  categories: 'category',
  industries: 'industry',
  levels: 'level',
  departments: 'department',
  domains: 'domain',
  courseTypes: 'courseType',
};

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { key: 'categories', label: 'Categories', icon: Tag, hint: 'MasterCategory — used in course creation "Category" dropdown' },
  { key: 'industries', label: 'Industries', icon: Briefcase, hint: 'MasterIndustry — used in course creation "Industry" dropdown & /courses filter' },
  { key: 'levels', label: 'Levels', icon: Layers, hint: 'MasterLevel — used in course creation "Career Level" dropdown & /courses filter' },
  { key: 'departments', label: 'Departments', icon: Building2, hint: 'MasterDepartment — used in organisation department assignments' },
  { key: 'domains', label: 'Domains', icon: Globe, hint: 'MasterDomain — used in course creation "Domain" dropdown (IT/Non-IT/All)' },
  { key: 'courseTypes', label: 'Course Types', icon: BookOpen, hint: 'MasterCourseType — used in course creation "Course Type" dropdown & /courses filter' },
];

const EMPTY_DATA: Record<TabKey, MasterItem[]> = {
  categories: [], industries: [], levels: [], departments: [], domains: [], courseTypes: [],
};

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [data, setData] = useState<Record<TabKey, MasterItem[]>>(EMPTY_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Inline add state
  const [addingName, setAddingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/master-data');
      if (!res.ok) throw new Error('Failed to load');
      const result = await res.json();
      if (result.data) {
        const d = result.data;
        setData({
          categories: d.category ?? [],
          industries: d.industry ?? [],
          levels: d.level ?? [],
          departments: d.department ?? [],
          domains: d.domain ?? [],
          courseTypes: d.courseType ?? [],
        });
      }
    } catch {
      toast.error('Failed to load master data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    const name = addingName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: TAB_TO_API[activeTab], name }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to add item');
        return;
      }
      toast.success(`Added "${name}"`);
      setAddingName('');
      setIsAdding(false);
      await loadData();
    } catch {
      toast.error('Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: MasterItem) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/master-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: TAB_TO_API[activeTab], id: item.id, isActive: item.isActive === false }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to update');
        return;
      }
      toast.success(`"${item.name}" ${item.isActive === false ? 'activated' : 'deactivated'}`);
      await loadData();
    } catch {
      toast.error('Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/master-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: TAB_TO_API[activeTab], id, name }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to update item');
        return;
      }
      toast.success(`Updated to "${name}"`);
      setEditingId(null);
      await loadData();
    } catch {
      toast.error('Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/master-data?type=${TAB_TO_API[activeTab]}&id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to delete item');
        return;
      }
      toast.success(`Deleted "${name}"`);
      await loadData();
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setSaving(false);
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const startEditing = (item: MasterItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setIsAdding(false);
  };

  const cancelEdit = () => { setEditingId(null); setEditingName(''); };
  const cancelAdd = () => { setIsAdding(false); setAddingName(''); };

  const currentItems = data[activeTab].filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Master Data</h1>
          <p className="text-gray-600 mt-1">Reference data used in course creation dropdowns and /courses page filters. Hover a tab to see which DB column it maps to.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={startAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Tab summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {TAB_CONFIG.map(({ key, label, icon: Icon, hint }) => (
          <button
            key={key}
            title={hint}
            type="button"
            className={`p-3 rounded-lg border text-left transition-colors ${activeTab === key ? 'border-indigo-500 bg-indigo-50' : 'bg-white border-slate-200 shadow-sm hover:bg-gray-50'}`}
            onClick={() => { setActiveTab(key); setSearchTerm(''); setEditingId(null); setIsAdding(false); }}
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${activeTab === key ? 'text-indigo-600' : 'text-gray-500'}`} />
              <div>
                <p className={`text-xs font-medium ${activeTab === key ? 'text-indigo-700' : 'text-gray-700'}`}>{label}</p>
                <p className={`text-lg font-bold ${activeTab === key ? 'text-indigo-600' : 'text-gray-600'}`}>{data[key].length}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder={`Search ${TAB_CONFIG.find(t => t.key === activeTab)?.label.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {TAB_CONFIG.find(t => t.key === activeTab)?.label}
              <Badge variant="secondary">{currentItems.length} items</Badge>
            </CardTitle>
            <p className="text-xs text-gray-400 mt-1">{TAB_CONFIG.find(t => t.key === activeTab)?.hint}</p>
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={startAdding}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-right p-2 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Inline add row */}
                  {isAdding && (
                    <tr className="border-b bg-indigo-50">
                      <td className="p-2">
                        <Input
                          ref={addInputRef}
                          value={addingName}
                          onChange={(e) => setAddingName(e.target.value)}
                          placeholder="Enter name..."
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd();
                            if (e.key === 'Escape') cancelAdd();
                          }}
                          disabled={saving}
                        />
                      </td>
                      <td className="p-2">
                        <span className="text-xs text-gray-400">Active</span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" className="h-8 px-2 bg-green-600 hover:bg-green-700" onClick={handleAdd} disabled={saving || !addingName.trim()}>
                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-2" onClick={cancelAdd} disabled={saving}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Data rows */}
                  {currentItems.map((item) => (
                    <tr key={item.id} className={`border-b hover:bg-gray-50 ${item.isActive === false ? 'opacity-50' : ''}`}>
                      <td className="p-2">
                        {editingId === item.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEdit(item.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            disabled={saving}
                          />
                        ) : (
                          <span className="font-medium text-sm">{item.name}</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 justify-end">
                          {editingId === item.id ? (
                            <>
                              <Button size="sm" className="h-8 px-2 bg-green-600 hover:bg-green-700" onClick={() => handleEdit(item.id)} disabled={saving || !editingName.trim()}>
                                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 px-2" onClick={cancelEdit} disabled={saving}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => startEditing(item)} disabled={saving} title="Edit name">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className={`h-8 px-2 ${item.isActive !== false ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                onClick={() => handleToggleActive(item)}
                                disabled={saving}
                                title={item.isActive !== false ? 'Deactivate' : 'Activate'}
                              >
                                {item.isActive !== false ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => handleDelete(item.id, item.name)} disabled={saving} title="Delete">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentItems.length === 0 && !isAdding && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500 text-sm">
                        No {TAB_CONFIG.find(t => t.key === activeTab)?.label.toLowerCase()} found.{' '}
                        <button className="text-indigo-600 hover:underline" onClick={startAdding}>Add one?</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
