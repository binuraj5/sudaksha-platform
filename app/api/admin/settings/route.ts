import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";

const defaultConfig = {
    platformName: process.env.NEXT_PUBLIC_APP_NAME ?? "SudAssess",
    supportEmail: process.env.SUPPORT_EMAIL ?? "",
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    featureAIQuestions: true,
    featureBulkUpload: true,
    featureCustomReports: true,
    featureCareerPortal: true,
};

export async function GET() {
    const session = await getApiSession();

    if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // In future: read from DB or key-value store
        return NextResponse.json(defaultConfig);
    } catch (error) {
        console.error("[ADMIN_SETTINGS_GET]", error);
        return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getApiSession();

    if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const allowed = [
            "platformName",
            "supportEmail",
            "sessionTimeoutMinutes",
            "maxLoginAttempts",
            "featureAIQuestions",
            "featureBulkUpload",
            "featureCustomReports",
            "featureCareerPortal",
        ] as const;

        const updates: Record<string, unknown> = {};
        for (const key of allowed) {
            if (body[key] !== undefined) updates[key] = body[key];
        }

        // In future: persist to DB or env-backed store
        // For now we accept and return success; UI state is source of truth until refresh
        return NextResponse.json({ ...defaultConfig, ...updates });
    } catch (error) {
        console.error("[ADMIN_SETTINGS_PUT]", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
