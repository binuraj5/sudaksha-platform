import { Metadata } from "next";
import { ModelsPageContent } from "@/components/assessments/ModelsPageContent";

export const metadata: Metadata = {
    title: "Assessment Models | Client Administration",
    description: "Manage tenant assessment models",
};

export default async function ClientModelsPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = await params;
    return <ModelsPageContent clientId={clientId} />;
}
