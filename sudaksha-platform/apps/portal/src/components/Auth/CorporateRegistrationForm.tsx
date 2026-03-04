"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, User, Loader2, Globe, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const CorporateRegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ companyName: string } | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const companyName = (data.companyName as string) || "Your organization";
        const payload = {
            companyName: data.companyName,
            slug: data.slug,
            adminName: data.adminName,
            email: data.adminEmail,
            password: data.adminPassword,
            type: "corporate",
        };

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json().catch(() => ({}));
            const errorMessage = result.message || result.error || "Something went wrong";

            if (!res.ok) {
                throw new Error(errorMessage);
            }

            setSuccess({ companyName });
            toast.success("Organization created successfully", {
                description: "Redirecting to verify your email…",
            });
            setTimeout(() => {
                router.push("/assessments/verify-email");
            }, 1500);
        } catch (err: any) {
            const message = err?.message || "Registration failed";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 space-y-6">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Organization Details</h2>

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
                    <span><strong>{success.companyName}</strong> has been created. Redirecting to verify your email…</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-700 font-bold">Company Name</Label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="companyName" name="companyName" required placeholder="Acme Corp" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-gray-700 font-bold">Workspace URL</Label>
                    <div className="relative flex items-center">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="slug" name="slug" required placeholder="acme-corp" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-6">Admin Contact</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="adminName" className="text-gray-700 font-bold">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="adminName" name="adminName" required placeholder="John Doe" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-gray-700 font-bold">Work Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="adminEmail" name="adminEmail" type="email" required placeholder="admin@acme.com" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-gray-700 font-bold">Admin Password</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input id="adminPassword" name="adminPassword" type="password" required placeholder="••••••••" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                </div>
            </div>

            <Button type="submit" disabled={loading || !!success} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black italic rounded-xl shadow-lg shadow-indigo-100 transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? "Redirecting…" : "Register Organization"}
            </Button>
        </form>
    );
};
