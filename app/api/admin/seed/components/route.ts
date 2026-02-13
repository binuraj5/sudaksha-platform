import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        // Auth check...

        const components = [
            // Java Components
            {
                name: "Java Collections Framework",
                slug: "java-collections",
                description: "Deep dive into Lists, Sets, Maps and their implementations.",
                category: "TECHNICAL",
                subCategory: "Java",
                type: "CODING_CHALLENGE",
                difficultyLevel: "INTERMEDIATE",
                duration: 45,

                instructions: "Solve the coding challenges efficiently.",


                createdBy: "system"
            },
            {
                name: "Java Concurrency & Threads",
                slug: "java-concurrency",
                description: "Multithreading, synchronization, and executor services.",
                category: "TECHNICAL",
                subCategory: "Java",
                type: "MULTIPLE_CHOICE",
                difficultyLevel: "ADVANCED",
                duration: 30,

                instructions: "Answer the conceptual questions.",


                createdBy: "system"
            },
            // React Components
            {
                name: "React Hooks Proficiency",
                slug: "react-hooks",
                description: "Testing knowledge of useMemo, useCallback, and useEffect.",
                category: "TECHNICAL",
                subCategory: "Frontend",
                type: "CODING_CHALLENGE",
                difficultyLevel: "ADVANCED",
                duration: 60,

                instructions: "Implement the requested custom hooks.",


                createdBy: "system"
            },
            {
                name: "CSS Grid & Flexbox",
                slug: "css-layout",
                description: "Frontend layout mastery.",
                category: "TECHNICAL",
                subCategory: "Frontend",
                type: "CODING_CHALLENGE",
                difficultyLevel: "INTERMEDIATE",
                duration: 30,

                instructions: "Build the layout matching the design.",


                createdBy: "system"
            },
            // Soft Skills
            {
                name: "Email Etiquette",
                slug: "email-etiquette",
                description: "Professional communication standards.",
                category: "SOFT_SKILLS",
                subCategory: "Communication",
                type: "MULTIPLE_CHOICE",
                difficultyLevel: "BEGINNER",
                duration: 15,

                instructions: "Choose the most professional response.",


                createdBy: "system"
            },
            {
                name: "Conflict Resolution Scenario",
                slug: "conflict-resolution",
                description: "Handling workplace disagreements.",
                category: "SOFT_SKILLS",
                subCategory: "Leadership",
                type: "ESSAY",
                difficultyLevel: "INTERMEDIATE",
                duration: 25,


                instructions: "Describe how you would handle this situation.",


                createdBy: "system"
            }
        ];

        let count = 0;
        for (const comp of components) {
            // Check if exists
            // Schema has no slug on AssessmentModelComponent; look up by id if we had one. Skip duplicate check for seed.
                const { type, subCategory, slug, name, description, createdBy, ...rest } = comp as any;
                // AssessmentModelComponent requires modelId - seed assumes a default model exists; create with first available model
                const firstModel = await prisma.assessmentModel.findFirst({ select: { id: true } });
                if (!firstModel) continue;
                await prisma.assessmentModelComponent.create({
                    data: {
                        modelId: firstModel.id,
                        competencyId: null,
                        weight: 1,
                        order: rest.order ?? 0,
                        isRequired: true,
                        isTimed: true,
                        customDuration: rest.duration ?? null,
                    }
                });
                count++;
        }

        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
