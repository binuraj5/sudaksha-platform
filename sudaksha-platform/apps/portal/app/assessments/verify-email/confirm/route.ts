import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(new URL("/assessments/verify-email?error=missing_token", req.url));
        }

        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) throw new Error("NEXTAUTH_SECRET not set");

        let payload: any;
        try {
            payload = verify(token, secret);
        } catch (_) {
            return NextResponse.redirect(new URL("/assessments/verify-email?error=invalid_or_expired", req.url));
        }

        const { userId, email } = payload as { userId: string; email: string };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.email !== email) {
            return NextResponse.redirect(new URL("/assessments/verify-email?error=invalid_token", req.url));
        }

        if (user.emailVerified) {
            // Already verified — send to login
            return NextResponse.redirect(new URL("/assessments/login?verified=1", req.url));
        }

        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: new Date() },
        });

        return NextResponse.redirect(new URL("/assessments/login?verified=1", req.url));
    } catch (err: any) {
        console.error("[VERIFY_EMAIL_CONFIRM]", err);
        return NextResponse.redirect(new URL("/assessments/verify-email?error=server_error", req.url));
    }
}
