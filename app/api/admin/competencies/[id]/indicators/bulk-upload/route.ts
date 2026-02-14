import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getApiSession();
        const { id } = await params;

        const u = session?.user as { role?: string; userType?: string } | undefined;
        const isAdmin = u?.role === "ADMIN" || u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";
        if (!session || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const content = await file.text();
        let indicators: any[] = [];

        if (file.name.endsWith(".json")) {
            indicators = JSON.parse(content);
        } else if (file.name.endsWith(".csv")) {
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
            });
            indicators = records.map((r: any) => ({
                text: r.text || r.description,
                level: (r.level?.toUpperCase() === 'INTERMEDIATE' ? 'MIDDLE' : r.level?.toUpperCase()) || 'JUNIOR',
                type: r.type?.toUpperCase() || 'POSITIVE'
            }));
        } else {
            return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
        }

        if (!Array.isArray(indicators)) {
            indicators = [indicators];
        }

        // Use transaction for bulk creation
        const results = await prisma.$transaction(
            indicators.map((ind: any) =>
                prisma.competencyIndicator.create({
                    data: {
                        competencyId: id,
                        text: ind.text || ind.description,
                        level: ind.level || 'MIDDLE',
                        type: ind.type || 'POSITIVE'
                    }
                })
            )
        );

        return NextResponse.json({
            success: true,
            count: results.length,
            indicators: results
        });

    } catch (error) {
        console.error("Bulk upload indicators error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
