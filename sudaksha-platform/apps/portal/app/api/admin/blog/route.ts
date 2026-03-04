import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog - List all blogs with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured');

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (category) {
            where.category = category;
        }

        if (featured !== null) {
            where.featured = featured === 'true';
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
            ];
        }

        const blogs = await prisma.blog.findMany({
            where,
            orderBy: [
                { featured: 'desc' },
                { publishedAt: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        // Get stats
        const stats = {
            total: await prisma.blog.count(),
            published: await prisma.blog.count({ where: { status: 'PUBLISHED' } }),
            draft: await prisma.blog.count({ where: { status: 'DRAFT' } }),
            archived: await prisma.blog.count({ where: { status: 'ARCHIVED' } }),
        };

        return NextResponse.json({ blogs, stats });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}

// POST /api/admin/blog - Create new blog
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            title,
            slug,
            excerpt,
            content,
            author,
            authorImage,
            category,
            tags,
            imageUrl,
            status,
            readTime,
            featured,
            seoTitle,
            seoDescription,
        } = body;

        // Validate required fields
        if (!title || !slug || !excerpt || !content || !author || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existing = await prisma.blog.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        const publishedAt = status === 'PUBLISHED' ? new Date() : null;

        const blog = await prisma.blog.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                author,
                authorImage,
                category,
                tags: tags || [],
                imageUrl,
                status: status || 'DRAFT',
                publishedAt,
                readTime: readTime || 5,
                featured: featured || false,
                seoTitle,
                seoDescription,
            },
        });

        return NextResponse.json({ blog }, { status: 201 });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json(
            { error: 'Failed to create blog' },
            { status: 500 }
        );
    }
}
