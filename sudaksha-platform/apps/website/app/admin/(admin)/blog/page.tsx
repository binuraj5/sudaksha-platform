'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, Loader2, Globe, GlobeLock } from 'lucide-react';
import { toast } from 'sonner';

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      setPosts(data.blogs || []);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(posts.map(p => p.category))];

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    try {
      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : '/api/admin/blog';
      const method = editingPost ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!res.ok) throw new Error();
      toast.success(editingPost ? 'Post updated' : 'Post created');
      setShowAddForm(false);
      setEditingPost(null);
      await loadPosts();
    } catch {
      toast.error('Failed to save post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Post archived');
      await loadPosts();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handlePublishToggle = async (post: BlogPost) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(newStatus === 'PUBLISHED' ? 'Post published — visible on website' : 'Post unpublished — moved to draft');
      await loadPosts();
    } catch {
      toast.error('Failed to update post status');
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
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading...</div>
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
                        <div className="flex gap-1 flex-wrap">
                          {post.status === 'PUBLISHED' ? (
                            <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => handlePublishToggle(post)} title="Unpublish">
                              <GlobeLock className="h-4 w-4 mr-1" />Unpublish
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handlePublishToggle(post)} title="Publish">
                              <Globe className="h-4 w-4 mr-1" />Publish
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild title="View"><a href={`/blog/${post.slug}`} target="_blank"><Eye className="h-4 w-4" /></a></Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingPost(post); setShowAddForm(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4" /></Button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
          <input type="url" value={formData.imageUrl} onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
          <input type="text" value={formData.tags} onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))} placeholder="AI, Career, Skills" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Read Time (min)</label>
            <input type="number" min={1} value={formData.readTime} onChange={(e) => setFormData(p => ({ ...p, readTime: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData(p => ({ ...p, featured: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Featured post</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <RichTextEditor
          value={formData.content}
          onChange={(html) => setFormData(p => ({ ...p, content: html }))}
          placeholder="Write your blog post content here..."
          minHeight="400px"
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">{post ? 'Update Post' : 'Create Post'}</Button>
      </div>
    </form>
  );
}
