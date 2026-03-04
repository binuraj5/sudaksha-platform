'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock } from 'lucide-react';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    image: '/api/placeholder/400/250', // Placeholder image
    title: '5 Mistakes Freshers Make When Learning to Code',
    readTime: '5 min read',
    category: 'Career Advice',
    excerpt: 'Learn from common pitfalls and accelerate your coding journey with these expert tips.',
  },
  {
    id: 2,
    image: '/api/placeholder/400/250', // Placeholder image
    title: 'Full Stack vs Data Science: Which Should You Choose?',
    readTime: '8 min read',
    category: 'Career Guidance',
    excerpt: 'A comprehensive comparison to help you make the right career choice in tech.',
  },
  {
    id: 3,
    image: '/api/placeholder/400/250', // Placeholder image
    title: 'How to Get Your First Tech Job Without Experience',
    readTime: '6 min read',
    category: 'Job Search',
    excerpt: 'Practical strategies and insider tips to land your dream tech job as a beginner.',
  },
];

export function FeaturedBlogPosts() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Blog Posts
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert insights and practical advice to guide your tech career journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Blog Image</span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {post.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime}
                  </div>

                  <Link
                    href={`/blog/${post.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/blog"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            View All Blog Posts
          </Link>
        </motion.div>
      </div>
    </div>
  );
}





