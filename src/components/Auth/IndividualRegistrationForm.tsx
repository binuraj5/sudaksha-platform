"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export const IndividualRegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, type: "individual" }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Something went wrong");
            }

            router.push("/verify-email");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-bold">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input id="name" name="name" required placeholder="John Doe" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-bold">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input id="email" name="email" type="email" required placeholder="john@example.com" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-bold">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input id="password" name="password" type="password" required placeholder="••••••••" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    By registering, you agree to our <a href="/terms" className="text-indigo-600 font-bold hover:underline">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</a>.
                </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black italic rounded-xl shadow-lg shadow-indigo-100 transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
        </form>
    );
};
