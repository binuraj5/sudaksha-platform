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

interface Campaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  type: "EMAIL" | "SMS" | "PUSH";
  status: "DRAFT" | "SCHEDULED" | "SENT" | "FAILED";
  targetAudience: string;
  recipientCount: number;
  sentCount: number;
  openRate?: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

interface Store {
  templates: any[];
  campaigns: Campaign[];
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
  const { campaigns } = readStore();
  return NextResponse.json({ success: true, campaigns });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, templateId, templateName, type, targetAudience, recipientCount, scheduledAt, status } = body;
  if (!name || !templateId || !targetAudience) {
    return NextResponse.json({ error: "name, templateId, targetAudience are required" }, { status: 400 });
  }
  const store = readStore();
  const campaign: Campaign = {
    id: `cmp-${Date.now()}`,
    name, templateId, templateName: templateName || "",
    type: type || "EMAIL",
    status: status || "DRAFT",
    targetAudience,
    recipientCount: recipientCount || 0,
    sentCount: 0,
    scheduledAt: scheduledAt || undefined,
    createdAt: new Date().toISOString().split("T")[0],
  };
  store.campaigns.push(campaign);
  writeStore(store);
  return NextResponse.json({ success: true, campaign });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = readStore();
  const idx = store.campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.campaigns[idx] = { ...store.campaigns[idx], ...updates };
  writeStore(store);
  return NextResponse.json({ success: true, campaign: store.campaigns[idx] });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = readStore();
  store.campaigns = store.campaigns.filter((c) => c.id !== id);
  writeStore(store);
  return NextResponse.json({ success: true });
}
