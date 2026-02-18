import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { NextResponse } from "next/server";

const nextAuth = NextAuth(authOptions);

async function wrappedHandler(
    req: Request,
    context: { params: Promise<{ nextauth: string[] }> }
) {
    try {
        return await nextAuth(req, context as any);
    } catch (e) {
        console.error("[NextAuth] Route error:", e);
        return NextResponse.json(
            { error: "Authentication error", message: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export const GET = wrappedHandler;
export const POST = wrappedHandler;
