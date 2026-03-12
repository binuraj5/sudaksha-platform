import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

function buildVerifyToken(userId: string, email: string, secret: string): string {
    const expiry = Math.floor(Date.now() / 1000) + 86400; // 24h
    const payload = Buffer.from(JSON.stringify({ userId, email, exp: expiry })).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    return `${payload}.${sig}`;
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Return 200 regardless to prevent email enumeration
        if (!user) {
            return NextResponse.json({ message: "If that email exists, a verification link has been sent." });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: "Email already verified. You can log in." });
        }

        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) throw new Error("NEXTAUTH_SECRET not set");

        const token = buildVerifyToken(user.id, user.email, secret);

        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
        const verifyUrl = `${baseUrl}/assessments/verify-email/confirm?token=${token}`;

        const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; padding: 32px; background: #f8fafc;">
            <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin: 0;">Verify Your Email</h1>
                    <p style="color: #64748b; margin-top: 8px;">Click the button below to confirm your email and activate your Sudaksha account.</p>
                </div>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${verifyUrl}"
                       style="background: #4f46e5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color: #94a3b8; font-size: 13px; text-align: center;">
                    This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
                    Sudaksha Assessment Platform &middot; <a href="${baseUrl}" style="color: #94a3b8;">sudaksha.com</a>
                </p>
            </div>
        </body>
        </html>`;

        const sent = await sendEmail(user.email, "Verify your Sudaksha account", html);

        return NextResponse.json({
            message: "Verification email sent. Please check your inbox.",
            emailSent: sent,
        });
    } catch (err: any) {
        console.error("[SEND_VERIFICATION]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
