import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true, title: true, slug: true, excerpt: true, content: true,
        author: true, authorImage: true, category: true, tags: true,
        imageUrl: true, publishedAt: true, readTime: true, featured: true,
        viewCount: true, seoTitle: true, seoDescription: true, createdAt: true,
      },
    });

    if (!blog) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Increment view count (fire and forget)
    prisma.blog.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
