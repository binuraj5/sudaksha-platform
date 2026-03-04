"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, confirmPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Failed to reset password");
                return;
            }
            router.push("/assessments/login?reset=success");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 bg-[url('/grid.svg')] bg-center antialiased">
            <div className="mb-6 sm:mb-8 flex flex-col items-center">
                <Link href="/" className="mb-4 group">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Brain className="w-7 h-7 text-primary-foreground" />
                    </div>
                </Link>
                <span className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">SudAssess</span>
                <h1 className="text-2xl sm:text-3xl font-display font-semibold text-foreground tracking-tight mt-6">Reset Password</h1>
                <p className="text-muted-foreground font-medium mt-2">Enter your email and a new password.</p>
            </div>

            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-border space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-bold">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="pl-12 rounded-xl h-12"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 font-bold">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-12 rounded-xl h-12"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-bold">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-12 rounded-xl h-12"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive font-medium">{error}</p>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                    <Link href="/assessments/login" className="text-primary font-bold hover:underline">
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
