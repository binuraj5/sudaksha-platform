import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog - Get published blogs (public endpoint)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'PUBLISHED',
        };

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    author: true,
                    authorImage: true,
                    category: true,
                    tags: true,
                    imageUrl: true,
                    publishedAt: true,
                    readTime: true,
                    featured: true,
                    viewCount: true,
                },
                orderBy: [
                    { featured: 'desc' },
                    { publishedAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.blog.count({ where }),
        ]);

        return NextResponse.json({
            blogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}
