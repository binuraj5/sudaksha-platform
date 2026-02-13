import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";

const INDUSTRY_MAP: Record<string, string> = {
    "Information Technology": "INFORMATION_TECHNOLOGY",
    "Healthcare": "HEALTHCARE",
    "Finance": "FINANCE",
    "Manufacturing": "MANUFACTURING",
    "Education": "EDUCATION",
    "Retail": "RETAIL",
};

function mapIndustries(industries: string[] | undefined): string[] {
    if (!industries || industries.length === 0) return ["GENERIC"];
    return industries.map((i) => INDUSTRY_MAP[i] || "GENERIC").filter(Boolean);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getApiSession();
    const u = session?.user as { id?: string; role?: string; userType?: string } | undefined;
    const isSuperAdmin = u?.role === "SUPER_ADMIN" || u?.userType === "SUPER_ADMIN";

    if (!session || !isSuperAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;

    try {
        const body = await req.json();
        const {
            name,
            code,
            description,
            overallLevel = "JUNIOR",
            department,
            industries = [],
            competencies = [],
        } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: "Role name is required" },
                { status: 400 }
            );
        }

        const request = await prisma.roleAssignmentRequest.findUnique({
            where: { id: requestId },
            include: { member: true, tenant: true },
        });

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (request.status !== "PENDING") {
            return NextResponse.json(
                { error: "Request has already been processed" },
                { status: 400 }
            );
        }

        if (request.assignedRoleId) {
            return NextResponse.json(
                { error: "Role already created for this request", roleId: request.assignedRoleId },
                { status: 400 }
            );
        }

        const roleCode =
            code?.trim() ||
            name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "_")
                .slice(0, 20);

        const role = await prisma.$transaction(async (tx) => {
            const existingRole = await tx.role.findFirst({
                where: {
                    OR: [
                        { name: { equals: name.trim(), mode: "insensitive" } },
                        { code: roleCode },
                    ],
                },
            });

            if (existingRole) {
                throw new Error("Role with this name or code already exists.");
            }

            const newRole = await tx.role.create({
                data: {
                    name: name.trim(),
                    code: roleCode,
                    description: description?.trim() || `Requested by ${request.member.name}. Total experience: ${request.totalExperienceYears} years.`,
                    overallLevel: (overallLevel?.toUpperCase() || "JUNIOR") as any,
                    department: department?.trim() || null,
                    tenantId: request.tenantId,
                    industries: {
                        set: mapIndustries(industries),
                    },
                },
            });

            for (const comp of competencies) {
                const compName = comp.name?.trim();
                if (!compName) continue;

                let competency = await tx.competency.findUnique({
                    where: { name: compName },
                });

                if (!competency) {
                    competency = await tx.competency.create({
                        data: {
                            name: compName,
                            category: (comp.category?.toUpperCase() || "TECHNICAL") as any,
                            description: comp.description?.trim() || compName,
                        },
                    });
                }

                await tx.roleCompetency.upsert({
                    where: {
                        roleId_competencyId: {
                            roleId: newRole.id,
                            competencyId: competency.id,
                        },
                    },
                    create: {
                        roleId: newRole.id,
                        competencyId: competency.id,
                        requiredLevel: (overallLevel?.toUpperCase() || "JUNIOR") as any,
                        weight: comp.weight ?? 1.0,
                    },
                    update: {},
                });
            }

            await tx.roleAssignmentRequest.update({
                where: { id: requestId },
                data: {
                    assignedRoleId: newRole.id,
                },
            });

            return newRole;
        });

        return NextResponse.json({
            success: true,
            roleId: role.id,
            message: "Role and competencies created successfully",
        });
    } catch (error: any) {
        console.error("[CREATE_ROLE_FROM_APPROVAL]", error);
        return NextResponse.json(
            { error: error.message || "Failed to create role" },
            { status: 500 }
        );
    }
}
