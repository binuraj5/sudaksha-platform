'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, CheckCircle, Globe, AlertCircle, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface HomepageHero {
  id: string;
  isActive: boolean;
  headline: string;
  subHeadline: string | null;
  badgeText: string | null;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
  backgroundType: 'COLOR' | 'IMAGE' | 'GRADIENT';
  backgroundValue: string | null;
  overlayOpacity: number;
  textTheme: 'LIGHT' | 'DARK';
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const defaultFormData: Omit<HomepageHero, 'id' | 'createdAt'> = {
  isActive: false,
  headline: 'Transform Your Career with Industry-Leading Programs',
  subHeadline: 'Outcome-driven training designed for the modern tech workforce.',
  badgeText: 'New Cohort Starting Soon',
  primaryCtaLabel: 'Explore Programs',
  primaryCtaUrl: '/courses',
  secondaryCtaLabel: 'Book Consultation',
  secondaryCtaUrl: '#',
  backgroundType: 'GRADIENT',
  backgroundValue: 'linear-gradient(to right bottom, #1e3a8a, #4f46e5)',
  overlayOpacity: 0.5,
  textTheme: 'DARK',
  publishedAt: null,
  expiresAt: null,
};

function HeroPreview({ data }: { data: Partial<HomepageHero> }) {
  const isLight = data.textTheme === 'LIGHT';
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const subTextColor = isLight ? 'text-gray-700' : 'text-gray-200';
  
  const getBackgroundStyle = () => {
    if (data.backgroundType === 'COLOR') return { backgroundColor: data.backgroundValue || '#ffffff' };
    if (data.backgroundType === 'GRADIENT') return { background: data.backgroundValue || 'linear-gradient(to right, #4f46e5, #ec4899)' };
    return { backgroundColor: '#000' }; // fallback for image loading
  };

  return (
    <div className="relative w-full h-[300px] rounded-xl overflow-hidden border shadow-inner flex items-center justify-center" style={getBackgroundStyle()}>
      {data.backgroundType === 'IMAGE' && data.backgroundValue && (
        <img 
          src={data.backgroundValue} 
          alt="Preview cover" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      )}
      
      {/* Overlay */}
      {data.backgroundType === 'IMAGE' && (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: data.overlayOpacity ?? 0.5 }}
        />
      )}

      {/* Content wrapper scaled down */}
      <div className="absolute inset-0 flex items-center justify-center p-8 transform scale-75 origin-center">
        <div className={`text-center space-y-4 max-w-3xl relative z-10 ${textColor}`}>
          {data.badgeText && (
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${isLight ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
              {data.badgeText}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {data.headline || 'Your Headline Here'}
          </h1>
          
          {data.subHeadline && (
            <p className={`text-lg md:text-xl ${subTextColor}`}>
              {data.subHeadline}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <button className={`px-6 py-2.5 rounded-lg font-semibold ${isLight ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}`}>
              {data.primaryCtaLabel || 'Primary CTA'}
            </button>
            {data.secondaryCtaLabel && (
              <button className={`px-6 py-2.5 rounded-lg font-semibold border-2 ${isLight ? 'border-gray-300 text-gray-700' : 'border-white/50 text-white'}`}>
                {data.secondaryCtaLabel}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Watermark */}
      <div className="absolute bottom-2 right-4 text-white/50 font-black tracking-widest text-4xl opacity-20 pointer-events-none z-20">
        PREVIEW
      </div>
    </div>
  );
}

export default function HomepageHeroAdmin() {
  const [heroes, setHeroes] = useState<HomepageHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HomepageHero>>(defaultFormData);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage/hero');
      const data = await res.json();
      if (data.success) {
        setHeroes(data.heroes);
      }
    } catch (e) {
      toast.error('Failed to load hero configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (activateNow: boolean) => {
    try {
      // Use default value if backgroundValue is empty
      const finalFormData = {
        ...formData,
        backgroundValue: formData.backgroundValue || defaultFormData.backgroundValue,
      };
      const payload = { ...finalFormData, isActive: activateNow };
      const url = editingId ? `/api/admin/homepage/hero/${editingId}` : '/api/admin/homepage/hero';
      const method = editingId ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(activateNow ? 'Hero saved and activated!' : 'Hero draft saved');
        setEditingId(null);
        setFormData(defaultFormData);
        fetchHeroes();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/homepage/hero/${id}/activate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Hero set to live globally');
        fetchHeroes();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Connection error');
    }
  };

  const handleDelete = async (id: string, currentlyActive: boolean) => {
    if (currentlyActive && heroes.length > 1) {
      toast.error('Cannot delete the currently active hero. Activate another one first.');
      return;
    }
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    
    try {
      const res = await fetch(`/api/admin/homepage/hero/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        if (editingId === id) {
          setEditingId(null);
          setFormData(defaultFormData);
        }
        fetchHeroes();
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (h: HomepageHero) => {
    setEditingId(h.id);
    setFormData(h);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Hero Management</h1>
          <p className="text-gray-500">Design, preview, and switch your main landing page banner</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData(defaultFormData); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Setup
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: List */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg">Saved Configurations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[700px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : heroes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No heroes created yet.</div>
                ) : (
                  heroes.map(h => {
                    const isExpired = h.expiresAt && new Date(h.expiresAt) < new Date();
                    return (
                      <div key={h.id} className={`p-4 transition-colors hover:bg-slate-50 ${editingId === h.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 truncate pr-4" title={h.headline}>
                            {h.headline.substring(0, 40)}{h.headline.length > 40 ? '...' : ''}
                          </h3>
                          {h.isActive ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none"><Globe className="w-3 h-3 mr-1"/> Live</Badge>
                          ) : isExpired ? (
                            <Badge variant="outline" className="text-gray-500">Expired</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">Draft</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">Created: {new Date(h.createdAt).toLocaleDateString()}</div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(h)}>
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          {!h.isActive && (
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleActivate(h.id)}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Activate
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto" onClick={() => handleDelete(h.id, h.isActive)}>
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
                <span>{editingId ? 'Edit Configuration' : 'Create New Configuration'}</span>
                {formData.isActive && <Badge className="bg-green-100 text-green-700">Currently Live</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Main Headline</label>
                  <Input 
                    value={formData.headline || ''} 
                    onChange={e => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="E.g. Transform Your Career"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Sub-Headline</label>
                  <textarea 
                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.subHeadline || ''} 
                    onChange={e => setFormData({ ...formData, subHeadline: e.target.value })}
                    placeholder="Add a convincing sub-heading..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Top Badge Text</label>
                  <Input 
                    value={formData.badgeText || ''} 
                    onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="E.g. New Batch Enrolling"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Typeface Theme</label>
                  <select 
                    className="w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.textTheme || 'DARK'}
                    onChange={e => setFormData({ ...formData, textTheme: e.target.value as any })}
                  >
                    <option value="DARK">Dark UI (White Text)</option>
                    <option value="LIGHT">Light UI (Dark Text)</option>
                  </select>
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Call to Actions</h4>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Primary Button Label</label>
                  <Input value={formData.primaryCtaLabel || ''} onChange={e => setFormData({ ...formData, primaryCtaLabel: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Primary URL</label>
                  <Input value={formData.primaryCtaUrl || ''} onChange={e => setFormData({ ...formData, primaryCtaUrl: e.target.value })} />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Secondary Button Label (Optional)</label>
                  <Input value={formData.secondaryCtaLabel || ''} onChange={e => setFormData({ ...formData, secondaryCtaLabel: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Secondary URL</label>
                  <Input value={formData.secondaryCtaUrl || ''} onChange={e => setFormData({ ...formData, secondaryCtaUrl: e.target.value })} />
                </div>

                <div className="col-span-2 border-t pt-4 mt-2">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Background Styling</h4>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Background Type</label>
                  <select 
                    className="w-full flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.backgroundType || 'GRADIENT'}
                    onChange={e => setFormData({ ...formData, backgroundType: e.target.value as any })}
                  >
                    <option value="COLOR">Solid Color</option>
                    <option value="GRADIENT">Gradient CSS</option>
                    <option value="IMAGE">Image URL</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block text-gray-700">Value (Hex, CSS, or URL)</label>
                  <Input 
                    value={formData.backgroundValue || ''} 
                    onChange={e => setFormData({ ...formData, backgroundValue: e.target.value })} 
                    placeholder={formData.backgroundType === 'IMAGE' ? 'https://...' : (formData.backgroundType === 'COLOR' ? '#ffffff' : 'linear-gradient(...)')}
                  />
                </div>

                {formData.backgroundType === 'IMAGE' && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1.5 block text-gray-700">Overlay Opacity (0.0 to 1.0)</label>
                    <Input 
                      type="number" 
                      min="0" max="1" step="0.1" 
                      value={formData.overlayOpacity ?? 0.5} 
                      onChange={e => setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) })} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Darkens the image so text remains readable.</p>
                  </div>
                )}
              </div>

              {/* Live Preview Panel */}
              <div className="pt-6 border-t">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" /> Live Preview
                </h4>
                <div className="bg-gray-100 p-4 rounded-xl border border-dashed border-gray-300">
                  <HeroPreview data={formData} />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={() => handleSave(false)}>
                  <Save className="w-4 h-4 mr-2" /> Save as Draft
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave(true)}>
                  <Globe className="w-4 h-4 mr-2" /> Save & Publish Live
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
