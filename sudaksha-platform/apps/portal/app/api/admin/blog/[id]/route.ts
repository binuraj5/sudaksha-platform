import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog/[id] - Get single blog
// GET /api/admin/blog/[id] - Get single blog
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: params.id },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ blog });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/blog/[id] - Update blog
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
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

        // Check if blog exists
        const existing = await prisma.blog.findUnique({
            where: { id: params.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // If slug is changing, check for conflicts
        if (slug && slug !== existing.slug) {
            const slugExists = await prisma.blog.findUnique({
                where: { slug },
            });

            if (slugExists) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        // If status is changing to PUBLISHED, set publishedAt
        let publishedAt = existing.publishedAt;
        if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
            publishedAt = new Date();
        } else if (status !== 'PUBLISHED') {
            publishedAt = null;
        }

        const blog = await prisma.blog.update({
            where: { id: params.id },
            data: {
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
                publishedAt,
                readTime,
                featured,
                seoTitle,
                seoDescription,
            },
        });

        return NextResponse.json({ blog });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json(
            { error: 'Failed to update blog' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/blog/[id] - Delete blog
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await prisma.blog.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog' },
            { status: 500 }
        );
    }
}
