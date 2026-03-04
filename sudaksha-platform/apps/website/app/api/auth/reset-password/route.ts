import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/reset-password
 * Reset password for user by email (no token - direct reset).
 * Updates User, AdminUser, or Member password.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, confirmPassword } = body as {
            email?: string;
            password?: string;
            confirmPassword?: string;
        };

        if (!email || !password || !confirmPassword) {
            return NextResponse.json(
                { error: "Email, password, and confirm password are required" },
                { status: 400 }
            );
        }

        const trimmedEmail = String(email).trim().toLowerCase();
        if (!trimmedEmail) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Case-insensitive email lookup (DB may store Info@tra.tz, user types info@tra.tz)
        const emailFilter = { equals: trimmedEmail, mode: "insensitive" as const };

        // Try AdminUser first
        const adminUser = await prisma.adminUser.findFirst({
            where: { email: emailFilter }
        });
        if (adminUser) {
            await prisma.adminUser.update({
                where: { id: adminUser.id },
                data: { passwordHash: hashedPassword }
            });
            return NextResponse.json({ success: true, message: "Password reset successfully" });
        }

        // Try User
        const user = await prisma.user.findFirst({
            where: { email: emailFilter }
        });
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    failedAttempts: 0,
                    lockoutUntil: null
                }
            });
            return NextResponse.json({ success: true, message: "Password reset successfully" });
        }

        // Try Member
        const member = await prisma.member.findFirst({
            where: { email: emailFilter }
        });
        if (member) {
            await prisma.member.update({
                where: { id: member.id },
                data: { password: hashedPassword }
            });
            return NextResponse.json({ success: true, message: "Password reset successfully" });
        }

        // Don't reveal that account doesn't exist (security)
        return NextResponse.json({ success: true, message: "If an account exists, the password has been reset" });
    } catch (error) {
        console.error("[AUTH] Reset password error:", error);
        return NextResponse.json(
            { error: "Failed to reset password. Please try again." },
            { status: 500 }
        );
    }
}
