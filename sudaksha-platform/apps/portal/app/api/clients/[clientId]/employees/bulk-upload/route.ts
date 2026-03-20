import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'TENANT_ADMIN')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        // Fallback for arrays (the frontend might send an array directly or an object with `{ employees }`)
        const employees = Array.isArray(body) ? body : body.employees;

        if (!Array.isArray(employees) || employees.length === 0) {
            return NextResponse.json({ error: "No data provided" }, { status: 400 });
        }

        let successCount = 0;
        const errors = [];

        const tenantInfo = await prisma.tenant.findUnique({
            where: { id: clientId },
            select: { type: true },
        });
        const tenantType = (tenantInfo?.type as 'CORPORATE' | 'INSTITUTION') || 'CORPORATE';
        const memberType = tenantType === 'INSTITUTION' ? 'STUDENT' : 'EMPLOYEE';

        for (const emp of employees) {
            try {
                // Generate password
                const pwd = Math.random().toString(36).slice(-8);
                const hashed = await hash(pwd, 10);

                // Handle input code
                let inputCode = emp.employeeId || emp.enrollmentNumber || emp.memberCode || emp.id;
                if (!inputCode) {
                    const uniqueSuffix = Math.floor(10000 + Math.random() * 90000);
                    inputCode = memberType === 'STUDENT' ? `STU${uniqueSuffix}` : `EMP${uniqueSuffix}`;
                }

                // Handle Name Parsing
                let fName = emp.firstName;
                let lName = emp.lastName;
                if (!fName && emp.name) {
                    const parts = emp.name.split(' ');
                    fName = parts[0];
                    lName = parts.slice(1).join(' ');
                } else if (!fName) {
                    fName = "Unknown";
                }

                // Handle Department Code (OrgUnit lookup MVP)
                let orgUnitId = null;
                if (emp.departmentCode) {
                    const orgUnit = await prisma.organizationUnit.findFirst({
                        where: { tenantId: clientId, code: emp.departmentCode }
                    });
                    if (orgUnit) {
                        orgUnitId = orgUnit.id;
                    } else {
                        errors.push({ email: emp.email || 'Unknown', error: `Department code '${emp.departmentCode}' not found` });
                        continue; // Skip this employee since department is required
                    }
                }

                // Handle Supervisor lookup (by member code/employee ID)
                let reportingToId = null;
                if (emp.supervisorId) {
                    const supervisor = await prisma.member.findFirst({
                        where: { 
                            tenantId: clientId,
                            OR: [
                                { memberCode: emp.supervisorId },
                                { employeeId: emp.supervisorId },
                                { enrollmentNumber: emp.supervisorId }
                            ]
                        }
                    });
                    if (supervisor) {
                        reportingToId = supervisor.id;
                    } else {
                        // Log warning but continue - supervisor is optional
                        console.warn(`Supervisor ID '${emp.supervisorId}' not found for ${emp.email}`);
                    }
                }

                await prisma.member.create({
                    data: {
                        tenantId: clientId,
                        type: memberType,
                        role: memberType === 'STUDENT' ? 'ASSESSOR' : 'EMPLOYEE',
                        firstName: fName,
                        lastName: lName || '',
                        name: emp.name || `${fName} ${lName}`.trim(),
                        email: emp.email,
                        phone: emp.phone,
                        designation: emp.designation,
                        memberCode: inputCode,
                        ...(memberType === 'STUDENT' ? { enrollmentNumber: inputCode } : { employeeId: inputCode }),
                        password: hashed,
                        orgUnitId,
                        reportingToId,
                        isActive: true,
                    }
                });
                successCount++;
            } catch (e: any) {
                console.error(`Error importing ${emp.email}:`, e);
                let errorMessage = e.message;
                // Make Prisma unique constraint errors readable
                if (e.code === 'P2002') {
                    const target = e.meta?.target || "field";
                    errorMessage = `Duplicate entry for ${target}. This email or ID already exists.`;
                }
                errors.push({ email: emp.email || 'Unknown', error: errorMessage });
            }
        }


        return NextResponse.json({ success: true, count: successCount, errors });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
