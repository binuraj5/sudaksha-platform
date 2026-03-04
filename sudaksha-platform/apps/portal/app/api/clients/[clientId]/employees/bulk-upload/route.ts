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

                // Determine ID code
                let inputCode = emp.employeeId || emp.enrollmentNumber || emp.memberCode || emp.id;
                if (!inputCode) {
                    inputCode = memberType === 'STUDENT'
                        ? `STU${Math.floor(1000 + Math.random() * 9000)}`
                        : `EMP${Math.floor(1000 + Math.random() * 9000)}`;
                }

                // Parse name if firstName/lastName are missing
                let fName = emp.firstName;
                let lName = emp.lastName;
                if (!fName && emp.name) {
                    const parts = emp.name.split(' ');
                    fName = parts[0];
                    lName = parts.slice(1).join(' ');
                }

                await prisma.member.create({
                    data: {
                        tenantId: clientId,
                        type: memberType,
                        role: memberType === 'STUDENT' ? 'ASSESSOR' : 'EMPLOYEE',
                        firstName: fName || 'User',
                        lastName: lName || '',
                        name: emp.name || `${fName} ${lName}`.trim(),
                        email: emp.email,
                        phone: emp.phone,
                        designation: emp.designation,
                        memberCode: inputCode,
                        ...(memberType === 'STUDENT' ? { enrollmentNumber: inputCode } : { employeeId: inputCode }),
                        password: hashed,
                        isActive: true,
                    }
                });
                successCount++;
            } catch (e: any) {
                errors.push({ email: emp.email, error: e.message });
            }
        }

        return NextResponse.json({ success: true, count: successCount, errors });

    } catch (error) {
        console.error("Bulk Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
