import { ProfileWizard } from "@/components/Career/ProfileWizard";
import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function IndividualProfilePage() {
    const session = await getApiSession();
    if (!session) redirect("/assessments/login");

    if (session.user.role !== "INDIVIDUAL") {
        redirect("/assessments/login");
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    My Career Profile
                </h1>
                <p className="text-gray-500">Complete your profile to unlock personalized career recommendations.</p>
            </header>

            <ProfileWizard isB2C />
        </div>
    );
}
