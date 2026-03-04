import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        let individualTenant = await prisma.tenant.findFirst({
            where: { type: 'SYSTEM' }
        });

        if (!individualTenant) {
            individualTenant = await prisma.tenant.create({
                data: {
                    name: "Individual Users",
                    type: "SYSTEM",
                    slug: "individual-users",
                    email: "system@sudaksha.com",
                    createdBy: "SYSTEM"
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'USER' as any // Default B2C role
                }
            });

            await tx.member.create({
                data: {
                    tenantId: individualTenant.id,
                    email: newUser.email,
                    name: newUser.name || name,
                    role: 'ASSESSOR',
                    type: 'INDIVIDUAL',
                    password: hashedPassword
                }
            });

            return newUser;
        });

        return NextResponse.json({ success: true, userId: user.id });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
