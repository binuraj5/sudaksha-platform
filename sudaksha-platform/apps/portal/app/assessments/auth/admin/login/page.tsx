"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function SuperAdminLoginContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/assessments/admin/dashboard";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            // Use redirect: true so NextAuth completes the callback flow and sets the session cookie.
            // With redirect: false, the session cookie is never set (known NextAuth/Credentials issue).
            const targetPath = callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`;
            const result = await signIn("credentials", {
                email,
                password,
                isAdmin: "true",
                callbackUrl: targetPath,
                redirect: true,
            });

            // Only reached on error when redirect: true (e.g. network failure before redirect)
            if (result?.error) {
                setError("Invalid credentials or not a Super Admin account.");
            }
        } catch (err: any) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin</h1>
                <p className="text-slate-500 font-medium mt-1">Sign in to SudAssess Admin</p>
            </div>

            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input id="email" name="email" type="email" required placeholder="admin@example.com" className="pl-10 rounded-xl h-11 border-slate-200" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input id="password" name="password" type="password" required placeholder="••••••••" className="pl-10 rounded-xl h-11 border-slate-200" />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    <Link href="/assessments/login" className="text-indigo-600 font-medium hover:underline">
                        Back to standard login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function SuperAdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        }>
            <SuperAdminLoginContent />
        </Suspense>
    );
}
