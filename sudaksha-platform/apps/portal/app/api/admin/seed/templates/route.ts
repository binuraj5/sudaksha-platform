import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure this path checks out or use direct import
import { getApiSession } from "@/lib/get-session";

export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        // Safety check: only admin can seed
        // if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        // Define Templates
        const templates = [
            {
                name: "Java Full Stack Developer Assessment",
                slug: "java-full-stack-template",
                description: "Comprehensive assessment for Full Stack Java developers covering Core Java, Spring Boot, React, and SQL.",
                targetRoles: ["Full Stack Developer", "Java Developer"],
                targetIndustries: ["INFORMATION_TECHNOLOGY"],
                experienceLevel: "MID_LEVEL",
                passingCriteria: 70,
                totalDuration: 90,
                visibility: "SYSTEM", // Key field
                createdBy: "system"
            },
            {
                name: "Data Science Fundamentals",
                slug: "data-science-fundamentals-template",
                description: "Entry-level assessment ensuring basic proficiency in Python, Statistics, and SQL for data roles.",
                targetRoles: ["Data Analyst", "Junior Data Scientist"],
                targetIndustries: ["INFORMATION_TECHNOLOGY", "FINANCE"],
                experienceLevel: "ENTRY_LEVEL",
                passingCriteria: 60,
                totalDuration: 60,
                visibility: "SYSTEM",
                createdBy: "system"
            },
            {
                name: "Frontend React Specialist",
                slug: "frontend-react-template",
                description: "Deep dive into React ecosystem including Hooks, Redux, and modern CSS practices.",
                targetRoles: ["Frontend Developer"],
                targetIndustries: ["INFORMATION_TECHNOLOGY"],
                experienceLevel: "SENIOR_LEVEL",
                passingCriteria: 75,
                totalDuration: 75,
                visibility: "SYSTEM",
                createdBy: "system"
            },
            {
                name: "Communication Skills Assessment",
                slug: "comm-skills-template",
                description: "General purpose assessment for verifying verbal and written communication skills.",
                targetRoles: ["All Roles"],
                targetIndustries: ["GENERIC"],
                experienceLevel: "ENTRY_LEVEL",
                passingCriteria: 50,
                totalDuration: 30,
                visibility: "SYSTEM",
                createdBy: "system"
            }
        ];

        const created = [];
        for (const tmpl of templates) {
            // Upsert (create if not exists, update if exists)
            const code = (tmpl as { slug?: string }).slug ?? (tmpl as { code?: string }).code ?? `tpl-${Date.now()}`;
            const result = await prisma.assessmentModel.upsert({
                where: { code },
                update: { name: (tmpl as { name?: string }).name, description: (tmpl as { description?: string }).description ?? null },
                create: {
                    code,
                    slug: code,
                    name: (tmpl as { name?: string }).name ?? "Template",
                    description: (tmpl as { description?: string }).description ?? null,
                    createdBy: "system",
                    status: "DRAFT",
                    isTemplate: true,
                }
            });
            created.push(result);
        }

        return NextResponse.json({ success: true, count: created.length });

    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
