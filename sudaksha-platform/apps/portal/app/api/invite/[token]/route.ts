import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const member = await prisma.member.findUnique({
            where: { invitationToken: token },
            include: { tenant: { select: { name: true } } }
        });

        if (!member) {
            return NextResponse.json({ error: "Invalid or expired invitation token" }, { status: 404 });
        }

        // Check expiry (7 days)
        if (member.invitationSentAt) {
            const expiry = new Date(member.invitationSentAt.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (new Date() > expiry) {
                return NextResponse.json({ error: "Invitation token has expired" }, { status: 400 });
            }
        }

        return NextResponse.json({
            email: member.email,
            name: member.name,
            companyName: member.tenant?.name || "the platform"
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const body = await req.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        const member = await prisma.member.findUnique({
            where: { invitationToken: token }
        });

        if (!member) {
            return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Update Member and Create User Linkage
        await prisma.$transaction(async (tx) => {
            // 1. Update Member
            await tx.member.update({
                where: { id: member.id },
                data: {
                    password: hashedPassword,
                    status: "ACTIVE" as any,
                    invitationAcceptedAt: new Date(),
                    invitationToken: null // Clear token
                }
            });

            // 2. Create User for Auth if not exists
            const existingUser = await tx.user.findUnique({ where: { email: member.email } });
            if (!existingUser) {
                await tx.user.create({
                    data: {
                        email: member.email,
                        password: hashedPassword,
                        name: member.name,
                        role: member.role === 'TENANT_ADMIN' ? 'CLIENT_ADMIN' : 'EMPLOYEE',
                        accountType: member.role === 'TENANT_ADMIN' ? 'CLIENT_ADMIN' : 'CLIENT_USER',
                        clientId: member.tenantId,
                        userType: "TENANT",
                        isActive: true
                    }
                });
            } else {
                await tx.user.update({
                    where: { email: member.email },
                    data: { password: hashedPassword }
                });
            }
        });

        return NextResponse.json({ message: "Invitation accepted successfully" });
    } catch (error) {
        console.error("Invite POST Error:", error);
        return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
    }
}
