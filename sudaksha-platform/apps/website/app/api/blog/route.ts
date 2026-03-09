import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "12"));

  const where: any = { status: "PUBLISHED" };
  if (category && category !== "all") where.category = { contains: category, mode: "insensitive" };

  try {
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        select: {
          id: true, title: true, slug: true, excerpt: true, author: true,
          authorImage: true, category: true, tags: true, imageUrl: true,
          publishedAt: true, readTime: true, featured: true, viewCount: true,
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      blogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, blogs: [], error: error.message }, { status: 500 });
  }
}
