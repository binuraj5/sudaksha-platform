'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    authorImage: string | null;
    category: string;
    imageUrl: string | null;
    publishedAt: string;
    readTime: number;
}

export default function BlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

    const categories = ['All Posts', 'Career Guidance', 'Industry Insights', 'Corporate Training', 'Technology', 'Success Stories'];

    useEffect(() => {
        fetchBlogs();
    }, [selectedCategory, page]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.set('category', selectedCategory);
            params.set('page', page.toString());
            
            const res = await fetch(`/api/blog?${params.toString()}`);
            const data = await res.json();
            
            if (data.success) {
                setBlogs(data.blogs || []);
                if (data.pagination) setPagination(data.pagination);
            } else {
                setBlogs([]);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Sudaksha Blog</h1>
                        <p className="text-xl text-blue-100">
                            Insights, Tips & Trends in Skill Development
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap gap-3 mb-12 justify-center">
                            {categories.map((cat, idx) => {
                                const value = idx === 0 ? 'all' : cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(value)}
                                        className={`px-6 py-2 rounded-full font-semibold transition-colors ${selectedCategory === value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-gray-600">Loading blogs...</div>
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center py-12 bg-blue-50 rounded-xl p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">No blog posts yet!</h3>
                                <p className="text-gray-600">Check back soon for new articles</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {blogs.map((post) => (
                                        <article
                                            key={post.id}
                                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                        >
                                            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                                                {post.imageUrl && (
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-3">
                                                    <span>{post.category}</span>
                                                </div>

                                                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                                </h2>

                                                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span>{post.author}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">{post.readTime} min read</span>
                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                                    >
                                                        Read More
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {pagination.totalPages > 1 && (
                                    <div className="mt-12 flex justify-center gap-2">
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`px-4 py-2 rounded-lg font-semibold ${page === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
