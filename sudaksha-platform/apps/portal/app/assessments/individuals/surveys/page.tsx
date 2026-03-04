import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default async function IndividualSurveysPage() {
    const session = await getApiSession();
    if (!session) redirect("/assessments/login");

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-6">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                    My Surveys
                </h1>
                <p className="text-gray-500">
                    Complete assigned surveys from your organization.
                </p>
            </header>

            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No active surveys</h3>
                <p className="text-gray-500 mb-4">You have no pending surveys to complete at this time.</p>
            </div>
        </div>
    );
}
