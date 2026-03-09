'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Edit, Mail, Calendar, Loader2, Download, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string; name: string; email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  accountType: 'INDIVIDUAL' | 'CLIENT_USER';
  department?: string; employeeId?: string;
  createdAt: string; lastLogin?: string;
  enrolledCourses?: number; completedCourses?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = (userId: string) => {
    // Users are managed via the SSO system; show a message instead
    toast.info('User deletion is managed via the SSO system');
  };

  const handleSave = (userData: Partial<User>) => {
    // User creation is managed via the SSO system; read-only view
    toast.info('User creation is managed via the SSO system');
    setShowAddForm(false);
    setEditingUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'destructive'; case 'ADMIN': return 'default'; default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'; case 'INACTIVE': return 'secondary'; case 'SUSPENDED': return 'destructive'; default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return '👑'; case 'ADMIN': return '🛡️'; default: return '🎓';
    }
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h1>
          <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingUser(null); }}>Back to Users</Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <UserForm user={editingUser} onSave={handleSave} onCancel={() => { setShowAddForm(false); setEditingUser(null); }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <span className="text-sm text-gray-500">Read-only — users managed via SSO</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Users</p><p className="text-xl font-bold text-indigo-600 mt-1">{users.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Active</p><p className="text-xl font-bold text-green-600 mt-1">{users.filter(u => u.status === 'ACTIVE').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Students</p><p className="text-xl font-bold text-blue-600 mt-1">{users.filter(u => u.role === 'STUDENT').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Admins</p><p className="text-xl font-bold text-purple-600 mt-1">{users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}</p></Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="STUDENT">Student</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Courses</th>
                    <th className="text-left p-2">Registered</th>
                    <th className="text-left p-2">Last Login</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500"><Mail className="h-3 w-3" />{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span>{getRoleIcon(user.role)}</span>
                          <Badge variant={getRoleColor(user.role)} className="text-xs">{user.role.replace('_', ' ')}</Badge>
                        </div>
                      </td>
                      <td className="p-2"><Badge variant={getStatusColor(user.status)} className="text-xs">{user.status}</Badge></td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div>{user.enrolledCourses || 0} enrolled</div>
                          <div className="text-gray-500">{user.completedCourses || 0} completed</div>
                        </div>
                      </td>
                      <td className="p-2"><div className="flex items-center gap-1 text-xs"><Calendar className="h-3 w-3 text-gray-400" />{user.createdAt}</div></td>
                      <td className="p-2"><div className="flex items-center gap-1 text-xs"><Calendar className="h-3 w-3 text-gray-400" />{user.lastLogin || 'Never'}</div></td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingUser(user); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)}><Trash2 className="h-4 w-4" /></Button>
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

function UserForm({ user, onSave, onCancel }: { user: User | null; onSave: (data: Partial<User>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '',
    role: user?.role || 'STUDENT', status: user?.status || 'ACTIVE',
    accountType: user?.accountType || 'INDIVIDUAL',
    department: user?.department || '', employeeId: user?.employeeId || '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData as any); }} className="space-y-6">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
          <select value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" required>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" required>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{user ? 'Update User' : 'Create User'}</Button>
      </div>
    </form>
  );
}
