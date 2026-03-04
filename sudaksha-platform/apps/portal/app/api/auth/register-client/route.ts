import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterClientSchema = z.object({
    companyName: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    adminName: z.string().min(2),
    adminEmail: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = RegisterClientSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { companyName, slug, adminName, adminEmail, password } = validation.data;

        // Check for existing member or tenant
        const existingMember = await prisma.member.findUnique({ where: { email: adminEmail } });
        if (existingMember) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
        if (existingTenant) {
            return NextResponse.json({ error: "Company slug already taken" }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: companyName,
                    slug: slug,
                    email: adminEmail,
                    createdBy: "SYSTEM_REGISTRATION",
                    subscriptionStart: new Date(),
                    subscriptionEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    type: "CORPORATE",
                }
            });

            // 2. Create Tenant Settings
            await tx.tenantSettings.create({
                data: {
                    tenantId: tenant.id,
                    emailFromName: companyName,
                }
            });

            // 3. Create Admin Member
            const member = await tx.member.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: "TENANT_ADMIN",
                    type: "EMPLOYEE",
                    tenantId: tenant.id,
                }
            });

            return { tenant, member };
        });

        return NextResponse.json({
            success: true,
            clientId: result.tenant.id,
            redirect: `/assessments/login`
        });

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
