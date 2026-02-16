import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

export async function GET(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
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
                },
                orgUnit: true,
                reportingManager: { select: { id: true, name: true, designation: true } }
            }
        });

        if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

        return NextResponse.json(member);
    } catch (error) {
        console.error("Profile GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getApiSession();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        // Allowed updates
        // We expect `careerFormData` as a JSON object, or specific fields
        // For the wizard, we mainly update `careerFormData` section by section

        const { careerFormData, currentRoleId, aspirationalRoleId, bio, phone, metadata, studentInfo, professionalInfo } = body;

        const updateData: any = {};
        if (careerFormData !== undefined && typeof careerFormData === "object") {
            const existing = await prisma.member.findUnique({
                where: { email: session.user.email },
                select: { careerFormData: true },
            });
            const existingForm = (existing?.careerFormData as Record<string, unknown>) || {};
            const merged = { ...existingForm };
            for (const key of Object.keys(careerFormData)) {
                if ((careerFormData as Record<string, unknown>)[key] !== undefined) {
                    merged[key] = (careerFormData as Record<string, unknown>)[key];
                }
            }
            updateData.careerFormData = merged;
        }
        if (currentRoleId !== undefined) updateData.currentRoleId = currentRoleId;
        if (aspirationalRoleId !== undefined) updateData.aspirationalRoleId = aspirationalRoleId;
        if (bio !== undefined) updateData.bio = bio;
        if (phone !== undefined) updateData.phone = phone;

        // M15 B2C: Support student/professional metadata for INDIVIDUAL users
        if (metadata !== undefined || studentInfo !== undefined || professionalInfo !== undefined) {
            const existingMember = await prisma.member.findUnique({
                where: { email: session.user.email },
                select: { metadata: true }
            });
            if (existingMember) {
                const existing = (existingMember.metadata as Record<string, unknown>) || {};
                const merged = {
                    ...existing,
                    ...(metadata || {}),
                    ...(studentInfo !== undefined ? { studentInfo } : {}),
                    ...(professionalInfo !== undefined ? { professionalInfo } : {}),
                };
                updateData.metadata = merged;
            }
        }

        // Relation handling if saving career form data that maps to schema fields
        // e.g. if career form has "Designation", we might update member.designation? 
        // For now, keep careerFormData separate as the source of truth for the "Form".

        const member = await prisma.member.update({
            where: { email: session.user.email },
            data: updateData
        });

        return NextResponse.json(member);

    } catch (error) {
        console.error("Profile PATCH Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
