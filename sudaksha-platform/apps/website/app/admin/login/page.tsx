"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

function AdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/admin";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // We also copied /api/auth/login from portal. We can use that or NextAuth signIn
            // Since it's /admin/login for super admins, we try NextAuth first.
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Invalid email or password");
                setLoading(false);
                return;
            }

            // If we got here, NextAuth succeeded via the standard cookie routing
            // But /admin/login typically uses a custom JWT session for the admin space?
            // Wait, in middleware: `const adminCookie = req.cookies.get('admin_session');`
            // For `/admin/login`, let's ALSO hit the /api/auth/login endpoint which sets that cookie
            const customRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!customRes.ok) {
                const data = await customRes.json();
                setError(data.error || "Admin login failed");
                setLoading(false);
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            console.error("Login catch error:", err);
            setError("Network error. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 antialiased">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Sudaksha Admin</h1>
                    <p className="text-gray-500 text-sm mb-6 sm:mb-8">Sign in to manage the core website</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
                                    Password
                                </label>
                                <Link
                                    href="/admin/forgot-password"
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-5 w-5" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        <Link href="/" className="text-gray-900 hover:underline">
                            ← Back to site
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 antialiased">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}
