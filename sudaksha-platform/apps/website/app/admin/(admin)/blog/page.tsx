'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Filter, Calendar, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  author: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  readTime: number;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1', title: '5 Mistakes Freshers Make When Learning to Code',
    slug: '5-mistakes-freshers-coding', excerpt: 'Learn from common pitfalls and accelerate your coding journey.',
    author: 'Dr. Rajesh Kumar', category: 'Career Advice', tags: ['coding', 'career', 'beginners'],
    status: 'PUBLISHED', publishedAt: '2026-02-01', readTime: 5, featured: true,
    viewCount: 1250, createdAt: '2026-01-28', updatedAt: '2026-02-01',
  },
  {
    id: '2', title: 'Full Stack vs Data Science: Which Should You Choose?',
    slug: 'fullstack-vs-datascience', excerpt: 'A comprehensive comparison to help you make the right career choice.',
    author: 'Priya Sharma', category: 'Career Guidance', tags: ['career', 'fullstack', 'datascience'],
    status: 'PUBLISHED', publishedAt: '2026-01-25', readTime: 8, featured: false,
    viewCount: 890, createdAt: '2026-01-20', updatedAt: '2026-01-25',
  },
  {
    id: '3', title: 'How to Get Your First Tech Job Without Experience',
    slug: 'first-tech-job-no-experience', excerpt: 'Practical strategies to land your dream tech job as a beginner.',
    author: 'Amit Patel', category: 'Job Search', tags: ['jobs', 'career', 'interview'],
    status: 'DRAFT', readTime: 6, featured: false,
    viewCount: 0, createdAt: '2026-02-02', updatedAt: '2026-02-02',
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        setPosts(data.blogs || MOCK_POSTS);
      } catch {
        setPosts(MOCK_POSTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(posts.map(p => p.category))];

  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (editingPost) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...postData } : p));
    } else {
      setPosts(prev => [...prev, { id: Date.now().toString(), ...postData } as BlogPost]);
    }
    setShowAddForm(false);
    setEditingPost(null);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  const getStatusColor = (status: string) => status === 'PUBLISHED' ? 'default' : status === 'DRAFT' ? 'secondary' : 'outline';

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
          <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingPost(null); }}>Back to Blog</Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <BlogForm
              post={editingPost}
              onSave={handleSavePost}
              onCancel={() => { setShowAddForm(false); setEditingPost(null); }}
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
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-gray-600 mt-1">Create and manage blog posts</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />Write New Post
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Posts</p><p className="text-xl font-bold text-indigo-600 mt-1">{posts.length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Published</p><p className="text-xl font-bold text-green-600 mt-1">{posts.filter(p => p.status === 'PUBLISHED').length}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Total Views</p><p className="text-xl font-bold text-blue-600 mt-1">{posts.reduce((sum, p) => sum + p.viewCount, 0).toLocaleString()}</p></Card>
        <Card className="p-3"><p className="text-xs font-medium text-gray-600">Drafts</p><p className="text-xl font-bold text-orange-600 mt-1">{posts.filter(p => p.status === 'DRAFT').length}</p></Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="Search posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="ALL">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <Card>
        <CardHeader><CardTitle>All Blog Posts</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading posts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Author</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Published</th>
                    <th className="text-left p-2">Views</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium max-w-xs truncate">{post.title}</div>
                        <div className="text-xs text-gray-500">{post.readTime} min read</div>
                        {post.featured && <Badge variant="outline" className="mt-1 text-xs">Featured</Badge>}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2 text-sm"><User className="h-3 w-3 text-gray-400" />{post.author}</div>
                      </td>
                      <td className="p-2"><Badge variant="outline">{post.category}</Badge></td>
                      <td className="p-2"><Badge variant={getStatusColor(post.status)}>{post.status}</Badge></td>
                      <td className="p-2">
                        {post.publishedAt ? (
                          <div className="flex items-center gap-1 text-sm"><Calendar className="h-3 w-3 text-gray-400" />{post.publishedAt}</div>
                        ) : <span className="text-gray-400 text-sm">Not published</span>}
                      </td>
                      <td className="p-2"><span className="text-sm">👁️ {post.viewCount.toLocaleString()}</span></td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingPost(post); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
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

function BlogForm({ post, onSave, onCancel }: { post: BlogPost | null; onSave: (data: Partial<BlogPost>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: post?.title || '', slug: post?.slug || '', excerpt: post?.excerpt || '',
    content: post?.content || '', author: post?.author || '', category: post?.category || '',
    tags: post?.tags?.join(', ') || '', status: post?.status || 'DRAFT',
    featured: post?.featured || false, readTime: post?.readTime || 5, imageUrl: post?.imageUrl || '',
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) }); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
          <input type="text" value={formData.author} onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <input type="text" value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as any }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt *</label>
        <textarea value={formData.excerpt} onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{post ? 'Update Post' : 'Create Post'}</Button>
      </div>
    </form>
  );
}
