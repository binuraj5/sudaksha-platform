import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt"; // Using bcrypt as per package.json
import { MemberRole, MemberType, TenantType } from "@prisma/client";

const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000000';
const SYSTEM_TENANT_NAME = 'SudAssess Individual Users';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, password, userMode } = body;

        if (!email || !password || !firstName || !lastName) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return new NextResponse("Email already registered", { status: 400 });
        }

        // 2. Ensure System Tenant exists
        // We use upsert to ensure it exists without race conditions or separate check-then-create
        // However, ID must be valid CUID or we must allow non-CUIDs if we force a specific ID.
        // Prisma CUIDs are strings. We can use a specific UUID-like string or a known CUID.
        // "00000000-0000-0000-0000-000000000000" is a UUID, which fits in String @id.
        // Let's try to upsert it.

        let systemTenant = await prisma.tenant.findUnique({
            where: { id: SYSTEM_TENANT_ID }
        });

        if (!systemTenant) {
            // Need to create it. 
            // Note: If the ID format in DB is strict CUID, this might fail. 
            // But typical String @id just takes strings.
            // Let's rely on finding by type "SYSTEM" if we want to be more dynamic, 
            // or just create if missing.

            // Check if ANY system tenant exists to avoid duplicates if ID is different
            const anySystemTenant = await prisma.tenant.findFirst({
                where: { type: 'SYSTEM' as TenantType } // Casting if TenantType enum not updated yet in types
            });

            if (anySystemTenant) {
                // Use existing system tenant
                systemTenant = anySystemTenant;
            } else {
                // Create new
                try {
                    systemTenant = await prisma.tenant.create({
                        data: {
                            id: SYSTEM_TENANT_ID,
                            name: SYSTEM_TENANT_NAME,
                            slug: 'system-users',
                            type: 'SYSTEM' as TenantType,
                            email: 'system@sudassess.com', // Placeholder
                            isActive: true,
                            createdBy: 'SYSTEM_BOOTSTRAP'
                        }
                    });
                } catch (e) {
                    // Fallback if ID constraint fails or other issue, let Prisma generate ID
                    systemTenant = await prisma.tenant.create({
                        data: {
                            name: SYSTEM_TENANT_NAME,
                            slug: 'system-users-' + Date.now(),
                            type: 'SYSTEM' as TenantType,
                            email: 'system@sudassess.com',
                            isActive: true,
                            createdBy: 'SYSTEM_BOOTSTRAP'
                        }
                    });
                }
            }
        }

        // 3. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name: `${firstName} ${lastName}`,
                password: hashedPassword,
                role: 'INDIVIDUAL',
                userType: 'INDIVIDUAL', // AUTHENTICATION_ARCHITECTURE: for correct session & redirects
            }
        });

        // 4. Create Member
        const member = await prisma.member.create({
            data: {
                tenantId: systemTenant.id,
                type: 'INDIVIDUAL' as MemberType, // Enum MemberType needs INDIVIDUAL
                role: 'EMPLOYEE' as MemberRole, // Map to minimal role or generic
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                email,
                password: hashedPassword, // Member also has password field in this schema
                memberCode: `IND${Date.now().toString().slice(-6)}`,
                metadata: {
                    userMode: userMode || 'PROFESSIONAL', // PROFESSIONAL or STUDENT
                    freeAssessmentsUsed: 0,
                    subscriptionTier: 'FREE',
                    registeredAt: new Date().toISOString()
                }
            }
        });

        // 5. Send verification (Mocked)
        console.log(`[MOCK EMAIL] Verification sent to ${email}`);

        return NextResponse.json({
            success: true,
            redirectUrl: "/login?verified=false" // Or onboarding
        });

    } catch (error) {
        console.error("[REGISTER_INDIVIDUAL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
