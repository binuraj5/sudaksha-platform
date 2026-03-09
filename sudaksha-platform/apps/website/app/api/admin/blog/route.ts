import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    return !!JSON.parse(raw)?.email;
  } catch { return false; }
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80) + "-" + Date.now();
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "50"));

  const where: any = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { author: { contains: search, mode: "insensitive" } },
    { category: { contains: search, mode: "insensitive" } },
  ];

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      select: {
        id: true, title: true, slug: true, excerpt: true, author: true,
        category: true, tags: true, imageUrl: true, status: true,
        publishedAt: true, readTime: true, featured: true, viewCount: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blog.count({ where }),
  ]);

  return NextResponse.json({ success: true, blogs, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const slug = body.slug?.trim() || slugify(body.title || "post");
    const existing = await prisma.blog.findUnique({ where: { slug }, select: { id: true } });
    const finalSlug = existing ? slugify(body.title || "post") : slug;

    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        slug: finalSlug,
        excerpt: body.excerpt || "",
        content: body.content || "",
        author: body.author || "Sudaksha Team",
        category: body.category || "General",
        tags: body.tags || [],
        imageUrl: body.imageUrl || null,
        status: body.status || "DRAFT",
        readTime: parseInt(body.readTime) || 5,
        featured: body.featured ?? false,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        ...(body.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
      select: { id: true, slug: true, title: true },
    });
    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
