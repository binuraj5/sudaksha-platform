import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { resolveCreatedByUserId } from "@/lib/resolve-created-by";

export async function POST(req: Request) {
    try {
        const session = await getApiSession();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const createdBy = await resolveCreatedByUserId(session);
        const firstCompetency = await prisma.competency.findFirst({ select: { id: true } });
        if (!firstCompetency) {
            return NextResponse.json({ error: "No competency found. Create a competency first." }, { status: 400 });
        }

        const components = [
            { name: "Java Collections Framework", description: "Deep dive into Lists, Sets, Maps and their implementations.", componentType: "CODE" as const, targetLevel: "MIDDLE" as const },
            { name: "Java Concurrency & Threads", description: "Multithreading, synchronization, and executor services.", componentType: "MCQ" as const, targetLevel: "SENIOR" as const },
            { name: "React Hooks Proficiency", description: "Testing knowledge of useMemo, useCallback, and useEffect.", componentType: "CODE" as const, targetLevel: "SENIOR" as const },
            { name: "CSS Grid & Flexbox", description: "Frontend layout mastery.", componentType: "CODE" as const, targetLevel: "MIDDLE" as const },
            { name: "Email Etiquette", description: "Professional communication standards.", componentType: "MCQ" as const, targetLevel: "JUNIOR" as const },
            { name: "Conflict Resolution Scenario", description: "Handling workplace disagreements.", componentType: "ESSAY" as const, targetLevel: "MIDDLE" as const },
        ];

        let count = 0;
        for (const comp of components) {
            const existing = await prisma.componentLibrary.findFirst({
                where: { name: comp.name },
                select: { id: true }
            });
            if (existing) continue;

            await prisma.componentLibrary.create({
                data: {
                    createdBy,
                    competencyId: firstCompetency.id,
                    name: comp.name,
                    description: comp.description,
                    componentType: comp.componentType,
                    targetLevel: comp.targetLevel,
                    visibility: "PRIVATE",
                    questions: [],
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
