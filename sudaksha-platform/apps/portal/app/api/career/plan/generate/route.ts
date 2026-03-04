import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { generateDevelopmentPlan } from "@/lib/career/plan-generator";

export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const member = await prisma.member.findUnique({
            where: { email: session.user.email }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        if (!member.aspirationalRoleId) {
            return NextResponse.json({
                error: "Aspirational role not set. Please set your career goals first."
            }, { status: 400 });
        }

        const plan = await generateDevelopmentPlan(member.id);

        if (!plan) {
            return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
        }

        // Save the plan to the member record
        await prisma.member.update({
            where: { id: member.id },
            data: {
                developmentPlan: plan as any
            }
        });

        return NextResponse.json({
            success: true,
            message: "Development plan generated successfully",
            plan
        });

    } catch (error) {
        console.error("Development Plan Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const member = await prisma.member.findUnique({
            where: { email: session.user.email },
            include: {
                currentRole: {
                    include: {
                        competencies: { include: { competency: true } }
                    }
                },
                aspirationalRole: {
                    include: {
                        competencies: { include: { competency: true } }
                    }
                }
            }
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        // If plan already exists, return it
        if (member.developmentPlan) {
            return NextResponse.json({ plan: member.developmentPlan });
        }

        // Otherwise return null or an empty plan object structure
        return NextResponse.json({ plan: null });

    } catch (error) {
        console.error("Development Plan Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/** PATCH: Update development plan (e.g. action status) and persist to member */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const member = await prisma.member.findUnique({
            where: { email: session.user.email }
        });
        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        const body = await req.json();
        const plan = body.plan as Record<string, unknown> | null;
        if (!plan || typeof plan !== "object") {
            return NextResponse.json({ error: "Invalid plan payload" }, { status: 400 });
        }

        await prisma.member.update({
            where: { id: member.id },
            data: { developmentPlan: plan as any }
        });

        return NextResponse.json({ success: true, plan });
    } catch (error) {
        console.error("Development Plan Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
