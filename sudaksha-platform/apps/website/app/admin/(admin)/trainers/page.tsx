'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Mail, Loader2, Upload, Download, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const CSV_HEADERS = 'name,email,expertise,experience,bio,status,currentDesignation,currentCompany,linkedinUrl';
const CSV_EXAMPLE = 'John Doe,john@example.com,"JavaScript,React",5,Senior trainer,ACTIVE,Senior Trainer,Acme Corp,https://linkedin.com/in/johndoe';

function downloadTemplate() {
  const content = [CSV_HEADERS, CSV_EXAMPLE].join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trainers_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { values.push(cur); cur = ''; }
      else { cur += ch; }
    }
    values.push(cur);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim(); });
    return row;
  });
}

interface BulkResult { created: number; skipped: number; errors: { row: number; email: string; error: string }[] }

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadTrainers(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length === 0) { toast.error('No valid rows found in CSV'); return; }
    if (rows.length > 500) { toast.error('Maximum 500 rows per upload'); return; }
    setIsUploading(true);
    setBulkResult(null);
    try {
      const res = await fetch('/api/admin/trainers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainers: rows }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Upload failed');
      setBulkResult({ created: data.created, skipped: data.skipped, errors: data.errors ?? [] });
      if (data.created > 0) { toast.success(`${data.created} trainer(s) added`); await loadTrainers(); }
      else { toast.info('No new trainers added'); }
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const loadTrainers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/trainers');
      const data = await res.json();
      setTrainers(data.trainers || []);
    } catch {
      toast.error('Failed to load trainers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrainers = trainers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.expertise || []).some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteTrainer = async (id: string) => {
    if (!confirm('Delete this trainer? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/trainers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Trainer deleted');
      await loadTrainers();
    } catch {
      toast.error('Failed to delete trainer');
    }
  };

  const handleSave = async (data: any) => {
    try {
      const url = editingTrainer ? `/api/admin/trainers/${editingTrainer.id}` : '/api/admin/trainers';
      const method = editingTrainer ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(editingTrainer ? 'Trainer updated' : 'Trainer added');
      setShowAddForm(false);
      setEditingTrainer(null);
      await loadTrainers();
    } catch {
      toast.error('Failed to save trainer');
    }
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h1>
          <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingTrainer(null); }}>Back to Trainers</Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <TrainerForm trainer={editingTrainer} onSave={handleSave} onCancel={() => { setShowAddForm(false); setEditingTrainer(null); }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Trainers Management</h1>
          <p className="text-gray-600 mt-1">Manage trainer profiles and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Bulk Upload
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />Add New Trainer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Trainers</p><p className="text-xl font-bold text-indigo-600 mt-1">{trainers.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Active</p><p className="text-xl font-bold text-green-600 mt-1">{trainers.filter(t => t.status === 'ACTIVE').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Inactive</p><p className="text-xl font-bold text-gray-600 mt-1">{trainers.filter(t => t.status !== 'ACTIVE').length}</p></Card>
      </div>

      {bulkResult && (
        <Card className="border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">Bulk Upload Results</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-700"><CheckCircle className="h-4 w-4" /><strong>{bulkResult.created}</strong> created</span>
                  <span className="flex items-center gap-1 text-gray-500"><strong>{bulkResult.skipped}</strong> skipped (duplicates)</span>
                  {bulkResult.errors.length > 0 && <span className="flex items-center gap-1 text-red-600"><AlertTriangle className="h-4 w-4" /><strong>{bulkResult.errors.length}</strong> errors</span>}
                </div>
                {bulkResult.errors.length > 0 && (
                  <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                    {bulkResult.errors.map((e, i) => (
                      <div key={i} className="text-xs bg-red-50 border border-red-200 rounded px-3 py-1 text-red-700">
                        Row {e.row} ({e.email || 'no email'}): {e.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setBulkResult(null)} className="text-gray-400 hover:text-gray-600 ml-4"><X className="h-4 w-4" /></button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input placeholder="Search trainers by name, email or skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader><CardTitle>All Trainers</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Trainer</th>
                    <th className="text-left p-2">Expertise</th>
                    <th className="text-left p-2">Experience</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainers.map((trainer) => (
                    <tr key={trainer.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{trainer.name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500"><Mail className="h-3 w-3" />{trainer.email}</div>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {(trainer.expertise || []).slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {(trainer.expertise || []).length > 3 && <Badge variant="outline" className="text-xs">+{(trainer.expertise || []).length - 3}</Badge>}
                        </div>
                      </td>
                      <td className="p-2 text-sm">{trainer.experience ?? 0} years</td>
                      <td className="p-2">
                        <Badge variant={trainer.status === 'ACTIVE' ? 'default' : 'secondary'}>{trainer.status}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingTrainer(trainer); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTrainer(trainer.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTrainers.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500 text-sm">No trainers found. <button className="text-indigo-600 hover:underline" onClick={() => setShowAddForm(true)}>Add one?</button></td></tr>
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

function TrainerForm({ trainer, onSave, onCancel }: { trainer: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: trainer?.name || '', email: trainer?.email || '',
    expertise: trainer?.expertise?.join(', ') || '',
    experience: trainer?.experience || 0, status: trainer?.status || 'ACTIVE', bio: trainer?.bio || '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, expertise: formData.expertise.split(',').map((s: string) => s.trim()).filter(Boolean) }); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
          <input type="number" value={formData.experience} onChange={(e) => setFormData(p => ({ ...p, experience: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Expertise (comma separated)</label>
        <input type="text" value={formData.expertise} onChange={(e) => setFormData(p => ({ ...p, expertise: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="JavaScript, React, Node.js" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{trainer ? 'Update Trainer' : 'Add Trainer'}</Button>
      </div>
    </form>
  );
}
