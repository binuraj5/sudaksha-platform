import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Navigation/Sidebar";
import { MobileNav } from "@/components/Navigation/MobileNav";

export default async function IndividualLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getApiSession();

    if (!session || session.user.role !== 'INDIVIDUAL') {
        redirect("/assessments/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <MobileNav />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <main className="flex-1 overflow-y-auto focus:outline-none">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
