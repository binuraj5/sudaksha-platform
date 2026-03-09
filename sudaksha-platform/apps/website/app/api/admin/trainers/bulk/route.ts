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

// POST /api/admin/trainers/bulk
// Body: { trainers: Array<{ name, email, expertise?, experience?, bio?, status?, currentDesignation?, currentCompany?, linkedinUrl? }> }
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { trainers } = await req.json();
    if (!Array.isArray(trainers) || trainers.length === 0) {
      return NextResponse.json({ success: false, error: "trainers array is required" }, { status: 400 });
    }
    if (trainers.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 trainers per upload" }, { status: 400 });
    }

    const results = { created: 0, skipped: 0, errors: [] as { row: number; email: string; error: string }[] };

    for (let i = 0; i < trainers.length; i++) {
      const row = trainers[i];
      const name = row.name?.toString().trim();
      const email = row.email?.toString().trim().toLowerCase();

      if (!name || !email) {
        results.errors.push({ row: i + 2, email: email || '', error: 'name and email are required' });
        continue;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.errors.push({ row: i + 2, email, error: 'invalid email format' });
        continue;
      }

      try {
        const existing = await prisma.trainer.findFirst({ where: { email } });
        if (existing) { results.skipped++; continue; }

        const expertiseRaw = row.expertise?.toString().trim() ?? '';
        const expertise = expertiseRaw ? expertiseRaw.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean) : [];

        await prisma.trainer.create({
          data: {
            name,
            email,
            expertise,
            experience: row.experience ? parseInt(row.experience.toString()) || 0 : 0,
            bio: row.bio?.toString().trim() || null,
            status: ['ACTIVE', 'INACTIVE'].includes(row.status?.toString().toUpperCase()) ? row.status.toString().toUpperCase() : 'ACTIVE',
            currentDesignation: row.currentDesignation?.toString().trim() || null,
            currentCompany: row.currentCompany?.toString().trim() || null,
            linkedinUrl: row.linkedinUrl?.toString().trim() || null,
          },
        });
        results.created++;
      } catch (err: any) {
        results.errors.push({ row: i + 2, email, error: err.message });
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
