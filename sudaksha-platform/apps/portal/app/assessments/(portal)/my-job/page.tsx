
import { MyJobForm } from "@/components/Career/MyJobForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function MyJobPage() {
    const session = await getServerSession(authOptions);
    // In real implementation, fetch existing job details here

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Current Role</h2>
                <p className="text-muted-foreground mt-2">
                    Define your current responsibilities and competencies to track your professional growth.
                </p>
            </div>

            <MyJobForm />
        </div>
    );
}
