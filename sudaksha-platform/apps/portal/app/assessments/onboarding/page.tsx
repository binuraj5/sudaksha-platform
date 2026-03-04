"use client";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <OnboardingWizard redirectTo="/assessments/individuals/dashboard" />
        </div>
    );
}
