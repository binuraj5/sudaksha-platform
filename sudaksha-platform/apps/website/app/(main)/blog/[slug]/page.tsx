'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react';
import { useParams } from 'next/navigation';

interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorImage: string | null;
  category: string;
  tags: string[];
  imageUrl: string | null;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        const data = await res.json();
        if (data.success && data.blog) {
          setBlog(data.blog);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h2>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const tags = Array.isArray(blog.tags) ? blog.tags : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="text-sm text-blue-200 mb-4 font-semibold uppercase tracking-wide">{blog.category}</div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">{blog.title}</h1>
          <p className="text-xl text-blue-100 mb-8">{blog.excerpt}</p>
          <div className="flex flex-wrap items-center gap-6 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blog.author}</span>
            </div>
            {blog.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blog.readTime} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        {blog.imageUrl && (
          <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
            <img src={blog.imageUrl} alt={blog.title} className="w-full h-64 object-cover" />
          </div>
        )}

        <article className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-gray-900
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-gray-900
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-900
              [&_p]:my-3 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
              [&_li]:my-1
              [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4 [&_blockquote]:bg-blue-50 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
              [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto
              [&_code]:bg-gray-100 [&_code]:text-red-600 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
              [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0
              [&_hr]:border-gray-200 [&_hr]:my-6
              [&_strong]:font-semibold [&_strong]:text-gray-900
              [&_em]:italic
              [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
              [&_img]:rounded-lg [&_img]:max-w-full [&_img]:mx-auto [&_img]:my-4
            "
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Tag className="w-4 h-4 text-gray-500" />
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-t pt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
