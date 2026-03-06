'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Filter, Users, Mail } from 'lucide-react';

const MOCK_TRAINERS = [
  {
    id: '1', name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@sudaksha.com',
    expertise: ['JavaScript', 'React', 'Node.js', 'AWS', 'DevOps'],
    experience: 15, rating: 4.8, status: 'ACTIVE', courses: 8, totalStudents: 245,
    bio: 'Expert in software development and cloud technologies with 15+ years of industry experience.',
  },
  {
    id: '2', name: 'Priya Sharma', email: 'priya.sharma@sudaksha.com',
    expertise: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow'],
    experience: 12, rating: 4.9, status: 'ACTIVE', courses: 6, totalStudents: 189,
    bio: 'Data science and machine learning specialist with expertise in Python and AI.',
  },
  {
    id: '3', name: 'Amit Patel', email: 'amit.patel@sudaksha.com',
    expertise: ['Cybersecurity', 'Ethical Hacking', 'Network Security'],
    experience: 10, rating: 4.7, status: 'ACTIVE', courses: 5, totalStudents: 156,
    bio: 'Cybersecurity expert and ethical hacker with enterprise security experience.',
  },
];

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setTrainers(MOCK_TRAINERS);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.expertise.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteTrainer = (id: string) => {
    if (confirm('Delete this trainer?')) setTrainers(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = (data: any) => {
    if (editingTrainer) {
      setTrainers(prev => prev.map(t => t.id === editingTrainer.id ? { ...t, ...data } : t));
    } else {
      setTrainers(prev => [...prev, { id: Date.now().toString(), ...data, courses: 0, totalStudents: 0 }]);
    }
    setShowAddForm(false);
    setEditingTrainer(null);
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
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />Add New Trainer
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Trainers</p><p className="text-xl font-bold text-indigo-600 mt-1">{trainers.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Active</p><p className="text-xl font-bold text-green-600 mt-1">{trainers.filter(t => t.status === 'ACTIVE').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Avg Rating</p><p className="text-xl font-bold text-yellow-600 mt-1">4.8 ⭐</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Students</p><p className="text-xl font-bold text-blue-600 mt-1">{trainers.reduce((sum, t) => sum + t.totalStudents, 0)}</p></Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search trainers by name, email or skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filters</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Trainers</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading trainers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Trainer</th>
                    <th className="text-left p-2">Expertise</th>
                    <th className="text-left p-2">Experience</th>
                    <th className="text-left p-2">Rating</th>
                    <th className="text-left p-2">Courses</th>
                    <th className="text-left p-2">Students</th>
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
                          {trainer.expertise.slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {trainer.expertise.length > 3 && <Badge variant="outline" className="text-xs">+{trainer.expertise.length - 3}</Badge>}
                        </div>
                      </td>
                      <td className="p-2 text-sm">{trainer.experience} years</td>
                      <td className="p-2"><span className="text-sm">⭐ {trainer.rating}</span></td>
                      <td className="p-2 text-sm">{trainer.courses}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 text-sm"><Users className="h-4 w-4 text-gray-400" />{trainer.totalStudents}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant={trainer.status === 'ACTIVE' ? 'default' : 'secondary'}>{trainer.status}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingTrainer(trainer); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTrainer(trainer.id)}><Trash2 className="h-4 w-4" /></Button>
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
