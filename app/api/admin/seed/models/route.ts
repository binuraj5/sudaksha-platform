import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        // Auth check...

        // 1. Ensure components exist (Assuming they are seeded or we search for them)
        const componentsInfo = [
            { slug: "java-collections", weight: 2 },
            { slug: "java-concurrency", weight: 2 },
            { slug: "react-hooks", weight: 1.5 },
            { slug: "email-etiquette", weight: 1 },
        ];

        // Fetch component IDs (schema has no slug; match by order or use existing components for this model)
        const dbComponents: Record<string, string> = {};
        const existingComponents = await prisma.assessmentModelComponent.findMany({ select: { id: true }, take: 20 });
        componentsInfo.forEach((c, i) => {
            if (existingComponents[i]) dbComponents[c.slug] = existingComponents[i].id;
        });

        const models = [
            {
                name: "Full Stack Java Developer Assmt",
                description: "Comprehensive evaluation for Senior Java Developers.",
                slug: "full-stack-java-dev",
                validityDays: 30,
                visibility: "PUBLIC",
                totalDuration: 135,
                passingScore: 70,
                difficultyLevel: "ADVANCED",
                experienceLevel: "SENIOR",
                industries: ["INFORMATION_TECHNOLOGY"],
                componentsToLink: ["java-collections", "java-concurrency", "react-hooks"]
            },
            {
                name: "Graduate Trainee Screening",
                description: "Initial screening for campus hires.",
                slug: "graduate-trainee-screen",
                validityDays: 90,
                visibility: "PUBLIC",
                totalDuration: 60,
                passingScore: 60,
                difficultyLevel: "BEGINNER",
                experienceLevel: "ENTRY",
                industries: ["GENERIC"],
                componentsToLink: ["java-collections", "email-etiquette"]
            }
        ];

        let count = 0;
        for (const m of models) {
            const existing = await prisma.assessmentModel.findUnique({ where: { code: m.slug } });
            if (!existing) {
                const { componentsToLink, ...modelData } = m;

                // Create Model (schema: code, name, description, createdBy, etc.)
                const newModel = await prisma.assessmentModel.create({
                    data: {
                        name: m.name,
                        description: m.description ?? null,
                        code: m.slug,
                        slug: m.slug,
                        createdBy: "system",
                        status: "DRAFT",
                        isTemplate: false,
                        passingScore: m.passingScore ?? 60,
                        durationMinutes: m.totalDuration ?? null,
                    }
                });

                // Add component slots to model (competencyId references Competency, not component id; use null for seed)
                let order = 1;
                for (const _slug of componentsToLink) {
                    await prisma.assessmentModelComponent.create({
                        data: {
                            modelId: newModel.id,
                            competencyId: null,
                            weight: 1,
                            order: order++,
                            isRequired: true,
                            isTimed: true,
                        }
                    });
                }
                count++;
            }
        }

        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
