import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateStudentOrgUnit } from "@/lib/services/class-service";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; employeeId: string }> }
) {
    const session = await getApiSession();
    const { clientId, employeeId } = await params;

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const employee = await prisma.member.findUnique({
            where: { id: employeeId },
            include: {
                orgUnit: true,
                reportingManager: true,
                assessments: {
                    include: { assessmentModel: true },
                    orderBy: { createdAt: 'desc' }
                },
                assignedActivities: { include: { activity: true } }
            }
        });

        if (!employee || employee.tenantId !== clientId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; employeeId: string }> }
) {
    const session = await getApiSession();
    const { clientId, employeeId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validMemberRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'MANAGER', 'ASSESSOR', 'DEPT_HEAD', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER', 'INDIVIDUAL', 'EMPLOYEE'];

    try {
        const body = await req.json();
        const { firstName, lastName, role, isActive, facultyType, designation, orgUnitId, reportingToId, ...rest } = body;

        const current = await prisma.member.findUnique({
            where: { id: employeeId },
            select: { tenantId: true, type: true },
        });
        if (!current || current.tenantId !== clientId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Validate org unit if provided (polymorphic: supports TEAM, DEPARTMENT, CLASS, etc.)
        if (orgUnitId !== undefined && orgUnitId !== null) {
            const orgUnit = await prisma.organizationUnit.findUnique({
                where: { id: orgUnitId }
            });
            if (!orgUnit || orgUnit.tenantId !== clientId) {
                return NextResponse.json({ error: "Organization unit not found" }, { status: 400 });
            }
            // For students, still enforce CLASS requirement (FSD validation)
            if (current.type === "STUDENT" && orgUnit.type !== "CLASS") {
                return NextResponse.json({ error: "Students must be assigned to a CLASS" }, { status: 400 });
            }
        }

        // Validate supervisor exists if provided
        if (reportingToId !== undefined && reportingToId !== null) {
            const supervisor = await prisma.member.findUnique({
                where: { id: reportingToId }
            });
            if (!supervisor || supervisor.tenantId !== clientId) {
                return NextResponse.json({ error: "Supervisor not found in this organization" }, { status: 400 });
            }
        }

        const updateData: Record<string, unknown> = { ...rest };
        if (role && validMemberRoles.includes(role)) updateData.role = role;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (facultyType !== undefined && ['PERMANENT', 'ADJUNCT', 'VISITING'].includes(String(facultyType))) updateData.facultyType = facultyType;
        if (designation !== undefined) updateData.designation = designation;
        if (orgUnitId !== undefined) updateData.orgUnitId = orgUnitId || null;
        if (reportingToId !== undefined) updateData.reportingToId = reportingToId || null;
        if (firstName || lastName) {
            const memberForName = await prisma.member.findUnique({ where: { id: employeeId } });
            const fName = firstName || memberForName?.firstName || "";
            const lName = lastName || memberForName?.lastName || "";
            updateData.firstName = fName;
            updateData.lastName = lName;
            updateData.name = `${fName} ${lName}`.trim();
        }

        const updated = await prisma.member.update({
            where: { id: employeeId },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; employeeId: string }> }
) {
    // Soft delete usually
    const session = await getApiSession();
    const { clientId, employeeId } = await params;

    const deleteAllowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD'];
    if (!session || !deleteAllowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const member = await prisma.member.findUnique({ where: { id: employeeId }, select: { tenantId: true } });
        if (!member || member.tenantId !== clientId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        await prisma.member.update({
            where: { id: employeeId },
            data: { isActive: false },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
