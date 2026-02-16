import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profile/role-request-options
 * Returns MasterDepartment and MasterIndustry lists for the Role Request form dropdowns.
 */
export async function GET() {
    let departments: { id: string; name: string; slug: string }[] = [];
    let industries: { id: string; name: string; slug: string }[] = [];

    try {
        try {
            departments = await prisma.masterDepartment.findMany({
                where: { isActive: true },
                orderBy: { name: "asc" },
                select: { id: true, name: true, slug: true },
            });
        } catch (e) {
            console.warn("[ROLE_REQUEST_OPTIONS] MasterDepartment not available:", (e as Error).message);
        }
        try {
            industries = await prisma.masterIndustry.findMany({
                where: { isActive: true },
                orderBy: { name: "asc" },
                select: { id: true, name: true, slug: true },
            });
        } catch (e) {
            console.warn("[ROLE_REQUEST_OPTIONS] MasterIndustry not available:", (e as Error).message);
        }

        return NextResponse.json({ departments, industries });
    } catch (error) {
        console.error("[ROLE_REQUEST_OPTIONS]", error);
        return NextResponse.json(
            { error: "Failed to load options", departments: [], industries: [] },
            { status: 200 }
        );
    }
}
