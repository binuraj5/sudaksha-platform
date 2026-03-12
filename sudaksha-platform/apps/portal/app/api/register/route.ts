import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

function buildVerifyToken(userId: string, email: string, secret: string): string {
    const expiry = Math.floor(Date.now() / 1000) + 86400; // 24h
    const payload = Buffer.from(JSON.stringify({ userId, email, exp: expiry })).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    return `${payload}.${sig}`;
}

async function sendVerificationEmail(email: string, userId: string) {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) return;
        const token = buildVerifyToken(userId, email, secret);

        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
        const verifyUrl = `${baseUrl}/assessments/verify-email/confirm?token=${token}`;
        const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;background:#f8fafc;">
            <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:40px;">
                <h1 style="color:#1e293b;font-size:24px;font-weight:800;">Verify Your Email</h1>
                <p style="color:#64748b;">Click the button below to activate your Sudaksha account.</p>
                <div style="text-align:center;margin:32px 0;">
                    <a href="${verifyUrl}" style="background:#4f46e5;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:16px;display:inline-block;">Verify Email Address</a>
                </div>
                <p style="color:#94a3b8;font-size:13px;">This link expires in 24 hours.</p>
            </div>
        </body></html>`;
        await sendEmail(email, "Verify your Sudaksha account", html);
    } catch (err) {
        console.error("[REGISTER] Failed to send verification email:", err);
    }
}

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

            // Fire-and-forget — don't block the response
            sendVerificationEmail(resolvedEmail, result.user.id);

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

            // Fire-and-forget — don't block the response
            sendVerificationEmail(resolvedEmail, result.id);

            return NextResponse.json({ message: "Registration successful", userId: result.id }, { status: 201 });
        }

        return NextResponse.json({ message: "Invalid registration type" }, { status: 400 });

    } catch (error: any) {
        console.error("[REGISTER_API] Error:", error.message);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
