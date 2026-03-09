import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) return false;
    return !!JSON.parse(raw)?.email;
  } catch { return false; }
}

const DATA_FILE = path.join(process.cwd(), "data", "communication.json");

interface Template {
  id: string;
  name: string;
  subject: string;
  type: "EMAIL" | "SMS" | "PUSH";
  category: "ENROLLMENT" | "REMINDER" | "COMPLETION" | "MARKETING" | "SYSTEM";
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
}

interface Store {
  templates: Template[];
  campaigns: any[];
}

function readStore(): Store {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {}
  return { templates: [], campaigns: [] };
}

function writeStore(store: Store) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function GET(_req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { templates } = readStore();
  return NextResponse.json({ success: true, templates });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, subject, type, category, status } = body;
  if (!name || !subject || !type || !category) {
    return NextResponse.json({ error: "name, subject, type, category are required" }, { status: 400 });
  }
  const store = readStore();
  const template: Template = {
    id: `tpl-${Date.now()}`,
    name, subject,
    type: type || "EMAIL",
    category: category || "ENROLLMENT",
    status: status || "DRAFT",
    usageCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
  store.templates.push(template);
  writeStore(store);
  return NextResponse.json({ success: true, template });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = readStore();
  const idx = store.templates.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.templates[idx] = { ...store.templates[idx], ...updates };
  writeStore(store);
  return NextResponse.json({ success: true, template: store.templates[idx] });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = readStore();
  store.templates = store.templates.filter((t) => t.id !== id);
  writeStore(store);
  return NextResponse.json({ success: true });
}
