import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const role = (session?.user as any)?.role as string | undefined;
    const userTenantId = (session?.user as any)?.tenantId as string | undefined;

    const isSuperOrTenantAdmin = role === "SUPER_ADMIN" || role === "TENANT_ADMIN";
    // CLIENT_ADMIN may manage their own tenant's branding
    const isClientAdminOwner = role === "CLIENT_ADMIN" && userTenantId === clientId;

    if (!session || (!isSuperOrTenantAdmin && !isClientAdminOwner)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split(".").pop() || "png";
        const filename = `logo-${Date.now()}.${ext}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", clientId);
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        const url = `/uploads/${clientId}/${filename}`;

        return NextResponse.json({ url });

    } catch (error) {
        console.error("Logo Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
