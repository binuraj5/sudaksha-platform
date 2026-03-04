import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export async function POST(request: Request) {
    try {
        const session = await getApiSession();
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
        let competencies: any[] = [];

        if (file.name.endsWith(".json")) {
            competencies = JSON.parse(content);
        } else if (file.name.endsWith(".csv")) {
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
            });
            competencies = records.map((r: any) => ({
                name: r.name,
                category: r.category || "Technical",
                description: r.description || "",
                // Support indicators in CSV as a JSON string if needed
                indicators: r.indicators ? JSON.parse(r.indicators) : []
            }));
        } else {
            return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
        }

        if (!Array.isArray(competencies)) {
            competencies = [competencies];
        }

        let createdCount = 0;

        // Use a transaction for reliability, but handle duplicates gracefully
        for (const compData of competencies) {
            try {
                const { name, category, description, indicators } = compData;

                if (!name) continue;

                const competency = await prisma.competency.create({
                    data: {
                        name,
                        category: category.toUpperCase() as any, // Simple cast, ideally map safely
                        description,
                        indicators: {
                            create: indicators?.map((ind: any) => ({
                                text: ind.description || ind.text, // Use text, fallback to description
                                level: (ind.level?.toUpperCase() === 'INTERMEDIATE' ? 'MIDDLE' : ind.level?.toUpperCase()) || 'JUNIOR',
                                type: ind.type?.toUpperCase() || 'POSITIVE'
                            })) || []
                        }
                    }
                });
                createdCount++;
            } catch (err) {
                console.error(`Failed to create competency ${compData.name}:`, err);
                // Continue with next one
            }
        }

        return NextResponse.json({
            success: true,
            count: createdCount,
            total: competencies.length
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
