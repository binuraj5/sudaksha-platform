import { NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getApiSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const memberId = (session.user as any).id;
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: {
                currentRole: { include: { competencies: { include: { competency: true } } } },
                aspirationalRole: { include: { competencies: { include: { competency: true } } } },
                assessments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const LEVEL_MAP: Record<string, number> = {
            'JUNIOR': 1,
            'MIDDLE': 2,
            'SENIOR': 3,
            'EXPERT': 4
        };

        const aspirationalCompetencies = member.aspirationalRole?.competencies || [];

        const analysis = aspirationalCompetencies.map(comp => {
            const reqLevel = LEVEL_MAP[comp.requiredLevel] || 1;
            const currentLevel = Math.floor(Math.random() * 5) + 1; // Mock current level
            return {
                name: comp.competency.name,
                requiredLevel: reqLevel,
                currentLevel: currentLevel,
                gap: reqLevel - currentLevel
            };
        });

        return NextResponse.json({
            currentRole: member.currentRole?.name,
            aspirationalRole: member.aspirationalRole?.name,
            analysis
        });
    } catch (error) {
        console.error("Gap analysis error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
