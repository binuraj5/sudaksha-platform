"use client";

import React, { useState, useEffect } from "react";
import { signIn, getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const callbackUrlRaw = searchParams.get("callbackUrl") || "/assessments/dashboard";
    // Never use legacy clients URL as callback (causes redirect loop). Use /assessments/dashboard so dispatcher can send to correct dashboard.
    const normalizedRaw =
        typeof callbackUrlRaw === "string" && callbackUrlRaw.startsWith("/assessments/clients/")
            ? "/assessments/dashboard"
            : callbackUrlRaw;
    // Always use path-only for form POST so redirect callback never receives a full URL (avoids doubled origin).
    const callbackUrl =
        typeof normalizedRaw === "string" && (normalizedRaw.startsWith("http://") || normalizedRaw.startsWith("https://"))
            ? (() => {
                try {
                    return new URL(normalizedRaw).pathname;
                } catch {
                    return normalizedRaw.startsWith("/") ? normalizedRaw : `/${normalizedRaw}`;
                }
            })()
            : normalizedRaw.startsWith("/")
                ? normalizedRaw
                : `/${normalizedRaw}`;
    const debugMode = searchParams.get("debug") === "1";

    useEffect(() => {
        getCsrfToken().then((token) => setCsrfToken(token ?? null));
    }, []);

    // Show error when redirected back with error=CredentialsSignin (or other)
    useEffect(() => {
        const err = searchParams.get("error");
        if (err === "CredentialsSignin") {
            setError("Invalid email or password. Please try again.");
        } else if (err) {
            setError("Sign-in failed. Please try again.");
        }
    }, [searchParams]);

    // Show success message when redirected back after password reset
    useEffect(() => {
        if (searchParams.get("reset") === "success") {
            setSuccessMessage("Password reset successfully. Please sign in with your new password.");
        }
    }, [searchParams]);

    const postDebugAndRedirect = async (
        success: boolean,
        email: string,
        passwordLength: number,
        callbackUrl: string,
        result: { url?: string | null; error?: string | null; ok?: boolean } | null,
        message: string
    ) => {
        const cookieStr = typeof document !== "undefined" ? document.cookie : "";
        const payload = {
            success,
            email,
            passwordLength,
            password: "***",
            callbackUrl,
            redirectUrl: result?.url ?? null,
            resultOk: result?.ok ?? null,
            resultError: result?.error ?? null,
            cookiesOnClient: cookieStr ? "present" : "missing",
            cookiesLength: cookieStr.length,
            nextAuthCookie: cookieStr.includes("next-auth.session-token") ? "present" : "missing",
            message,
            timestamp: new Date().toISOString(),
        };
        try {
            const res = await fetch("/api/auth/login-debug", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (json.redirectUrl) {
                window.location.href = json.redirectUrl;
            } else {
                window.location.href = "/assessments/login-debug-view";
            }
        } catch {
            window.location.href = "/assessments/login-debug-view";
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (debugMode) {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                    callbackUrl,
                });
                if (result?.error) {
                    setError("Invalid email or password. Please try again.");
                    await postDebugAndRedirect(false, email, password?.length ?? 0, callbackUrl, result, "Auth FAILURE: " + (result?.error ?? "unknown"));
                    setLoading(false);
                    return;
                }
                await postDebugAndRedirect(true, email, password?.length ?? 0, callbackUrl, result ?? null, "Auth SUCCESS – check cookies and redirectUrl below");
            } catch (err) {
                setError("Sign-in failed. Please try again.");
                await postDebugAndRedirect(false, email, password?.length ?? 0, callbackUrl, null, "Auth FAILURE: " + (err instanceof Error ? err.message : String(err)));
                setLoading(false);
            }
            return;
        }

        // Let the form submit naturally (no preventDefault) so the browser does a real full-page POST.
        // That guarantees the response Set-Cookie is received and the redirect to callbackUrl works.
        if (!csrfToken) {
            e.preventDefault();
        }
        setLoading(true);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 bg-[url('/grid.svg')] bg-center antialiased">
            <div className="mb-6 sm:mb-8 flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2 mb-4 group">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Brain className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <span className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">SudAssess</span>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight">Welcome Back</h1>
                <p className="text-muted-foreground font-medium mt-2">Sign in to your account to continue.</p>
            </div>

            <div className="w-full max-w-md">
                {debugMode && (
                    <p className="mb-4 text-center text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2">
                        Debug mode: after submit you will be sent to the debug view.
                    </p>
                )}
                {callbackUrl.includes("/clients/") && !error && !debugMode && (
                    <p className="mb-4 text-center text-sm text-muted-foreground">
                        Sign in to access your organization dashboard.
                    </p>
                )}
                <form
                    action="/api/auth/callback/credentials"
                    method="POST"
                    onSubmit={handleSubmit}
                    className="bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-border space-y-6"
                >
                    <input type="hidden" name="csrfToken" value={csrfToken ?? ""} />
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                    {successMessage && (
                        <div className="p-4 bg-green-100 border border-green-200 text-green-800 text-sm font-semibold rounded-xl" role="status">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-red-100 border border-red-200 text-red-800 text-sm font-semibold rounded-xl flex items-center gap-2" role="alert">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-bold">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input id="email" name="email" type="email" required placeholder="name@company.com" className="pl-12 rounded-xl h-12 border-input focus:border-primary focus:ring-primary transition-all font-medium" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-gray-700 font-bold">Password</Label>
                            <Link href="/assessments/forgot-password" className="text-xs font-bold text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input id="password" name="password" type="password" required placeholder="••••••••" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="rememberMe" name="rememberMe" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                        <label htmlFor="rememberMe" className="text-sm text-gray-500 font-medium cursor-pointer">Remember me for 30 days</label>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || (!debugMode && !csrfToken)}
                        className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                    Don't have an account?{" "}
                    <Link href="/assessments/register" className="text-primary font-bold hover:underline">
                        Create one free
                    </Link>
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <Link href="/assessments/auth/admin/login" className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">
                        Super Admin Access
                    </Link>
                </div>
            </div>
        </div>
    );
}
