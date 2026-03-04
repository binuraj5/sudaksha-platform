import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog/[slug] - Get single blog by slug (public endpoint)
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ slug: string }> }
) {
    const params = await props.params;
    try {
        const blog = await prisma.blog.findUnique({
            where: {
                slug: params.slug,
            },
        });

        if (!blog || blog.status !== 'PUBLISHED') {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Increment view count
        await prisma.blog.update({
            where: { id: blog.id },
            data: { viewCount: { increment: 1 } },
        });

        // Get related posts (same category, excluding current)
        const relatedPosts = await prisma.blog.findMany({
            where: {
                status: 'PUBLISHED',
                category: blog.category,
                id: { not: blog.id },
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                imageUrl: true,
                publishedAt: true,
                readTime: true,
            },
            take: 3,
            orderBy: { publishedAt: 'desc' },
        });

        return NextResponse.json({ blog, relatedPosts });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog' },
            { status: 500 }
        );
    }
}
