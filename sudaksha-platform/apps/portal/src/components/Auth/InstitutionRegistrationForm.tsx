"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User, Loader2, Globe, School } from "lucide-react";

export const InstitutionRegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const payload = {
            institutionName: data.institutionName,
            slug: data.slug,
            adminName: data.adminName,
            email: data.adminEmail,
            password: data.adminPassword,
            type: "institution",
        };

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Something went wrong");
            }

            router.push("/assessments/verify-email");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 space-y-6">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Institution Details</h2>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="institutionName" className="text-gray-700 font-bold">Institution Name</Label>
                    <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="institutionName" name="institutionName" required placeholder="University of Future" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-gray-700 font-bold">Campus URL</Label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="slug" name="slug" required placeholder="univ-edu" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-6">Administrative Contact</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="adminName" className="text-gray-700 font-bold">Administrator Name</Label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="adminName" name="adminName" required placeholder="Principal Smith" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-gray-700 font-bold">Official Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input id="adminEmail" name="adminEmail" type="email" required placeholder="admin@univ.edu" className="pl-12 rounded-xl h-12 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600 transition-all font-medium" />
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

            <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black italic rounded-xl shadow-lg shadow-indigo-100 transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Institution"}
            </Button>
        </form>
    );
};
