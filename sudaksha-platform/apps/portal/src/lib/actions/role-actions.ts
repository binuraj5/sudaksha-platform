"use server";

import { prisma } from "@/lib/prisma";
import { GeneratedCompetency } from "@/lib/actions/ai-competency";
import { revalidatePath } from "next/cache";
import { getApiSession } from "@/lib/get-session";

interface CreateRoleData {
    name: string;
    code: string;
    description: string;
    overallLevel: "JUNIOR" | "MIDDLE" | "SENIOR" | "EXPERT";
    department?: string;
    keyResponsibilities?: string;
    industries: string[];
}

export async function createRoleWithCompetencies(
    roleData: CreateRoleData,
    competencies: GeneratedCompetency[]
) {
    try {
        // 1. Create the Role
        // Note: We use transaction to ensure all or nothing
        const result = await prisma.$transaction(async (tx) => {
            // Check if role exists (though constrained by unique code/name)
            const existingRole = await tx.role.findFirst({
                where: { OR: [{ code: roleData.code }, { name: roleData.name }] }
            });

            if (existingRole) {
                throw new Error("Role with this name or code already exists.");
            }

            const role = await tx.role.create({
                data: {
                    name: roleData.name,
                    code: roleData.code, // Now optional in schema but we provide it
                    description: roleData.description,
                    keyResponsibilities: roleData.keyResponsibilities,
                    overallLevel: roleData.overallLevel,
                    department: roleData.department,
                    // Handle industries enum array if possible, or just skip if type mismatch
                    // Our schema has industries as Industry[] (Enum). 
                    // We need to make sure the strings match the Enum values.
                    // For safety, we map or filter valid enums if needed.
                    // Assuming the UI provides valid enum strings or we map "Information Technology" -> "INFORMATION_TECHNOLOGY"
                    industries: {
                        set: mapIndustriesToEnum(roleData.industries)
                    }
                }
            });

            // 2. Process Competencies
            // For each competency, find or put, then link
            for (const comp of competencies) {
                // Check if competency exists
                let competency = await tx.competency.findUnique({
                    where: { name: comp.name }
                });

                if (!competency) {
                    competency = await tx.competency.create({
                        data: {
                            name: comp.name,
                            category: (comp.category?.toUpperCase() as any) || "TECHNICAL",
                            description: comp.description,
                        }
                    });
                } else if (comp.category && competency.category !== comp.category.toUpperCase() as any) {
                    // Update category if it was default or changed
                    await tx.competency.update({
                        where: { id: competency.id },
                        data: { category: comp.category.toUpperCase() as any }
                    });
                }

                // Setup indicators for competency (new or existing)
                if (comp.indicators && comp.indicators.length > 0) {
                    for (const ind of comp.indicators) {
                        const indText = (ind as any).text || (ind as any).description;
                        if (!indText) continue;

                        const normalizedLevel = (ind.level?.toUpperCase()) as any;
                        const normalizedType = (ind.type?.toUpperCase()) as any;

                        // Check if indicator already exists by text to avoid duplicates
                        const existingIndicator = await tx.competencyIndicator.findFirst({
                            where: {
                                competencyId: competency.id,
                                text: indText,
                                level: normalizedLevel
                            }
                        });

                        if (!existingIndicator) {
                            await tx.competencyIndicator.create({
                                data: {
                                    competencyId: competency.id,
                                    level: normalizedLevel,
                                    type: normalizedType,
                                    text: indText
                                }
                            });
                        }
                    }
                }

                // Link Role to Competency
                await tx.roleCompetency.create({
                    data: {
                        roleId: role.id,
                        competencyId: competency.id,
                        requiredLevel: roleData.overallLevel, // Default requirement matches role level
                        weight: 1.0
                    }
                });
            }

            return role;
        });

        revalidatePath("/assessments/admin/roles");
        return { success: true, roleId: result.id };

    } catch (error: any) {
        console.error("Create Role Error:", error);
        return { success: false, error: error.message };
    }
}

// Helper to map UI industry strings to Enum
function mapIndustriesToEnum(industries: string[] | undefined): any[] {
    // Safety check for undefined or empty array
    if (!industries || industries.length === 0) {
        return ["GENERIC"];
    }

    const mapping: Record<string, string> = {
        "Information Technology": "INFORMATION_TECHNOLOGY",
        "Healthcare": "HEALTHCARE",
        "Finance": "FINANCE",
        "Manufacturing": "MANUFACTURING",
        "Education": "EDUCATION",
        "Retail": "RETAIL",
        // Add others as needed
    };

    return industries.map(i => mapping[i] || "GENERIC").filter(Boolean);
}

export async function requestRoleWithCompetencies(
    roleData: CreateRoleData,
    competencies: GeneratedCompetency[]
) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const u = session.user as any;
        const tenantId = u.tenantId;

        if (!tenantId) {
            throw new Error("User does not belong to an organization.");
        }

        // Store the exact payload JSON that the Role generator produced,
        // so that the Admin can inspect it and instantiate it later.
        const originalData = {
            roleData: {
                ...roleData,
                industries: mapIndustriesToEnum(roleData.industries)
            },
            competencies
        };

        const result = await prisma.approvalRequest.create({
            data: {
                type: "ROLE",
                status: "PENDING",
                entityId: "NEW_ROLE_REQUEST_" + Date.now(), // Placeholder ID
                requesterId: u.id,
                tenantId: tenantId,
                originalData: originalData as any,
                comments: `Requested by ${u.name || u.email}. Role Code: ${roleData.code}`,
            }
        });

        return { success: true, requestId: result.id };
    } catch (error: any) {
        console.error("Request Role Error:", error);
        return { success: false, error: error.message };
    }
}
