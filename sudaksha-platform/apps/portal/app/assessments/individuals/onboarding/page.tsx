import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function IndividualOnboardingPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Get started</h1>
            <OnboardingWizard redirectTo="/assessments/individuals/dashboard" />
        </div>
    );
}
