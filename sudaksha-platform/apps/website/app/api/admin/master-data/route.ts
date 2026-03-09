import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    const session = JSON.parse(raw);
    return !!session?.email;
  } catch {
    return false;
  }
}

const VALID_TYPES = ["category", "industry", "level", "domain", "courseType", "department"] as const;
type MasterType = typeof VALID_TYPES[number];

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function getItems(type: MasterType) {
  const select = { id: true, name: true, isActive: true };
  const orderBy = { name: "asc" as const };
  switch (type) {
    case "category":    return prisma.masterCategory.findMany({ select, orderBy });
    case "industry":    return prisma.masterIndustry.findMany({ select, orderBy });
    case "level":       return prisma.masterLevel.findMany({ select, orderBy });
    case "domain":      return prisma.masterDomain.findMany({ select, orderBy });
    case "courseType":  return prisma.masterCourseType.findMany({ select, orderBy });
    case "department":  return prisma.masterDepartment.findMany({ select, orderBy });
  }
}

async function createItem(type: MasterType, name: string) {
  const slug = slugify(name);
  const data = { name, slug, isActive: true };
  switch (type) {
    case "category":   return prisma.masterCategory.create({ data });
    case "industry":   return prisma.masterIndustry.create({ data });
    case "level":      return prisma.masterLevel.create({ data });
    case "domain":     return prisma.masterDomain.create({ data });
    case "courseType": return prisma.masterCourseType.create({ data });
    case "department": return prisma.masterDepartment.create({ data });
  }
}

async function updateItem(type: MasterType, id: string, fields: { name?: string; isActive?: boolean }) {
  const data: any = {};
  if (fields.name !== undefined) { data.name = fields.name; data.slug = slugify(fields.name); }
  if (fields.isActive !== undefined) data.isActive = fields.isActive;
  switch (type) {
    case "category":   return prisma.masterCategory.update({ where: { id }, data });
    case "industry":   return prisma.masterIndustry.update({ where: { id }, data });
    case "level":      return prisma.masterLevel.update({ where: { id }, data });
    case "domain":     return prisma.masterDomain.update({ where: { id }, data });
    case "courseType": return prisma.masterCourseType.update({ where: { id }, data });
    case "department": return prisma.masterDepartment.update({ where: { id }, data });
  }
}

async function deleteItem(type: MasterType, id: string) {
  switch (type) {
    case "category":   return prisma.masterCategory.delete({ where: { id } });
    case "industry":   return prisma.masterIndustry.delete({ where: { id } });
    case "level":      return prisma.masterLevel.delete({ where: { id } });
    case "domain":     return prisma.masterDomain.delete({ where: { id } });
    case "courseType": return prisma.masterCourseType.delete({ where: { id } });
    case "department": return prisma.masterDepartment.delete({ where: { id } });
  }
}

const DEFAULTS: Record<MasterType, string[]> = {
  category: [
    "Software Development", "Data Science & Analytics", "Cloud & DevOps",
    "Cybersecurity", "AI & Machine Learning", "Business & Management",
    "Finance & Accounting", "Marketing & Sales", "HR & People Management",
    "Leadership & Soft Skills", "Project Management", "Design & UX",
  ],
  industry: [
    "Technology", "Healthcare", "Finance & Banking", "Manufacturing",
    "Retail & E-Commerce", "Education", "Government & Public Sector",
    "Telecommunications", "Consulting", "Generic/All Industries",
  ],
  level: ["Beginner", "Intermediate", "Advanced", "Expert", "All Levels"],
  domain: ["IT", "Non-IT", "All"],
  courseType: ["Technology", "Functional", "Process", "Behavioral", "Personal"],
  department: [
    "Engineering", "Sales", "Marketing", "Finance", "HR",
    "Operations", "Product", "Design", "Legal", "Customer Success",
  ],
};

async function countItems(type: MasterType): Promise<number> {
  switch (type) {
    case "category":   return prisma.masterCategory.count();
    case "industry":   return prisma.masterIndustry.count();
    case "level":      return prisma.masterLevel.count();
    case "domain":     return prisma.masterDomain.count();
    case "courseType": return prisma.masterCourseType.count();
    case "department": return prisma.masterDepartment.count();
  }
}

async function seedIfEmpty(type: MasterType) {
  const count = await countItems(type);
  if (count === 0) {
    for (const name of DEFAULTS[type]) {
      try { await createItem(type, name); } catch { /* ignore duplicates */ }
    }
  }
}

// GET /api/admin/master-data?type=...  (omit type → returns all)
export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get("type") as MasterType | null;

  try {
    if (type) {
      if (!(VALID_TYPES as readonly string[]).includes(type)) {
        return NextResponse.json({ success: false, error: `Unknown type: ${type}` }, { status: 400 });
      }
      await seedIfEmpty(type);
      return NextResponse.json({ success: true, data: await getItems(type) });
    }

    // Seed all types if empty, then return all
    await Promise.all(VALID_TYPES.map(seedIfEmpty));

    const [category, industry, level, domain, courseType, department] = await Promise.all([
      getItems("category"),
      getItems("industry"),
      getItems("level"),
      getItems("domain"),
      getItems("courseType"),
      getItems("department"),
    ]);

    return NextResponse.json({ success: true, data: { category, industry, level, domain, courseType, department } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — add item { type, name }
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { type, name } = await req.json();
    if (!(VALID_TYPES as readonly string[]).includes(type) || !name?.trim()) {
      return NextResponse.json({ success: false, error: "type and name are required" }, { status: 400 });
    }
    const item = await createItem(type as MasterType, name.trim());
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Item already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — update item { type, id, name?, isActive? }
export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { type, id, name, isActive } = await req.json();
    if (!(VALID_TYPES as readonly string[]).includes(type) || !id) {
      return NextResponse.json({ success: false, error: "type and id are required" }, { status: 400 });
    }
    const fields: { name?: string; isActive?: boolean } = {};
    if (name !== undefined) fields.name = name.trim();
    if (isActive !== undefined) fields.isActive = isActive;
    if (!fields.name && fields.isActive === undefined) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }
    const item = await updateItem(type as MasterType, id, fields);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Name already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/master-data?type=...&id=...
export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const type = req.nextUrl.searchParams.get("type") as MasterType;
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!(VALID_TYPES as readonly string[]).includes(type) || !id) {
      return NextResponse.json({ success: false, error: "type and id are required" }, { status: 400 });
    }
    await deleteItem(type, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
