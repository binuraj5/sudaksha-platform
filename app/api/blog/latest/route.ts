import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const blogPosts = [
      {
        id: '1',
        title: 'Top 10 Tech Skills That Will Dominate 2024',
        excerpt: 'Discover the most in-demand technical skills that will shape the job market in 2024 and beyond.',
        image: '/images/blog/tech-skills-2024.jpg',
        category: 'Career Guidance',
        author: 'Sarah Johnson',
        date: '2024-01-15',
        slug: 'top-tech-skills-2024'
      },
      {
        id: '2',
        title: 'From Campus to Corporate: A Complete Guide',
        excerpt: 'Navigate your journey from academic life to professional success with our comprehensive guide.',
        image: '/images/blog/campus-to-corporate.jpg',
        category: 'Career Tips',
        author: 'Mike Wilson',
        date: '2024-01-12',
        slug: 'campus-to-corporate-guide'
      },
      {
        id: '3',
        title: 'Why Data Science is the Career of the Future',
        excerpt: 'Explore the growing demand for data scientists and how you can build a successful career in this field.',
        image: '/images/blog/data-science-future.jpg',
        category: 'Industry Insights',
        author: 'Emily Chen',
        date: '2024-01-10',
        slug: 'data-science-career-future'
      }
    ];

    return NextResponse.json(blogPosts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
