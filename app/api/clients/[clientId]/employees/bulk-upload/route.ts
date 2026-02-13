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
        const { employees } = body; // Array of validated objects

        if (!Array.isArray(employees) || employees.length === 0) {
            return NextResponse.json({ error: "No data provided" }, { status: 400 });
        }

        // Optimization: Create Many?
        // Validating uniqueness again is safe.
        // Prisma createMany is fast but doesn't handle relations like self-relation reportingManager easily if referenced by Email in CSV.
        // Assuming the client resolved Managers to IDs? Likely not if bulk upload.
        // Strategy: 
        // 1. Fetch all existing emails to filtering properties.
        // 2. Insert valid ones. 
        // 3. Handle Manager linking? If CSV has "Reporting Manager Email", we need a second pass.

        // For MVP M1-5, I will assume basic fields first. Manager linking via Email is complex in single transaction.
        // I will do it in loop or best effort.

        let successCount = 0;
        const errors = [];

        // Pre-fetch organization units map
        // const depts = await prisma.organizationUnit.findMany({ where: { tenantId: clientId } });
        // Map Name/Code to ID... (Implied logic)

        for (const emp of employees) {
            try {
                // Generate password
                const pwd = Math.random().toString(36).slice(-8);
                const hashed = await hash(pwd, 10);

                // Code
                const randomCode = `EMP${Math.floor(1000 + Math.random() * 9000)}`;

                await prisma.member.create({
                    data: {
                        tenantId: clientId,
                        type: 'EMPLOYEE',
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        name: `${emp.firstName} ${emp.lastName}`,
                        email: emp.email,
                        phone: emp.phone,
                        designation: emp.designation,
                        memberCode: emp.memberCode || randomCode, // Use provided or generated
                        password: hashed,
                        isActive: true,
                        // orgUnitId: emp.orgUnitId // mapped ?
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
