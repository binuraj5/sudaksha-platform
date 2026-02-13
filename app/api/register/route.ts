import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            adminEmail,
            adminPassword,
            name,
            type,
            slug,
            companyName,
            institutionName,
            adminName
        } = body;

        const resolvedEmail = email || adminEmail;
        const resolvedPassword = password || adminPassword;

        if (!resolvedEmail || !resolvedPassword) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: resolvedEmail }
        });

        if (existingUser) {
            return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(resolvedPassword, 10);

        // 2. Handle Registration by Type
        if (type === "corporate" || type === "institution") {
            if (!slug) {
                return NextResponse.json({ message: "Workspace URL (slug) is required" }, { status: 400 });
            }

            // Check if tenant slug exists
            const existingTenant = await prisma.tenant.findUnique({
                where: { slug }
            });

            if (existingTenant) {
                return NextResponse.json({ message: "This workspace URL is already taken" }, { status: 400 });
            }

            // Check if client slug exists
            const existingClient = await prisma.client.findUnique({
                where: { slug }
            });

            if (existingClient) {
                return NextResponse.json({ message: "This workspace URL is already taken" }, { status: 400 });
            }

            const orgName = companyName || institutionName;
            const tenantType = type === "corporate" ? "CORPORATE" : "INSTITUTION";

            // Create Tenant + Client + User Transaction
            const result = await prisma.$transaction(async (tx) => {
                const tenant = await tx.tenant.create({
                    data: {
                        name: orgName,
                        slug,
                        email: resolvedEmail,
                        type: tenantType as any,
                        createdBy: "registration",
                        isActive: true,
                        subscriptionStart: new Date(),
                    }
                });

                const client = await tx.client.create({
                    data: {
                        name: orgName,
                        slug,
                        email: resolvedEmail,
                        createdBy: "registration",
                        subscriptionStart: new Date(),
                        isActive: true,
                    }
                });

                const user = await tx.user.create({
                    data: {
                        email: resolvedEmail,
                        password: hashedPassword,
                        name: adminName || name,
                        role: "CLIENT_ADMIN",
                        accountType: "CLIENT_ADMIN",
                        clientId: client.id,
                        userType: "TENANT",
                        isActive: true
                    }
                });

                await (tx.member as any).create({
                    data: {
                    email: resolvedEmail,
                        password: hashedPassword,
                        name: adminName || name,
                        role: "TENANT_ADMIN",
                        tenantId: tenant.id,
                        type: type === "corporate" ? "EMPLOYEE" : "STUDENT",
                        isActive: true,
                        status: "ACTIVE"
                    }
                });

                return { user, tenant, client };
            });

            return NextResponse.json({ message: "Registration successful", userId: result.user.id }, { status: 201 });
        }

        if (type === "individual") {
            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: resolvedEmail,
                        password: hashedPassword,
                        name,
                        role: "INDIVIDUAL",
                        accountType: "INDIVIDUAL",
                        userType: "INDIVIDUAL",
                        isActive: true
                    }
                });

                await (tx.member as any).create({
                    data: {
                        email: resolvedEmail,
                        password: hashedPassword,
                        name,
                        role: "INDIVIDUAL",
                        type: "INDIVIDUAL",
                        isActive: true,
                        status: "ACTIVE"
                    }
                });

                return user;
            });

            return NextResponse.json({ message: "Registration successful", userId: result.id }, { status: 201 });
        }

        return NextResponse.json({ message: "Invalid registration type" }, { status: 400 });

    } catch (error: any) {
        console.error("[REGISTER_API] Error:", error.message);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
