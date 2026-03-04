import { NextResponse } from "next/server";
import { PrismaClient } from "@sudaksha/db-core";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    employeeId: z.string().optional(),
    department: z.string().optional(),
    role: z.enum(["ADMIN", "ASSESSOR", "MANAGER"]).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: {
                email: validatedData.email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                name: validatedData.name,
                employeeId: validatedData.employeeId,
                department: validatedData.department,
                role: validatedData.role || "ASSESSOR",
            },
        });

        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
