"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CorporateRegistrationForm } from "@/components/Auth/CorporateRegistrationForm";
import { InstitutionRegistrationForm } from "@/components/Auth/InstitutionRegistrationForm";
import { IndividualRegistrationForm } from "@/components/Auth/IndividualRegistrationForm";
import { Brain } from "lucide-react";
import Link from "next/link";

function RegisterContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "individual";

    const renderForm = () => {
        switch (type) {
            case "corporate":
                return <CorporateRegistrationForm />;
            case "institution":
                return <InstitutionRegistrationForm />;
            case "individual":
            default:
                return <IndividualRegistrationForm />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case "corporate":
                return "Register Your Organization";
            case "institution":
                return "Register Your Institution";
            default:
                return "Create Your Personal Account";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 bg-[url('/grid.svg')] bg-center">
            <div className="mb-8 flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2 mb-4 group">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                        <Brain className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter italic">SudAssess</span>
                </Link>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{getTitle()}</h1>
                <p className="text-gray-500 font-medium mt-2">Join the future of skill assessment today.</p>
            </div>

            <div className="w-full max-w-xl">
                {renderForm()}
            </div>

            <p className="mt-8 text-sm text-gray-500 font-medium">
                Already have an account?{" "}
                <Link href="/assessments/login" className="text-indigo-600 font-bold hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
